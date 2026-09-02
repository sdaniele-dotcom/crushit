"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { getSupabase } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/notify";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Landing page for email-confirmation / magic / recovery links.
 *
 * Handles every shape of link Supabase can send, so confirmation works no
 * matter how the email template is configured or which device opens it:
 *   1. ?error=... / #error=...        → show the real reason (expired, invalid…)
 *   2. ?token_hash=...&type=...       → verifyOtp (cross-device safe, no PKCE verifier needed)
 *   3. ?code=...                      → exchangeCodeForSession (PKCE, same-browser)
 *   4. #access_token=...              → detectSessionInUrl already set the session
 */
export default function AuthCallbackPage() {
  const [msg, setMsg] = useState("Signing you in…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      window.location.assign("/");
      return;
    }

    const query = new URLSearchParams(window.location.search);
    // Some links put params in the URL hash (#…) instead of the query string.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const get = (k: string) => query.get(k) || hash.get(k);

    const fail = (m: string) => {
      setMsg(m);
      setFailed(true);
    };
    const finish = () => window.location.assign("/dashboard/");

    // 1) The link itself carried an error (expired, already used, invalid).
    const errDesc = get("error_description") || get("error");
    if (errDesc) {
      fail(decodeURIComponent(errDesc).replace(/\+/g, " "));
      return;
    }

    const isRecovery = get("type") === "recovery";
    // A signup confirmation (not a recovery/magic-link) is the one moment to
    // send the welcome email — the account is now confirmed and provisioned.
    const isSignupConfirm = get("type") === "signup" || get("type") === "email";
    const afterAuth = async () => {
      if (isRecovery) return window.location.assign("/update-password/");
      if (isSignupConfirm) {
        try {
          const { data } = await sb.auth.getUser();
          const u = data.user;
          const meta = (u?.user_metadata ?? {}) as { first_name?: string; last_name?: string };
          const name = [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim();
          if (u?.email) sendWelcomeEmail(u.email, name || null);
        } catch { /* welcome email is best-effort */ }
      }
      finish();
    };

    (async () => {
      const tokenHash = get("token_hash");
      const type = get("type") as EmailOtpType | null;
      const code = get("code");

      try {
        if (tokenHash && type) {
          // Cross-device safe: no PKCE code_verifier required.
          const { error } = await sb.auth.verifyOtp({ type, token_hash: tokenHash });
          if (error) return fail(error.message);
          return afterAuth();
        }

        if (code) {
          const { error } = await sb.auth.exchangeCodeForSession(code);
          if (error) {
            // PKCE links only work on the same browser/device that started
            // sign-up (the code verifier lives there). Give a human fix.
            return fail(
              /verifier|pkce|code challenge/i.test(error.message)
                ? "Open the link on the same device and browser you signed up with — or request a fresh link with “Resend confirmation email” on the log-in page."
                : error.message,
            );
          }
          return afterAuth();
        }

        // 4) Hash-based tokens: detectSessionInUrl consumes them asynchronously.
        for (let i = 0; i < 10; i++) {
          const { data } = await sb.auth.getSession();
          if (data.session) return afterAuth();
          await new Promise((r) => setTimeout(r, 250));
        }
        fail("This sign-in link is invalid or has expired. Request a new one below.");
      } catch {
        fail("Could not complete sign-in. Please request a new link.");
      }
    })();
  }, []);

  return (
    <AuthShell title={failed ? "Sign-in link problem" : "One moment…"} subtitle={msg}>
      {failed ? (
        <div className="grid gap-3">
          <Link
            href="/login/"
            className="rounded-full bg-crush-500 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-crush-600"
          >
            Go to log in
          </Link>
          <Link href="/signup/" className="text-center text-sm font-semibold text-crush-600">
            Create a new account
          </Link>
        </div>
      ) : (
        <div className="flex justify-center py-4">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" />
        </div>
      )}
    </AuthShell>
  );
}
