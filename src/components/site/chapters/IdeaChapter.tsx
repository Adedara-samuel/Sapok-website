"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, CornerDownLeft, RotateCcw, Sparkles } from "lucide-react";
import type { ChapterProps } from "../chapters";
import { Rise, chapterPad } from "./ChapterHead";

type Phase = "idle" | "thinking" | "designing" | "building" | "live";
const PHASES: { id: Exclude<Phase, "idle">; label: string; ms: number }[] = [
  { id: "thinking", label: "Understanding the idea", ms: 1300 },
  { id: "designing", label: "Designing the experience", ms: 1700 },
  { id: "building", label: "Engineering & testing", ms: 2000 },
  { id: "live", label: "Live", ms: 0 },
];

// Modules the mock product shows, guessed from words in the idea.
const MODULE_HINTS: [RegExp, string[]][] = [
  [/book|salon|appoint|schedul|clinic|spa|barb/i, ["Bookings", "Calendar", "Payments", "Reminders"]],
  [/store|shop|sell|commerce|checkout|market|product/i, ["Products", "Cart", "Checkout", "Orders"]],
  [/school|student|result|class|fee|learn|course/i, ["Students", "Results", "Fees", "Timetable"]],
  [/hospital|patient|health|records|pharm|medic/i, ["Patients", "Appointments", "Records", "Billing"]],
  [/ai|assistant|chatbot|smart|bot/i, ["Assistant", "Knowledge", "Insights", "Automations"]],
  [/estate|property|propert|rent|house|home/i, ["Listings", "Enquiries", "Viewings", "Admin"]],
  [/church|ministry|member|cell/i, ["Members", "Attendance", "Giving", "Events"]],
  [/pay|wallet|fintech|bank|loan|savings/i, ["Wallets", "Transfers", "Ledger", "Reports"]],
];

function modulesFor(idea: string) {
  return MODULE_HINTS.find(([re]) => re.test(idea))?.[1] ?? ["Dashboard", "Users", "Workflows", "Reports"];
}

function appName(idea: string) {
  const cleaned = idea.replace(/^(an?|the|i want|build|make|create)\s+/i, "").trim();
  const name = cleaned.length > 34 ? `${cleaned.slice(0, 32)}…` : cleaned;
  return name.replace(/\b\w/g, (c) => c.toUpperCase()) || "Your Idea";
}

