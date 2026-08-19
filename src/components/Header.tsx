"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { navItems } from "@/lib/site";
import { useAuth } from "@/components/auth/AuthProvider";
import { fullName } from "@/lib/profile";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { configured, user, profile, signOut } = useAuth();
  const firstName = profile?.first_name || fullName(profile).split(" ")[0] || "Account";
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {(!configured || user) &&
            navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          {configured && user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="ml-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="ml-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                <span aria-hidden>⭐</span>
                {profile?.current_stars ?? 0}
                <span className="text-slate-300">· {firstName}</span>
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-full px-3 py-2 text-sm font-medium text-slate-300 hover:text-white"
              >
                Log out
              </button>
            </>
          ) : configured ? (
            <>
              <Link href="/login" className="ml-2 rounded-full px-4 py-2 text-sm font-medium text-slate-200 hover:text-white">
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-full bg-crush-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
              >
                Create Free Account
              </Link>
            </>
          ) : (
            <Link
              href="/about/#contact"
              className="ml-2 inline-flex items-center rounded-full bg-crush-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
            >
              Get Pre-Approved
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-white/10 bg-ink-900 md:hidden">
          <div className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
            {(!configured || user) &&
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            {configured && user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="mt-2 block rounded-lg px-3 py-2.5 text-base font-medium text-white">
                  ⭐ {profile?.current_stars ?? 0} · Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-white/5">
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-base font-medium text-slate-300"
                >
                  Log out
                </button>
              </>
            ) : configured ? (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="mt-2 block rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-white/5">
                  Log in
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="mt-1 block rounded-full bg-crush-500 px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Create Free Account
                </Link>
              </>
            ) : (
              <Link
                href="/about/#contact"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-crush-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Get Pre-Approved
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
