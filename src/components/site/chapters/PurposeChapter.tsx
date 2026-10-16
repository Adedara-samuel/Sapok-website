"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, Eye, Heart, Infinity as InfinityIcon, Sparkles, Users } from "lucide-react";
import type { ChapterProps } from "../chapters";
import { ChapterHead, Rise, chapterPad, trackSpotlight } from "./ChapterHead";

const VALUE_ICONS = [Heart, InfinityIcon, Sparkles, Users];

/** Text that reveals word by word. */
function Words({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <>
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: reduce ? 1 : 0.12, y: reduce ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.035, duration: 0.4 }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </>
  );
}

/** Chapter 6 — mission, vision and values. */
export default function PurposeChapter({ content }: ChapterProps) {
  return (
    <div className={chapterPad}>
      <ChapterHead n={6} tag="purpose" title="Beyond satisfied." highlight="Smiling." intro="Why we do what we do — and the promise we make to every client." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Rise step={2} className="panel overflow-hidden">
          <div onPointerMove={trackSpotlight} className="spotlight h-full p-7 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-teal/15 text-teal">
                <Compass className="size-5" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal">Our mission</span>
            </div>
            <p className="mt-6 font-display text-2xl font-semibold leading-snug tracking-tight sm:text-[1.7rem]">
              <Words text={content.mission} delay={0.5} />
            </p>
          </div>
        </Rise>
        <Rise step={3} className="panel overflow-hidden">
          <div onPointerMove={trackSpotlight} className="spotlight h-full p-7 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-coral/15 text-coral">
                <Eye className="size-5" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-coral">Our vision</span>
            </div>
            <p className="mt-6 font-display text-2xl font-semibold leading-snug tracking-tight sm:text-[1.7rem]">
              <Words text={content.vision} delay={0.9} />
            </p>
          </div>
        </Rise>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {content.values.map((v, i) => {
          const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
          return (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              whileHover={{ y: -6 }}
              onPointerMove={trackSpotlight}
              className="panel spotlight p-5"
            >
              <Icon className="size-5 text-teal" />
              <h3 className="mt-4 font-display text-lg font-bold">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.body}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
