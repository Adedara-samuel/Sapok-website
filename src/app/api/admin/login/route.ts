import { NextResponse } from "next/server";
import { z } from "zod";
import { adminConfigured, checkCredentials, createSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().max(200), password: z.string().max(200) });

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Admin login isn't set up yet. Add ADMIN_EMAIL and ADMIN_PASSWORD to your environment." }, { status: 503 });
  }
  const limit = rateLimit(`login:${clientIp(req)}`, 8, 15 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !checkCredentials(parsed.data.email, parsed.data.password)) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
