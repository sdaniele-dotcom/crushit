"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";

type Overview = {
  total_users: number;
  active_30d: number;
  new_this_month: number;
  total_stars: number;
  flyers: number;
  marketing_pieces: number;
  open_house_pieces: number;
  content_pieces: number;
  top_tools: { action: string; count: number }[];
  recent_signups: { id: string; name: string | null; email: string | null; brokerage: string | null; created_at: string }[];
};

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink-900">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function AdminInner() {
  const [ov, setOv] = useState<Overview | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.rpc("admin_overview").then(({ data, error }) => {
      if (error) setErr(error.message);
      else setOv(data as Overview);
    });
  }, []);

  return (
    <>
      <PageHero eyebrow="Admin" title={<>Platform <span className="text-gradient">Overview</span></>} subtitle="Everything happening across Crushing It." />
      <Container className="py-12">
        <div className="mb-8 flex flex-wrap gap-3">
          <Link href="/admin/users" className="rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600">Manage users</Link>
          <Link href="/admin/rewards" className="rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-surface-2">Rewards settings</Link>
        </div>

        {err && <p className="rounded-2xl border border-crush-200 bg-crush-50 p-4 text-sm text-crush-700">{err}</p>}
        {!ov && !err && <div className="flex justify-center py-16"><span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" /></div>}

        {ov && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Total users" value={ov.total_users} />
              <Stat label="Active (30 days)" value={ov.active_30d} />
              <Stat label="New this month" value={ov.new_this_month} />
              <Stat label="Total ⭐ awarded" value={ov.total_stars} />
              <Stat label="Flyers created" value={ov.flyers} />
              <Stat label="Marketing pieces" value={ov.marketing_pieces} />
              <Stat label="Open house pieces" value={ov.open_house_pieces} />
              <Stat label="Content pieces" value={ov.content_pieces} />
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">Most-used tools</h2>
                <div className="mt-4 space-y-2">
                  {ov.top_tools.length === 0 && <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">No tool usage yet.</p>}
                  {ov.top_tools.map((t) => (
                    <div key={t.action} className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3">
                      <span className="text-sm font-medium text-ink-900">{t.action.replace(/_/g, " ")}</span>
                      <span className="text-sm font-bold text-crush-600">{t.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">Recently registered</h2>
                <div className="mt-4 space-y-2">
                  {ov.recent_signups.map((s) => (
                    <Link key={s.id} href={`/admin/users?u=${s.id}`} className="block rounded-xl border border-border bg-white px-4 py-3 hover:bg-surface-2">
                      <p className="text-sm font-semibold text-ink-900">{s.name || s.email}</p>
                      <p className="text-xs text-muted">{s.brokerage || ""} · {new Date(s.created_at).toLocaleDateString("en-US")}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </Container>
    </>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminInner />
    </AdminGuard>
  );
}
