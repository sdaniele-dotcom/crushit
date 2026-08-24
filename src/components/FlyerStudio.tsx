"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveListing } from "@/components/ActiveListing";
import { fullName } from "@/lib/profile";
import { awardStars, logActivity } from "@/lib/rewards";
import { FLYER_TEMPLATES, renderFlyer, type FlyerData, type FlyerCategory } from "@/lib/flyerTemplates";

const CATEGORIES: { key: FlyerCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "listing", label: "Listing" },
  { key: "open-house", label: "Open house" },
  { key: "luxury", label: "Luxury" },
  { key: "rental", label: "Rental" },
  { key: "price-drop", label: "Price drop" },
  { key: "sold", label: "Just sold" },
];

const inputCls = "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
const labelCls = "text-xs font-semibold uppercase tracking-wide text-muted";

function resizeToDataUrl(file: File, max = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const money = (n: number | null | undefined) =>
  n == null ? "" : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function FlyerStudio({ initialCategory = "all" }: { initialCategory?: FlyerCategory | "all" }) {
  const { profile } = useAuth();
  const { listing } = useActiveListing();
  const [cat, setCat] = useState<FlyerCategory | "all">(initialCategory);
  const [tplId, setTplId] = useState<string>(FLYER_TEMPLATES.find((t) => initialCategory === "all" || t.category === initialCategory)?.id ?? FLYER_TEMPLATES[0].id);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  const tpl = FLYER_TEMPLATES.find((t) => t.id === tplId) ?? FLYER_TEMPLATES[0];

  const [d, setD] = useState<FlyerData>({
    kicker: tpl.kicker, price: "", address: "", cityLine: "", beds: "", baths: "", sqft: "",
    description: "", openDate: "", openTime: "",
    agentName: "", agentPhone: "", agentEmail: "", agentBrokerage: "", headshotUrl: "", logoUrl: "", dreLicense: "",
  });
  const set = (k: keyof FlyerData, v: string) => setD((s) => ({ ...s, [k]: v }));

  // Prefill agent branding + active listing once each becomes available.
  useEffect(() => {
    if (profile && !prefilled) {
      setD((s) => ({
        ...s,
        agentName: fullName(profile),
        agentPhone: profile.phone ?? "",
        agentEmail: profile.email ?? "",
        agentBrokerage: profile.brokerage ?? "",
        dreLicense: profile.dre_license ?? "",
        headshotUrl: profile.headshot_url ?? "",
        logoUrl: profile.brokerage_logo_url ?? profile.team_logo_url ?? "",
      }));
      setPrefilled(true);
    }
  }, [profile, prefilled]);

  useEffect(() => {
    if (!listing) return;
    setD((s) => ({
      ...s,
      price: listing.price != null ? money(listing.price) : s.price,
      address: listing.address || s.address,
      cityLine: [listing.city, listing.state, listing.zip].filter(Boolean).join(", ") || s.cityLine,
      beds: listing.beds != null ? String(listing.beds) : s.beds,
      baths: listing.baths != null ? String(listing.baths) : s.baths,
      sqft: listing.sqft != null ? String(listing.sqft) : s.sqft,
      description: listing.description || s.description,
      openDate: listing.open_house_at ? new Date(listing.open_house_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : s.openDate,
      openTime: listing.open_house_at ? new Date(listing.open_house_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : s.openTime,
    }));
    const p = (listing.photos ?? []).filter(Boolean);
    if (p.length) setPhotos((cur) => (cur.length ? cur : p));
  }, [listing]);

  // Keep the kicker in sync when switching templates (unless the user edited it).
  const [kickerTouched, setKickerTouched] = useState(false);
  useEffect(() => {
    if (!kickerTouched) setD((s) => ({ ...s, kicker: tpl.kicker }));
  }, [tplId, tpl.kicker, kickerTouched]);

  const html = useMemo(() => renderFlyer(tpl, d, photos), [tpl, d, photos]);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => resizeToDataUrl(f)));
      setPhotos((cur) => [...cur, ...urls].slice(0, 6));
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
    }
  }
  const removePhoto = (i: number) => setPhotos((cur) => cur.filter((_, idx) => idx !== i));
  const movePhoto = (i: number, dir: -1 | 1) =>
    setPhotos((cur) => {
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  function print() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    awardStars("create_flyer", { relatedType: "flyer", description: "Designed a flyer from a template" });
    logActivity("marketing_piece_created", { kind: "flyer_template", template: tpl.id });
  }

  const shown = FLYER_TEMPLATES.filter((t) => cat === "all" || t.category === cat);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,420px)]">
      {/* Left: template gallery + editor */}
      <div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.key} type="button" onClick={() => setCat(c.key)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${cat === c.key ? "bg-crush-500 text-white" : "bg-surface-2 text-ink-700 hover:bg-surface"}`}>{c.label}</button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shown.map((t) => (
            <button key={t.id} type="button" onClick={() => setTplId(t.id)} className={`rounded-2xl border p-4 text-left transition-colors ${tplId === t.id ? "border-crush-400 bg-crush-50 ring-2 ring-crush-200" : "border-border bg-white hover:bg-surface-2"}`}>
              <span className="text-2xl" aria-hidden>{t.badge}</span>
              <p className="mt-1 text-sm font-bold text-ink-900">{t.name}</p>
              <p className="text-xs capitalize text-muted">{t.category.replace("-", " ")}</p>
            </button>
          ))}
        </div>

        {/* Photos */}
        <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-crush-700">Photos</h3>
        <p className="mt-1 text-xs text-muted">Upload your own — the first is the hero. Drag order with the arrows.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="h-20 w-28 rounded-lg object-cover ring-1 ring-border" />
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-crush-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Hero</span>}
              <div className="mt-1 flex items-center justify-between">
                <div className="flex gap-1">
                  <button type="button" onClick={() => movePhoto(i, -1)} className="rounded bg-surface-2 px-1.5 text-xs">←</button>
                  <button type="button" onClick={() => movePhoto(i, 1)} className="rounded bg-surface-2 px-1.5 text-xs">→</button>
                </div>
                <button type="button" onClick={() => removePhoto(i)} className="text-xs font-semibold text-muted hover:text-crush-600">Remove</button>
              </div>
            </div>
          ))}
          <label className="grid h-20 w-28 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-border text-xs font-semibold text-muted hover:border-crush-300 hover:text-crush-600">
            {uploading ? "Uploading…" : "+ Upload"}
            <input type="file" accept="image/*" multiple onChange={onFiles} disabled={uploading} className="hidden" />
          </label>
        </div>

        {/* Fields */}
        <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-crush-700">Details</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block"><span className={labelCls}>Banner text</span>
            <input className={inputCls} value={d.kicker} onChange={(e) => { setKickerTouched(true); set("kicker", e.target.value); }} /></label>
          <label className="block"><span className={labelCls}>Price</span>
            <input className={inputCls} value={d.price} onChange={(e) => set("price", e.target.value)} placeholder="$450,000" /></label>
          <label className="block sm:col-span-2"><span className={labelCls}>Address</span>
            <input className={inputCls} value={d.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St" /></label>
          <label className="block sm:col-span-2"><span className={labelCls}>City / state / zip</span>
            <input className={inputCls} value={d.cityLine} onChange={(e) => set("cityLine", e.target.value)} placeholder="Long Beach, CA 90808" /></label>
          <label className="block"><span className={labelCls}>Beds</span><input className={inputCls} value={d.beds} onChange={(e) => set("beds", e.target.value)} /></label>
          <label className="block"><span className={labelCls}>Baths</span><input className={inputCls} value={d.baths} onChange={(e) => set("baths", e.target.value)} /></label>
          <label className="block"><span className={labelCls}>Sq ft</span><input className={inputCls} value={d.sqft} onChange={(e) => set("sqft", e.target.value)} /></label>
          <div />
          <label className="block"><span className={labelCls}>Open house date</span><input className={inputCls} value={d.openDate} onChange={(e) => set("openDate", e.target.value)} placeholder="Saturday, June 7" /></label>
          <label className="block"><span className={labelCls}>Open house time</span><input className={inputCls} value={d.openTime} onChange={(e) => set("openTime", e.target.value)} placeholder="1:00 – 4:00 PM" /></label>
          <label className="block sm:col-span-2"><span className={labelCls}>Description</span>
            <textarea className={`${inputCls} min-h-[80px]`} value={d.description} onChange={(e) => set("description", e.target.value)} placeholder="Highlights, upgrades, neighborhood…" /></label>
        </div>

        <details className="mt-4 rounded-2xl border border-border bg-surface">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink-900">Your contact info (auto-filled from your profile)</summary>
          <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2">
            <label className="block"><span className={labelCls}>Name</span><input className={inputCls} value={d.agentName} onChange={(e) => set("agentName", e.target.value)} /></label>
            <label className="block"><span className={labelCls}>Phone</span><input className={inputCls} value={d.agentPhone} onChange={(e) => set("agentPhone", e.target.value)} /></label>
            <label className="block"><span className={labelCls}>Email</span><input className={inputCls} value={d.agentEmail} onChange={(e) => set("agentEmail", e.target.value)} /></label>
            <label className="block"><span className={labelCls}>Brokerage</span><input className={inputCls} value={d.agentBrokerage} onChange={(e) => set("agentBrokerage", e.target.value)} /></label>
          </div>
        </details>
      </div>

      {/* Right: live preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">Live preview</p>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-inner">
          <div className="mx-auto" style={{ width: 408, height: 528 }}>
            <iframe title="Flyer preview" srcDoc={html} style={{ width: 816, height: 1056, border: 0, transform: "scale(0.5)", transformOrigin: "top left" }} />
          </div>
        </div>
        <button type="button" onClick={print} className="mt-4 w-full rounded-full bg-crush-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-crush-500/20 hover:bg-crush-600">
          Print / Save as PDF
        </button>
        <p className="mt-2 text-center text-xs text-muted">Opens a clean, full-page version to print or save.</p>
      </div>
    </div>
  );
}
