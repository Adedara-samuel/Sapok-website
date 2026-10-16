"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ChapterProps } from "../chapters";
import { ChapterHead, Rise, chapterPad } from "./ChapterHead";

function Counter({ to, suffix, delay }: { to: number; suffix: string; delay: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - start) / 1400, 0), 1);
      setN(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, delay, reduce]);
  return (
    <>
      {n}
      {suffix}
    </>
  );
}

/** Chapter 5 — happy clients and the numbers. */
export default function ClientsChapter({ content }: ChapterProps) {
  const clients = content.clients;
  return (
    <div className={chapterPad}>
      <ChapterHead n={5} tag="clients" title="Happy clients," highlight="real results." intro="Businesses that trusted us with their ideas — and keep coming back." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {clients.map((c, i) => {
          const card = (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.08, type: "spring", stiffness: 220, damping: 22 }}
              whileHover={{ y: -8, rotate: i % 2 ? 1 : -1 }}
              className="group overflow-hidden rounded-3xl border border-line bg-surface"
            >
              <div className="relative grid h-44 place-items-center bg-white p-6">
                <img src={c.logo} alt={`${c.name} logo`} className="max-h-32 w-auto max-w-full object-contain transition duration-500 group-hover:scale-105" />
                <span className="absolute right-3 top-3 rounded-full bg-[#04120f] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-teal">client</span>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c.name}</div>
                  <div className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{c.sector}</div>
                </div>
                {c.link ? <ArrowUpRight className="size-4 shrink-0 text-muted transition group-hover:rotate-45 group-hover:text-teal" /> : null}
              </div>
            </motion.div>
          );
          return c.link ? (
            <a key={c.name} href={c.link} target="_blank" rel="noopener noreferrer" data-cursor="link">
              {card}
            </a>
          ) : (
            <div key={c.name}>{card}</div>
          );
        })}
      </div>

      {/* Numbers */}
      <Rise step={6} className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
        {content.stats.map((s, i) => (
          <div key={s.label} className="bg-ink/90 p-6 sm:p-8">
            <div className="font-display text-4xl font-extrabold tracking-tight text-gradient sm:text-5xl">
              <Counter to={s.value} suffix={s.suffix} delay={500 + i * 150} />
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{s.label}</div>
          </div>
        ))}
      </Rise>

      {/* Logo ticker */}
      <Rise step={7} className="mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee flex w-max items-center gap-12">
          {[...clients, ...clients, ...clients, ...clients].map((c, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap font-display text-lg font-bold text-faint">
              <span className="size-1.5 rounded-full bg-teal" />
              {c.name}
            </span>
          ))}
        </div>
      </Rise>
    </div>
  );
}
