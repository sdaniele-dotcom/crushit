"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AuthShell,
  authInput,
  authLabel,
  authButton,
  authNotice,
  authOk,
} from "@/components/auth/AuthShell";
import { getSupabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) {
      setError("Accounts aren't enabled yet.");
      return;
    }
    setBusy(true);
    setError("");
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/update-password/`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure link to set a new one."
      footer={
        <Link href="/login" className="font-semibold text-crush-600">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <p className={authOk}>
          If an account exists for <strong>{email}</strong>, a password-reset
          link is on its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className={authLabel}>Email</label>
            <input className={authInput} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brokerage.com" autoComplete="email" />
          </div>
          {error && <p className={authNotice}>{error}</p>}
          <button type="submit" className={authButton} disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
