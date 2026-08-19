"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui";

/**
 * Gates admin pages. This is a UX guard only — the REAL enforcement is
 * server-side: every admin query/action is protected by Supabase RLS +
 * is_admin() SECURITY DEFINER checks, so a non-admin who loads the page shell
 * still gets no data and can perform no admin action.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { configured, ready, user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!configured) {
      window.location.assign("/");
      return;
    }
    if (ready && (!user || (profile && !isAdmin))) {
      window.location.assign(user ? "/dashboard/" : "/login/");
    }
  }, [configured, ready, user, profile, isAdmin]);

  if (!configured || !ready || !user || !profile || !isAdmin) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-20">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" />
      </Container>
    );
  }
  return <>{children}</>;
}
