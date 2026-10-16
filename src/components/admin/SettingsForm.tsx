"use client";

import { useState } from "react";
import { Check, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsForm({ email: initialEmail, lastChanged }: { email: string; lastChanged: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setState("error");
      setMsg("New passwords don't match.");
      return;
    }
    setState("saving");
    const res = await fetch("/api/admin/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, currentPassword, newPassword }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setState("saved");
      setMsg("Saved. Other signed-in devices have been signed out.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      setState("error");
      setMsg(data.error || "Could not save.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-xs text-teal">&gt; account --security</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Sign-in details for the admin console · last changed{" "}
          {new Date(lastChanged).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" })}
        </p>
      </div>

      <div className="flex gap-3 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-4 text-sm">
        <ShieldAlert className="size-5 shrink-0 text-amber-300" />
        <p className="text-muted">
          If you&apos;re still using the starter password, change it now — use 10+ characters mixing letters and numbers. Only you should know it.
        </p>
      </div>

      <form onSubmit={submit} className="panel space-y-4 p-6">
        <div className="grid gap-2">
          <Label htmlFor="set-email">Sign-in email</Label>
          <Input id="set-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="set-current">Current password</Label>
          <Input id="set-current" type="password" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="set-new">New password</Label>
            <Input id="set-new" type="password" value={newPassword} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" placeholder="leave blank to keep" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="set-confirm">Confirm new password</Label>
            <Input id="set-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className={`font-mono text-xs ${state === "error" ? "text-coral" : "text-teal"}`}>{state === "error" ? `! ${msg}` : state === "saved" ? `✓ ${msg}` : ""}</span>
          <Button type="submit" disabled={state === "saving"}>
            {state === "saving" ? <Loader2 className="animate-spin" /> : state === "saved" ? <Check /> : <KeyRound />}
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
