"use client";

import { useEffect, useState } from "react";
import { Container, PageHero } from "@/components/ui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { useLevels } from "@/lib/useLevels";
import { levelProgress } from "@/lib/levels";

type Tx = { id: string; action: string; stars: number; description: string | null; created_at: string };
type Achievement = { key: string; name: string; description: string | null; icon: string | null };

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function RewardsInner() {
  const { user, profile } = useAuth();
  const levels = useLevels();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user) return;
    (async () => {
      const [t, a, ua] = await Promise.all([
        sb.from("star_transactions").select("id,action,stars,description,created_at").order("created_at", { ascending: false }).limit(60),
        sb.from("achievements").select("key,name,description,icon").eq("active", true).order("sort"),
        sb.from("user_achievements").select("achievement_key"),
      ]);
      setTxs((t.data as Tx[]) ?? []);
      setAchievements((a.data as Achievement[]) ?? []);
      setEarned(new Set(((ua.data as { achievement_key: string }[]) ?? []).map((x) => x.achievement_key)));
    })();
  }, [user]);

  const lifetime = profile?.lifetime_stars ?? 0;
  const lp = levelProgress(lifetime, levels);
  const sortedLevels = [...levels].sort((a, b) => a.min - b.min);

  return (
    <>
      <PageHero
        eyebrow="Crush Stars"
        title={<>Your <span className="text-gradient">Rewards</span></>}
        subtitle="Earn Crush Stars for using the platform, level up, and unlock achievements."
      />
      <Container className="py-12">
        {/* Stars + level progress */}
        <div className="grid gap-4 rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
          <div>
            <p className="text-4xl font-extrabold text-crush-600">⭐ {profile?.current_stars ?? 0}</p>
            <p className="text-xs text-muted">Crush Stars · {lifetime} lifetime</p>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-ink-900">{lp.current.name}</span>
              {lp.next ? <span className="text-sm text-muted">{lp.starsToNext} ⭐ until {lp.next.name}</span> : <span className="text-sm font-semibold text-crush-600">Top level 🏆</span>}
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-crush-500 transition-all" style={{ width: `${lp.pct}%` }} />
            </div>
          </div>
        </div>

        {/* Levels */}
        <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-crush-700">Crush levels</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sortedLevels.map((l) => {
            const reached = lifetime >= l.min;
            const current = l.name === lp.current.name;
            return (
              <div key={l.name} className={`rounded-2xl border p-5 ${current ? "border-crush-400 bg-crush-50" : reached ? "border-crush-200 bg-white" : "border-border bg-white opacity-70"}`}>
                <p className="text-lg font-bold text-ink-900">{l.name}</p>
                <p className="text-xs text-muted">{l.min}+ lifetime ⭐</p>
                <p className={`mt-2 text-xs font-semibold ${current ? "text-crush-600" : reached ? "text-mint-500" : "text-muted"}`}>
                  {current ? "You're here" : reached ? "Reached ✓" : "Locked"}
                </p>
              </div>
            );
          })}
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

        {/* Star history */}
        <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-crush-700">Star history</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white">
          {txs.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">No stars yet — use a tool to start earning.</p>
          ) : (
            txs.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">{t.description || t.action.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted">{fmt(t.created_at)}</p>
                </div>
                <span className={`shrink-0 text-sm font-bold ${t.stars >= 0 ? "text-crush-600" : "text-ink-500"}`}>{t.stars >= 0 ? "+" : ""}{t.stars} ⭐</span>
              </div>
            ))
          )}
        </div>
      </Container>
    </>
  );
}

export default function RewardsPage() {
  return (
    <RequireAuth>
      <RewardsInner />
    </RequireAuth>
  );
}
