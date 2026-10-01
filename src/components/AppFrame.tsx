"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { useAuth } from "@/components/auth/AuthProvider";
import { TermsGate } from "@/components/auth/TermsGate";
import { TERMS_VERSION } from "@/lib/terms";
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

/**
 * Readable without an account AND without having accepted the terms. /terms
 * has to be on this list or the gate traps you: the gate links to the terms,
 * and a gate that blocks the document it is asking you to agree to is asking
 * you to agree to something you cannot read.
 */
const PUBLIC_ROUTES = ["/terms"];

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
  const { configured, ready, user, profile, refreshProfile } = useAuth();
  const path = normalize(usePathname() || "/");
  const isAuthRoute = AUTH_ROUTES.includes(path);
  const isPublicRoute = PUBLIC_ROUTES.includes(path);
  const isHome = path === "/";

  /*
    Gate on the profile actually having loaded. `profile` is null both while it
    is in flight and when the row is genuinely missing, so gating on a null
    would flash the terms screen at every agent on every page load. Waiting for
    a row means an agent who has already accepted never sees this again.

    AND on the COLUMN existing, which is the part that is not obvious. If this
    code ships before migration 0059 runs, `terms_version` is not a key on the
    row at all — and `undefined !== TERMS_VERSION` is true, so every agent would
    be shown a gate whose accept button writes to a column that does not exist
    and therefore always fails. That is a total lockout of the whole suite,
    caused purely by deploy order. Checking for the key means the gate stays
    dormant until the migration lands and then switches itself on, in either
    order, with no window where anybody is stuck.
  */
  const termsColumnExists = !!profile && "terms_version" in profile;
  const needsTerms =
    !!user && termsColumnExists && profile.terms_version !== TERMS_VERSION;

  useEffect(() => {
    if (!configured || !ready) return;
    if (isPublicRoute) return;
    if (isHome && user) {
      window.location.assign("/dashboard/");
    } else if (!isHome && !isAuthRoute && !user) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.assign(`/login/?next=${next}`);
    }
  }, [configured, ready, user, isHome, isAuthRoute, isPublicRoute]);

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
  } else if (isPublicRoute) {
    content = children; // readable logged-out and before accepting the terms
    chrome = true;
  } else if (!ready) {
    content = <Spinner />; // wait for the session check before deciding
  } else if (needsTerms) {
    // Ahead of every other signed-in branch, including the home redirect, so
    // there is no route that reaches the app around it.
    content = <TermsGate onAccepted={() => void refreshProfile()} />;
    chrome = false;
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
