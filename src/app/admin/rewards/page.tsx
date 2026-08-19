"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";

type Rule = {
  key: string;
  label: string;
  stars: number;
  active: boolean;
  per_user_limit: number | null;
  daily_limit: number | null;
  cooldown_secs: number | null;
  sort: number;
};

type LevelRow = { name: string; min_stars: number; sort: number };

const input =
  "w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

function RewardsInner() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const [r, l] = await Promise.all([
      sb.from("reward_rules").select("*").order("sort"),
      sb.from("levels").select("name,min_stars,sort").order("sort"),
    ]);
    setRules((r.data as Rule[]) ?? []);
    setLevels((l.data as LevelRow[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patchRule(key: string, patch: Partial<Rule>) {
    setRules((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function patchLevel(sort: number, patch: Partial<LevelRow>) {
    setLevels((ls) => ls.map((l) => (l.sort === sort ? { ...l, ...patch } : l)));
  }

  async function saveRules() {
    const sb = getSupabase();
    if (!sb) return;
    setSaving(true);
    setMsg("");
    for (const r of rules) {
      const { error } = await sb
        .from("reward_rules")
        .update({
          label: r.label,
          stars: r.stars,
          active: r.active,
          per_user_limit: r.per_user_limit,
          daily_limit: r.daily_limit,
          cooldown_secs: r.cooldown_secs,
        })
        .eq("key", r.key);
      if (error) {
        setMsg(`Error saving ${r.key}: ${error.message}`);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setMsg("Point values saved. New rewards use these immediately.");
    setTimeout(() => setMsg(""), 3000);
  }

  async function saveLevels() {
    const sb = getSupabase();
    if (!sb) return;
    setSaving(true);
    setMsg("");
    for (const l of levels) {
      const { error } = await sb
        .from("levels")
        .update({ name: l.name, min_stars: l.min_stars })
        .eq("sort", l.sort);
      if (error) {
        setMsg(`Error saving level ${l.name}: ${error.message}`);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setMsg("Level thresholds saved.");
    await load();
    setTimeout(() => setMsg(""), 3000);
  }

  const numOrNull = (v: string) => (v.trim() === "" ? null : Math.max(0, parseInt(v, 10) || 0));

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title={
          <>
            Rewards <span className="text-gradient">settings</span>
          </>
        }
        subtitle="Set how many Crush Stars each action earns, the anti-farming limits, and the level thresholds."
      />
      <Container className="py-12">
        <Link href="/admin" className="text-sm font-semibold text-crush-600">
          ← Admin overview
        </Link>

        {msg && (
          <p className="mt-4 rounded-xl border border-crush-200 bg-crush-50 px-4 py-3 text-sm font-semibold text-crush-700">
            {msg}
          </p>
        )}

        {/* Reward rules */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink-900">Point values</h2>
            <button
              type="button"
              onClick={saveRules}
              disabled={saving}
              className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save point values"}
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">
            These are enforced by the backend — the browser never decides how many stars an action is worth. Limits leave a field
            blank for &ldquo;no limit.&rdquo;
          </p>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-white">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">⭐ Stars</th>
                  <th className="px-4 py-3 font-semibold">Per-user cap</th>
                  <th className="px-4 py-3 font-semibold">Daily cap</th>
                  <th className="px-4 py-3 font-semibold">Cooldown (s)</th>
                  <th className="px-4 py-3 font-semibold">Active</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.key} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <input
                        className={input}
                        value={r.label}
                        onChange={(e) => patchRule(r.key, { label: e.target.value })}
                      />
                      <p className="mt-1 text-xs text-muted">{r.key}</p>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className={`${input} w-20`}
                        type="number"
                        min={0}
                        value={r.stars}
                        onChange={(e) => patchRule(r.key, { stars: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className={`${input} w-24`}
                        type="number"
                        min={0}
                        placeholder="∞"
                        value={r.per_user_limit ?? ""}
                        onChange={(e) => patchRule(r.key, { per_user_limit: numOrNull(e.target.value) })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className={`${input} w-24`}
                        type="number"
                        min={0}
                        placeholder="∞"
                        value={r.daily_limit ?? ""}
                        onChange={(e) => patchRule(r.key, { daily_limit: numOrNull(e.target.value) })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className={`${input} w-24`}
                        type="number"
                        min={0}
                        placeholder="0"
                        value={r.cooldown_secs ?? ""}
                        onChange={(e) => patchRule(r.key, { cooldown_secs: numOrNull(e.target.value) })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => patchRule(r.key, { active: !r.active })}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          r.active ? "bg-mint-500/15 text-mint-500" : "bg-surface-2 text-muted"
                        }`}
                      >
                        {r.active ? "On" : "Off"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Levels */}
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink-900">Crush Levels</h2>
            <button
              type="button"
              onClick={saveLevels}
              disabled={saving}
              className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save levels"}
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">
            Levels are based on <strong>lifetime</strong> stars. Set the minimum lifetime stars required to reach each level.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {levels.map((l) => (
              <div key={l.sort} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
                <input
                  className={input}
                  value={l.name}
                  onChange={(e) => patchLevel(l.sort, { name: e.target.value })}
                />
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted">min ⭐</span>
                  <input
                    className={`${input} w-24`}
                    type="number"
                    min={0}
                    value={l.min_stars}
                    onChange={(e) => patchLevel(l.sort, { min_stars: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}

export default function AdminRewardsPage() {
  return (
    <AdminGuard>
      <RewardsInner />
    </AdminGuard>
  );
}
