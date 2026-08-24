"use client";

import { useEffect, useMemo, useState } from "react";
import { Container, PageHero } from "@/components/ui";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { fetchVendors, type Vendor } from "@/lib/vendors";

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function VendorCard({ v }: { v: Vendor }) {
  return (
    <div className={`flex flex-col rounded-2xl border bg-white p-6 ${v.featured ? "border-crush-300 ring-1 ring-crush-100" : "border-border"}`}>
      <div className="flex items-start gap-4">
        {v.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.logo_url} alt={v.name} className="h-12 w-12 rounded-xl object-contain" />
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink-900 text-sm font-extrabold text-white">{initials(v.name)}</span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-ink-900">{v.name}</h3>
            {v.featured && <span className="rounded-full bg-crush-500 px-2 py-0.5 text-[10px] font-bold text-white">Featured</span>}
          </div>
          {v.category && <p className="text-xs font-semibold uppercase tracking-wide text-crush-600">{v.category}</p>}
        </div>
      </div>
      {v.description && <p className="mt-3 flex-1 text-sm text-muted">{v.description}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        {v.action_url && (
          <a href={v.action_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-crush-500 px-4 py-2 text-sm font-semibold text-white hover:bg-crush-600">
            {v.action_label || "Open"}
          </a>
        )}
        {v.website && v.website !== v.action_url && (
          <a href={v.website} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-surface-2">Visit website</a>
        )}
        {(v.contact_email || v.contact_phone) && (
          <a href={v.contact_email ? `mailto:${v.contact_email}` : `tel:${v.contact_phone}`} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-surface-2">Contact</a>
        )}
      </div>
      {v.resource_urls?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {v.resource_urls.map((r) => (
            <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-crush-600 hover:text-crush-700">{r.label} →</a>
          ))}
        </div>
      )}
    </div>
  );
}

function PartnersInner() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  useEffect(() => { fetchVendors(true).then(setVendors); }, []);

  const categories = useMemo(() => Array.from(new Set(vendors.map((v) => v.category).filter(Boolean))) as string[], [vendors]);
  const filtered = vendors.filter((v) => {
    if (cat && v.category !== cat) return false;
    if (!q.trim()) return true;
    const s = `${v.name} ${v.category ?? ""} ${v.description ?? ""}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <>
      <PageHero
        eyebrow="Preferred resources"
        title={<>Tools &amp; partners to help you <span className="text-gradient">close</span></>}
        subtitle="Trusted vendors and services Crush Mortgage works with — escrow, disclosures, marketing, CRMs, and more."
      />
      <Container className="py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you need help with? (escrow, NHD, CRM…)"
            className="flex-1 rounded-full border border-border bg-white px-5 py-3 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100" />
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-full border border-border bg-white px-4 py-3 text-sm font-medium outline-none focus:border-crush-400">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted md:col-span-2 lg:col-span-3">No partners match — try a different search.</p>}
          {filtered.map((v) => <VendorCard key={v.id} v={v} />)}
        </div>
      </Container>
    </>
  );
}

export default function PartnersPage() {
  return (
    <RequireAuth>
      <PartnersInner />
    </RequireAuth>
  );
}
