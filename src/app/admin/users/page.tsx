"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";
import { level_name } from "@/lib/levels";
import type { Profile } from "@/lib/profile";

type Tx = { id: string; action: string; stars: number; description: string | null; created_at: string };

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-US") : "—";
}

function UsersInner() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(null);
  const sel = users.find((u) => u.id === selId) || null;

  const [txs, setTxs] = useState<Tx[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [pieces, setPieces] = useState<number>(0);
  const [stars, setStars] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  const loadUsers = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers((data as Profile[]) ?? []);
  }, []);

  useEffect(() => {
    loadUsers();
    const u = new URLSearchParams(window.location.search).get("u");
    if (u) setSelId(u);
  }, [loadUsers]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !selId) return;
    (async () => {
      const [t, b, p] = await Promise.all([
        sb.from("star_transactions").select("id,action,stars,description,created_at").eq("user_id", selId).order("created_at", { ascending: false }).limit(15),
        sb.from("user_achievements").select("achievement_key").eq("user_id", selId),
        sb.from("saved_projects").select("id", { count: "exact", head: true }).eq("user_id", selId),
      ]);
      setTxs((t.data as Tx[]) ?? []);
      setBadges(((b.data as { achievement_key: string }[]) ?? []).map((x) => x.achievement_key));
      setPieces(p.count ?? 0);
    })();
  }, [selId, users]);

  async function adjust(sign: 1 | -1) {
    const sb = getSupabase();
    const n = Math.abs(parseInt(stars, 10) || 0) * sign;
    if (!sb || !selId || !n || !reason.trim()) {
      setMsg("Enter an amount and a reason.");
      return;
    }
    const { error } = await sb.rpc("admin_adjust_stars", { p_user: selId, p_stars: n, p_reason: reason.trim() });
    if (error) {
      setMsg(error.message);
      return;
    }
    setStars("");
    setReason("");
    setMsg(`${n >= 0 ? "+" : ""}${n} ⭐ applied.`);
    await loadUsers();
    setTimeout(() => setMsg(""), 2500);
  }

  async function toggleActive() {
    const sb = getSupabase();
    if (!sb || !sel) return;
    await sb.from("profiles").update({ is_active: !sel.is_active }).eq("id", sel.id);
    await loadUsers();
  }

  const filtered = users.filter((u) => {
    const s = `${u.first_name ?? ""} ${u.last_name ?? ""} ${u.display_name ?? ""} ${u.email ?? ""} ${u.brokerage ?? ""}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const input = "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

  return (
    <>
      <PageHero eyebrow="Admin" title={<>User <span className="text-gradient">management</span></>} subtitle="Search agents, view their activity, and manage Crush Stars." />
      <Container className="py-12">
        <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
          {/* List */}
          <div>
            <input className={input} placeholder="Search name, email, brokerage…" value={q} onChange={(e) => setQ(e.target.value)} />
            <p className="mt-2 text-xs text-muted">{filtered.length} of {users.length} agents</p>
            <div className="mt-3 max-h-[70vh] space-y-1.5 overflow-y-auto">
              {filtered.map((u) => (
                <button key={u.id} type="button" onClick={() => setSelId(u.id)} className={`block w-full rounded-xl border px-3 py-2.5 text-left ${selId === u.id ? "border-crush-400 bg-crush-50" : "border-border bg-white hover:bg-surface-2"}`}>
                  <p className="truncate text-sm font-semibold text-ink-900">{u.display_name || `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email}{u.role === "admin" && <span className="ml-1 text-xs text-crush-600">· admin</span>}</p>
                  <p className="truncate text-xs text-muted">{u.email} · ⭐ {u.lifetime_stars}{!u.is_active && " · inactive"}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div>
            {!sel ? (
              <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">Select an agent to view their profile and activity.</p>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-white p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {sel.headshot_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sel.headshot_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-lg font-bold text-muted">{(sel.first_name ?? sel.email ?? "?").slice(0, 1)}</span>
                      )}
                      <div>
                        <p className="text-lg font-bold text-ink-900">{sel.display_name || `${sel.first_name ?? ""} ${sel.last_name ?? ""}`.trim() || "—"}</p>
                        <p className="text-sm text-muted">{level_name(sel.lifetime_stars)} · ⭐ {sel.current_stars} ({sel.lifetime_stars} lifetime)</p>
                      </div>
                    </div>
                    <button type="button" onClick={toggleActive} className={`rounded-full px-4 py-2 text-xs font-semibold ${sel.is_active ? "border border-border bg-white text-ink-800 hover:bg-surface-2" : "bg-crush-500 text-white"}`}>
                      {sel.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                  <dl className="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <Row k="Email" v={sel.email} />
                    <Row k="Phone" v={sel.phone} />
                    <Row k="Brokerage" v={sel.brokerage} />
                    <Row k="DRE #" v={sel.dre_license} />
                    <Row k="Registered" v={fmt(sel.created_at)} />
                    <Row k="Last active" v={fmt(sel.last_active_at)} />
                    <Row k="Marketing pieces" v={String(pieces)} />
                    <Row k="Badges" v={String(badges.length)} />
                  </dl>
                </div>

                {/* Star management */}
                <div className="rounded-2xl border border-border bg-white p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">Adjust Crush Stars</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
                    <input className={input} type="number" min={1} placeholder="Amount" value={stars} onChange={(e) => setStars(e.target.value)} />
                    <input className={input} placeholder="Reason (required) — e.g. Attended workshop" value={reason} onChange={(e) => setReason(e.target.value)} />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => adjust(1)} className="rounded-full bg-crush-500 px-4 py-2 text-sm font-semibold text-white hover:bg-crush-600">Add</button>
                      <button type="button" onClick={() => adjust(-1)} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-800 hover:bg-surface-2">Remove</button>
                    </div>
                  </div>
                  {msg && <p className="mt-2 text-xs font-semibold text-crush-600">{msg}</p>}
                  <p className="mt-2 text-xs text-muted">Every adjustment is recorded in the admin audit log with your account, the amount, and the reason.</p>
                </div>

                {/* Activity */}
                <div className="rounded-2xl border border-border bg-white p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">Recent activity</h3>
                  <div className="mt-3 space-y-1.5">
                    {txs.length === 0 && <p className="text-sm text-muted">No star activity yet.</p>}
                    {txs.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-ink-800">{t.description || t.action.replace(/_/g, " ")}</span>
                        <span className="shrink-0 text-muted">{fmt(t.created_at)}</span>
                        <span className={`shrink-0 font-bold ${t.stars >= 0 ? "text-crush-600" : "text-ink-500"}`}>{t.stars >= 0 ? "+" : ""}{t.stars} ⭐</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

function Row({ k, v }: { k: string; v: string | null }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/50 py-1.5">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium text-ink-900">{v || "—"}</dd>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UsersInner />
    </AdminGuard>
  );
}
