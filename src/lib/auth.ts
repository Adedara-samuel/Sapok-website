import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { store, type AdminRecord } from "./store";

/*
 * Single-owner admin auth, stored in the database.
 * - Password is kept as a salted scrypt hash, never in plain text.
 * - On first run, the owner account is seeded (ADMIN_EMAIL / ADMIN_PASSWORD env vars override
 *   the defaults below). Change the password from Admin → Settings after the first sign in.
 * - Sessions are HS256 JWTs in an httpOnly, SameSite=strict cookie, bound to the password
 *   version so changing the password signs out every other session.
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = "sapok_admin";
const SESSION_DAYS = 7;
const DEFAULT_ADMIN_EMAIL = "sapoktech.c@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Passw0rd";

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("ADMIN_SESSION_SECRET must be set (32+ characters).");
    return new TextEncoder().encode("dev-only-secret-change-me-dev-only-secret");
  }
  return new TextEncoder().encode(s);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [algo, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Returns the owner account, seeding it on first run. */
export async function getOrSeedAdmin(): Promise<AdminRecord> {
  const db = store();
  const existing = await db.getAdmin();
  if (existing) return existing;
  const admin: AdminRecord = {
    email: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
    passwordHash: await hashPassword(process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD),
    updatedAt: new Date().toISOString(),
  };
  await db.setAdmin(admin);
  return admin;
}

export async function checkCredentials(email: string, password: string) {
  const admin = await getOrSeedAdmin();
  // Always run the hash so a wrong email takes as long as a wrong password
  const passOk = await verifyPassword(password, admin.passwordHash);
  const emailOk = email.trim().toLowerCase() === admin.email;
  return passOk && emailOk;
}

export async function updateAdmin(email: string, newPassword: string | null) {
  const current = await getOrSeedAdmin();
  await store().setAdmin({
    email: email.trim().toLowerCase(),
    passwordHash: newPassword ? await hashPassword(newPassword) : current.passwordHash,
    updatedAt: new Date().toISOString(),
  });
}

export async function createSession() {
  const admin = await getOrSeedAdmin();
  const token = await new SignJWT({ role: "owner", v: admin.updatedAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.role !== "owner") return false;
    // Sessions issued before the last credential change are no longer valid
    const admin = await getOrSeedAdmin();
    return payload.v === admin.updatedAt;
  } catch {
    return false;
  }
}
