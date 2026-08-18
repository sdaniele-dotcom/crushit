"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AuthShell,
  authInput,
  authLabel,
  authButton,
  authNotice,
} from "@/components/auth/AuthShell";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) {
      setError("Accounts aren't enabled yet. Please check back soon.");
      return;
    }
    setBusy(true);
    setError("");
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") || "/dashboard";
    window.location.assign(next);
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back to Crushing It."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-crush-600">
            Create a free account
          </Link>
        </>
      }
    >
      {!isSupabaseConfigured && (
        <p className={`${authNotice} mb-4`}>
          Accounts aren&apos;t enabled yet — this is coming online shortly.
        </p>
      )}
      <form onSubmit={submit} className="grid gap-4">
        <div>
          <label className={authLabel}>Email</label>
          <input className={authInput} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brokerage.com" autoComplete="email" />
        </div>
        <div>
          <label className={authLabel}>Password</label>
          <input className={authInput} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p className={authNotice}>{error}</p>}
        <button type="submit" className={authButton} disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
        <div className="text-center">
          <Link href="/reset-password" className="text-sm text-muted underline">
            Forgot your password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
