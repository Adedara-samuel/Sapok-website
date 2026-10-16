"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ExternalLink, Inbox, KeyRound, LayoutDashboard, LogOut, Menu, PenSquare, X } from "lucide-react";
import { SapokMark, SapokWordmark } from "@/components/brand/SapokMarks";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { href: "/admin", label: "Dashboard", cmd: "dash", icon: LayoutDashboard },
  { href: "/admin/inbox", label: "Inbox", cmd: "inbox", icon: Inbox },
  { href: "/admin/content", label: "Website content", cmd: "content", icon: PenSquare },
  { href: "/admin/settings", label: "Settings", cmd: "settings", icon: KeyRound },
];

export interface SystemStatus {
  storage: string;
  storageOk: boolean;
  email: boolean;
}

function Led({ ok, warn }: { ok: boolean; warn?: boolean }) {
  return (
    <span className="relative flex size-2">
      {ok && <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-60" />}
      <span className={`relative inline-flex size-2 rounded-full ${ok ? "bg-teal" : warn ? "bg-amber-300" : "bg-coral"}`} />
    </span>
  );
}

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Lagos" }));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return <span className="tabular-nums">{t || "--:--:--"} WAT</span>;
}

/** Mission-control frame for every admin page. */
export default function AdminShell({ status, children }: { status: SystemStatus; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <SapokMark className="size-8" />
        <div>
          <SapokWordmark suffix="TECH" className="text-sm" />
          <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-teal">mission control</div>
        </div>
      </div>

      <nav className="mt-2 space-y-1 px-3">
        {NAV.map((n) => {
          const on = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${on ? "bg-teal/12 text-teal ring-1 ring-teal/30" : "text-muted hover:bg-raised hover:text-paper"}`}
            >
              <n.icon className="size-4" />
              <span className="flex-1">{n.label}</span>
              <span className="font-mono text-[9px] text-faint group-hover:text-muted">/{n.cmd}</span>
            </Link>
          );
        })}
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-raised hover:text-paper">
          <ExternalLink className="size-4" />
          View live site
        </a>
      </nav>

      <div className="mt-auto space-y-3 p-4">
        <div className="rounded-2xl border border-line bg-ink/60 p-4 font-mono text-[10px] leading-6">
          <div className="mb-1 uppercase tracking-[0.18em] text-faint">system</div>
          <div className="flex items-center justify-between">
            <span className="text-muted">site</span>
            <span className="flex items-center gap-2 text-paper">
              <Led ok /> online
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">database</span>
            <span className="flex items-center gap-2 text-paper">
              <Led ok={status.storageOk} warn /> {status.storageOk ? "mongodb" : "local"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">email</span>
            <span className="flex items-center gap-2 text-paper">
              <Led ok={status.email} warn /> {status.email ? "active" : "not set"}
            </span>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-coral/10 hover:text-coral">
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-dvh bg-ink text-paper">
      <div aria-hidden className="grid-floor pointer-events-none fixed inset-0 opacity-30" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface/80 backdrop-blur-xl lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-surface">{sidebar}</aside>
        </div>
      )}

      <div className="relative lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-ink/80 px-4 backdrop-blur-xl sm:px-6">
          <button onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-lg border border-line lg:hidden" aria-label="Menu">
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <span className="font-mono text-[11px] text-muted">
            <span className="text-teal">owner@sapok</span>:~{path.replace("/admin", "") || "/"}$
          </span>
          <span className="ml-auto hidden font-mono text-[11px] text-muted sm:block">
            <Clock />
          </span>
          <ThemeToggle className="ml-auto size-9 sm:ml-0" />
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
