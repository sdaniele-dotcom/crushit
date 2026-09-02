"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendWelcomeEmail, claimInvitedListings } from "@/lib/notify";
import { toast } from "@/lib/toast";
import type { Profile } from "@/lib/profile";

/**
 * Import any listing an agent was invited about (via a /signup?claim= link or
 * an email match) into their account, once, after login. The imported listing
 * shows up in My Listings with the marketing package ready to download.
 */
async function maybeClaimListings(session: Session | null) {
  const u = session?.user;
  if (!u || !session.access_token) return;
  let token: string | null = null;
  let alreadyDone = false;
  const flagKey = `crush:claimed:${u.id}`;
  try {
    token = localStorage.getItem("crush:claim-token");
    alreadyDone = !!localStorage.getItem(flagKey);
  } catch { /* storage blocked */ }
  if (!token && alreadyDone) return; // nothing new to claim

  const n = await claimInvitedListings(session.access_token, token);
  try {
    localStorage.removeItem("crush:claim-token");
    localStorage.setItem(flagKey, "1");
  } catch { /* ignore */ }
  if (n > 0) {
    try { window.dispatchEvent(new Event("crush:refresh-profile")); } catch { /* ignore */ }
    toast({
      emoji: "🎁",
      title: "Your listing is ready",
      body: `We added ${n} listing${n === 1 ? "" : "s"} to your account — download the marketing package in My Listings.`,
    });
  }
}

/**
 * Fire the welcome email once, when a freshly-confirmed agent first shows up in
 * the app — wherever their confirmation link lands them. Guards: only for an
 * account confirmed in the last 24h (so existing agents aren't emailed on their
 * next login), and only once per browser via a localStorage flag. The server
 * dedupes for good once migration 0037 is applied.
 */
function maybeWelcome(u: User | null) {
  if (!u?.email) return;
  const confirmedAt = u.email_confirmed_at || u.confirmed_at;
  if (!confirmedAt) return;
  if (Date.now() - new Date(confirmedAt).getTime() > 24 * 60 * 60 * 1000) return;
  const key = `crush:welcomed:${u.id}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    /* storage blocked — fall through and send (server dedupe still protects) */
  }
  const meta = (u.user_metadata ?? {}) as { first_name?: string; last_name?: string };
  const name = [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim();
  sendWelcomeEmail(u.email, name || null);
}

type AuthState = {
  ready: boolean; // finished initial session check
  configured: boolean; // Supabase env present
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (uid: string | undefined) => {
    const sb = getSupabase();
    if (!sb || !uid) {
      setProfile(null);
      return;
    }
    const { data } = await sb.from("profiles").select("*").eq("id", uid).maybeSingle();
    setProfile((data as Profile) ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user?.id);
  }, [loadProfile, user?.id]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    let mounted = true;

    sb.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      if (data.session?.user) { maybeWelcome(data.session.user); void maybeClaimListings(data.session); }
      await loadProfile(data.session?.user?.id);
      setReady(true);
    });

    const { data: sub } = sb.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;
      setSession(s ?? null);
      setUser(s?.user ?? null);
      // A newly-confirmed agent triggers SIGNED_IN here — send the welcome and
      // import any listing they were invited about.
      if (s?.user && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        maybeWelcome(s.user);
        void maybeClaimListings(s);
      }
      await loadProfile(s?.user?.id);
    });

    // Re-fetch the profile when rewards change it (updates stars in the header).
    const handler = () => {
      sb.auth.getSession().then(({ data }) => loadProfile(data.session?.user?.id));
    };
    window.addEventListener("crush:refresh-profile", handler);

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("crush:refresh-profile", handler);
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    await sb?.auth.signOut();
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ready,
        configured: isSupabaseConfigured,
        session,
        user,
        profile,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
