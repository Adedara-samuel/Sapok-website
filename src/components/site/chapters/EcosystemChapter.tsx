"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PRODUCT_MARKS, SapokMark } from "@/components/brand/SapokMarks";
import type { ChapterProps } from "../chapters";
import { ChapterHead, Rise, chapterPad } from "./ChapterHead";

const STATUS_TONE = { Live: "bg-teal", "In progress": "bg-coral", "Coming soon": "bg-amber-300" } as const;

/** Node positions evenly around a circle, starting at the top. */
function positions(n: number, r = 40) {
  return Array.from({ length: n }, (_, i) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
  });
}

/** Chapter 2 — the SAPOK ecosystem: products orbiting the company, with a live detail panel. */
export default function EcosystemChapter({ content, go, setIdea }: ChapterProps) {
  const reduce = useReducedMotion();
  const products = content.products;
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const pos = positions(products.length);
  const p = products[active] ?? products[0];

  // Gently tour the products until the visitor picks one
  useEffect(() => {
    if (pinned || products.length < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % products.length), 4200);
    return () => clearInterval(t);
  }, [pinned, products.length]);

  if (!p) return null;
  const Mark = PRODUCT_MARKS[p.mark];

  return (
    <div className={chapterPad}>
      <ChapterHead
        n={2}
        tag="ecosystem"
        title="One company."
        highlight="A growing ecosystem."
        intro="Besides building for clients, we build our own products — so we know what it takes to run software, not just ship it."
      />

      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
        {/* Orbit */}
        <Rise step={2} className="relative mx-auto aspect-square w-full max-w-[520px]">
          <div aria-hidden className="absolute inset-[20%] rounded-full bg-teal-deep/10 blur-3xl" />
          <div aria-hidden className="spin-slow absolute inset-[10%] rounded-full border border-dashed border-teal/25" />
          <div aria-hidden className="spin-rev absolute inset-[27%] rounded-full border border-teal/15" />
          <div aria-hidden className="spin-slow absolute inset-[2%] rounded-full border border-line/70 [animation-duration:90s]" />

          <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full">
            {pos.map((pt, i) => (
              <g key={i}>
                <line x1="50" y1="50" x2={pt.x} y2={pt.y} stroke="#5eead4" strokeOpacity={i === active ? 0.6 : 0.15} strokeWidth="0.4" />
                <line x1="50" y1="50" x2={pt.x} y2={pt.y} stroke="#5eead4" strokeWidth="0.5" strokeDasharray="1.5 4" className="flow" style={{ animationDelay: `${i * -0.5}s` }} />
                {!reduce && (
                  <circle r="1.1" fill={i === active ? "#ff7a59" : "#5eead4"}>
                    <animateMotion dur={`${2.4 + i * 0.35}s`} repeatCount="indefinite" path={`M50 50 L${pt.x} ${pt.y}`} />
                  </circle>
                )}
              </g>
            ))}
          </svg>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span aria-hidden className="absolute inset-0 animate-ping rounded-[28%] bg-teal-deep/20 [animation-duration:2.8s]" />
            <motion.div
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative grid size-24 place-items-center rounded-[28%] border border-teal/30 bg-ink sm:size-28"
            >
              <SapokMark className="size-14 sm:size-16" />
            </motion.div>
          </div>

          {products.map((prod, i) => {
            const M = PRODUCT_MARKS[prod.mark];
            const on = i === active;
            return (
              <div key={prod.slug} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%` }}>
                <motion.button
                  data-cursor="view"
                  onClick={() => {
                    setActive(i);
                    setPinned(true);
                  }}
                  animate={{ y: reduce ? 0 : [0, i % 2 ? 5 : -5, 0], scale: on ? 1.12 : 1 }}
                  transition={{ y: { duration: 4 + i * 0.6, repeat: Infinity, ease: "easeInOut" }, scale: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="group flex flex-col items-center gap-1.5"
                  aria-pressed={on}
                  aria-label={prod.name}
                >
                  <span className={`grid size-14 place-items-center overflow-hidden rounded-2xl border bg-surface shadow-xl shadow-black/40 transition sm:size-16 ${on ? "border-teal ring-4 ring-teal/15" : "border-line group-hover:border-teal/60"}`}>
                    <M className={prod.mark === "withu" ? "size-full" : "size-9 sm:size-10"} />
                  </span>
                  <span className={`whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] backdrop-blur ${on ? "bg-teal text-ink" : "bg-ink/80 text-paper"}`}>
                    {prod.name}
                  </span>
                </motion.button>
              </div>
            );
          })}
        </Rise>

        {/* Detail panel */}
        <Rise step={3}>
          <AnimatePresence mode="wait">
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={{ duration: 0.45 }}
              className="panel spotlight overflow-hidden p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid size-16 place-items-center overflow-hidden rounded-2xl border border-line bg-ink">
                  <Mark className={p.mark === "withu" ? "size-full" : "size-10"} />
                </div>
                <span className="chip">
                  <span className={`size-1.5 animate-pulse rounded-full ${STATUS_TONE[p.status]}`} />
                  {p.status}
                </span>
              </div>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-teal">{p.category}</p>
              <h3 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{p.name}</h3>
              <p className="mt-3 leading-relaxed text-muted">{p.summary}</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-paper/90">
                    <span className="font-mono text-teal">›</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                {p.link ? (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    Open {p.name} <ArrowUpRight className="size-4" />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setIdea(`Early access to ${p.name}`);
                      go("contact");
                    }}
                    className="btn-primary"
                  >
                    Get early access <ArrowUpRight className="size-4" />
                  </button>
                )}
              </div>
              {/* product tour progress */}
              <div className="mt-7 flex gap-1.5">
                {products.map((prod, i) => (
                  <button
                    key={prod.slug}
                    onClick={() => {
                      setActive(i);
                      setPinned(true);
                    }}
                    aria-label={`Show ${prod.name}`}
                    className={`h-1 flex-1 rounded-full transition-colors ${i === active ? "bg-teal" : "bg-line hover:bg-faint"}`}
                  />
                ))}
              </div>
            </motion.article>
          </AnimatePresence>
        </Rise>
      </div>
    </div>
  );
}
