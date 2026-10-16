"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Staggered entrance for chapter content. */
export function Rise({ children, step = 0, className }: { children: React.ReactNode; step?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 + step * 0.07 }}
    >
      {children}
    </motion.div>
  );
}

/** Chapter heading in a code-comment voice: `// 02 — products`. */
export function ChapterHead({ n, tag, title, highlight, intro }: { n: number; tag: string; title: string; highlight?: string; intro?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="mb-10 max-w-4xl md:mb-14">
      <Rise className="mb-5 flex items-center gap-3 font-mono text-[12px] text-muted">
        <span className="text-teal">{"//"}</span>
        <span className="text-paper">{String(n).padStart(2, "0")}</span>
        <span className="h-px w-8 bg-line" />
        <span className="uppercase tracking-[0.2em]">{tag}</span>
      </Rise>
      <h2 className="font-display text-[clamp(2.2rem,5.5vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
        <span className="block overflow-hidden pb-1">
          <motion.span className="block" initial={{ y: reduce ? 0 : "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}>
            {title}
          </motion.span>
        </span>
        {highlight ? (
          <span className="block overflow-hidden pb-1">
            <motion.span className="text-gradient block" initial={{ y: reduce ? 0 : "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}>
              {highlight}
            </motion.span>
          </span>
        ) : null}
      </h2>
      {intro ? (
        <Rise step={3} className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {intro}
        </Rise>
      ) : null}
    </div>
  );
}

export const chapterPad = "mx-auto w-full max-w-7xl px-5 pb-28 pt-10 sm:px-10 md:pb-24 md:pt-14 lg:pr-28";

/** Sets --mx/--my on hover so .spotlight cards glow under the cursor. */
export function trackSpotlight(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}
