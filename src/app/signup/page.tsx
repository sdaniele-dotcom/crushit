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
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) {
      setError("Accounts aren't enabled yet. Please check back soon.");
      return;
    }
    if (password.length < 8) {
      setError("Please use a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    setError("");
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback/`,
        data: { first_name: firstName.trim(), last_name: lastName.trim() },
      },
    });
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    // Persist the names onto the profile (created by the DB trigger).
    if (data.session && data.user) {
      await sb
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name: [firstName.trim(), lastName.trim()].filter(Boolean).join(" "),
        })
        .eq("id", data.user.id);
    }
    setBusy(false);
    if (data.session) {
      window.location.assign("/dashboard");
    } else {
      setSent(true); // email confirmation required
    }
  }

  return (
    <AuthShell
      title="Create your free account"
      subtitle="One profile, reused across every Crushing It tool."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-crush-600">
            Log in
          </Link>
        </>
      }
    >
      {!isSupabaseConfigured && (
        <p className={`${authNotice} mb-4`}>
          Accounts aren&apos;t enabled yet — this is coming online shortly.
        </p>
      )}
      {sent ? (
        <p className={authOk}>
          Almost there — we sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your account, then log in.
        </p>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={authLabel}>First name</label>
              <input className={authInput} required value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
            </div>
            <div>
              <label className={authLabel}>Last name</label>
              <input className={authInput} required value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
            </div>
          </div>
          <div>
            <label className={authLabel}>Email</label>
            <input className={authInput} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brokerage.com" autoComplete="email" />
          </div>
          <div>
            <label className={authLabel}>Password</label>
            <input className={authInput} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
          </div>
          {error && <p className={authNotice}>{error}</p>}
          <button type="submit" className={authButton} disabled={busy}>
            {busy ? "Creating account…" : "Create free account"}
          </button>
          <p className="text-center text-xs text-muted">
            By creating an account you agree to use Crushing It for real-estate
            marketing. We never sell your data.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
