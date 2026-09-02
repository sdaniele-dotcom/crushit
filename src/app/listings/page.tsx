"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { listMyListings, upsertListing, deleteListing, listingLabel, lookupProperty, type Listing } from "@/lib/listings";
import { uploadListingPhoto } from "@/lib/storage";
import { useAuth } from "@/components/auth/AuthProvider";
import { fullName } from "@/lib/profile";
import { notifyNewListing } from "@/lib/notify";
import { toast } from "@/lib/toast";

const input =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
const label = "text-xs font-semibold uppercase tracking-wide text-muted";

function money(n: number | null) {
  return n == null ? "" : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const SHORTCUTS = (id: string) => [
  { label: "Flyer", href: `/co-brand?listing=${id}` },
  { label: "Open House Kit", href: `/co-marketing/open-house-kit?listing=${id}` },
  { label: "Social", href: `/co-marketing/social-kit?listing=${id}` },
  { label: "Email", href: `/co-marketing/email-templates?listing=${id}` },
  { label: "Video", href: `/co-marketing/video-scripts?listing=${id}` },
];

function num(v: string): number | undefined {
  const n = parseFloat(v.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function ListingsInner() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [looking, setLooking] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lookupMsg, setLookupMsg] = useState("");
  const [f, setF] = useState({ address: "", city: "", state: "", zip: "", price: "", beds: "", baths: "", sqft: "", description: "" });

  const load = useCallback(async () => setListings(await listMyListings()), []);
  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function lookup() {
    if (!f.address.trim()) return;
    setLooking(true);
    setLookupMsg("");
    const p = await lookupProperty(f.address);
    setLooking(false);
    if (!p) { setLookupMsg("No MLS match found — you can fill the details in by hand."); return; }
    setF((s) => ({
      ...s,
      city: p.city || s.city, state: p.state || s.state, zip: p.zip || s.zip,
      price: p.purchase_price ? String(p.purchase_price) : s.price,
      beds: p.bedrooms != null ? String(p.bedrooms) : s.beds,
      baths: p.bathrooms != null ? String(p.bathrooms) : s.baths,
      sqft: p.square_footage != null ? String(p.square_footage) : s.sqft,
      description: p.description || s.description,
    }));
    const found = p.photos && p.photos.length ? p.photos : p.photo_url ? [p.photo_url] : [];
    if (found.length) setPhotos(found);
    setLookupMsg(
      found.length
        ? `Filled in from the MLS — ${found.length} photo${found.length === 1 ? "" : "s"} pulled from Lofty.`
        : "Filled in from the MLS — no photo on file, upload one below.",
    );
  }

  async function onPhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setLookupMsg("");
    try {
      const urls = await Promise.all(files.map((file) => uploadListingPhoto(file)));
      setPhotos((cur) => [...cur, ...urls]);
    } catch (err) {
      toast({ emoji: "⚠️", title: "Upload failed", body: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setUploading(false);
    }
  }

  const removePhoto = (i: number) => setPhotos((cur) => cur.filter((_, idx) => idx !== i));
  const makeHero = (i: number) => setPhotos((cur) => (i <= 0 ? cur : [cur[i], ...cur.filter((_, idx) => idx !== i)]));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.address.trim()) return;
    setBusy(true);
    // A brand-new address (not already saved) triggers the new-listing email.
    const addr = f.address.trim().toLowerCase();
    const isNew = !listings.some((l) => (l.address ?? "").trim().toLowerCase() === addr);
    const res = await upsertListing({
      address: f.address, city: f.city || undefined, state: f.state || undefined, zip: f.zip || undefined,
      price: num(f.price), beds: num(f.beds), baths: num(f.baths), sqft: num(f.sqft) as number | undefined,
      description: f.description || undefined,
      photos: photos.length ? photos : undefined,
    });
    setBusy(false);
    if (res) {
      if (isNew) {
        notifyNewListing(
          { name: fullName(profile) || null, email: profile?.email ?? user?.email ?? null },
          { id: res.id, address: listingLabel(res), price: res.price, beds: res.beds, baths: res.baths, sqft: res.sqft },
        );
      }
      toast({ emoji: "🏠", title: "Listing saved", body: "Reuse it across every tool." });
      setF({ address: "", city: "", state: "", zip: "", price: "", beds: "", baths: "", sqft: "", description: "" });
      setPhotos([]);
      setLookupMsg("");
      setOpen(false);
      load();
    }
  }

  async function remove(id: string) {
    await deleteListing(id);
    load();
  }

  return (
    <>
      <PageHero
        eyebrow="My business"
        title={<>My <span className="text-gradient">listings</span></>}
        subtitle="Enter a property once — then reuse it for flyers, open house kits, social posts, and more."
      />
      <Container className="py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-crush-600">← Dashboard</Link>
          <button type="button" onClick={() => setOpen((o) => !o)} className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600">
            {open ? "Close" : "+ Add a listing"}
          </button>
        </div>

        {open && (
          <form onSubmit={add} className="mt-5 grid gap-4 rounded-2xl border border-border bg-white p-6">
            <div>
              <label className={label}>Property address *</label>
              <div className="flex flex-wrap gap-2">
                <input className={`${input} flex-1`} value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St, Long Beach, CA" required autoFocus />
                <button type="button" onClick={lookup} disabled={looking || f.address.trim().length < 3} className="shrink-0 rounded-xl border border-crush-200 bg-crush-50 px-4 py-2.5 text-sm font-semibold text-crush-700 hover:bg-crush-100 disabled:opacity-50">
                  {looking ? "Looking up…" : "Look up from MLS"}
                </button>
              </div>
              {lookupMsg && <p className="mt-1.5 text-xs font-medium text-crush-700">{lookupMsg}</p>}
              {photos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {photos.map((src, i) => (
                    <div key={src + i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="Listing" className="h-16 w-24 rounded-lg object-cover ring-1 ring-border" />
                      {i === 0 && <span className="absolute left-1 top-1 rounded bg-crush-500 px-1.5 py-0.5 text-[9px] font-bold text-white">Hero</span>}
                      <div className="mt-1 flex justify-between gap-1">
                        {i !== 0 && <button type="button" onClick={() => makeHero(i)} className="text-[10px] font-semibold text-crush-600">Make hero</button>}
                        <button type="button" onClick={() => removePhoto(i)} className="ml-auto text-[10px] font-semibold text-muted hover:text-crush-600">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <label className="mt-2 inline-flex cursor-pointer rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-surface-2">
                {uploading ? "Uploading…" : photos.length ? "Add more photos" : "Upload a photo"}
                <input type="file" accept="image/*" multiple onChange={onPhotoFile} disabled={uploading} className="hidden" />
              </label>
              <p className="mt-1 text-xs text-muted">Photos are pulled from Lofty automatically and reused across flyers, postcards, and the open-house flyer. The first is the hero. Add your own too.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className={label}>City</label><input className={input} value={f.city} onChange={(e) => set("city", e.target.value)} /></div>
              <div><label className={label}>State</label><input className={input} value={f.state} onChange={(e) => set("state", e.target.value)} placeholder="CA" /></div>
              <div><label className={label}>ZIP</label><input className={input} value={f.zip} onChange={(e) => set("zip", e.target.value)} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div><label className={label}>Price</label><input className={input} value={f.price} onChange={(e) => { const d = e.target.value.replace(/[^\d]/g, ""); set("price", d ? Number(d).toLocaleString("en-US") : ""); }} placeholder="450,000" inputMode="numeric" /></div>
              <div><label className={label}>Beds</label><input className={input} value={f.beds} onChange={(e) => set("beds", e.target.value)} inputMode="decimal" /></div>
              <div><label className={label}>Baths</label><input className={input} value={f.baths} onChange={(e) => set("baths", e.target.value)} inputMode="decimal" /></div>
              <div><label className={label}>Sq ft</label><input className={input} value={f.sqft} onChange={(e) => set("sqft", e.target.value)} inputMode="numeric" /></div>
            </div>
            <div>
              <label className={label}>Description</label>
              <textarea className={`${input} min-h-[80px]`} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Highlights, upgrades, neighborhood…" />
            </div>
            <button type="submit" disabled={busy} className="justify-self-start rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50">
              {busy ? "Saving…" : "Save listing"}
            </button>
          </form>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {listings.length === 0 && !open && (
            <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted sm:col-span-2">
              No listings yet. Add your first property above and it&apos;ll be ready to drop into any marketing tool.
            </p>
          )}
          {listings.map((l) => (
            <div key={l.id} className="flex flex-col rounded-2xl border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink-900">{listingLabel(l)}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {[l.price ? money(l.price) : null, l.beds != null ? `${l.beds} bd` : null, l.baths != null ? `${l.baths} ba` : null, l.sqft ? `${l.sqft.toLocaleString()} sqft` : null].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <button type="button" onClick={() => remove(l.id)} aria-label="Delete listing" className="shrink-0 text-xs font-semibold text-muted hover:text-crush-600">Delete</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {SHORTCUTS(l.id).map((s) => (
                  <Link key={s.label} href={s.href} className="rounded-full bg-crush-50 px-3 py-1.5 text-xs font-semibold text-crush-700 hover:bg-crush-100">
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}

export default function ListingsPage() {
  return (
    <RequireAuth>
      <ListingsInner />
    </RequireAuth>
  );
}
