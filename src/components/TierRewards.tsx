"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTierRewards, fetchMyClaims, claimReward, type TierReward, type RewardClaim } from "@/lib/tierRewards";
import { toast } from "@/lib/toast";

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  approved: "Approved — on the way",
  fulfilled: "Delivered ✓",
  declined: "Not approved",
};
const STATUS_CLASS: Record<string, string> = {
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-sky-50 text-sky-700 border-sky-200",
  fulfilled: "bg-mint-500/15 text-mint-600 border-mint-500/30",
  declined: "bg-surface-2 text-muted border-border",
};

export function TierRewards({ lifetime }: { lifetime: number }) {
  const [rewards, setRewards] = useState<TierReward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [busy, setBusy] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [r, c] = await Promise.all([fetchTierRewards(), fetchMyClaims()]);
    setRewards(r.filter((x) => x.active));
    setClaims(c);
    setLoaded(true);
  }, []);
  useEffect(() => { load(); }, [load]);

  // The open/most-recent claim per reward.
  const claimFor = (rewardId: string) =>
    claims.find((c) => c.reward_id === rewardId);

  async function onClaim(r: TierReward) {
    setBusy(r.id);
    const res = await claimReward(r.id);
    setBusy("");
    if (res.ok) {
      toast({ emoji: r.icon || "🎁", title: "Reward claimed!", body: `We'll set up "${r.title}" and be in touch.` });
      load();
    } else if (res.reason === "already_claimed") {
      toast({ emoji: "⏳", title: "Already claimed", body: "This reward is already in progress." });
      load();
    } else if (res.reason === "not_unlocked") {
      toast({ emoji: "🔒", title: "Not unlocked yet", body: `Reach ${res.needed} lifetime ⭐ to unlock this.` });
    } else {
      toast({ emoji: "⚠️", title: "Couldn't claim", body: "Please try again in a moment." });
    }
  }

  if (loaded && rewards.length === 0) return null;

  return (
    <>
      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-crush-700">Tier rewards</h2>
      <p className="mt-1 text-sm text-muted">
        Real perks for leveling up — a free headshot, done-for-you marketing, print runs and more.
        Unlock them with lifetime ⭐, then claim and we&apos;ll take care of it.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((r) => {
          const unlocked = lifetime >= r.min_stars;
          const claim = claimFor(r.id);
          const open = claim && (claim.status === "requested" || claim.status === "approved");
          const done = claim && claim.status === "fulfilled" && !r.repeatable;
          const canClaim = unlocked && !open && !done;
          return (
            <div
              key={r.id}
              className={`flex flex-col rounded-2xl border p-5 ${unlocked ? "border-crush-200 bg-white" : "border-border bg-white opacity-75"}`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-3xl ${unlocked ? "" : "grayscale"}`} aria-hidden>{r.icon || "🎁"}</span>
                <div className="min-w-0">
                  <p className="font-bold text-ink-900">{r.title}</p>
                  <p className="text-xs font-semibold text-muted">
                    {r.min_stars <= 0 ? "Everyone" : `${r.min_stars}+ lifetime ⭐`}
                    {r.level_name ? ` · ${r.level_name}` : ""}
                  </p>
                </div>
              </div>
              {r.description && <p className="mt-3 flex-1 text-sm text-muted">{r.description}</p>}

              <div className="mt-4">
                {claim && (
                  <span className={`mb-2 inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[claim.status]}`}>
                    {STATUS_LABEL[claim.status] ?? claim.status}
                  </span>
                )}
                {canClaim ? (
                  <button
                    type="button"
                    onClick={() => onClaim(r)}
                    disabled={busy === r.id}
                    className="w-full rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-60"
                  >
                    {busy === r.id ? "Claiming…" : r.repeatable && claim ? "Claim again" : "Claim reward"}
                  </button>
                ) : !unlocked ? (
                  <p className="rounded-full bg-surface-2 px-4 py-2.5 text-center text-xs font-semibold text-muted">
                    🔒 {Math.max(0, r.min_stars - lifetime)} ⭐ to unlock
                  </p>
                ) : open ? (
                  <p className="text-center text-xs font-medium text-muted">We&apos;re on it — watch your email.</p>
                ) : done ? (
                  <p className="text-center text-xs font-medium text-mint-600">Enjoy your reward!</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
