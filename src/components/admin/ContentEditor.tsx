"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ExternalLink, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { productMarks, type SiteContent } from "@/lib/content";

/* ---------------------------- tiny form kit ---------------------------- */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
        {hint ? <span className="normal-case tracking-normal text-faint">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function Text({ value, onChange, area, placeholder }: { value: string; onChange: (v: string) => void; area?: boolean; placeholder?: string }) {
  return area ? (
    <textarea className="field min-h-24 resize-y" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <input className="field" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  );
}

/** String list edited one item per line. */
function Lines({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <textarea
      className="field min-h-24 resize-y font-mono text-sm"
      value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n"))}
      onBlur={() => onChange(value.map((s) => s.trim()).filter(Boolean))}
    />
  );
}

/** Repeating group: add, remove and reorder items. */
function Repeater<T>({ items, onChange, blank, title, render }: { items: T[]; onChange: (v: T[]) => void; blank: T; title: (item: T, i: number) => string; render: (item: T, set: (v: T) => void) => React.ReactNode }) {
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-line bg-ink/40">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2">
            <span className="font-mono text-[10px] text-teal">[{String(i).padStart(2, "0")}]</span>
            <span className="flex-1 truncate text-sm font-semibold">{title(item, i) || "Untitled"}</span>
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid size-7 place-items-center rounded-md text-muted hover:text-paper disabled:opacity-25" aria-label="Move up">
              <ArrowUp className="size-3.5" />
            </button>
            <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="grid size-7 place-items-center rounded-md text-muted hover:text-paper disabled:opacity-25" aria-label="Move down">
              <ArrowDown className="size-3.5" />
            </button>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid size-7 place-items-center rounded-md text-muted hover:text-coral" aria-label="Remove">
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">{render(item, (v) => onChange(items.map((x, j) => (j === i ? v : x))))}</div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, structuredClone(blank)])} className="btn-ghost w-full !border-dashed">
        <Plus className="size-4" /> Add item
      </button>
    </div>
  );
}

/* ------------------------------- editor ------------------------------- */

const TABS = ["Company", "Hero", "About", "Mission & vision", "Services", "Process", "Products", "Clients", "Numbers", "Contact"] as const;
type Tab = (typeof TABS)[number];

