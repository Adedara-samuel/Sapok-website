"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { phoneDigits } from "@/lib/content";
import { SapokWordmark } from "@/components/brand/SapokMarks";
import type { ChapterProps } from "../chapters";
import { ChapterHead, Rise, chapterPad } from "./ChapterHead";

const BUDGETS = ["Not sure yet", "Under ₦500k", "₦500k – ₦2m", "₦2m – ₦10m", "₦10m+"];

/** Chapter 8 — tell us your idea. Messages land in the admin inbox and the owner's email. */
export default function ContactChapter({ content, idea }: ChapterProps) {
  const c = content.contact;
  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    budget: "",
    message: idea ? `My idea: ${idea}\n\n` : "",
    website: "",
  }));
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, idea }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  const wa = `https://wa.me/${phoneDigits(c.whatsapp)}?text=${encodeURIComponent("Hello SAPOK TECH, I have an idea I'd like to bring to life.")}`;
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`;

  return (
    <div className={chapterPad}>
      <ChapterHead n={8} tag="contact" title="Tell us the idea." highlight="We'll make it real." intro="Send a message, call or WhatsApp — every enquiry reaches us directly." />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Rise step={2} className="panel relative overflow-hidden p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {state === "sent" ? (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="grid size-16 place-items-center rounded-full bg-teal text-ink">
                  <Check className="size-8" strokeWidth={3} />
                </motion.span>
                <h3 className="mt-6 font-display text-3xl font-extrabold">Message received.</h3>
                <p className="mt-2 max-w-sm text-muted">Thank you, {form.name.split(" ")[0] || "friend"}. We&apos;ll be in touch shortly — usually within one working day.</p>
                <p className="mt-4 font-mono text-[11px] text-faint">&gt; enquiry.status = &quot;received&quot; ✓</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2" exit={{ opacity: 0 }} data-swipe-ignore>
                {idea ? (
                  <p className="font-mono text-xs text-teal sm:col-span-2">
                    &gt; idea loaded: <span className="text-paper">“{idea}”</span>
                  </p>
                ) : null}
                <input className="field" placeholder="Full name *" aria-label="Full name" required value={form.name} onChange={set("name")} maxLength={100} />
                <input className="field" type="email" placeholder="Email *" aria-label="Email" required value={form.email} onChange={set("email")} maxLength={160} />
                <input className="field" type="tel" placeholder="Phone (optional)" aria-label="Phone" value={form.phone} onChange={set("phone")} maxLength={40} />
                <input className="field" placeholder="Company (optional)" aria-label="Company" value={form.company} onChange={set("company")} maxLength={120} />
                <select className="field" aria-label="What do you need?" value={form.service} onChange={set("service")}>
                  <option value="">What do you need?</option>
                  {content.services.map((s) => (
                    <option key={s.title}>{s.title}</option>
                  ))}
                  <option>Something else</option>
                </select>
                <select className="field" aria-label="Budget" value={form.budget} onChange={set("budget")}>
                  <option value="">Budget (optional)</option>
                  {BUDGETS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                <textarea
                  className="field min-h-36 resize-y sm:col-span-2"
                  placeholder="Tell us about your idea — what should it do, and who is it for? *"
                  aria-label="Your message"
                  required
                  minLength={10}
                  maxLength={4000}
                  value={form.message}
                  onChange={set("message")}
                />
                {/* Honeypot: hidden from people, tempting to bots */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden />
                {state === "error" && <p className="text-sm text-coral sm:col-span-2">{error}</p>}
                <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                  <p className="font-mono text-[10px] text-faint">Your details are only used to reply to you.</p>
                  <button type="submit" disabled={state === "sending"} className="btn-primary">
                    {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    {state === "sending" ? "Sending…" : "Send message"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Rise>

        <div className="space-y-3">
          {[
            { icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}` },
            { icon: Phone, label: "Call", value: c.phone, href: `tel:+${phoneDigits(c.phone)}` },
            { icon: MessageCircle, label: "WhatsApp", value: c.whatsapp, href: wa, external: true },
            { icon: MapPin, label: "Visit", value: c.address, href: map, external: true },
          ].map((item, i) => (
            <Rise key={item.label} step={3 + i}>
              <a
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="panel group flex items-center gap-4 p-4 transition hover:border-teal/50"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal/10 text-teal transition group-hover:bg-teal group-hover:text-ink">
                  <item.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{item.label}</span>
                  <span className="block break-words text-sm font-medium">{item.value}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted transition group-hover:rotate-45 group-hover:text-teal" />
              </a>
            </Rise>
          ))}
          <Rise step={7} className="panel p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{c.hours}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {content.socials.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="chip transition hover:border-teal hover:text-teal">
                  {s.label}
                </a>
              ))}
            </div>
          </Rise>
        </div>
      </div>

      <Rise step={8} className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 sm:flex-row">
        <SapokWordmark suffix="TECH" className="text-sm" />
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
          © {new Date().getFullYear()} {content.company.name} · {content.company.tagline}
        </p>
      </Rise>
    </div>
  );
}
