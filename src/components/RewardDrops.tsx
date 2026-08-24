"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchDrops, fetchMyClaims, redeemDrop, type TierReward, type RewardClaim } from "@/lib/tierRewards";
import { toast } from "@/lib/toast";

function endsLabel(iso: string | null): string {
  if (!iso) return "";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} left`;
  const hrs = Math.max(1, Math.floor(ms / 3_600_000));
  return `${hrs} hour${hrs === 1 ? "" : "s"} left`;
}

export function RewardDrops({ current }: { current: number }) {
  const { refreshProfile } = useAuth();
  const [drops, setDrops] = useState<TierReward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [busy, setBusy] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [d, c] = await Promise.all([fetchDrops(), fetchMyClaims()]);
    setDrops(d);
    setClaims(c);
    setLoaded(true);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function onRedeem(d: TierReward) {
    setBusy(d.id);
    const res = await redeemDrop(d.id);
    setBusy("");
    if (res.ok) {
      toast({ emoji: d.icon || "🔥", title: "Redeemed!", body: `We'll set up "${d.title}" — watch your email.` });
      await refreshProfile();
      load();
    } else if (res.reason === "insufficient_stars") {
      toast({ emoji: "⭐", title: "Not enough stars", body: `You need ${res.needed} ⭐ for this drop.` });
    } else if (res.reason === "sold_out") {
      toast({ emoji: "😮", title: "Sold out", body: "This drop is all claimed. Watch for the next one!" });
      load();
    } else if (res.reason === "already_redeemed") {
      toast({ emoji: "✓", title: "Already redeemed", body: "You've claimed this drop." });
      load();
    } else {
      toast({ emoji: "⚠️", title: "Couldn't redeem", body: "Please try again in a moment." });
      load();
    }
  }

  if (!loaded || drops.length === 0) return null;

  return (
    <>
      <h2 className="mt-10 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-crush-700">
        <span aria-hidden>🔥</span> Limited-time drops
      </h2>
      <p className="mt-1 text-sm text-muted">Spend your stars on these while they last — limited quantities, limited time.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {drops.map((d) => {
          const remaining = d.quantity_total == null ? null : Math.max(0, d.quantity_total - d.quantity_claimed);
          const soldOut = remaining != null && remaining <= 0;
          const ended = d.ends_at ? new Date(d.ends_at).getTime() <= Date.now() : false;
          const mine = claims.find((c) => c.reward_id === d.id && c.status !== "declined");
          const afford = current >= d.star_cost;
          const disabled = !!mine || soldOut || ended || !afford;
          return (
            <div key={d.id} className="flex flex-col rounded-2xl border-2 border-crush-200 bg-gradient-to-br from-crush-50 to-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl" aria-hidden>{d.icon || "🔥"}</span>
                  <p className="font-bold text-ink-900">{d.title}</p>
                </div>
                {d.ends_at && !ended && (
                  <span className="shrink-0 rounded-full bg-ink-900 px-2.5 py-1 text-xs font-bold text-white">{endsLabel(d.ends_at)}</span>
                )}
              </div>
              {d.description && <p className="mt-2 flex-1 text-sm text-muted">{d.description}</p>}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-extrabold text-crush-600">{d.star_cost.toLocaleString()} ⭐</span>
                {remaining != null && <span className="text-xs font-semibold text-muted">{soldOut ? "Sold out" : `Only ${remaining} left`}</span>}
              </div>
              <button
                type="button"
                onClick={() => onRedeem(d)}
                disabled={disabled || busy === d.id}
                className="mt-4 rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === d.id ? "Redeeming…"
                  : mine ? "Redeemed ✓"
                  : ended ? "Ended"
                  : soldOut ? "Sold out"
                  : !afford ? `Need ${(d.star_cost - current).toLocaleString()} more ⭐`
                  : "Redeem"}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
