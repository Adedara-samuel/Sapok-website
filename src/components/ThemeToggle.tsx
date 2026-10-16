"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_KEY } from "@/lib/theme";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

/** Sun/moon switch. Theme lives as a class on <html>, remembered in localStorage. */
export default function ThemeToggle({ className }: { className?: string }) {
  const light = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("light"), () => false);

  const toggle = () => {
    const next = !light;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "light" : "dark");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      className={`grid size-10 place-items-center rounded-full border border-line text-paper transition hover:border-teal hover:text-teal ${className ?? ""}`}
    >
      {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}
