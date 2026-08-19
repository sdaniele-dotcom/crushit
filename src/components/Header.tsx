"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { navItems, site } from "@/lib/site";
import { useAuth } from "@/components/auth/AuthProvider";
import { fullName } from "@/lib/profile";

type Item = { label: string; href: string };

// Grouped navigation for signed-in agents (spec §11).
const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Marketing",
    items: [
      { label: "Listing Flyers", href: "/co-brand" },
      { label: "Social Media Kit", href: "/co-marketing/social-kit" },
      { label: "Open House Kit", href: "/co-marketing/open-house-kit" },
      { label: "Email Templates", href: "/co-marketing/email-templates" },
      { label: "Video Scripts", href: "/co-marketing/video-scripts" },
      { label: "Buyer & Seller Guides", href: "/resources" },
    ],
  },
  {
    label: "Buyer Tools",
    items: [
      { label: "Mortgage Calculator", href: "/calculators" },
      { label: "Rent vs Own", href: "/rent-vs-own" },
      { label: "Loan Program Finder", href: "/loan-programs" },
    ],
  },
  {
    label: "My Business",
    items: [
      { label: "My Listings", href: "/listings" },
      { label: "Rewards", href: "/rewards" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { configured, user, profile, signOut } = useAuth();
  const firstName = profile?.first_name || fullName(profile).split(" ")[0] || "Account";
  const isAdmin = profile?.role === "admin";
  const loggedIn = configured && !!user;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {loggedIn ? (
            <>
              <Link href="/dashboard" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">Dashboard</Link>
              {GROUPS.map((g) => (
                <div key={g.label} className="group relative">
                  <button type="button" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">
                    {g.label}
                  </button>
                  <div className="invisible absolute left-0 top-full z-50 min-w-[220px] translate-y-1 rounded-2xl border border-border bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {g.items.map((it) => (
                      <Link key={it.href} href={it.href} className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-800 hover:bg-crush-50 hover:text-crush-700">
                        {it.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              {/* Account */}
              <div className="group relative ml-1">
                <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                  <span aria-hidden>⭐</span>{profile?.current_stars ?? 0}
                  <span className="text-slate-300">· {firstName}</span>
                </button>
                <div className="invisible absolute right-0 top-full z-50 min-w-[200px] translate-y-1 rounded-2xl border border-border bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <Link href="/dashboard" className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-800 hover:bg-crush-50 hover:text-crush-700">Dashboard</Link>
                  <Link href="/profile" className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-800 hover:bg-crush-50 hover:text-crush-700">Profile & branding</Link>
                  <Link href="/rewards" className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-800 hover:bg-crush-50 hover:text-crush-700">Rewards</Link>
                  {isAdmin && <Link href="/admin" className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-800 hover:bg-crush-50 hover:text-crush-700">Admin</Link>}
                  <button type="button" onClick={() => signOut()} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-800 hover:bg-crush-50 hover:text-crush-700">Log out</button>
                </div>
              </div>
            </>
          ) : configured ? (
            <>
              <Link href="/login" className="ml-2 rounded-full px-4 py-2 text-sm font-medium text-slate-200 hover:text-white">Log in</Link>
              <Link href="/signup" className="inline-flex items-center rounded-full bg-crush-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600">Create Free Account</Link>
            </>
          ) : (
            <>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">{item.label}</Link>
              ))}
              <a href={site.applyUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center rounded-full bg-crush-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600">Get Pre-Approved</a>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white md:hidden" aria-label="Toggle menu" aria-expanded={open}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="max-h-[80vh] overflow-y-auto border-t border-white/10 bg-ink-900 md:hidden">
          <div className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
            {loggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-bold text-white">Dashboard</Link>
                {GROUPS.map((g) => (
                  <div key={g.label} className="mt-2">
                    <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">{g.label}</p>
                    {g.items.map((it) => (
                      <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-white/5">{it.label}</Link>
                    ))}
                  </div>
                ))}
                <div className="mt-2 border-t border-white/10 pt-2">
                  <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-white/5">Profile & branding</Link>
                  {isAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-white/5">Admin</Link>}
                  <button type="button" onClick={() => { setOpen(false); signOut(); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-base font-medium text-slate-300">Log out (⭐ {profile?.current_stars ?? 0})</button>
                </div>
              </>
            ) : configured ? (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="mt-2 block rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-white/5">Log in</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="mt-1 block rounded-full bg-crush-500 px-4 py-2.5 text-center text-sm font-semibold text-white">Create Free Account</Link>
              </>
            ) : (
              <>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-white/5">{item.label}</Link>
                ))}
                <a href={site.applyUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="mt-2 block rounded-full bg-crush-500 px-4 py-2.5 text-center text-sm font-semibold text-white">Get Pre-Approved</a>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
