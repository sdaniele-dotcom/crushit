"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import {
  fetchAllPromotions,
  updatePromotionStatus,
  type PromotionRequest,
  type PromotionStatus,
} from "@/lib/promotions";
import { toast } from "@/lib/toast";

const STATUSES: PromotionStatus[] = ["new", "in_progress", "scheduled", "posted", "declined"];
const STATUS_CLASS: Record<string, string> = {
  new: "bg-amber-50 text-amber-700",
  in_progress: "bg-sky-50 text-sky-700",
  scheduled: "bg-violet-50 text-violet-700",
  posted: "bg-mint-500/15 text-mint-600",
  declined: "bg-surface-2 text-muted",
};
const INCLUDE_LABEL: Record<string, string> = {
  listing_photos: "Listing photos",
  property_info: "Property details",
  payment_scenarios: "Payment scenarios",
  mortgage_flyer: "Financing flyer",
  walkthrough_video: "Walkthrough video",
  my_branding: "Agent branding",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Inner() {
  const [rows, setRows] = useState<PromotionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await fetchAllPromotions());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setStatus(r: PromotionRequest, status: PromotionStatus) {
    const ok = await updatePromotionStatus(r.id, status);
    if (ok) setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status } : x)));
    else toast({ emoji: "⚠️", title: "Update failed", body: "Check your admin access and try again." });
  }

  const pending = rows.filter((r) => r.status === "new" || r.status === "in_progress");

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title={<>Listing <span className="text-gradient">promotions</span></>}
        subtitle="Agents who asked us to promote their listings on Instagram. Build the post as a collab — keep the agent front-and-center."
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
          <p className="mt-5 rounded-2xl border border-border bg-surface p-6 text-sm text-muted">No promotion requests yet.</p>
        )}

        <div className="mt-5 space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-ink-900">{r.address || "Listing (no address)"}</p>
                  <p className="text-sm text-muted">
                    {r.price ? `$${Math.round(r.price).toLocaleString("en-US")} · ` : ""}
                    {r.agent_name || "Agent"}{r.brokerage ? `, ${r.brokerage}` : ""} · {fmt(r.created_at)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {[r.agent_email, r.agent_phone, r.instagram].filter(Boolean).join(" · ") || "No contact on file"}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[r.status]}`}>{r.status.replace("_", " ")}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(r.include ?? []).map((k) => (
                  <span key={k} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-700">{INCLUDE_LABEL[k] ?? k}</span>
                ))}
              </div>

              {r.note && <p className="mt-3 text-sm text-ink-800">“{r.note}”</p>}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                {r.photos?.length > 0 && <span className="text-muted">📷 {r.photos.length} photo{r.photos.length === 1 ? "" : "s"}</span>}
                {r.video_url && (
                  <a href={r.video_url} target="_blank" rel="noreferrer" className="font-semibold text-crush-600">🎬 Walkthrough video</a>
                )}
              </div>

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
                    {s === "new" ? "New" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}

export default function AdminPromotionsPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
