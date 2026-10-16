import { NextResponse } from "next/server";
import { z } from "zod";
import { checkCredentials, createSession, getOrSeedAdmin, isAdmin, updateAdmin } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().max(160).pipe(z.email("Enter a valid email")),
  currentPassword: z.string().min(1, "Enter your current password").max(200),
  newPassword: z
    .string()
    .max(200)
    .refine((p) => p === "" || (p.length >= 10 && /[a-z]/i.test(p) && /\d/.test(p)), "New password needs 10+ characters with letters and numbers")
    .optional()
    .default(""),
});

/** Owner changes their sign-in email and/or password. Requires the current password. */
export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const limit = rateLimit(`account:${clientIp(req)}`, 6, 15 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const { email, currentPassword, newPassword } = parsed.data;
  const admin = await getOrSeedAdmin();
  if (!(await checkCredentials(admin.email, currentPassword))) {
    return NextResponse.json({ error: "Current password is wrong." }, { status: 401 });
  }
  await updateAdmin(email, newPassword || null);
  await createSession(); // keep this browser signed in; other sessions are now invalid
  return NextResponse.json({ ok: true });
}
