"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { fullName } from "@/lib/profile";
import { levelProgress } from "@/lib/levels";

const QUICK = [
  { label: "Create a flyer", href: "/co-brand", icon: "📄" },
  { label: "Open House Kit", href: "/co-marketing/open-house-kit", icon: "🏡" },
  { label: "Buyer & seller guides", href: "/resources#guides", icon: "📘" },
  { label: "Social & video", href: "/co-marketing/social-kit", icon: "🎬" },
  { label: "Loan programs", href: "/loan-programs", icon: "🏦" },
  { label: "Calculators", href: "/calculators", icon: "🧮" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
function when(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US");
}

type Tx = { id: string; action: string; stars: number; description: string | null; created_at: string };
type Project = { id: string; kind: string; title: string | null; public_url: string | null; pdf_url: string | null; created_at: string };
type Achievement = { key: string; name: string; description: string | null; icon: string | null };

const KIND_ICON: Record<string, string> = {
  property_flyer: "📄", open_house_flyer: "🏡", buyer_guide: "📘",
  seller_guide: "📗", social: "🎬", video: "🎥", open_house_kit: "🏡",
};

function DashboardInner() {
  const { user, profile } = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user) return;
    (async () => {
      const [t, p, a, ua] = await Promise.all([
        sb.from("star_transactions").select("id,action,stars,description,created_at").order("created_at", { ascending: false }).limit(8),
        sb.from("saved_projects").select("id,kind,title,public_url,pdf_url,created_at").order("created_at", { ascending: false }).limit(6),
        sb.from("achievements").select("key,name,description,icon").eq("active", true).order("sort"),
        sb.from("user_achievements").select("achievement_key"),
      ]);
      setTxs((t.data as Tx[]) ?? []);
      setProjects((p.data as Project[]) ?? []);
      setAchievements((a.data as Achievement[]) ?? []);
      setEarned(new Set(((ua.data as { achievement_key: string }[]) ?? []).map((x) => x.achievement_key)));
    })();
  }, [user]);

  const name = profile?.first_name || fullName(profile) || "there";
  const lifetime = profile?.lifetime_stars ?? 0;
  const lp = levelProgress(lifetime);

  return (
    <>
      <PageHero
        eyebrow="Your dashboard"
        title={<>{greeting()}, <span className="text-gradient">{name}</span> 👋</>}
        subtitle="Run your real estate marketing — your info is saved and reused everywhere."
      />
      <Container className="py-12">
        {/* Stars + level */}
        <div className="grid gap-4 rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
          <div>
            <p className="text-4xl font-extrabold text-crush-600">⭐ {profile?.current_stars ?? 0}</p>
            <p className="text-xs text-muted">Crush Stars · {lifetime} lifetime</p>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-ink-900">{lp.current.name}</span>
              {lp.next ? (
                <span className="text-sm text-muted">{lp.starsToNext} ⭐ until {lp.next.name}</span>
              ) : (
                <span className="text-sm font-semibold text-crush-600">Top level 🏆</span>
              )}
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-crush-500 transition-all" style={{ width: `${lp.pct}%` }} />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-crush-700">Quick actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK.map((q) => (
            <Link key={q.href} href={q.href} className="card-hover flex items-center gap-4 rounded-2xl border border-border bg-white p-5">
              <span className="text-2xl" aria-hidden>{q.icon}</span>
              <span className="font-semibold text-ink-900">{q.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Recent marketing */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">My recent marketing</h2>
            <div className="mt-4 space-y-3">
              {projects.length === 0 && <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">Nothing yet — create a flyer or a guide and it&apos;ll show up here.</p>}
              {projects.map((p) => (
                <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4">
                  <span className="text-2xl" aria-hidden>{KIND_ICON[p.kind] ?? "📄"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{p.title || p.kind.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted">{when(p.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {p.public_url && <a href={p.public_url} target="_blank" rel="noreferrer" className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-surface">Open</a>}
                    {p.pdf_url && <a href={p.pdf_url} target="_blank" rel="noreferrer" className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-surface">PDF</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity / stars */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">Recent activity</h2>
            <div className="mt-4 space-y-2">
              {txs.length === 0 && <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">Your Crush Stars activity will appear here.</p>}
              {txs.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{t.description || t.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted">{when(t.created_at)}</p>
                  </div>
                  <span className={`shrink-0 text-sm font-bold ${t.stars >= 0 ? "text-crush-600" : "text-ink-500"}`}>
                    {t.stars >= 0 ? "+" : ""}{t.stars} ⭐
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-crush-700">Achievements</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => {
            const got = earned.has(a.key);
            return (
              <div key={a.key} className={`flex items-start gap-4 rounded-2xl border p-5 ${got ? "border-crush-200 bg-crush-50" : "border-border bg-white opacity-70"}`}>
                <span className={`text-3xl ${got ? "" : "grayscale"}`} aria-hidden>{a.icon || "🏅"}</span>
                <div>
                  <p className="font-bold text-ink-900">{a.name}</p>
                  <p className="text-xs text-muted">{a.description}</p>
                  <p className={`mt-1 text-xs font-semibold ${got ? "text-crush-600" : "text-muted"}`}>{got ? "Earned ✓" : "Locked"}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <Link href="/profile" className="rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600">Edit my profile</Link>
        </div>
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
