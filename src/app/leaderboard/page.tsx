"use client";

import { useEffect, useState } from "react";
import { Container, PageHero } from "@/components/ui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { useLevels } from "@/lib/useLevels";
import { level_icon } from "@/lib/levels";

type Row = {
  rank: number;
  id: string;
  display_name: string | null;
  brokerage: string | null;
  headshot_url: string | null;
  level: string | null;
  lifetime_stars: number;
  period_stars: number;
};

const medal = (r: number) => (r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `${r}`);

function LeaderboardInner() {
  const { user, profile } = useAuth();
  const levels = useLevels();
  const [scope, setScope] = useState<"all" | "month">("all");
  const [rows, setRows] = useState<Row[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    (async () => {
      const [{ data }, rank] = await Promise.all([
        sb.rpc("get_leaderboard", { p_scope: scope, p_limit: 100 }),
        sb.rpc("my_rank"),
      ]);
      setRows((data as Row[]) ?? []);
      setMyRank((rank.data as number) ?? null);
      setLoading(false);
    })();
  }, [scope]);

  const onBoard = rows.some((r) => r.id === user?.id);

  return (
    <>
      <PageHero
        eyebrow="Crush community"
        title={<>Crush <span className="text-gradient">Leaderboard</span></>}
        subtitle="The most active agents on Crushing It, ranked by lifetime Crush Stars."
      />
      <Container className="py-12">
        {/* Scope filter */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(["all", "month"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                scope === s ? "bg-crush-500 text-white" : "bg-surface-2 text-ink-700 hover:bg-surface"
              }`}
            >
              {s === "all" ? "All time" : "This month"}
            </button>
          ))}
        </div>

        {/* Not-on-board note */}
        {!loading && !onBoard && profile && (
          <div className="mb-6 rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
            {profile.leaderboard_visible ? (
              <>You&apos;re ranked <strong className="text-ink-800">#{myRank}</strong> by lifetime stars. Earn more to climb into the top 100!</>
            ) : (
              <>You&apos;re hidden from the public board (change this in your profile). Your private rank is <strong className="text-ink-800">#{myRank}</strong>.</>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" /></div>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">No ranked agents yet — be the first to earn Crush Stars!</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            {rows.map((r) => {
              const me = r.id === user?.id;
              return (
                <div
                  key={r.id}
                  className={`flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-0 ${me ? "bg-crush-50" : ""}`}
                >
                  <span className={`w-8 shrink-0 text-center text-lg font-extrabold ${r.rank <= 3 ? "" : "text-muted"}`}>{medal(r.rank)}</span>
                  {r.headshot_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.headshot_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-bold text-muted">
                      {(r.display_name ?? "?").slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">
                      <span className="mr-1.5" aria-hidden title={r.level ?? ""}>{level_icon(r.level, levels)}</span>
                      {r.display_name || "Agent"}{me && <span className="ml-2 text-xs font-normal text-crush-600">(you)</span>}
                    </p>
                    <p className="truncate text-xs text-muted">{r.brokerage || ""}</p>
                  </div>
                  <span className="hidden shrink-0 rounded-full bg-crush-50 px-3 py-1 text-xs font-semibold text-crush-700 sm:inline">{r.level}</span>
                  <span className="w-24 shrink-0 text-right text-sm font-bold text-crush-600">
                    {(scope === "month" ? r.period_stars : r.lifetime_stars).toLocaleString()} ⭐
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-4 text-xs text-muted">Only agents who opted in appear here. We never show email, phone, or DRE numbers.</p>
      </Container>
    </>
  );
}

export default function LeaderboardPage() {
  return (
    <RequireAuth>
      <LeaderboardInner />
    </RequireAuth>
  );
}
