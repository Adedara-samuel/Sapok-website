import Link from "next/link";
import { ArrowRight, Inbox, Mail, PenSquare, Sparkles } from "lucide-react";
import { store } from "@/lib/store";

function ago(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export default async function Dashboard() {
  const enquiries = await store().listEnquiries();
  const week = Date.now() - 7 * 86400_000;
  const stats = [
    { label: "New", value: enquiries.filter((e) => e.status === "new").length, tone: "text-coral" },
    { label: "This week", value: enquiries.filter((e) => new Date(e.createdAt).getTime() > week).length, tone: "text-teal" },
    { label: "All enquiries", value: enquiries.length, tone: "text-paper" },
    { label: "Emailed to you", value: enquiries.filter((e) => e.emailed).length, tone: "text-paper" },
  ];
  const recent = enquiries.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-teal">&gt; sapok status</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Welcome back.</h1>
        <p className="mt-1 text-muted">Here&apos;s what&apos;s happening on sapok tech today.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-5">
            <div className={`font-display text-4xl font-extrabold tabular-nums ${s.tone}`}>{String(s.value).padStart(2, "0")}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              <span className="size-1.5 animate-pulse rounded-full bg-teal" /> activity.log
            </span>
            <Link href="/admin/inbox" className="font-mono text-[11px] text-teal hover:underline">
              open inbox →
            </Link>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-5 font-mono text-[12px] leading-7">
            {recent.length === 0 ? (
              <p className="text-muted">
                <span className="text-teal">›</span> no enquiries yet. when a visitor sends a message, it appears here instantly.
              </p>
            ) : (
              recent.map((e) => (
                <Link key={e.id} href={`/admin/inbox?id=${e.id}`} className="block truncate rounded-md px-2 hover:bg-raised">
                  <span className="text-faint">[{ago(e.createdAt)}]</span>{" "}
                  <span className={e.status === "new" ? "text-coral" : "text-teal"}>{e.status === "new" ? "NEW" : e.status.toUpperCase()}</span>{" "}
                  <span className="text-paper">{e.name}</span> <span className="text-muted">— {e.service || e.idea || e.message.slice(0, 60)}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          {[
            { href: "/admin/inbox", icon: Inbox, title: "Reply to enquiries", body: "Read messages, mark them done, reply by email or WhatsApp." },
            { href: "/admin/content", icon: PenSquare, title: "Edit the website", body: "Hero, services, products, clients, mission, contact — all of it." },
            { href: "/", icon: Sparkles, title: "View the live site", body: "See exactly what your visitors see.", external: true },
          ].map((a) => (
            <Link key={a.title} href={a.href} target={a.external ? "_blank" : undefined} className="panel group flex items-center gap-4 p-4 transition hover:border-teal/50">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal/10 text-teal transition group-hover:bg-teal group-hover:text-ink">
                <a.icon className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{a.title}</span>
                <span className="block text-sm text-muted">{a.body}</span>
              </span>
              <ArrowRight className="size-4 text-muted transition group-hover:translate-x-1 group-hover:text-teal" />
            </Link>
          ))}
          <div className="panel flex items-center gap-3 p-4 font-mono text-[11px] text-muted">
            <Mail className="size-4 text-teal" />
            Enquiries are also emailed to {process.env.NOTIFY_EMAIL || process.env.SMTP_USER || "your inbox once email is configured"}.
          </div>
        </section>
      </div>
    </div>
  );
}
