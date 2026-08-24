"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useActiveListing } from "@/components/ActiveListing";
import { upsertListing } from "@/lib/listings";
import { recordUse } from "@/lib/rewards";
import { toast } from "@/lib/toast";

const inp = "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
const lbl = "text-xs font-semibold uppercase tracking-wide text-muted";

function toLocalDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}
function toLocalTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toTimeString().slice(0, 5);
}

/** Step 1–3 of the Open House Kit: pick the property, set the details, and pull
 *  the nearby competition — all seeded from the selected saved listing. */
export function OpenHouseSetup() {
  const { listing, setListing } = useActiveListing();
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDate(toLocalDate(listing?.open_house_at ?? null));
    setStart(toLocalTime(listing?.open_house_at ?? null));
    setEnd(toLocalTime(listing?.open_house_end ?? null));
    setNotes(listing?.open_house_notes ?? "");
  }, [listing]);

  async function saveDetails() {
    if (!listing) {
      toast({ emoji: "🏠", title: "Pick a listing first", body: "Choose a saved listing above to attach these details." });
      return;
    }
    setBusy(true);
    const at = date && start ? new Date(`${date}T${start}`).toISOString() : undefined;
    const endAt = date && end ? new Date(`${date}T${end}`).toISOString() : undefined;
    const updated = await upsertListing({
      address: listing.address,
      open_house_at: at,
      open_house_end: endAt,
      open_house_notes: notes || undefined,
    });
    setBusy(false);
    if (updated) {
      setListing(updated);
      toast({ emoji: "📅", title: "Open house details saved" });
      void recordUse("open_house_kit", {
        events: ["open_house_piece_created"],
        dedupeKey: `open_house_kit:${updated.id}`,
        relatedType: "listing",
        relatedId: updated.id,
        description: "Built an open house kit",
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Details */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">Open house details</h3>
        {!listing && (
          <p className="mt-1 text-xs text-muted">Select a saved listing above to attach the date &amp; time (or just fill the pieces below manually).</p>
        )}
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <label className="block sm:col-span-1"><span className={lbl}>Date</span><input type="date" className={inp} value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label className="block"><span className={lbl}>Start</span><input type="time" className={inp} value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <label className="block"><span className={lbl}>End</span><input type="time" className={inp} value={end} onChange={(e) => setEnd(e.target.value)} /></label>
          <label className="block"><span className={lbl}>Notes</span><input className={inp} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Refreshments, parking…" /></label>
        </div>
        <button type="button" onClick={saveDetails} disabled={busy} className="mt-3 rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50">
          {busy ? "Saving…" : "Save open house details"}
        </button>
      </div>

      {/* Know the nearby competition — search the MLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">Know the competition</h3>
          <p className="mt-1 text-sm text-muted">Pull up active homes for sale nearby on the MLS to talk to buyers about their options.</p>
        </div>
        <Link href="/mls-search" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600">
          Search the MLS →
        </Link>
      </div>
    </div>
  );
}
