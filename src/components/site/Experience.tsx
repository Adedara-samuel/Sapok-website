"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useTransform } from "framer-motion";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import type { SiteContent } from "@/lib/content";
import { SapokMark, SapokWordmark } from "@/components/brand/SapokMarks";
import { CHAPTERS, type ChapterId } from "./chapters";
import { useSceneScroll } from "./useChapterScroll";
import Cursor from "./Cursor";
import BootScreen from "./BootScreen";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import IdeaChapter from "./chapters/IdeaChapter";
import EcosystemChapter from "./chapters/EcosystemChapter";
import ServicesChapter from "./chapters/ServicesChapter";
import ProcessChapter from "./chapters/ProcessChapter";
import ClientsChapter from "./chapters/ClientsChapter";
import PurposeChapter from "./chapters/PurposeChapter";
import AboutChapter from "./chapters/AboutChapter";
import ContactChapter from "./chapters/ContactChapter";

const COMPONENTS = {
  idea: IdeaChapter,
  ecosystem: EcosystemChapter,
  services: ServicesChapter,
  process: ProcessChapter,
  clients: ClientsChapter,
  purpose: PurposeChapter,
  about: AboutChapter,
  contact: ContactChapter,
} as const;

const EASE = [0.76, 0, 0.24, 1] as const;

function chapterFromHash(): number {
  if (typeof window === "undefined") return 0;
  const id = window.location.hash.replace("#", "");
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return i < 0 ? 0 : i;
}

/**
 * The site as a stack of chapters instead of one long scroll. Moving forward, the current
 * chapter recedes into depth while the next rises toward the viewer.
 */
