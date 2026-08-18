"use client";

import { useEffect, useState } from "react";
import {
  AuthShell,
  authInput,
  authLabel,
  authButton,
  authNotice,
  authOk,
} from "@/components/auth/AuthShell";
import { getSupabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // The reset link opens here with a recovery session; exchange the code.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    const url = window.location.href;
    if (url.includes("code=")) {
      sb.auth.exchangeCodeForSession(url).finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    if (password.length < 8) {
      setError("Please use a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    setError("");
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => window.location.assign("/dashboard"), 1500);
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you'll remember.">
      {done ? (
        <p className={authOk}>Password updated — taking you to your dashboard…</p>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className={authLabel}>New password</label>
            <input className={authInput} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" disabled={!ready} />
          </div>
          {error && <p className={authNotice}>{error}</p>}
          <button type="submit" className={authButton} disabled={busy || !ready}>
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
