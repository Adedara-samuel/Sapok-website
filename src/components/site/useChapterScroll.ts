"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue } from "framer-motion";

// How much wheel travel past a scene's edge it takes to move on (~3–4 mouse-wheel notches).
const PULL_WHEEL_PX = 380;
// Finger travel past the edge needed on touch screens.
const PULL_TOUCH_PX = 170;
// Stop pushing for this long and the pull springs back.
const RELEASE_MS = 240;
// Ease factor for smooth wheel scrolling inside a scene (lower = silkier, higher = snappier).
const LERP = 0.13;
// After a scene change, ignore input briefly so the transition isn't interrupted.
const NAV_LOCK_MS = 1000;

type Dir = 1 | -1;

interface Options {
  sceneId: string;
  enabled: boolean;
  reduce: boolean;
  canGo: (dir: Dir) => boolean;
  onNavigate: (dir: Dir) => void;
}

/**
 * Scroll engine for the workspace.
 * - Inside a scene, wheel input is eased (smooth scrolling) instead of the browser's stepped scroll.
 * - Past a scene's edge, further scrolling "pulls" toward the next scene: `pull` (-1…1) drives a
 *   lift + progress indicator, and reaching 1 navigates. Let go early and it springs back.
 * - Touch: the same pull when dragging past the edge, plus horizontal swipes between scenes.
 */