export default function ContentEditor({ initial }: { initial: SiteContent }) {
  const [c, setC] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [tab, setTab] = useState<Tab>("Hero");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const dirty = JSON.stringify(c) !== JSON.stringify(saved);

  // Warn before leaving with unsaved edits
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const patch = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => setC((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setState("saving");
    setError("");
    const res = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
    if (res.ok) {
      setSaved(c);
      setState("saved");
      setTimeout(() => setState("idle"), 2200);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save.");
      setState("error");
    }
  };

  return (
    <div className="space-y-5 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-teal">&gt; content --edit</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Website content</h1>
          <p className="mt-1 text-sm text-muted">Changes go live on the site the moment you save.</p>
        </div>
        <a href="/" target="_blank" className="btn-ghost !py-2 text-sm">
          <ExternalLink className="size-4" /> Preview site
        </a>
      </div>

      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition ${tab === t ? "bg-teal text-ink" : "border border-line text-muted hover:text-paper"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.section key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="panel space-y-4 p-5 sm:p-7">
          {tab === "Company" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name"><Text value={c.company.name} onChange={(v) => patch("company", { ...c.company, name: v })} /></Field>
              <Field label="Tagline"><Text value={c.company.tagline} onChange={(v) => patch("company", { ...c.company, tagline: v })} /></Field>
              <Field label="Founded"><Text value={c.company.founded} onChange={(v) => patch("company", { ...c.company, founded: v })} /></Field>
              <Field label="Owner"><Text value={c.company.owner} onChange={(v) => patch("company", { ...c.company, owner: v })} /></Field>
              <Field label="Owner title"><Text value={c.company.ownerTitle} onChange={(v) => patch("company", { ...c.company, ownerTitle: v })} /></Field>
            </div>
          )}

          {tab === "Hero" && (
            <div className="grid gap-4">
              <Field label="Small line above the headline"><Text value={c.hero.eyebrow} onChange={(v) => patch("hero", { ...c.hero, eyebrow: v })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Headline"><Text value={c.hero.headline} onChange={(v) => patch("hero", { ...c.hero, headline: v })} /></Field>
                <Field label="Highlighted line" hint="shown in teal"><Text value={c.hero.highlight} onChange={(v) => patch("hero", { ...c.hero, highlight: v })} /></Field>
              </div>
              <Field label="Subtitle"><Text area value={c.hero.subtitle} onChange={(v) => patch("hero", { ...c.hero, subtitle: v })} /></Field>
              <Field label="Example ideas" hint="one per line — typed in the idea box"><Lines value={c.hero.ideas} onChange={(v) => patch("hero", { ...c.hero, ideas: v })} /></Field>
            </div>
          )}

          {tab === "About" && (
            <div className="grid gap-4">
              <Field label="Intro line"><Text value={c.about.heading} onChange={(v) => patch("about", { ...c.about, heading: v })} /></Field>
              {c.about.paragraphs.map((p, i) => (
                <Field key={i} label={`Paragraph ${i + 1}`}>
                  <Text area value={p} onChange={(v) => patch("about", { ...c.about, paragraphs: c.about.paragraphs.map((x, j) => (j === i ? v : x)) })} />
                </Field>
              ))}
              <div className="flex gap-2">
                <button type="button" className="btn-ghost !py-2 text-sm" onClick={() => patch("about", { ...c.about, paragraphs: [...c.about.paragraphs, ""] })}>
                  <Plus className="size-4" /> Paragraph
                </button>
                {c.about.paragraphs.length > 1 && (
                  <button type="button" className="btn-ghost !py-2 text-sm" onClick={() => patch("about", { ...c.about, paragraphs: c.about.paragraphs.slice(0, -1) })}>
                    <Trash2 className="size-4" /> Remove last
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === "Mission & vision" && (
            <div className="grid gap-4">
              <Field label="Mission"><Text area value={c.mission} onChange={(v) => patch("mission", v)} /></Field>
              <Field label="Vision"><Text area value={c.vision} onChange={(v) => patch("vision", v)} /></Field>
              <Field label="Values">
                <Repeater
                  items={c.values}
                  onChange={(v) => patch("values", v)}
                  blank={{ title: "", body: "" }}
                  title={(v) => v.title}
                  render={(v, set) => (
                    <>
                      <Field label="Title"><Text value={v.title} onChange={(x) => set({ ...v, title: x })} /></Field>
                      <Field label="Description"><Text value={v.body} onChange={(x) => set({ ...v, body: x })} /></Field>
                    </>
                  )}
                />
              </Field>
            </div>
          )}

          {tab === "Services" && (
            <Repeater
              items={c.services}
              onChange={(v) => patch("services", v)}
              blank={{ title: "", body: "", tags: [] }}
              title={(v) => v.title}
              render={(v, set) => (
                <>
                  <Field label="Title"><Text value={v.title} onChange={(x) => set({ ...v, title: x })} /></Field>
                  <Field label="Tags" hint="comma separated">
                    <input className="field" value={v.tags.join(", ")} onChange={(e) => set({ ...v, tags: e.target.value.split(",").map((t) => t.trimStart()) })} onBlur={() => set({ ...v, tags: v.tags.map((t) => t.trim()).filter(Boolean) })} />
                  </Field>
                  <div className="sm:col-span-2"><Field label="Description"><Text area value={v.body} onChange={(x) => set({ ...v, body: x })} /></Field></div>
                </>
              )}
            />
          )}

          {tab === "Process" && (
            <Repeater
              items={c.process}
              onChange={(v) => patch("process", v)}
              blank={{ title: "", body: "" }}
              title={(v) => v.title}
              render={(v, set) => (
                <>
                  <Field label="Step"><Text value={v.title} onChange={(x) => set({ ...v, title: x })} /></Field>
                  <Field label="What happens"><Text value={v.body} onChange={(x) => set({ ...v, body: x })} /></Field>
                </>
              )}
            />
          )}

          {tab === "Products" && (
            <Repeater
              items={c.products}
              onChange={(v) => patch("products", v)}
              blank={{ slug: "new-product", name: "", category: "", status: "In progress", summary: "", features: [], link: "", mark: "ai" }}
              title={(v) => v.name}
              render={(v, set) => (
                <>
                  <Field label="Name"><Text value={v.name} onChange={(x) => set({ ...v, name: x })} /></Field>
                  <Field label="Category"><Text value={v.category} onChange={(x) => set({ ...v, category: x })} /></Field>
                  <Field label="Status">
                    <select className="field" value={v.status} onChange={(e) => set({ ...v, status: e.target.value as typeof v.status })}>
                      {["Live", "In progress", "Coming soon"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Logo">
                    <select className="field" value={v.mark} onChange={(e) => set({ ...v, mark: e.target.value as typeof v.mark })}>
                      {productMarks.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Link" hint="leave empty → “Get early access”"><Text value={v.link} onChange={(x) => set({ ...v, link: x })} placeholder="https://" /></Field>
                  <Field label="Slug" hint="a-z, 0-9, dashes"><Text value={v.slug} onChange={(x) => set({ ...v, slug: x.toLowerCase() })} /></Field>
                  <div className="sm:col-span-2"><Field label="Summary"><Text area value={v.summary} onChange={(x) => set({ ...v, summary: x })} /></Field></div>
                  <div className="sm:col-span-2"><Field label="Features" hint="one per line"><Lines value={v.features} onChange={(x) => set({ ...v, features: x })} /></Field></div>
                </>
              )}
            />
          )}

          {tab === "Clients" && (
            <Repeater
              items={c.clients}
              onChange={(v) => patch("clients", v)}
              blank={{ name: "", logo: "", link: "", sector: "" }}
              title={(v) => v.name}
              render={(v, set) => (
                <>
                  <Field label="Name"><Text value={v.name} onChange={(x) => set({ ...v, name: x })} /></Field>
                  <Field label="Sector"><Text value={v.sector} onChange={(x) => set({ ...v, sector: x })} /></Field>
                  <Field label="Logo URL" hint="https://… or /clients/…"><Text value={v.logo} onChange={(x) => set({ ...v, logo: x })} /></Field>
                  <Field label="Website"><Text value={v.link} onChange={(x) => set({ ...v, link: x })} placeholder="https://" /></Field>
                  {v.logo ? (
                    <div className="grid h-24 place-items-center rounded-xl bg-white p-3 sm:col-span-2">
                      <img src={v.logo} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : null}
                </>
              )}
            />
          )}

          {tab === "Numbers" && (
            <Repeater
              items={c.stats}
              onChange={(v) => patch("stats", v)}
              blank={{ value: 0, suffix: "", label: "" }}
              title={(v) => `${v.value}${v.suffix} ${v.label}`}
              render={(v, set) => (
                <>
                  <Field label="Number"><input type="number" min={0} className="field" value={v.value} onChange={(e) => set({ ...v, value: Math.max(0, Math.round(Number(e.target.value) || 0)) })} /></Field>
                  <Field label="Suffix" hint="+, %, k…"><Text value={v.suffix} onChange={(x) => set({ ...v, suffix: x })} /></Field>
                  <div className="sm:col-span-2"><Field label="Label"><Text value={v.label} onChange={(x) => set({ ...v, label: x })} /></Field></div>
                </>
              )}
            />
          )}

          {tab === "Contact" && (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email"><Text value={c.contact.email} onChange={(v) => patch("contact", { ...c.contact, email: v })} /></Field>
                <Field label="Phone (calls)"><Text value={c.contact.phone} onChange={(v) => patch("contact", { ...c.contact, phone: v })} /></Field>
                <Field label="WhatsApp"><Text value={c.contact.whatsapp} onChange={(v) => patch("contact", { ...c.contact, whatsapp: v })} /></Field>
                <Field label="Opening hours"><Text value={c.contact.hours} onChange={(v) => patch("contact", { ...c.contact, hours: v })} /></Field>
              </div>
              <Field label="Address"><Text value={c.contact.address} onChange={(v) => patch("contact", { ...c.contact, address: v })} /></Field>
              <Field label="Social links">
                <Repeater
                  items={c.socials}
                  onChange={(v) => patch("socials", v)}
                  blank={{ label: "", href: "" }}
                  title={(v) => v.label}
                  render={(v, set) => (
                    <>
                      <Field label="Label"><Text value={v.label} onChange={(x) => set({ ...v, label: x })} /></Field>
                      <Field label="Link"><Text value={v.href} onChange={(x) => set({ ...v, href: x })} placeholder="https://" /></Field>
                    </>
                  )}
                />
              </Field>
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/90 backdrop-blur-xl lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
          <span className="flex-1 font-mono text-[11px] text-muted">
            {state === "error" ? (
              <span className="text-coral">! {error}</span>
            ) : state === "saved" ? (
              <span className="text-teal">✓ saved — live on the site</span>
            ) : dirty ? (
              <span className="text-amber-300">● unsaved changes</span>
            ) : (
              "✓ everything is saved"
            )}
          </span>
          <button type="button" disabled={!dirty || state === "saving"} onClick={() => setC(saved)} className="btn-ghost !py-2 text-sm disabled:opacity-40">
            <RotateCcw className="size-4" /> Discard
          </button>
          <button type="button" disabled={!dirty || state === "saving"} onClick={save} className="btn-primary !py-2 text-sm">
            {state === "saving" ? <Loader2 className="size-4 animate-spin" /> : state === "saved" ? <Check className="size-4" /> : <Save className="size-4" />}
            Save &amp; publish
          </button>
        </div>
      </div>
    </div>
  );
}
