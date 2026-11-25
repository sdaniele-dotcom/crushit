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
import { AUTH_ROUTES, PUBLIC_ROUTES, normalizePath } from "@/lib/routes";

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
// The route lists live in lib/routes so the sitemap can read the same answer;
// see the note there on why they were split out.

function Spinner() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-20">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" />
    </Container>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  const { configured, ready, user, profile, refreshProfile } = useAuth();
  const path = normalizePath(usePathname() || "/");
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
  } else if (needsTerms) {
    // Ahead of every other signed-in branch, including the home redirect, so
    // there is no route that reaches the app around it. Safe to sit ahead of
    // the home branch below: it requires a loaded profile, so it is false at
    // build time and cannot swallow the prerender.
    content = <TermsGate onAccepted={() => void refreshProfile()} />;
    chrome = false;
  } else if (isHome) {
    /*
      THE HOME BRANCH COMES BEFORE THE `!ready` CHECK, AND THAT IS THE POINT.

      `ready` is false at build time — there is no session to check during a
      static export — so when this branch sat after `!ready`, the homepage
      prerendered as a spinner. Production served 3.8KB of header and a
      spinning border to every visitor and every crawler, and the marketing
      page only existed once JS had run. The footer went with it, which is
      where the NMLS, Equal Housing and Regulation Z disclosures live.

      It was invisible locally because an unconfigured Supabase takes the
      `!configured` path above, which renders everything. Only the deployed
      build, with env set, took the broken path.

      So: render the real page unless we positively know we are about to
      redirect. `ready && user` is that knowledge, and it is only ever true
      after hydration.
    */
    if (ready && user) {
      content = <Spinner />; // signed-in → redirecting to dashboard
    } else {
      content = children; // build time and logged-out → marketing homepage
      chrome = true; // which means the footer is in the served HTML
    }
  } else if (!ready) {
    content = <Spinner />; // wait for the session check before deciding
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