export default function Experience({ content }: { content: SiteContent }) {
  const reduce = !!useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [revealed, setRevealed] = useState(false);
  // Images worth having ready before the curtain lifts
  const bootAssets = useMemo(() => [...content.clients.map((c) => c.logo).filter(Boolean), "/products/withu.jpg"], [content.clients]);

  const chapter = CHAPTERS[index];

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= CHAPTERS.length || next === index) return;
      setDirection(next > index ? 1 : -1);
      setIndex(next);
      setMenuOpen(false);
      const hash = next === 0 ? window.location.pathname : `#${CHAPTERS[next].id}`;
      window.history.pushState(null, "", hash);
    },
    [index],
  );
  const go = useCallback((id: ChapterId) => goTo(CHAPTERS.findIndex((c) => c.id === id)), [goTo]);

  const { mainRef, registerScroller, onScrollerScroll, getEl, pull, progress, pullDir } = useSceneScroll({
    sceneId: chapter.id,
    enabled: !menuOpen,
    reduce,
    canGo: (dir) => Boolean(CHAPTERS[index + dir]),
    onNavigate: (dir) => goTo(index + dir),
  });
  const lift = useTransform(pull, [-1, 0, 1], [60, 0, -60]);
  const pullFill = useTransform(pull, (v) => Math.abs(v));
  const pullTarget = pullDir !== 0 ? CHAPTERS[index + pullDir] : undefined;

  // Deep links + back/forward
  useEffect(() => {
    const sync = () => {
      const next = chapterFromHash();
      setIndex((cur) => {
        if (next !== cur) setDirection(next > cur ? 1 : -1);
        return next;
      });
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") setMenuOpen(false);
      const el = getEl();
      const atTop = !el || el.scrollTop <= 1;
      const atBottom = !el || el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      if (e.key === "ArrowRight" || (e.key === "PageDown" && atBottom) || (e.key === "ArrowDown" && atBottom)) {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === "ArrowLeft" || (e.key === "PageUp" && atTop) || (e.key === "ArrowUp" && atTop)) {
        e.preventDefault();
        goTo(index - 1);
      } else if (/^[1-8]$/.test(e.key)) {
        goTo(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index, getEl]);

  const Chapter = COMPONENTS[chapter.id];
  const d = reduce ? 0 : 1;

  return (
    <div className="fixed inset-0 overflow-hidden bg-ink">
      <div aria-hidden className="aurora" />
      <div aria-hidden className="grid-floor pointer-events-none absolute inset-0 opacity-50" />

      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-line/70 bg-ink/70 px-4 backdrop-blur-xl sm:px-8">
        <button onClick={() => goTo(0)} className="flex items-center gap-3" aria-label="SAPOK TECH — home">
          <SapokMark className="size-8" />
          <SapokWordmark suffix="TECH" className="text-[15px]" />
        </button>
        <div className="hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted md:flex">
          <span className="text-teal">{String(index + 1).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-line" />
          <span className="relative inline-flex h-4 w-24 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={chapter.id} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 0.45, ease: EASE }} className="absolute">
                {chapter.label}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => go("contact")} className="hidden sm:inline-flex">
            Start a project
          </Button>
          <ThemeToggle />
          <button onClick={() => setMenuOpen(true)} aria-label="Open chapters" className="grid size-10 place-items-center rounded-full border border-line text-paper transition hover:border-teal hover:text-teal">
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      {/* Reading progress inside the chapter */}
      <motion.div aria-hidden className="absolute inset-x-0 top-16 z-40 h-0.5 origin-left bg-gradient-to-r from-teal to-teal-deep" style={{ scaleX: progress }} />

      {/* Stage */}
      <main ref={mainRef} className="absolute inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] top-16 [perspective:1600px] md:bottom-0">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.section
            key={chapter.id}
            custom={direction}
            aria-label={chapter.label}
            className="absolute inset-0 origin-[50%_40%]"
            variants={{
              enter: (dir: number) => ({ opacity: 0, y: `${dir * 16 * d}%`, scale: 1 - 0.08 * d, rotateX: dir * 10 * d, filter: "blur(0px)" }),
              center: { opacity: 1, y: "0%", scale: 1, rotateX: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
              exit: (dir: number) => ({ opacity: 0, y: `${-dir * 9 * d}%`, scale: 1 - 0.14 * d, rotateX: -dir * 8 * d, filter: reduce ? "blur(0px)" : "blur(10px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.2 : 0.95, ease: EASE }}
          >
            <motion.div className="h-full" style={{ y: lift }}>
              <div ref={registerScroller(chapter.id)} onScroll={(e) => onScrollerScroll(e.currentTarget)} className="chapter-scroll h-full overflow-y-auto overflow-x-hidden">
                {revealed ? <Chapter content={content} go={go} idea={idea} setIdea={setIdea} /> : null}
              </div>
            </motion.div>
          </motion.section>
        </AnimatePresence>
      </main>

      {/* Pull-to-continue meter */}
      <AnimatePresence>
        {pullTarget && (
          <motion.div
            key="pull"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute bottom-[calc(84px+env(safe-area-inset-bottom))] left-1/2 z-50 w-64 -translate-x-1/2 overflow-hidden rounded-full border border-line bg-surface/90 backdrop-blur-xl md:bottom-8"
          >
            <motion.span aria-hidden className="absolute inset-0 origin-left bg-teal/20" style={{ scaleX: pullFill }} />
            <span className="relative flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em]">
              {pullDir > 0 ? <ArrowDown className="size-3.5 text-teal" /> : <ArrowUp className="size-3.5 text-teal" />}
              Keep going <span className="text-teal">· {pullTarget.label}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop chapter dial */}
      <nav aria-label="Chapters" className="absolute right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <ol className="flex flex-col items-end gap-2.5">
          {CHAPTERS.map((c, i) => {
            const active = i === index;
            return (
              <li key={c.id}>
                <button onClick={() => goTo(i)} className="group flex items-center gap-3" aria-current={active ? "step" : undefined} aria-label={`${i + 1}. ${c.label}`}>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-500 ${active ? "text-paper opacity-100" : "translate-x-2 text-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}>
                    {c.label}
                  </span>
                  <span className={`grid place-items-center rounded-full border transition-all duration-500 ${active ? "size-7 border-teal bg-teal/15 text-teal" : "size-4 border-line bg-ink text-transparent group-hover:border-teal/60"}`}>
                    <span className="font-mono text-[9px]">{active ? String(i + 1).padStart(2, "0") : ""}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile controls */}
      <nav aria-label="Chapter controls" className="absolute inset-x-0 bottom-0 z-40 border-t border-line bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center gap-3 px-4">
          <button onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous chapter" className="grid size-10 place-items-center rounded-full border border-line disabled:opacity-30">
            <ChevronUp className="size-4" />
          </button>
          <button onClick={() => setMenuOpen(true)} className="flex-1 text-left">
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              {String(index + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
            </span>
            <span className="block text-sm font-semibold">{chapter.label}</span>
          </button>
          <div className="h-1 w-20 overflow-hidden rounded-full bg-line">
            <motion.div className="h-full bg-teal" animate={{ width: `${((index + 1) / CHAPTERS.length) * 100}%` }} />
          </div>
          <button onClick={() => goTo(index + 1)} disabled={index === CHAPTERS.length - 1} aria-label="Next chapter" className="grid size-10 place-items-center rounded-full bg-teal text-ink disabled:opacity-30">
            <ChevronDown className="size-4" />
          </button>
        </div>
      </nav>

      {/* Full-screen chapter menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-ink/95 backdrop-blur-2xl"
            initial={{ clipPath: "circle(0% at 95% 4%)" }}
            animate={{ clipPath: "circle(150% at 95% 4%)" }}
            exit={{ clipPath: "circle(0% at 95% 4%)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="flex h-16 items-center justify-between px-4 sm:px-8">
              <SapokWordmark suffix="TECH" className="text-[15px]" />
              <button onClick={() => setMenuOpen(false)} aria-label="Close" className="grid size-10 place-items-center rounded-full border border-line hover:border-teal hover:text-teal">
                <X className="size-4" />
              </button>
            </div>
            <ol className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-1 overflow-y-auto px-6 sm:px-10">
              {CHAPTERS.map((c, i) => (
                <motion.li key={c.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <button onClick={() => goTo(i)} className="group flex w-full items-baseline gap-5 border-b border-line py-3 text-left">
                    <span className="font-mono text-xs text-teal">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`font-display text-3xl font-bold tracking-tight transition group-hover:translate-x-2 group-hover:text-teal sm:text-5xl ${i === index ? "text-teal" : ""}`}>{c.label}</span>
                  </button>
                </motion.li>
              ))}
            </ol>
            <p className="px-6 pb-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              {content.contact.email} · {content.contact.phone}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <BootScreen assets={bootAssets} onReveal={() => setRevealed(true)} />
      <Cursor />
    </div>
  );
}
