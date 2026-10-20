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

/**
 * Set a password. Reached two ways, and the difference matters to the copy:
 *
 *   • a password RESET the agent asked for  → "set a new password"
 *   • an INVITE from the brokerage (?welcome=1) → "set your password", because
 *     an invited account is created without one and they have never had one
 *
 * WAIT FOR THE SESSION BEFORE ENABLING THE FORM. This page used to call
 * setReady(true) immediately on any link without `code=` in it — which, since
 * the client runs flowType "implicit" (src/lib/supabase.ts), is every link it
 * ever receives. The recovery token arrives in the URL hash and
 * detectSessionInUrl consumes it ASYNCHRONOUSLY, so the form was live before
 * there was a session to update, and a fast typist got "Auth session missing!".
 * It usually won, which is the problem: it is a race, so it fails rarely and
 * never for the person testing it. /auth/callback has always polled for exactly
 * this reason; this page did not.
 */
export default function UpdatePasswordPage() {
  const [ready, setReady] = useState(false);
  const [stale, setStale] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [password, setPassword] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    setWelcome(new URLSearchParams(window.location.search).get("welcome") === "1");

    let alive = true;
    (async () => {
      /*
        An invited agent arrives here from /auth/callback, which has already
        called verifyOtp — so the session is in storage and the first getSession
        returns it. A reset link arrives with #access_token= still unparsed, so
        it needs the wait. Same loop covers both.
      */
      for (let i = 0; i < 20; i++) {
        const { data } = await sb.auth.getSession();
        if (!alive) return;
        if (data.session) {
          setReady(true);
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!alive) return;
      // Five seconds with no session means the link is spent, not slow. Say so
      // rather than showing a form whose submit cannot work.
      setStale(true);
    })();
    return () => {
      alive = false;
    };
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
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    /*
      The checkbox is the whole reason an invited agent can be provisioned
      opted OUT (migration 0067). Nothing else in the app lets them answer, so
      without this the brokerage's choice would be permanent and this would be
      a list nobody could join or leave.

      Written after the password, and never allowed to fail the page: a save
      that worked plus a preference that did not is a far better outcome than
      sending somebody back to re-enter a password they already set.
    */
    if (optIn) {
      const { data } = await sb.auth.getUser();
      const uid = data.user?.id;
      if (uid) {
        const { error: optErr } = await sb
          .from("profiles")
          .update({ email_opt_in: true })
          .eq("id", uid);
        if (optErr) console.error("[update-password] opt-in not saved:", optErr.message);
      }
    }
    setBusy(false);
    setDone(true);
    setTimeout(() => window.location.assign("/dashboard"), 1500);
  }

  if (stale) {
    return (
      <AuthShell
        title="This link has expired"
        subtitle="Password links are good for about a day."
      >
        <p className={authNotice}>
          Your account is still there — nothing is lost. Go to{" "}
          <a className="font-semibold underline" href="/reset-password/">
            Forgot password
          </a>{" "}
          and enter your email to get a fresh link.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={welcome ? "Set your password" : "Set a new password"}
      subtitle={
        welcome
          ? "Your Crush account is ready — pick a password and you're in."
          : "Choose a strong password you'll remember."
      }
    >
      {done ? (
        <p className={authOk}>Password saved — taking you to your dashboard…</p>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className={authLabel}>{welcome ? "Password" : "New password"}</label>
            <input
              className={authInput}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              disabled={!ready}
            />
          </div>
          {welcome && (
            <label className="flex items-start gap-3 text-sm text-ink-800">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border text-crush-500 focus:ring-crush-200"
                checked={optIn}
                onChange={(e) => setOptIn(e.target.checked)}
                disabled={!ready}
              />
              <span>
                Email me market updates and new tools.{" "}
                <span className="text-muted">
                  Optional — your flyers and account emails arrive either way, and you can
                  change this in your profile.
                </span>
              </span>
            </label>
          )}
          {error && <p className={authNotice}>{error}</p>}
          <button type="submit" className={authButton} disabled={busy || !ready}>
            {busy ? "Saving…" : !ready ? "Checking your link…" : "Save password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