export function useSceneScroll({ sceneId, enabled, reduce, canGo, onNavigate }: Options) {
  const mainRef = useRef<HTMLElement>(null);
  const scrollers = useRef<Record<string, HTMLDivElement | null>>({});
  const current = useRef({ sceneId, enabled, reduce, canGo, onNavigate });
  const target = useRef(0);
  const animating = useRef(false);
  const lockUntil = useRef(0);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pull = useMotionValue(0);
  const progress = useMotionValue(0);
  const [pullDir, setPullDir] = useState<0 | Dir>(0);

  useEffect(() => {
    current.current = { sceneId, enabled, reduce, canGo, onNavigate };
  });

  const getEl = useCallback(() => scrollers.current[current.current.sceneId] ?? null, []);

  /** Callback ref for each scene's scroll container, keyed by scene so exiting scenes don't clobber it. */
  const registerScroller = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) scrollers.current[id] = el;
      else delete scrollers.current[id];
    },
    [],
  );

  const syncProgress = useCallback(
    (el: HTMLDivElement) => {
      const max = el.scrollHeight - el.clientHeight;
      progress.set(max > 0 ? el.scrollTop / max : 0);
    },
    [progress],
  );

  /** Wire to the scroller's onScroll: keeps the smooth-scroll target honest when something else scrolls it. */
  const onScrollerScroll = useCallback(
    (el: HTMLDivElement) => {
      if (!animating.current) target.current = el.scrollTop;
      syncProgress(el);
    },
    [syncProgress],
  );

  // Fresh scene: start at the top with no pull.
  useEffect(() => {
    target.current = 0;
    progress.set(0);
    pull.set(0);
    lockUntil.current = performance.now() + NAV_LOCK_MS;
  }, [sceneId, progress, pull]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const springBack = () => {
      animate(pull, 0, { type: "spring", stiffness: 320, damping: 30 });
      setPullDir(0);
    };

    const navigate = (dir: Dir) => {
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
      lockUntil.current = performance.now() + NAV_LOCK_MS;
      pull.set(0);
      setPullDir(0);
      current.current.onNavigate(dir);
    };

    const smoothStep = () => {
      const el = getEl();
      if (!el) {
        animating.current = false;
        return;
      }
      const diff = target.current - el.scrollTop;
      if (Math.abs(diff) < 0.5) {
        el.scrollTop = target.current;
        animating.current = false;
        return;
      }
      el.scrollTop += diff * LERP;
      requestAnimationFrame(smoothStep);
    };

    /** Adds `amount` (0–1 scale) of pull in `dir`; navigates when full. */
    const addPull = (dir: Dir, amount: number, absolute = false) => {
      const allowed = current.current.canGo(dir);
      const prev = Math.sign(pull.get()) === dir ? Math.abs(pull.get()) : 0;
      let p = absolute ? amount : prev + amount;
      // At the very first/last scene there's nowhere to go: give a small elastic nudge only.
      if (!allowed) p = Math.min(p, 0.1);
      pull.set(dir * Math.min(p, 1));
      setPullDir(allowed ? dir : 0);
      return allowed && p >= 1;
    };

    const onWheel = (e: WheelEvent) => {
      if (!current.current.enabled) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const el = getEl();
      if (!el || performance.now() < lockUntil.current) return;

      const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * el.clientHeight : e.deltaY;
      const dir: Dir = delta > 0 ? 1 : -1;
      const max = el.scrollHeight - el.clientHeight;
      const atEdge = dir > 0 ? target.current >= max - 1 : target.current <= 1;

      if (!atEdge) {
        if (pull.get() !== 0) {
          pull.stop();
          pull.set(0);
          setPullDir(0);
        }
        target.current = Math.min(max, Math.max(0, target.current + delta));
        if (current.current.reduce) {
          el.scrollTop = target.current;
        } else if (!animating.current) {
          animating.current = true;
          requestAnimationFrame(smoothStep);
        }
        return;
      }

      if (addPull(dir, Math.abs(delta) / PULL_WHEEL_PX)) {
        navigate(dir);
        return;
      }
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
      releaseTimer.current = setTimeout(springBack, RELEASE_MS);
    };

    let touch: { x: number; y: number; t: number; atTop: boolean; atBottom: boolean; ignore: boolean } | null = null;

    const onTouchStart = (e: TouchEvent) => {
      const el = getEl();
      const t = e.touches[0];
      const max = el ? el.scrollHeight - el.clientHeight : 0;
      touch = {
        x: t.clientX,
        y: t.clientY,
        t: performance.now(),
        atTop: !el || el.scrollTop <= 1,
        atBottom: !el || el.scrollTop >= max - 1,
        ignore: !!(e.target as Element).closest?.("[data-swipe-ignore]"),
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touch || !current.current.enabled || performance.now() < lockUntil.current) return;
      const t = e.touches[0];
      const dx = t.clientX - touch.x;
      const up = touch.y - t.clientY; // >0 means finger moving up (towards next scene)
      if (Math.abs(up) < Math.abs(dx)) return;
      const el = getEl();
      const max = el ? el.scrollHeight - el.clientHeight : 0;
      if (up > 0 && touch.atBottom && (!el || el.scrollTop >= max - 1)) addPull(1, up / PULL_TOUCH_PX, true);
      else if (up < 0 && touch.atTop && (!el || el.scrollTop <= 1)) addPull(-1, -up / PULL_TOUCH_PX, true);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const start = touch;
      touch = null;
      if (!start || !current.current.enabled) return;
      const p = pull.get();
      if (Math.abs(p) >= 1 && current.current.canGo(Math.sign(p) as Dir)) {
        navigate(Math.sign(p) as Dir);
        return;
      }
      if (p !== 0) springBack();
      // Quick horizontal swipe = previous / next scene
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (!start.ignore && performance.now() - start.t < 600 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        const dir: Dir = dx < 0 ? 1 : -1;
        if (current.current.canGo(dir) && performance.now() >= lockUntil.current) navigate(dir);
      }
    };

    main.addEventListener("wheel", onWheel, { passive: false });
    main.addEventListener("touchstart", onTouchStart, { passive: true });
    main.addEventListener("touchmove", onTouchMove, { passive: true });
    main.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      main.removeEventListener("wheel", onWheel);
      main.removeEventListener("touchstart", onTouchStart);
      main.removeEventListener("touchmove", onTouchMove);
      main.removeEventListener("touchend", onTouchEnd);
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
    };
  }, [getEl, pull]);

  return { mainRef, registerScroller, onScrollerScroll, getEl, pull, progress, pullDir };
}
