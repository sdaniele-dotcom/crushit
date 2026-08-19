"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";

type Scenario = {
  id: string; user_id: string | null; credit_range: string | null; price: number | null; down: number | null;
  first_time: boolean | null; veteran: boolean | null; self_employed: boolean | null; property_type: string | null;
  occupancy: string | null; income: number | null; matched_slugs: string[]; status: string; created_at: string;
  profiles?: { display_name: string | null; email: string | null; phone: string | null } | null;
};

function money(n: number | null) { return n == null ? "—" : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }); }

function ScenariosInner() {
  const [rows, setRows] = useState<Scenario[]>([]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.from("buyer_scenarios")
      .select("*, profiles:user_id(display_name,email,phone)")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => setRows((data as Scenario[]) ?? []));
  }, []);

  return (
    <>
      <PageHero eyebrow="Admin" title={<>Buyer <span className="text-gradient">scenarios</span></>} subtitle="Loan-finder submissions sent in by agents." />
      <Container className="py-12">
        <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>
        <p className="mt-4 text-sm text-muted">{rows.length} scenario{rows.length === 1 ? "" : "s"}</p>
        <div className="mt-4 space-y-3">
          {rows.length === 0 && <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">No buyer scenarios submitted yet.</p>}
          {rows.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-ink-900">{s.profiles?.display_name || s.profiles?.email || "Agent"}</p>
                  <p className="text-xs text-muted">{s.profiles?.phone || s.profiles?.email || ""} · {new Date(s.created_at).toLocaleString("en-US")}</p>
                </div>
                <span className="rounded-full bg-crush-50 px-3 py-1 text-xs font-semibold text-crush-700">{s.status}</span>
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                <div className="flex justify-between gap-2 border-b border-border/40 py-1"><dt className="text-muted">Price</dt><dd className="font-medium">{money(s.price)}</dd></div>
                <div className="flex justify-between gap-2 border-b border-border/40 py-1"><dt className="text-muted">Down</dt><dd className="font-medium">{money(s.down)}</dd></div>
                <div className="flex justify-between gap-2 border-b border-border/40 py-1"><dt className="text-muted">Credit</dt><dd className="font-medium">{s.credit_range || "—"}</dd></div>
                <div className="flex justify-between gap-2 border-b border-border/40 py-1"><dt className="text-muted">Type</dt><dd className="font-medium">{s.property_type || "—"}</dd></div>
                <div className="flex justify-between gap-2 border-b border-border/40 py-1"><dt className="text-muted">Occupancy</dt><dd className="font-medium">{s.occupancy || "—"}</dd></div>
                <div className="flex justify-between gap-2 border-b border-border/40 py-1"><dt className="text-muted">Income</dt><dd className="font-medium">{money(s.income)}</dd></div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[s.first_time && "First-time", s.veteran && "Veteran", s.self_employed && "Self-employed"].filter(Boolean).map((t) => (
                  <span key={t as string} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-800">{t}</span>
                ))}
              </div>
              {s.matched_slugs.length > 0 && (
                <p className="mt-3 text-xs text-muted">Matched: <span className="font-semibold text-ink-800">{s.matched_slugs.join(", ")}</span></p>
              )}
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}

export default function AdminScenariosPage() {
  return (
    <AdminGuard>
      <ScenariosInner />
    </AdminGuard>
  );
}
