import "server-only";
import nodemailer from "nodemailer";
import type { Enquiry } from "./content";

/*
 * Sends new-enquiry notifications to the owner.
 * Gmail: set SMTP_USER to the Gmail address and SMTP_PASS to a 16-character App Password
 * (Google Account → Security → 2-Step Verification → App passwords). Other providers can set
 * SMTP_HOST / SMTP_PORT too.
 */

export function mailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function transport() {
  const host = process.env.SMTP_HOST;
  return host
    ? nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 465),
        secure: Number(process.env.SMTP_PORT || 465) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
    : nodemailer.createTransport({ service: "gmail", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
}

export async function sendEnquiryEmail(e: Enquiry): Promise<boolean> {
  if (!mailConfigured()) return false;
  const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER!;
  const rows: [string, string][] = [
    ["Name", e.name],
    ["Email", e.email],
    ["Phone", e.phone],
    ["Company", e.company],
    ["Service", e.service],
    ["Budget", e.budget],
    ["Their idea", e.idea],
  ].filter(([, v]) => v) as [string, string][];

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#f4fbf8;padding:24px">
    <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #d7efe7">
      <div style="background:#04120f;padding:20px 24px;color:#5eead4;font-weight:700;letter-spacing:.08em">SAPOK TECH · New enquiry</div>
      <div style="padding:24px;color:#0b1a17">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${rows.map(([k, v]) => `<tr><td style="padding:6px 0;color:#5b6b67;width:120px">${k}</td><td style="padding:6px 0;font-weight:600">${esc(v)}</td></tr>`).join("")}
        </table>
        <div style="margin-top:18px;padding:16px;background:#f4fbf8;border-radius:12px;white-space:pre-wrap;line-height:1.6">${esc(e.message)}</div>
        <p style="margin-top:18px;font-size:12px;color:#5b6b67">Reply to this email to answer ${esc(e.name)} directly. It's also saved in your admin portal.</p>
      </div>
    </div>
  </div>`;

  try {
    await transport().sendMail({
      from: `"SAPOK TECH Website" <${process.env.SMTP_USER}>`,
      to,
      replyTo: `"${e.name.replace(/"/g, "")}" <${e.email}>`,
      subject: `New enquiry from ${e.name}${e.service ? ` — ${e.service}` : ""}`,
      text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${e.message}`,
      html,
    });
    return true;
  } catch (err) {
    console.error("[mailer] could not send enquiry email:", err instanceof Error ? err.message : err);
    return false;
  }
}
