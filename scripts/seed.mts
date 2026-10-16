/*
 * Seeds the SAPOK TECH database (MongoDB Atlas) with the owner account and all website content.
 *
 *   npm run seed                 create anything missing (safe to re-run)
 *   npm run seed -- --reset-admin     reset the owner login to the starter credentials
 *   npm run seed -- --reset-content   overwrite the website content with the defaults
 *
 * Reads MONGODB_URI / MONGODB_DB / ADMIN_EMAIL / ADMIN_PASSWORD from the environment or .env.local.
 * Runs on Node 22.6+ (built-in TypeScript type stripping).
 */
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import { contentSchema, defaultContent } from "../src/lib/content.ts";

function loadEnvFile(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("✗ MONGODB_URI is not set (add it to .env.local).");
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const email = (process.env.ADMIN_EMAIL || "sapoktech.c@gmail.com").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "Passw0rd";

// Same format as src/lib/auth.ts → hashPassword
function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "sapok_website");
  const admins = db.collection<{ _id: string; email: string; passwordHash: string; updatedAt: string }>("admins");
  const site = db.collection<{ _id: string; content: unknown; updatedAt: Date }>("site");
  const enquiries = db.collection("enquiries");

  // Owner account
  const existingAdmin = await admins.findOne({ _id: "owner" });
  if (!existingAdmin || args.has("--reset-admin")) {
    await admins.updateOne(
      { _id: "owner" },
      { $set: { email, passwordHash: hashPassword(password), updatedAt: new Date().toISOString() } },
      { upsert: true },
    );
    console.log(`✓ admin account ${existingAdmin ? "reset" : "created"}: ${email}`);
  } else {
    console.log(`• admin account already exists (${existingAdmin.email}) — left unchanged`);
  }

  // Website content
  const existingContent = await site.findOne({ _id: "content" });
  if (!existingContent || args.has("--reset-content")) {
    const content = contentSchema.parse(defaultContent);
    await site.updateOne({ _id: "content" }, { $set: { content, updatedAt: new Date() } }, { upsert: true });
    console.log(`✓ website content ${existingContent ? "reset to defaults" : "seeded"} (${content.services.length} services, ${content.products.length} products, ${content.clients.length} clients)`);
  } else {
    console.log("• website content already exists — left unchanged");
  }

  // Indexes for the inbox
  await enquiries.createIndex({ createdAt: -1 });
  await enquiries.createIndex({ status: 1, createdAt: -1 });
  console.log("✓ indexes ready");
  console.log(`\nDatabase: ${db.databaseName}  ·  collections: ${(await db.listCollections().toArray()).map((c) => c.name).join(", ")}`);
} catch (err) {
  console.error("✗ seed failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await client.close();
}
