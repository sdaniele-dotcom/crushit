"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { CONSENT_SUMMARY, TERMS_VERSION } from "@/lib/terms";
import { Container } from "@/components/ui";

/**
 * Consent gate. An agent whose profile does not carry the current
 * TERMS_VERSION sees this instead of the app, on every route, until they
 * accept or sign out.
 *
 * WHY THE CHECKBOX STARTS EMPTY AND THE BUTTON STARTS DISABLED. The point of
 * this screen is to produce a consent record that is worth something later. A
 * pre-ticked box is not assent in most places that have ruled on it, and a
 * screen you can dismiss by pressing Enter is a screen nobody read. The cost
 * is one click; the thing being bought is an agreement that holds up.
 *
 * TWO WRITES, AND THE ORDER MATTERS. The append-only `terms_acceptances` row
 * goes in FIRST, because it is the evidence — who, which version, when, from
 * what browser. The profile stamp that opens the gate goes second. If the
 * second write fails the agent is asked again, which is harmless; if the first
 * failed silently we would have an agent through the gate with no record, and
 * that is the one outcome worth preventing.
 *
 * NO SILENT FAILURE. If either write errors the gate stays shut and says so.
 * An agent who "accepted" into a dropped connection has not accepted.
 */
export function TermsGate({ onAccepted }: { onAccepted: () => void }) {
  const { user, signOut } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    const sb = getSupabase();
    if (!sb || !user) return;
    setBusy(true);
    setError("");

    const { error: logErr } = await sb.from("terms_acceptances").insert({
      user_id: user.id,
      version: TERMS_VERSION,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
    if (logErr) {
      setBusy(false);
      setError("We couldn't record that. Check your connection and try again.");
      return;
    }

    const { error: profErr } = await sb
      .from("profiles")
      .update({
        terms_version: TERMS_VERSION,
        terms_accepted_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setBusy(false);
    if (profErr) {
      setError("We couldn't save that. Please try again.");
      return;
    }
    onAccepted();
  }

  return (
    <Container className="flex min-h-[80vh] items-center justify-center py-14">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-white p-7 shadow-xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-crush-600">
          Before you continue
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          We&apos;ve added terms for the suite
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Nothing changes about how you use the suite. Here&apos;s the short
          version of section 3, which is about featuring you in our co-marketing —
          the full terms are one click away.
        </p>

        <ul className="mt-5 space-y-3 rounded-2xl border border-border bg-surface p-5">
          {CONSENT_SUMMARY.map((s) => (
            <li key={s} className="flex gap-3 text-sm text-ink-800">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crush-500" />
              <span>{s}</span>
            </li>
          ))}
        </ul>

        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-border text-crush-500 focus:ring-crush-400"
          />
          <span className="text-sm text-ink-800">
            I&apos;ve read and agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="font-semibold text-crush-600 underline hover:text-crush-700"
            >
              Agent Terms of Use
            </Link>
            , including the permission in section 3 for Crush to feature me in
            co-marketing.
          </span>
        </label>

        {error && (
          <p className="mt-4 rounded-xl border border-crush-200 bg-crush-50 px-4 py-3 text-sm font-medium text-crush-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!agreed || busy}
            onClick={accept}
            className="rounded-full bg-crush-500 px-7 py-3 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Agree & continue"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void signOut()}
            className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-surface-2 disabled:opacity-50"
          >
            Not now — log out
          </button>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted">
          You can withdraw the permission in section 3 at any time by emailing
          info@crushmortgage.com, and we&apos;ll stop using your name and photo in
          new marketing. Version {TERMS_VERSION}.
        </p>
      </div>
    </Container>
  );
}
