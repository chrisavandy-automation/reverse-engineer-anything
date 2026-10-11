"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    let res: Response;
    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
    } catch {
      setError("Titan Mind could not be reached. Check your connection and try again.");
      setBusy(false);
      return;
    }
    if (!res.ok) {
      setError((await res.json().catch(() => ({})))?.error ?? "Unable to sign in.");
      setBusy(false);
      return;
    }
    window.location.assign(next);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-3">
      <input
        autoFocus
        type="password"
        placeholder="Access password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-xl border border-[var(--input)] bg-[var(--card)]/85 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-[var(--ring)]/70 focus:ring-[3px] focus:ring-[var(--ring)]/15"
      />
      {error && <p className="text-left text-xs text-[#f0717e]">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-1 h-10 w-full rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_8px_28px_rgba(0,0,0,.16)] transition hover:-translate-y-px hover:bg-white disabled:opacity-50"
      >
        {busy ? "Opening the archive…" : "Continue"}
      </button>
    </form>
  );
}
