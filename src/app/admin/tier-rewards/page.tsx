"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import {
  fetchTierRewards,
  fetchAllClaims,
  updateClaim,
  upsertReward,
  deleteReward,
  type TierReward,
  type AdminClaim,
  type ClaimStatus,
} from "@/lib/tierRewards";
import { toast } from "@/lib/toast";

const input = "w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

const STATUSES: ClaimStatus[] = ["requested", "approved", "fulfilled", "declined"];
const STATUS_CLASS: Record<string, string> = {
  requested: "bg-amber-50 text-amber-700",
  approved: "bg-sky-50 text-sky-700",
  fulfilled: "bg-mint-500/15 text-mint-600",
  declined: "bg-surface-2 text-muted",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Inner() {
  const [rewards, setRewards] = useState<TierReward[]>([]);
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [r, c] = await Promise.all([fetchTierRewards(), fetchAllClaims()]);
    setRewards(r);
    setClaims(c);
  }, []);
  useEffect(() => { load(); }, [load]);

  function patch(id: string, p: Partial<TierReward>) {
    setRewards((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }

  async function saveReward(r: TierReward) {
    setSaving(true);
    const res = await upsertReward(r);
    setSaving(false);
    if (res) { setMsg(`Saved "${r.title}".`); setTimeout(() => setMsg(""), 2500); }
    else toast({ emoji: "⚠️", title: "Save failed", body: "Check your admin access and try again." });
  }

  async function addReward() {
    const res = await upsertReward({
      title: "New reward",
      description: "",
      icon: "🎁",
      min_stars: 0,
      level_name: "",
      fulfillment: "",
      repeatable: false,
      active: false,
      sort: (rewards[rewards.length - 1]?.sort ?? 0) + 1,
    });
    if (res) load();
  }

  async function removeReward(id: string) {
    await deleteReward(id);
    load();
  }

  async function setStatus(c: AdminClaim, status: ClaimStatus) {
    const ok = await updateClaim(c.id, status, c.admin_note ?? undefined);
    if (ok) { setClaims((cs) => cs.map((x) => (x.id === c.id ? { ...x, status } : x))); }
    else toast({ emoji: "⚠️", title: "Update failed", body: "Please try again." });
  }

  const pending = claims.filter((c) => c.status === "requested" || c.status === "approved");

  return (
    <>
      <PageHero eyebrow="Admin" title={<>Tier <span className="text-gradient">rewards</span></>} subtitle="Manage the perks agents unlock by leveling up — and fulfill their claims." />
      <Container className="py-12">
        <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>
        {msg && <p className="mt-4 rounded-xl border border-crush-200 bg-crush-50 px-4 py-3 text-sm font-semibold text-crush-700">{msg}</p>}

        {/* Claims queue */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">Claims {pending.length > 0 && <span className="ml-2 rounded-full bg-crush-500 px-2.5 py-0.5 text-xs font-bold text-white align-middle">{pending.length} to action</span>}</h2>
          <p className="mt-1 text-sm text-muted">When an agent claims a perk it lands here. Approve it, mark it delivered once fulfilled, or decline.</p>
          <div className="mt-5 space-y-3">
            {claims.length === 0 && <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">No claims yet.</p>}
            {claims.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-ink-900">{c.reward_title ?? "Reward"}</p>
                    <p className="text-sm text-muted">
                      {c.agent_name || "Agent"}{c.agent_email ? ` · ${c.agent_email}` : ""} · {fmt(c.created_at)}
                    </p>
                    {c.note && <p className="mt-1 text-sm text-ink-800">“{c.note}”</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[c.status]}`}>{c.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(c, s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${c.status === s ? "bg-ink-900 text-white" : "border border-border bg-white text-ink-800 hover:bg-surface-2"}`}
                    >
                      {s === "requested" ? "Reset" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Catalog */}
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink-900">Reward catalog</h2>
            <button type="button" onClick={addReward} className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-surface-2">+ Add reward</button>
          </div>
          <p className="mt-1 text-sm text-muted">Perks are unlocked by <strong>lifetime</strong> stars — set the threshold to match a level. Eligibility is enforced on the server; inactive perks are hidden from agents.</p>

          <div className="mt-5 space-y-4">
            {rewards.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-white p-5">
                <div className="grid gap-3 sm:grid-cols-[3rem_1fr_1fr]">
                  <label className="block"><span className="text-xs font-semibold text-muted">Icon</span>
                    <input className={input} value={r.icon ?? ""} onChange={(e) => patch(r.id, { icon: e.target.value })} /></label>
                  <label className="block"><span className="text-xs font-semibold text-muted">Title</span>
                    <input className={input} value={r.title} onChange={(e) => patch(r.id, { title: e.target.value })} /></label>
                  <label className="block"><span className="text-xs font-semibold text-muted">Tier label</span>
                    <input className={input} value={r.level_name ?? ""} onChange={(e) => patch(r.id, { level_name: e.target.value })} placeholder="Gold Agent" /></label>
                </div>
                <label className="mt-3 block"><span className="text-xs font-semibold text-muted">Description (agent-facing)</span>
                  <textarea className={`${input} min-h-[54px]`} value={r.description ?? ""} onChange={(e) => patch(r.id, { description: e.target.value })} /></label>
                <label className="mt-3 block"><span className="text-xs font-semibold text-muted">Fulfillment note (internal)</span>
                  <input className={input} value={r.fulfillment ?? ""} onChange={(e) => patch(r.id, { fulfillment: e.target.value })} placeholder="How staff delivers this" /></label>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm"><span className="text-xs font-semibold text-muted">Min ⭐</span>
                    <input type="number" min={0} className={`${input} w-24`} value={r.min_stars} onChange={(e) => patch(r.id, { min_stars: Math.max(0, parseInt(e.target.value, 10) || 0) })} /></label>
                  <button type="button" onClick={() => patch(r.id, { repeatable: !r.repeatable })} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${r.repeatable ? "bg-mint-500/15 text-mint-600" : "bg-surface-2 text-muted"}`}>{r.repeatable ? "Repeatable" : "One-time"}</button>
                  <button type="button" onClick={() => patch(r.id, { active: !r.active })} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${r.active ? "bg-mint-500/15 text-mint-600" : "bg-surface-2 text-muted"}`}>{r.active ? "Active" : "Hidden"}</button>
                  <div className="ml-auto flex gap-2">
                    <button type="button" onClick={() => removeReward(r.id)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:text-crush-600">Delete</button>
                    <button type="button" onClick={() => saveReward(r)} disabled={saving} className="rounded-full bg-crush-500 px-5 py-1.5 text-xs font-semibold text-white hover:bg-crush-600 disabled:opacity-50">Save</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}

export default function AdminTierRewardsPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
