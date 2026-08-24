"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui";

/**
 * App shell + login gate.
 *
 * When Supabase is configured, the whole site requires an account:
 *   - Auth routes (login/signup/reset/callback) are always public.
 *   - The home page ("/") is the public login landing for logged-out visitors,
 *     and redirects logged-in users to their dashboard.
 *   - Every other route redirects to /login when logged out.
 *
 * When Supabase is NOT configured, it degrades to the old public site so
 * nothing breaks before accounts are switched on.
 */
// Public routes that render without the login gate or app chrome — auth pages
// plus the QR-driven open-house visitor forms (scanned by logged-out visitors).
const AUTH_ROUTES = [
  "/login", "/signup", "/reset-password", "/update-password", "/auth/callback",
  "/open-house", "/feedback",
];

function normalize(p: string): string {
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

function Spinner() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-20">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" />
    </Container>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  const { configured, ready, user } = useAuth();
  const path = normalize(usePathname() || "/");
  const isAuthRoute = AUTH_ROUTES.includes(path);
  const isHome = path === "/";

  useEffect(() => {
    if (!configured || !ready) return;
    if (isHome && user) {
      window.location.assign("/dashboard/");
    } else if (!isHome && !isAuthRoute && !user) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.assign(`/login/?next=${next}`);
    }
  }, [configured, ready, user, isHome, isAuthRoute]);

  // Not configured yet → behave like the original public site.
  if (!configured) {
    return (
      <>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </>
    );
  }

  // Decide what to render and whether to show the full site chrome.
  let content: ReactNode = children;
  let chrome = false;

  if (isAuthRoute) {
    content = children; // self-contained auth pages
  } else if (!ready) {
    content = <Spinner />; // wait for the session check before deciding
  } else if (isHome) {
    if (user) {
      content = <Spinner />; // signed-in → redirecting to dashboard
    } else {
      content = children; // logged-out → full marketing homepage
      chrome = true; // marketing page gets the footer + chat
    }
  } else if (!user) {
    content = <Spinner />; // redirecting to /login
  } else {
    content = children; // signed-in app
    chrome = true; // footer + chat only inside the app
  }

  return (
    <>
      <Header />
      <main className="flex-1">{content}</main>
      {chrome && <Footer />}
      {chrome && <ChatWidget />}
    </>
  );
}
