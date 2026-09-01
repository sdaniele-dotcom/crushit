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
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resent, setResent] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) {
      setError("Accounts aren't enabled yet. Please check back soon.");
      return;
    }
    setBusy(true);
    setError("");
    setNeedsConfirm(false);
    setResent("");
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      // Email confirmation is on and this account hasn't confirmed yet.
      if (/confirm/i.test(error.message) || (error as { code?: string }).code === "email_not_confirmed") {
        setNeedsConfirm(true);
        setError("Please confirm your email first — check your inbox for the link we sent.");
      } else {
        setError(error.message);
      }
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") || "/dashboard";
    window.location.assign(next);
  }

  async function resend() {
    const sb = getSupabase();
    if (!sb || !email.trim()) return;
    setResent("");
    const { error } = await sb.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback/` },
    });
    setResent(error ? error.message : `New confirmation link sent to ${email.trim()}.`);
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
        {needsConfirm && (
          <button type="button" onClick={resend} className="text-center text-sm font-semibold text-crush-600 underline">
            Resend confirmation email
          </button>
        )}
        {resent && <p className="text-center text-sm font-medium text-mint-600">{resent}</p>}
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
