"use client";

import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { fullName } from "@/lib/profile";

const QUICK = [
  { label: "Create a flyer", href: "/co-brand", icon: "📄" },
  { label: "Open House Kit", href: "/co-marketing/open-house-kit", icon: "🏡" },
  { label: "Buyer & seller guides", href: "/resources#guides", icon: "📘" },
  { label: "Loan programs", href: "/loan-programs", icon: "🏦" },
  { label: "Calculators", href: "/calculators", icon: "🧮" },
  { label: "My profile", href: "/profile", icon: "🙂" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardInner() {
  const { profile } = useAuth();
  const name = profile?.first_name || fullName(profile) || "there";
  return (
    <>
      <PageHero
        eyebrow="Your dashboard"
        title={
          <>
            {greeting()}, <span className="text-gradient">{name}</span> 👋
          </>
        }
        subtitle="Run your real estate marketing — your info is saved and reused everywhere."
      />
      <Container className="py-12">
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-6">
          <div className="text-3xl font-extrabold text-crush-600">
            ⭐ {profile?.current_stars ?? 0}
          </div>
          <div className="text-sm text-muted">
            Crush Stars · {profile?.lifetime_stars ?? 0} lifetime
          </div>
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">
          Quick actions
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="card-hover flex items-center gap-4 rounded-2xl border border-border bg-white p-5"
            >
              <span className="text-2xl" aria-hidden>{q.icon}</span>
              <span className="font-semibold text-ink-900">{q.label}</span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          More is coming to your dashboard — recent marketing, rewards progress,
          achievements, and the leaderboard.
        </p>
      </Container>
    </>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
