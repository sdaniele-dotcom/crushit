"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui";

/**
 * Gates a page behind login. If Supabase isn't configured yet, it renders
 * children (graceful — the site works as today until accounts go live).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { configured, ready, user } = useAuth();

  useEffect(() => {
    if (configured && ready && !user) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.assign(`/login/?next=${next}`);
    }
  }, [configured, ready, user]);

  if (!configured) return <>{children}</>;
  if (!ready || !user) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-20">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" />
      </Container>
    );
  }
  return <>{children}</>;
}
