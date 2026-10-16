"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { SapokMark, SapokWordmark } from "@/components/brand/SapokMarks";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error || "Sign in failed.");
    setBusy(false);
  };

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink px-4">
      <div aria-hidden className="aurora" />
      <div aria-hidden className="grid-floor pointer-events-none absolute inset-0 opacity-60" />
      <ThemeToggle className="absolute right-4 top-4 z-10" />

      <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 }} className="panel relative w-full max-w-md overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="size-2 rounded-full bg-coral/80" />
          <span className="size-2 rounded-full bg-amber-300/80" />
          <span className="size-2 rounded-full bg-teal/80" />
          <span className="ml-2">sapok · mission-control · auth</span>
        </div>
        <div className="p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <SapokMark className="size-10" />
            <SapokWordmark suffix="TECH" className="text-lg" />
          </div>
          <p className="mt-6 font-mono text-xs text-teal">&gt; authenticate --role owner</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold">Admin console</h1>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <input className="field font-mono" type="email" autoComplete="username" placeholder="email" aria-label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="field font-mono" type="password" autoComplete="current-password" placeholder="password" aria-label="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="font-mono text-xs text-coral">! {error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              {busy ? "Verifying…" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 flex items-center gap-2 font-mono text-[10px] text-faint">
            <ShieldCheck className="size-3.5 text-teal" /> encrypted session · rate-limited · owner only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
