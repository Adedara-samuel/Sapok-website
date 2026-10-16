"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, ArrowLeft, Check, Mail, MailOpen, MessageCircle, Phone, Search, Trash2 } from "lucide-react";
import { phoneDigits, type Enquiry, type EnquiryStatus } from "@/lib/content";

const FILTERS: ("all" | EnquiryStatus)[] = ["all", "new", "read", "archived"];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

export default function InboxClient({ initial, openId }: { initial: Enquiry[]; openId: string | null }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(openId);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(
      (e) =>
        (filter === "all" ? e.status !== "archived" : e.status === filter) &&
        (!term || `${e.name} ${e.email} ${e.company} ${e.service} ${e.message} ${e.idea}`.toLowerCase().includes(term)),
    );
  }, [items, filter, q]);

  const current = items.find((e) => e.id === selected) ?? null;

  const setStatus = async (id: string, status: EnquiryStatus) => {
    setBusy(true);
    const res = await fetch(`/api/admin/enquiries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) setItems((all) => all.map((e) => (e.id === id ? { ...e, status } : e)));
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this enquiry permanently?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((all) => all.filter((e) => e.id !== id));
      setSelected(null);
    }
    setBusy(false);
  };

  const open = (e: Enquiry) => {
    setSelected(e.id);
    if (e.status === "new") void setStatus(e.id, "read");
  };

  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === "all" ? items.filter((e) => e.status !== "archived").length : items.filter((e) => e.status === f).length]));

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-xs text-teal">&gt; inbox --list</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Inbox</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition ${filter === f ? "bg-teal text-ink" : "text-muted hover:text-paper"}`}
            >
              {f} <span className="opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>
        <label className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="grep name, email, idea…" className="field !rounded-full !py-2 pl-10 font-mono text-sm" aria-label="Search enquiries" />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* List */}
        <ul className={`panel max-h-[70vh] divide-y divide-line overflow-y-auto ${current ? "hidden lg:block" : ""}`}>
          {list.length === 0 && <li className="p-6 font-mono text-sm text-muted">› nothing here.</li>}
          {list.map((e) => (
            <li key={e.id}>
              <button onClick={() => open(e)} className={`block w-full p-4 text-left transition hover:bg-raised ${selected === e.id ? "bg-raised" : ""}`}>
                <div className="flex items-center gap-2">
                  {e.status === "new" && <span className="size-2 shrink-0 rounded-full bg-coral" />}
                  <span className={`flex-1 truncate ${e.status === "new" ? "font-bold" : "font-medium"}`}>{e.name}</span>
                  <span className="shrink-0 font-mono text-[10px] text-faint">{fmt(e.createdAt).split(",")[0]}</span>
                </div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-teal">{e.service || e.idea || e.email}</div>
                <div className="mt-1 line-clamp-2 text-sm text-muted">{e.message}</div>
              </button>
            </li>
          ))}
        </ul>

        {/* Detail */}
        <AnimatePresence mode="wait">
          {current ? (
            <motion.article key={current.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="panel overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
                <button onClick={() => setSelected(null)} className="grid size-8 place-items-center rounded-lg border border-line lg:hidden" aria-label="Back">
                  <ArrowLeft className="size-4" />
                </button>
                <span className="chip">
                  <span className={`size-1.5 rounded-full ${current.status === "new" ? "bg-coral" : current.status === "read" ? "bg-teal" : "bg-faint"}`} />
                  {current.status}
                </span>
                <span className="chip">{current.emailed ? "✓ emailed" : "not emailed"}</span>
                <span className="ml-auto flex gap-1.5">
                  {current.status !== "read" && (
                    <button disabled={busy} onClick={() => setStatus(current.id, "read")} className="btn-ghost !px-3 !py-1.5 text-xs" title="Mark as read">
                      <Check className="size-3.5" /> Read
                    </button>
                  )}
                  {current.status !== "new" && (
                    <button disabled={busy} onClick={() => setStatus(current.id, "new")} className="btn-ghost !px-3 !py-1.5 text-xs" title="Mark as unread">
                      <MailOpen className="size-3.5" /> Unread
                    </button>
                  )}
                  {current.status !== "archived" && (
                    <button disabled={busy} onClick={() => setStatus(current.id, "archived")} className="btn-ghost !px-3 !py-1.5 text-xs" title="Archive">
                      <Archive className="size-3.5" /> Archive
                    </button>
                  )}
                  <button disabled={busy} onClick={() => remove(current.id)} className="btn-ghost !px-3 !py-1.5 text-xs hover:!border-coral hover:!text-coral" title="Delete">
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </div>

              <div className="p-5 sm:p-7">
                <h2 className="font-display text-2xl font-extrabold">{current.name}</h2>
                <p className="font-mono text-xs text-muted">{fmt(current.createdAt)} WAT</p>

                <dl className="mt-5 grid gap-x-6 gap-y-3 font-mono text-[12px] sm:grid-cols-2">
                  {[
                    ["email", current.email],
                    ["phone", current.phone],
                    ["company", current.company],
                    ["service", current.service],
                    ["budget", current.budget],
                    ["idea", current.idea],
                  ]
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-faint">{k}</dt>
                        <dd className="break-words text-paper">{v}</dd>
                      </div>
                    ))}
                </dl>

                <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-line bg-ink/60 p-5 leading-relaxed">{current.message}</div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <a href={`mailto:${current.email}?subject=${encodeURIComponent("Re: your enquiry to SAPOK TECH")}`} className="btn-primary">
                    <Mail className="size-4" /> Reply by email
                  </a>
                  {current.phone && (
                    <>
                      <a href={`https://wa.me/${phoneDigits(current.phone)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                        <MessageCircle className="size-4" /> WhatsApp
                      </a>
                      <a href={`tel:+${phoneDigits(current.phone)}`} className="btn-ghost">
                        <Phone className="size-4" /> Call
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.article>
          ) : (
            <div className="panel hidden place-items-center p-10 text-center font-mono text-sm text-muted lg:grid">
              <div>
                <Mail className="mx-auto mb-3 size-6 text-teal" />› select an enquiry to read it
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
