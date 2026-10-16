import { NextResponse } from "next/server";
import { enquiryInputSchema } from "@/lib/content";
import { sendEnquiryEmail } from "@/lib/mailer";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { store } from "@/lib/store";

/** Public: a visitor sends an enquiry. Saved to the admin inbox first, then emailed to the owner. */
export async function POST(req: Request) {
  const limit = rateLimit(`enquiry:${clientIp(req)}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: `Too many messages. Please try again in ${Math.ceil(limit.retryAfter / 60)} minute(s).` }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = enquiryInputSchema.safeParse(body);
  if (!parsed.success) {
    // A filled honeypot means a bot: answer as if it worked, store nothing.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { website, ...input } = parsed.data;
  const db = store();
  const enquiry = await db.addEnquiry(input, false);
  const emailed = await sendEnquiryEmail(enquiry);
  if (emailed) await db.markEmailed(enquiry.id, true);

  return NextResponse.json({ ok: true });
}
