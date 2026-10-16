"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type Mode = "dot" | "link" | "click" | "view" | "text" | "drag";

const LABELS: Partial<Record<Mode, string>> = {
  link: "↗",
  click: "CLICK",
  view: "VIEW",
  drag: "DRAG",
};

const MODES: Mode[] = ["link", "click", "view", "text", "drag"];

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(pointer: fine)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function modeFor(target: EventTarget | null): Mode {
  if (!(target instanceof Element)) return "dot";
  const tagged = target.closest("[data-cursor]");
  if (tagged) {
    const m = tagged.getAttribute("data-cursor") as Mode;
    if (MODES.includes(m)) return m;
  }
  if (target.closest("input, textarea, select, [contenteditable='true']")) return "text";
  if (target.closest("button, [role='button']")) return "click";
  if (target.closest("a")) return "link";
  return "dot";
}

/**
 * Difference-blended dot that rides a fast spring, plus a trailing accent pill
 * that labels what the pointer is over. Fine pointers only — touch keeps the native UX.
 */
export default function Cursor() {
  const fine = useSyncExternalStore(subscribe, () => window.matchMedia("(pointer: fine)").matches, () => false);
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("dot");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const stiffness = reduce ? 900 : 520;
  const damping = reduce ? 60 : 46;
  const dotX = useSpring(x, { stiffness, damping, mass: 0.45 });
  const dotY = useSpring(y, { stiffness, damping, mass: 0.45 });
  const pillX = useSpring(x, { stiffness: 300, damping: 34 });
  const pillY = useSpring(y, { stiffness: 300, damping: 34 });

  useEffect(() => {
    if (!fine) return;
    const root = document.documentElement;
    root.classList.add("custom-cursor");

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setVisible(true);
      x.set(e.clientX);
      y.set(e.clientY);
      setMode(modeFor(e.target));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  const label = LABELS[mode];
  const dotScale = !visible ? 0 : mode === "dot" ? 1 : mode === "text" ? 0.5 : 2.6;

  return (
    <>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[130]" style={{ x: dotX, y: dotY }}>
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
          style={{ width: 8, height: mode === "text" ? 22 : 8 }}
          animate={{ scale: dotScale, opacity: visible ? 1 : 0, borderRadius: mode === "text" ? 2 : 999 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        />
      </motion.div>
      {label ? (
        <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[131]" style={{ x: pillX, y: pillY }}>
          <motion.div
            initial={false}
            animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.6, x: 16, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="flex h-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal px-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-ink"
          >
            {label}
          </motion.div>
        </motion.div>
      ) : null}
    </>
  );
}
