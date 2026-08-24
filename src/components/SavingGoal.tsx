"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchTierRewards, setSavingGoal, type TierReward } from "@/lib/tierRewards";

function target(r: TierReward) {
  return r.kind === "drop" ? r.star_cost : r.min_stars;
}
function progressBase(r: TierReward, lifetime: number, current: number) {
  return r.kind === "drop" ? current : lifetime;
}

export function SavingGoal({ lifetime, current }: { lifetime: number; current: number }) {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<TierReward[]>([]);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    const [r, prof] = await Promise.all([
      fetchTierRewards(),
      user && sb ? sb.from("profiles").select("saving_goal_id").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setRewards(r.filter((x) => x.active && target(x) > 0));
    setGoalId((prof?.data as { saving_goal_id: string | null } | null)?.saving_goal_id ?? null);
    setLoaded(true);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  async function choose(id: string | null) {
    setGoalId(id);
    setPicking(false);
    await setSavingGoal(id);
  }

  if (!loaded) return null;
  const goal = rewards.find((r) => r.id === goalId) || null;

  return (
    <div className="mt-10 rounded-3xl border border-crush-200 bg-gradient-to-br from-white to-crush-50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">What are you saving for?</h2>
        {goal && !picking && (
          <button type="button" onClick={() => setPicking(true)} className="text-xs font-semibold text-crush-600 underline">Change goal</button>
        )}
      </div>

      {goal && !picking ? (
        (() => {
          const t = target(goal);
          const have = progressBase(goal, lifetime, current);
          const pct = Math.min(100, Math.round((have / t) * 100));
          const toGo = Math.max(0, t - have);
          return (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden>{goal.icon || "🎯"}</span>
                <div className="min-w-0">
                  <p className="font-bold text-ink-900">{goal.title}</p>
                  <p className="text-xs font-semibold text-muted">
                    {goal.kind === "drop" ? "Redeem" : "Unlock at"} {t.toLocaleString()} ⭐
                    {goal.kind === "drop" ? " (spend)" : " lifetime"}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-white ring-1 ring-crush-100">
                <div className="flex h-full items-center justify-end rounded-full bg-crush-500 pr-2 transition-all" style={{ width: `${Math.max(pct, 6)}%` }}>
                  <span className="text-[10px] font-bold text-white">{pct}%</span>
                </div>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-900">
                {have.toLocaleString()} / {t.toLocaleString()} ⭐
                {toGo > 0 ? <span className="text-crush-600"> · only {toGo.toLocaleString()} to go!</span> : <span className="text-mint-600"> · unlocked! 🎉</span>}
              </p>
              <button type="button" onClick={() => choose(null)} className="mt-3 text-xs font-semibold text-muted underline">Clear goal</button>
            </div>
          );
        })()
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">Pick a reward to work toward — you&apos;ll see yourself getting closer every time you use the suite.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((r) => {
              const t = target(r);
              const have = progressBase(r, lifetime, current);
              const pct = Math.min(100, Math.round((have / t) * 100));
              return (
                <button key={r.id} type="button" onClick={() => choose(r.id)} className="rounded-2xl border border-border bg-white p-4 text-left transition-colors hover:border-crush-300 hover:bg-crush-50">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden>{r.icon || "🎁"}</span>
                    <span className="min-w-0 font-bold text-ink-900">{r.title}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-muted">{t.toLocaleString()} ⭐ {r.kind === "drop" ? "to redeem" : "to unlock"}</p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-crush-400" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
