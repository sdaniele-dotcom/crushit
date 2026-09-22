"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import {
  fetchAllFlyerRequests,
  updateFlyerRequestStatus,
  type FlyerRequest,
  type FlyerRequestStatus,
} from "@/lib/flyerRequests";
import { toast } from "@/lib/toast";

const STATUSES: FlyerRequestStatus[] = ["new", "in_progress", "sent", "declined"];
const STATUS_CLASS: Record<string, string> = {
  new: "bg-amber-50 text-amber-700",
  in_progress: "bg-sky-50 text-sky-700",
  sent: "bg-mint-500/15 text-mint-600",
  declined: "bg-surface-2 text-muted",
};

const money = (n: number | null) =>
  typeof n === "number" ? `$${Math.round(n).toLocaleString("en-US")}` : null;

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function Inner() {
  const [rows, setRows] = useState<FlyerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await fetchAllFlyerRequests());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setStatus(r: FlyerRequest, status: FlyerRequestStatus) {
    const ok = await updateFlyerRequestStatus(r.id, status);
    if (ok) setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status } : x)));
    else toast({ emoji: "⚠️", title: "Update failed", body: "Check your admin access and try again." });
  }

  const pending = rows.filter((r) => r.status === "new" || r.status === "in_progress");

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title={<>Mortgage <span className="text-gradient">flyer requests</span></>}
        subtitle="Agents who asked us to price a listing. Quote it, upload the pricing under Listing flyers on the mortgage admin, then send the flyer and mark it sent."
      />
      <Container className="py-12">
        <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>

        <div className="mt-6 flex items-center gap-2">
          <h2 className="text-lg font-bold text-ink-900">Requests</h2>
          {pending.length > 0 && (
            <span className="rounded-full bg-crush-500 px-2.5 py-0.5 text-xs font-bold text-white">{pending.length} to action</span>
          )}
        </div>

        {loading && <div className="flex justify-center py-16"><span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" /></div>}
        {!loading && rows.length === 0 && (
          <p className="mt-5 rounded-2xl border border-border bg-surface p-6 text-sm text-muted">No flyer requests yet.</p>
        )}

        <div className="mt-5 space-y-4">
          {rows.map((r) => {
            const where = [r.address, r.city, r.state, r.zip].filter(Boolean).join(", ");
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-ink-900">{where || "Listing (no address)"}</p>
                    <p className="text-sm text-muted">
                      {money(r.price) ? `${money(r.price)} · ` : ""}
                      {r.property_type ? `${r.property_type} · ` : ""}
                      {r.agent_name || "Agent"}{r.brokerage ? `, ${r.brokerage}` : ""} · {when(r.created_at)}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {[r.agent_email, r.agent_phone, r.agent_dre ? `DRE ${r.agent_dre}` : null]
                        .filter(Boolean)
                        .join(" · ") || "No contact on file"}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[r.status]}`}>
                    {r.status.replace("_", " ")}
                  </span>
                </div>

                {/* The carrying costs. "not provided" is load-bearing: it means
                    the agent didn't know, so we look it up rather than assume. */}
                <div className="mt-3 grid gap-x-6 gap-y-1 text-sm text-muted sm:grid-cols-2">
                  <span>Annual taxes: <strong className="text-ink-800">{money(r.annual_taxes) ?? "not provided"}</strong></span>
                  <span>Monthly HOA: <strong className="text-ink-800">{money(r.monthly_hoa) ?? "not provided"}</strong></span>
                  <span>Down payment: <strong className="text-ink-800">{r.down_payment_pct != null ? `${r.down_payment_pct}%` : "—"}</strong></span>
                  <span>Occupancy: <strong className="text-ink-800">{r.occupancy ?? "—"}</strong></span>
                  <span className="sm:col-span-2">Co-brand with: <strong className="text-ink-800">{r.loan_officer || "any available LO"}</strong></span>
                </div>

                {r.programs?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.programs.map((p) => (
                      <span key={p} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-700">{p}</span>
                    ))}
                  </div>
                )}

                {r.note && <p className="mt-3 text-sm text-ink-800">&ldquo;{r.note}&rdquo;</p>}

                {r.photos?.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {r.photos.slice(0, 8).map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(r, s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${r.status === s ? "bg-ink-900 text-white" : "border border-border bg-white text-ink-800 hover:bg-surface-2"}`}
                    >
                      {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                  ))}
                  {r.agent_email && (
                    <a
                      href={`mailto:${r.agent_email}?subject=${encodeURIComponent(`Your flyer — ${where || "your listing"}`)}`}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-crush-600 hover:bg-surface-2"
                    >
                      Email the agent
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </>
  );
}

export default function AdminFlyerRequestsPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
