import { useId } from "react";

// Flat SAPOK brand marks (100×100 grid) in the house teal gradient — no glow, no glass.
// Keep these in sync with public/brand/*.svg.
export const SAPOK_TEAL = ["#5eead4", "#00c896"] as const;

function Teal({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={SAPOK_TEAL[0]} />
      <stop offset="1" stopColor={SAPOK_TEAL[1]} />
    </linearGradient>
  );
}

interface MarkProps {
  className?: string;
  title?: string;
}

/** SAPOK TECH — the S ribbon. */
export function SapokMark({ className, title = "SAPOK TECH" }: MarkProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <defs>
        <Teal id={id} />
      </defs>
      <path
        fill={`url(#${id})`}
        d="M84 10C64 11 38 14 27 25C15 37 20 51 36 57L56 64C63 67 63 73 56 77C46 83 30 86 14 89C30 92 54 93 69 87C85 81 89 66 79 56C72 49 62 46 52 42L45 39C38 36 38 31 45 28C55 22 68 16 84 10Z"
      />
    </svg>
  );
}

/** SAPOK Pay — the P with speed lines. */
export function SapokPayMark({ className, title = "SAPOK Pay" }: MarkProps) {
  const id = useId();
  const f = `url(#${id})`;
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <defs>
        <Teal id={id} />
      </defs>
      <path fill={f} d="M36 14H70C86 14 94 26 90 39C86 52 74 58 60 58H50L55 47H61C69 47 76 43 78 37C80 30 76 25 68 25H31Z" />
      <path fill={f} d="M44 32H60L38 86H22Z" />
      <rect fill={f} x="6" y="40" width="26" height="8" rx="4" />
      <rect fill={f} x="2" y="54" width="24" height="8" rx="4" />
      <rect fill={f} x="9" y="68" width="14" height="8" rx="4" />
    </svg>
  );
}

/** SAPOK AI — open A, i and spark. */
export function SapokAiMark({ className, title = "SAPOK AI" }: MarkProps) {
  const id = useId();
  const f = `url(#${id})`;
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <defs>
        <Teal id={id} />
      </defs>
      <path fill={f} d="M36 14H50L70 86H55L41 34L27 86H12Z" />
      <path fill={f} d="M24 64L58 55L60.5 64L22 72Z" />
      <rect fill={f} x="76" y="44" width="12" height="42" rx="3" />
      <circle fill={f} cx="82" cy="33" r="6.5" />
      <path fill={f} d="M86 6C87 12 89 14 95 15C89 16 87 18 86 24C85 18 83 16 77 15C83 14 85 12 86 6Z" />
    </svg>
  );
}

/** Sapok OneGrid — a G drawn as a grid tile closing around its core cell. */
export function OneGridMark({ className, title = "Sapok OneGrid" }: MarkProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <defs>
        <Teal id={id} />
      </defs>
      <path
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M74 22H38C27 22 20 29 20 40V60C20 71 27 78 38 78H62C73 78 80 71 80 60V52H58"
      />
      <rect fill={`url(#${id})`} x="40" y="40" width="16" height="16" rx="3" />
    </svg>
  );
}

/** VibeSphere — a sphere carrying a sound/vibe wave. */
export function VibeSphereMark({ className, title = "VibeSphere" }: MarkProps) {
  const id = useId();
  const f = `url(#${id})`;
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <defs>
        <Teal id={id} />
      </defs>
      <circle cx="50" cy="50" r="36" fill="none" stroke={f} strokeWidth="9" />
      <path d="M24 52C30 52 32 38 38 38S44 66 50 66 56 30 62 30 68 54 76 52" fill="none" stroke={f} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** WITHU uses its own artwork. */
export function WithuMark({ className, title = "WITHU" }: MarkProps) {
  return <img src="/products/withu.jpg" alt={title} className={`${className ?? ""} rounded-[22%] object-cover`} />;
}

/** Product mark by key (matches `productMarks` in lib/content). */
export const PRODUCT_MARKS = {
  onegrid: OneGridMark,
  pay: SapokPayMark,
  ai: SapokAiMark,
  withu: WithuMark,
  vibesphere: VibeSphereMark,
} as const;

/**
 * The SAPOK wordmark: geometric caps with the signature open Λ and its teal drop.
 * `suffix` adds a product name in teal (e.g. "TECH", "Pay", "AI").
 */
export function SapokWordmark({ className, suffix, color = "currentColor" }: { className?: string; suffix?: string; color?: string }) {
  const id = useId();
  return (
    <span className={`inline-flex items-center gap-[0.07em] font-brand font-bold leading-none tracking-[0.04em] ${className ?? ""}`} style={{ color }}>
      <span>S</span>
      <svg viewBox="0 0 70 80" className="h-[0.74em] w-auto" aria-hidden>
        <defs>
          <Teal id={id} />
        </defs>
        <path fill="currentColor" d="M27 0H43L70 80H55L35 18L15 80H0Z" />
        <path fill={`url(#${id})`} d="M35 52L44 74H26Z" />
      </svg>
      <span>POK</span>
      {suffix ? (
        <span className="ml-[0.28em] bg-gradient-to-br from-[#5eead4] to-[#00c896] bg-clip-text text-transparent">{suffix}</span>
      ) : null}
      <span className="sr-only">SAPOK{suffix ? ` ${suffix}` : ""}</span>
    </span>
  );
}
