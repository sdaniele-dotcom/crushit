"use client";

import { useEffect, useRef, useState } from "react";
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

// Optional Cloudflare Turnstile CAPTCHA. When this env var is set (and CAPTCHA
// is enabled in Supabase Auth with the matching secret), the widget renders and
// a verified token is required to sign up — the real fix for bot signups.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

/** Very light "is this a random bot string?" check — flags a long, low-vowel
 *  token like "FwTNhhydslRVhfTRKpEQfMBF" without tripping on real names. */
function looksRandom(name: string): boolean {
  return name
    .trim()
    .split(/\s+/)
    .some((tok) => {
      if (tok.length < 12) return false;
      const vowels = (tok.match(/[aeiouAEIOU]/g) || []).length;
      return vowels / tok.length < 0.2;
    });
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [trap, setTrap] = useState(""); // honeypot — humans never fill this
  const [captchaToken, setCaptchaToken] = useState("");
  const mountedAt = useRef(Date.now());
  const captchaRef = useRef<HTMLDivElement>(null);
  const captchaRendered = useRef(false);

  // Load + render Turnstile only when a site key is configured.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || captchaRendered.current) return;
    const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    function render() {
      if (captchaRendered.current || !captchaRef.current || !window.turnstile) return;
      captchaRendered.current = true;
      window.turnstile.render(captchaRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (t: string) => setCaptchaToken(t),
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => setCaptchaToken(""),
      });
    }
    if (window.turnstile) return render();
    const existing = document.querySelector(`script[src="${SRC}"]`);
    if (existing) {
      existing.addEventListener("load", render);
      return;
    }
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.defer = true;
    s.onload = render;
    document.head.appendChild(s);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) {
      setError("Accounts aren't enabled yet. Please check back soon.");
      return;
    }
    // Bot defenses — quiet, generic failure so bots learn nothing.
    if (trap.trim()) return; // honeypot filled
    if (Date.now() - mountedAt.current < 2500) {
      setError("Please take a moment and try again.");
      return;
    }
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (fn.length > 40 || ln.length > 40 || looksRandom(`${fn} ${ln}`)) {
      setError("Please enter your real first and last name.");
      return;
    }
    if (password.length < 8) {
      setError("Please use a password of at least 8 characters.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the “I'm human” check above.");
      return;
    }
    setBusy(true);
    setError("");
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback/`,
        data: { first_name: fn, last_name: ln },
        ...(captchaToken ? { captchaToken } : {}),
      },
    });
    if (error) {
      setBusy(false);
      setError(error.message);
      if (TURNSTILE_SITE_KEY) { window.turnstile?.reset(); setCaptchaToken(""); }
      return;
    }
    // Persist the names onto the profile (created by the DB trigger).
    if (data.session && data.user) {
      await sb
        .from("profiles")
        .update({
          first_name: fn,
          last_name: ln,
          display_name: [fn, ln].filter(Boolean).join(" "),
        })
        .eq("id", data.user.id);
    }
    setBusy(false);
    if (data.session) {
      // Signed in immediately (email confirmation is off). Start onboarding at
      // the profile so they add their headshot/logo and earn the +10 — after
      // which every co-branded tool autofills from it.
      window.location.assign("/profile/");
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
              <input className={authInput} required value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" maxLength={40} />
            </div>
            <div>
              <label className={authLabel}>Last name</label>
              <input className={authInput} required value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" maxLength={40} />
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

          {/* Honeypot — hidden from humans; bots fill it and get rejected. */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: 0, height: 0, overflow: "hidden" }}>
            <label>Company website</label>
            <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </div>

          {TURNSTILE_SITE_KEY && <div ref={captchaRef} className="min-h-[65px]" />}

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
