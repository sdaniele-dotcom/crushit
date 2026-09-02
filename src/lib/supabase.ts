"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client for the CRUSH IT suite.
 *
 * The public URL + anon key are safe to ship in the static bundle — all data
 * access is enforced server-side by Supabase Row Level Security. Until these
 * are configured (GitHub Actions build secrets), `isSupabaseConfigured` is
 * false and the app degrades gracefully (no login gate, marketing site as-is).
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

let cached: SupabaseClient | null = null;

/** Returns the singleton browser client, or null if Supabase isn't configured. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (cached) return cached;
  cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Implicit (not PKCE): this is a static SPA with no server to store the
      // PKCE code verifier, so PKCE email links fail when opened on a different
      // device/browser than sign-up ("code verifier not found"). Implicit flow
      // returns the session in the URL hash, which detectSessionInUrl + our
      // /auth/callback consume — cross-device safe, no email-template edit.
      flowType: "implicit",
    },
  });
  return cached;
}
