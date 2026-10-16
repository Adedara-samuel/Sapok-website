"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ChapterProps } from "../chapters";
import { ChapterHead, chapterPad, trackSpotlight } from "./ChapterHead";

/** Chapter 3 — services as glowing cards that light up under the cursor. */
export default function ServicesChapter({ content, go, setIdea }: ChapterProps) {
  return (
    <div className={chapterPad}>
      <ChapterHead
        n={3}
        tag="services"
        title="Whatever the idea,"
        highlight="we have the stack for it."
        intro="Consulting, design, engineering and long-term care — one partner for the whole journey."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {content.services.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ opacity: 0, y: 30, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.35 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            onPointerMove={trackSpotlight}
            onClick={() => {
              setIdea(`I need help with ${s.title.toLowerCase()}`);
              go("contact");
            }}
            data-cursor="click"
            className="panel spotlight group flex flex-col p-5 text-left transition-colors hover:border-teal/40"
          >
            <div className="flex items-center justify-between font-mono text-[11px] text-faint">
              <span>0x{String(i + 1).padStart(2, "0")}</span>
              <ArrowUpRight className="size-4 transition group-hover:rotate-45 group-hover:text-teal" />
            </div>
            <h3 className="mt-8 font-display text-xl font-bold tracking-tight transition group-hover:text-teal">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.body}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {s.tags.map((t) => (
                <span key={t} className="chip !text-[10px]">
                  {t}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
