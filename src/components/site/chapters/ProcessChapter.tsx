"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChapterProps } from "../chapters";
import { ChapterHead, Rise, chapterPad } from "./ChapterHead";

const FN = ["imagine()", "design()", "build()", "launch()", "grow()", "support()", "scale()", "evolve()"];

/** Chapter 4 — the process as a running pipeline that advances on its own. */
export default function ProcessChapter({ content }: ChapterProps) {
  const steps = content.process;
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (pinned || steps.length < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % steps.length), 3200);
    return () => clearInterval(t);
  }, [pinned, steps.length]);

  const s = steps[active];
  if (!s) return null;

  return (
    <div className={chapterPad}>
      <ChapterHead n={4} tag="process" title="From a thought" highlight="to a thing people use." intro="A clear, collaborative path — you see progress at every step." />

      {/* Pipeline */}
      <Rise step={2} className="relative" >
        <div className="absolute left-0 right-0 top-6 hidden h-0.5 bg-line sm:block" />
        <motion.div
          className="absolute left-0 top-6 hidden h-0.5 bg-gradient-to-r from-teal to-teal-deep sm:block"
          animate={{ width: `${(active / Math.max(steps.length - 1, 1)) * 100}%` }}
          transition={{ duration: 0.6 }}
        />
        <ol className="relative grid gap-3 sm:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ ["--n" as string]: steps.length }}>
          {steps.map((st, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <li key={st.title}>
                <button
                  onClick={() => {
                    setActive(i);
                    setPinned(true);
                  }}
                  className="group flex w-full items-center gap-3 text-left sm:flex-col sm:items-start"
                  aria-current={on ? "step" : undefined}
                >
                  <span
                    className={`relative grid size-12 shrink-0 place-items-center rounded-full border font-mono text-sm transition ${on ? "border-teal bg-teal text-ink" : done ? "border-teal/60 bg-ink text-teal" : "border-line bg-ink text-muted group-hover:border-teal/50"}`}
                  >
                    {on && <span className="absolute inset-0 animate-ping rounded-full bg-teal/30" />}
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={`block font-display text-lg font-bold ${on ? "text-teal" : ""}`}>{st.title}</span>
                    <span className="block font-mono text-[10px] text-faint">{FN[i] ?? "next()"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </Rise>

      {/* Active step console */}
      <Rise step={3} className="mt-10">
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            <span className="size-2 animate-pulse rounded-full bg-teal" />
            process.log
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
              <div className="font-display text-7xl font-extrabold leading-none text-gradient sm:text-8xl">{String(active + 1).padStart(2, "0")}</div>
              <div>
                <p className="font-mono text-sm text-teal">
                  &gt; sapok.{FN[active] ?? "next()"} <span className="text-muted">— running</span>
                </p>
                <h3 className="mt-2 font-display text-3xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">{s.body}</p>
                <p className="mt-4 font-mono text-xs text-faint">
                  ✓ step {active + 1} of {steps.length}
                  {active === steps.length - 1 ? " · and we keep going with you." : ""}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Rise>
    </div>
  );
}
