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
import type { Profile } from "@/lib/profile";

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
      await loadProfile(data.session?.user?.id);
      setReady(true);
    });

    const { data: sub } = sb.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;
      setSession(s ?? null);
      setUser(s?.user ?? null);
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