/** Chapter 1 — "Idea → Reality": a visitor types an idea and watches it get built. */
export default function IdeaChapter({ content, go, setIdea }: ChapterProps) {
  const reduce = useReducedMotion();
  const ideas = useMemo(() => (content.hero.ideas.length ? content.hero.ideas : ["A booking app for my salon"]), [content.hero.ideas]);
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [built, setBuilt] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [touched, setTouched] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Typewriter placeholder cycling through example ideas
  useEffect(() => {
    if (value) return;
    let i = 0;
    let c = 0;
    let deleting = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word = ideas[i % ideas.length];
      c += deleting ? -1 : 1;
      setPlaceholder(word.slice(0, c));
      if (!deleting && c === word.length) {
        deleting = true;
        t = setTimeout(tick, 1800);
        return;
      }
      if (deleting && c === 0) {
        deleting = false;
        i++;
      }
      t = setTimeout(tick, deleting ? 28 : 55);
    };
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [value, ideas]);

  const build = (idea: string) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setBuilt(idea);
    if (reduce) {
      setPhase("live");
      return;
    }
    let at = 0;
    for (const p of PHASES) {
      timers.current.push(setTimeout(() => setPhase(p.id), at));
      at += p.ms;
    }
  };

  // Until the visitor types their own idea, demo the builder with an example so the hero is never still.
  useEffect(() => {
    if (touched) return;
    let n = 0;
    const run = () => build(ideas[n++ % ideas.length]);
    const first = setTimeout(run, 900);
    const loop = setInterval(run, 9500);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const idea = (value || placeholder).trim();
    if (!idea) return;
    setTouched(true);
    build(idea);
  };

  const phaseIndex = PHASES.findIndex((p) => p.id === phase);
  const mods = modulesFor(built);

  return (
    <div className={`${chapterPad} grid min-h-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]`}>
      <div>
        <Rise className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 font-mono text-[11px] text-muted">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-teal" />
          </span>
          {content.hero.eyebrow}
        </Rise>

        <h1 className="font-display text-[clamp(2.6rem,6.6vw,5.6rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">
          <Rise step={1}>{content.hero.headline}</Rise>
          <Rise step={2} className="text-gradient">
            {content.hero.highlight}
          </Rise>
        </h1>
        <Rise step={3} className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {content.hero.subtitle}
        </Rise>

        {/* Terminal-style idea prompt */}
        <Rise step={4} className="mt-8">
          <form onSubmit={submit} className="panel overflow-hidden" data-swipe-ignore>
            <div className="flex items-center gap-2 border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              <span className="size-2 rounded-full bg-coral/80" />
              <span className="size-2 rounded-full bg-amber-300/80" />
              <span className="size-2 rounded-full bg-teal/80" />
              <span className="ml-2">sapok · idea-to-reality</span>
            </div>
            <label className="flex items-center gap-3 px-4 py-4">
              <span className="shrink-0 font-mono text-sm text-teal">$ build</span>
              <input
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setTouched(true);
                }}
                maxLength={120}
                placeholder={`"${placeholder}"`}
                aria-label="Describe your idea"
                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-paper outline-none placeholder:text-muted sm:text-base"
              />
              <button type="submit" className="btn-primary shrink-0 !px-4 !py-2.5" aria-label="Build my idea">
                <span className="hidden sm:inline">Build it</span>
                <CornerDownLeft className="size-4" />
              </button>
            </label>
          </form>
          <p className="mt-3 font-mono text-[11px] text-faint">Type any idea and press enter — watch it come to life.</p>
        </Rise>

        <Rise step={5} className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => {
              setIdea(built || value);
              go("contact");
            }}
            className="btn-primary"
          >
            Start a project <ArrowRight className="size-4" />
          </button>
          <button onClick={() => go("ecosystem")} className="btn-ghost">
            See our products
          </button>
        </Rise>
      </div>

      {/* The build visual */}
      <Rise step={3} className="relative">
        <div aria-hidden className="absolute -inset-10 rounded-full bg-teal-deep/10 blur-3xl" />
        <div className="panel relative overflow-hidden">
          {/* pipeline */}
          <div className="grid grid-cols-4 border-b border-line">
            {PHASES.map((p, i) => {
              const done = phaseIndex > i || phase === "live";
              const active = phaseIndex === i && phase !== "live";
              return (
                <div key={p.id} className="relative px-3 py-3">
                  <div className={`font-mono text-[9px] uppercase tracking-[0.14em] ${done || active ? "text-teal" : "text-faint"}`}>
                    {done ? "✓ " : active ? "▸ " : ""}
                    {p.id}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-line">
                    <motion.div className="h-full bg-teal" initial={false} animate={{ width: done ? "100%" : active ? "60%" : "0%" }} transition={{ duration: active ? p.ms / 1000 : 0.3 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative h-[360px] p-5 sm:h-[400px]">
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div key="idle" exit={{ opacity: 0 }} className="grid h-full place-items-center text-center">
                  <div>
                    <Sparkles className="mx-auto size-8 text-teal" />
                    <p className="mt-3 font-mono text-xs text-muted">awaiting your idea…</p>
                  </div>
                </motion.div>
              )}

              {phase === "thinking" && (
                <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full font-mono text-[12px] leading-7 text-muted">
                  <p className="text-paper">&gt; analysing “{built}”</p>
                  {["reading the problem…", "mapping users & goals…", `modules: ${mods.join(", ").toLowerCase()}`, "choosing the stack… ✓"].map((l, i) => (
                    <motion.p key={l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.22 }}>
                      <span className="text-teal">›</span> {l}
                    </motion.p>
                  ))}
                </motion.div>
              )}

              {(phase === "designing" || phase === "building" || phase === "live") && (
                <motion.div key="app" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ink">
                  <div className="flex items-center gap-2 border-b border-line px-3 py-2">
                    <span className="size-2 rounded-full bg-line" />
                    <span className="size-2 rounded-full bg-line" />
                    <span className="size-2 rounded-full bg-line" />
                    <span className="ml-2 truncate rounded-md bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
                      {phase === "live" ? "🔒 " : ""}
                      {appName(built).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "your-idea"}.app
                    </span>
                  </div>
                  <div className="grid flex-1 grid-cols-[88px_1fr]">
                    <div className="space-y-2 border-r border-line p-3">
                      {mods.map((m, i) => (
                        <motion.div
                          key={m}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className={`rounded-md px-2 py-1.5 text-[10px] ${i === 0 ? "bg-teal/15 text-teal" : phase === "designing" ? "bg-line/50 text-transparent" : "text-muted"}`}
                        >
                          {m}
                        </motion.div>
                      ))}
                    </div>
                    <div className="p-3">
                      <div className="font-display text-sm font-bold leading-tight">{appName(built)}</div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[0, 1, 2].map((k) => (
                          <motion.div
                            key={k}
                            className={`rounded-lg border p-2 ${phase === "designing" ? "border-dashed border-teal/40" : "border-line bg-surface"}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + k * 0.1 }}
                          >
                            <div className="h-1 w-8 rounded bg-faint/50" />
                            <div className={`mt-1.5 h-2.5 rounded ${phase === "designing" ? "w-6 bg-line" : k === 1 ? "w-10 bg-coral" : "w-9 bg-teal"}`} />
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-3 flex h-24 items-end gap-1.5 rounded-lg border border-line p-2">
                        {[40, 64, 52, 78, 60, 90, 72].map((h, k) => (
                          <motion.span
                            key={k}
                            className={`flex-1 rounded-sm ${phase === "designing" ? "border border-dashed border-teal/40" : "bg-gradient-to-t from-teal-deep to-teal"}`}
                            initial={{ height: "8%" }}
                            animate={{ height: phase === "designing" ? "30%" : `${h}%` }}
                            transition={{ delay: 0.2 + k * 0.06, type: "spring", stiffness: 160, damping: 16 }}
                          />
                        ))}
                      </div>
                      {phase === "building" && (
                        <div className="mt-3 h-6 overflow-hidden rounded-md bg-surface">
                          <div className="shimmer h-full" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live toast */}
            <AnimatePresence>
              {phase === "live" && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="absolute inset-x-8 bottom-8 flex items-center gap-3 rounded-2xl border border-teal/40 bg-ink/95 p-3 shadow-2xl shadow-black/60"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal text-ink">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">It&apos;s real.</span>
                    <span className="block truncate font-mono text-[10px] text-muted">{appName(built)} · deployed</span>
                  </span>
                  <button
                    onClick={() => {
                      setIdea(built);
                      go("contact");
                    }}
                    className="btn-primary !px-3 !py-2 text-xs"
                  >
                    Make it mine
                  </button>
                  <button onClick={() => build(built)} aria-label="Replay" className="grid size-8 place-items-center rounded-full border border-line text-muted hover:text-teal">
                    <RotateCcw className="size-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-[11px] text-faint">
          {content.company.name} · est. {content.company.founded} · {content.contact.address.split(",").slice(-2).join(",").trim()}
        </p>
      </Rise>
    </div>
  );
}
