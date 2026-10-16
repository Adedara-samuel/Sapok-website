"use client";

import { motion } from "framer-motion";
import { SapokMark, SapokWordmark } from "@/components/brand/SapokMarks";
import type { ChapterProps } from "../chapters";
import { ChapterHead, Rise, chapterPad } from "./ChapterHead";

/** Renders a JSON-ish object with syntax colours, one line at a time. */
function CompanyJson({ data }: { data: Record<string, string | string[]> }) {
  const lines: React.ReactNode[] = [<span key="o">{"{"}</span>];
  const entries = Object.entries(data);
  entries.forEach(([k, v], i) => {
    const comma = i < entries.length - 1 ? "," : "";
    lines.push(
      <span key={k}>
        {"  "}
        <span className="text-[#93c5fd]">&quot;{k}&quot;</span>: {Array.isArray(v) ? (
          <>
            [{v.map((x, j) => (
              <span key={x}>
                <span className="text-teal">&quot;{x}&quot;</span>
                {j < v.length - 1 ? ", " : ""}
              </span>
            ))}]
          </>
        ) : (
          <span className="text-teal">&quot;{v}&quot;</span>
        )}
        {comma}
      </span>,
    );
  });
  lines.push(<span key="c">{"}"}</span>);
  return (
    <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-7 text-paper/90 sm:text-[13px]">
      {lines.map((l, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }}>
          <span className="mr-4 inline-block w-5 select-none text-right text-faint">{i + 1}</span>
          {l}
        </motion.div>
      ))}
    </pre>
  );
}

/** Chapter 7 — who we are, and the founder. */
export default function AboutChapter({ content, go }: ChapterProps) {
  const c = content.company;
  const json = {
    name: c.name,
    type: "Technology & consulting company",
    founded: c.founded,
    founder: `${c.owner} (${c.ownerTitle})`,
    hq: content.contact.address,
    builds: ["web", "mobile", "desktop", "enterprise", "fintech", "AI", "brand"],
    promise: "If you can think it, it can be real.",
  };

  return (
    <div className={chapterPad}>
      <ChapterHead n={7} tag="about" title="Who we are." intro={content.about.heading} />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Rise step={2} className="space-y-4 text-lg leading-relaxed text-paper/85">
            {content.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Rise>

          {/* Founder card */}
          <Rise step={3} className="panel relative overflow-hidden p-6 sm:p-7">
            <div aria-hidden className="absolute -right-10 -top-10 size-48 rounded-full bg-teal-deep/15 blur-3xl" />
            <div className="relative flex items-center gap-5">
              <div className="grid size-20 shrink-0 place-items-center rounded-3xl border border-teal/30 bg-ink">
                <SapokMark className="size-12" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-teal">{c.ownerTitle}</p>
                <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight">{c.owner}</h3>
                <p className="mt-1 text-sm text-muted">Founded {c.name} in {c.founded} to give every idea a team that can build it.</p>
              </div>
            </div>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <button onClick={() => go("contact")} className="btn-primary">
                Talk to us
              </button>
              <button onClick={() => go("purpose")} className="btn-ghost">
                Our mission
              </button>
            </div>
          </Rise>
        </div>

        <Rise step={3} className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="font-mono text-[11px] text-muted">company.json</span>
            <SapokWordmark suffix="TECH" className="text-[11px]" />
          </div>
          <CompanyJson data={json} />
          <div className="flex items-center gap-2 border-t border-line px-4 py-2.5 font-mono text-[10px] text-faint">
            <span className="size-1.5 animate-pulse rounded-full bg-teal" />
            status: building the future · {new Date().getFullYear()}
          </div>
        </Rise>
      </div>
    </div>
  );
}
