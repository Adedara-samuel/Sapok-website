"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SAPOK_S_PATH } from "@/components/brand/SapokMarks";

const SESSION_KEY = "sapok:booted";
const EASE = [0.76, 0, 0.24, 1] as const;

const LOG = [
  ["sapok.os", "v2026.1"],
  ["initialising core", "ok"],
  ["mounting modules", "web · mobile · desktop · ai · pay"],
  ["linking ecosystem", "5 products"],
  ["loading clients", "4 online"],
  ["calibrating ideas → reality", "ok"],
] as const;

const GLYPHS = "▓▒░<>/\\{}[]#$%&@01";
const WORD = "SAPOK TECH";

/** Text that resolves from random glyphs into the real word, left to right. */
function Decode({ text, start, className }: { text: string; start: boolean; className?: string }) {
  const [out, setOut] = useState(() => text.replace(/\S/g, " "));
  useEffect(() => {
    if (!start) return;
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      setOut(
        text
          .split("")
          .map((ch, i) => (ch === " " ? " " : i < frame / 2.2 ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (frame / 2.2 > text.length) clearInterval(id);
    }, 38);
    return () => clearInterval(id);
  }, [start, text]);
  return <span className={className}>{out}</span>;
}

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * Futuristic boot sequence. Progress is the slower of real loading (fonts + key images) and a
 * minimum runtime, so it never lies and never flashes by. Exits with an aperture reveal.
 */
export default function BootScreen({ assets, onReveal }: { assets: string[]; onReveal: () => void }) {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "exit" | "gone">("boot");
  const loaded = useRef(0);
  const total = useRef(1);
  const revealRef = useRef(onReveal);

  useEffect(() => {
    revealRef.current = onReveal;
  }, [onReveal]);

  useEffect(() => {
    let repeat = false;
    try {
      repeat = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    const minMs = reduce ? 300 : repeat ? 1100 : 3200;
    const maxMs = 8000;

    const jobs = [document.fonts?.ready.then(() => undefined) ?? Promise.resolve(), ...assets.map(preload)];
    total.current = jobs.length;
    jobs.forEach((j) => j.then(() => (loaded.current += 1)));

    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - t0;
      const timeP = Math.min(elapsed / minMs, 1);
      const realP = elapsed > maxMs ? 1 : loaded.current / total.current;
      const p = Math.min(timeP, realP);
      setProgress(p);
      if (p >= 1) {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {}
        setTimeout(() => setPhase("exit"), reduce ? 0 : 350);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [assets, reduce]);

  useEffect(() => {
    if (phase !== "exit") return;
    revealRef.current();
    const t = setTimeout(() => setPhase("gone"), reduce ? 250 : 1200);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  if (phase === "gone") return null;
  const pct = Math.round(progress * 100);
  const logShown = Math.ceil(progress * LOG.length + 0.01);

  return (
    <motion.div
      role="status"
      aria-label={`Loading SAPOK TECH, ${pct}%`}
      className="fixed inset-0 z-[100] overflow-hidden bg-[#020c0a] text-[#ecfdf7]"
      initial={false}
      animate={phase === "exit" ? (reduce ? { opacity: 0 } : { clipPath: "circle(0% at 50% 50%)" }) : { clipPath: "circle(150% at 50% 50%)", opacity: 1 }}
      transition={{ duration: reduce ? 0.25 : 1.05, ease: EASE }}
      style={{ pointerEvents: phase === "exit" ? "none" : "auto" }}
    >
      {/* HUD backdrop: grid, vignette, scanline */}
      <div aria-hidden className="grid-floor absolute inset-0 opacity-70" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,transparent,#020c0a_85%)]" />
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#5eead4]/10 to-transparent"
          initial={{ top: "-10%" }}
          animate={{ top: "110%" }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Corner brackets */}
      {["left-5 top-5 border-l border-t", "right-5 top-5 border-r border-t", "left-5 bottom-5 border-l border-b", "right-5 bottom-5 border-r border-b"].map((c) => (
        <span key={c} aria-hidden className={`absolute size-8 border-[#5eead4]/50 ${c}`} />
      ))}

      {/* Boot log */}
      <div className="absolute left-8 top-10 max-w-[min(92vw,420px)] font-mono text-[11px] leading-6 text-[#8fb3a8] sm:left-12 sm:top-12 sm:text-xs">
        {LOG.slice(0, logShown).map(([k, v], i) => (
          <motion.div key={k} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="flex gap-2">
            <span className="text-[#5eead4]">{i === logShown - 1 && pct < 100 ? "›" : "✓"}</span>
            <span>{k}</span>
            <span className="min-w-4 flex-1 translate-y-[-3px] overflow-hidden whitespace-nowrap text-[#2a4a41]">.........................................</span>
            <span className="text-[#ecfdf7]">{v}</span>
          </motion.div>
        ))}
      </div>

      {/* Core: rings + self-drawing S */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%]">
        <div className="relative grid size-56 place-items-center sm:size-72">
          <div aria-hidden className="spin-slow absolute inset-0 rounded-full border border-dashed border-[#5eead4]/30 [animation-duration:14s]" />
          <div aria-hidden className="spin-rev absolute inset-6 rounded-full border border-[#5eead4]/20 [animation-duration:9s]" />
          {/* progress arc */}
          <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-3 -rotate-90">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#133229" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="url(#bootArc)" strokeWidth="1.4" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - progress} />
            <defs>
              <linearGradient id="bootArc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#5eead4" />
                <stop offset="1" stopColor="#00c896" />
              </linearGradient>
            </defs>
          </svg>
          {/* tick marks */}
          <svg aria-hidden viewBox="0 0 100 100" className="spin-slow absolute inset-0 [animation-duration:60s]">
            {Array.from({ length: 48 }, (_, i) => (
              <line key={i} x1="50" y1="1" x2="50" y2={i % 4 ? 2.5 : 4} stroke="#5eead4" strokeOpacity={i % 4 ? 0.25 : 0.6} strokeWidth="0.4" transform={`rotate(${i * 7.5} 50 50)`} />
            ))}
          </svg>

          <div className="relative grid size-28 place-items-center rounded-[30%] border border-[#5eead4]/30 bg-[#020c0a] shadow-[0_0_60px_-10px_rgba(0,200,150,0.55)] sm:size-32">
            <svg viewBox="0 0 100 100" className="size-16 sm:size-20" aria-hidden>
              <defs>
                <linearGradient id="bootS" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#5eead4" />
                  <stop offset="1" stopColor="#00c896" />
                </linearGradient>
              </defs>
              <motion.path
                d={SAPOK_S_PATH}
                fill="url(#bootS)"
                stroke="#5eead4"
                strokeWidth="1.6"
                strokeLinejoin="round"
                initial={{ pathLength: reduce ? 1 : 0, fillOpacity: reduce ? 1 : 0 }}
                animate={{ pathLength: 1, fillOpacity: 1 }}
                transition={{ pathLength: { duration: 1.4, ease: "easeInOut", delay: 0.2 }, fillOpacity: { duration: 0.6, delay: 1.4 } }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Wordmark + tagline */}
      <div className="absolute inset-x-0 top-1/2 mt-[7.5rem] text-center sm:mt-[9.5rem]">
        <div className="font-display text-[clamp(1.8rem,6vw,3.2rem)] font-extrabold tracking-[0.18em]">
          <Decode text={WORD} start={progress > 0.12 || !!reduce} className="text-gradient" />
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: progress > 0.45 ? 1 : 0 }} className="mt-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#8fb3a8]">
          If you can think it, we can build it
        </motion.p>
      </div>

      {/* Progress readout */}
      <div className="absolute inset-x-8 bottom-10 sm:inset-x-12 sm:bottom-12">
        <div className="mb-3 flex items-end justify-between font-mono">
          <span className="text-[10px] uppercase tracking-[0.24em] text-[#4d6d64]">
            <AnimatePresence mode="wait">
              <motion.span key={pct >= 100 ? "ready" : "boot"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {pct >= 100 ? "system ready" : "booting"}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="text-4xl tabular-nums text-[#ecfdf7] sm:text-5xl">
            {String(pct).padStart(3, "0")}
            <span className="text-lg text-[#5eead4]">%</span>
          </span>
        </div>
        <div className="relative h-1 overflow-hidden rounded-full bg-[#133229]">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#5eead4] to-[#00c896]" style={{ width: `${pct}%` }} />
          <div className="shimmer absolute inset-0" />
        </div>
      </div>
    </motion.div>
  );
}
