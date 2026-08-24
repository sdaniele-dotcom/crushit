"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";
import { uploadAgentImage } from "@/lib/storage";
import { fetchVendors, VENDOR_CATEGORIES, type Vendor, type ResourceLink } from "@/lib/vendors";

const inp = "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
const lbl = "text-xs font-semibold uppercase tracking-wide text-muted";

type Draft = Partial<Vendor>;

function linksToText(links: ResourceLink[] | undefined) {
  return (links ?? []).map((l) => `${l.label} | ${l.url}`).join("\n");
}
function textToLinks(s: string): ResourceLink[] {
  return s.split("\n").map((line) => {
    const [label, url] = line.split("|").map((x) => x.trim());
    return url ? { label: label || url, url } : null;
  }).filter((x): x is ResourceLink => x !== null);
}

function VendorsInner() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [sel, setSel] = useState<Draft | null>(null);
  const [linksText, setLinksText] = useState("");
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => setVendors(await fetchVendors(false)), []);
  useEffect(() => { load(); }, [load]);

  function edit(v: Vendor) { setSel({ ...v }); setLinksText(linksToText(v.resource_urls)); setMsg(""); }
  function add() { setSel({ name: "", category: "Escrow", active: true, featured: false, sort: (vendors.at(-1)?.sort ?? 0) + 1 }); setLinksText(""); setMsg(""); }
  const setF = (k: keyof Vendor, v: unknown) => setSel((s) => (s ? { ...s, [k]: v } : s));

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { setF("logo_url", await uploadAgentImage(file, "brokerage_logo")); }
    catch (err) { setMsg(err instanceof Error ? err.message : "Upload failed"); }
    finally { setUploading(false); }
  }

  async function save() {
    const sb = getSupabase();
    if (!sb || !sel) return;
    if (!sel.name?.trim()) { setMsg("Name is required."); return; }
    const row = {
      name: sel.name.trim(), category: sel.category ?? null, description: sel.description ?? null,
      logo_url: sel.logo_url ?? null, website: sel.website ?? null, action_url: sel.action_url ?? null,
      action_label: sel.action_label ?? null, contact_name: sel.contact_name ?? null,
      contact_phone: sel.contact_phone ?? null, contact_email: sel.contact_email ?? null,
      resource_urls: textToLinks(linksText), notes: sel.notes ?? null,
      active: sel.active ?? true, featured: !!sel.featured, sort: sel.sort ?? 0,
    };
    const { error } = sel.id ? await sb.from("vendors").update(row).eq("id", sel.id) : await sb.from("vendors").insert(row);
    if (error) { setMsg(error.message); return; }
    setSel(null); load();
  }

  async function del(id: string) {
    const sb = getSupabase();
    if (!sb) return;
    await sb.from("vendors").delete().eq("id", id);
    setSel(null); load();
  }

  return (
    <>
      <PageHero eyebrow="Admin" title={<>Resource <span className="text-gradient">partners</span></>} subtitle="Manage the vendor directory Realtors see. Changes are live immediately." />
      <Container className="py-12">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>
          <button type="button" onClick={add} className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600">+ New partner</button>
        </div>
        {msg && <p className="mt-4 text-sm font-semibold text-crush-600">{msg}</p>}

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="space-y-2">
            {vendors.map((v) => (
              <button key={v.id} type="button" onClick={() => edit(v)} className={`block w-full rounded-xl border px-4 py-3 text-left ${sel?.id === v.id ? "border-crush-400 bg-crush-50" : "border-border bg-white hover:bg-surface-2"}`}>
                <p className="font-semibold text-ink-900">{v.name} {v.featured && "⭐"} {!v.active && <span className="text-xs text-muted">· inactive</span>}</p>
                <p className="text-xs text-muted">{v.category}</p>
              </button>
            ))}
          </div>

          <div>
            {!sel ? (
              <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">Select a partner to edit, or add a new one.</p>
            ) : (
              <div className="space-y-4 rounded-2xl border border-border bg-white p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className={lbl}>Name *</span><input className={inp} value={sel.name ?? ""} onChange={(e) => setF("name", e.target.value)} /></label>
                  <label className="block"><span className={lbl}>Category</span>
                    <select className={inp} value={sel.category ?? ""} onChange={(e) => setF("category", e.target.value)}>
                      {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                </div>
                <label className="block"><span className={lbl}>Description</span><textarea className={`${inp} min-h-[70px]`} value={sel.description ?? ""} onChange={(e) => setF("description", e.target.value)} /></label>
                <div>
                  <span className={lbl}>Logo</span>
                  <div className="mt-1 flex items-center gap-3">
                    {sel.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sel.logo_url} alt="" className="h-12 w-12 rounded-lg object-contain" />
                    )}
                    <input type="file" accept="image/*" onChange={onLogo} className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-crush-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
                    {uploading && <span className="text-xs text-muted">Uploading…</span>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className={lbl}>Website</span><input className={inp} value={sel.website ?? ""} onChange={(e) => setF("website", e.target.value)} placeholder="https://…" /></label>
                  <label className="block"><span className={lbl}>Primary action URL</span><input className={inp} value={sel.action_url ?? ""} onChange={(e) => setF("action_url", e.target.value)} placeholder="https://…/order" /></label>
                  <label className="block"><span className={lbl}>Primary action label</span><input className={inp} value={sel.action_label ?? ""} onChange={(e) => setF("action_label", e.target.value)} placeholder="Order NHD" /></label>
                  <label className="block"><span className={lbl}>Sort</span><input className={inp} type="number" value={sel.sort ?? 0} onChange={(e) => setF("sort", parseInt(e.target.value, 10) || 0)} /></label>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block"><span className={lbl}>Contact name</span><input className={inp} value={sel.contact_name ?? ""} onChange={(e) => setF("contact_name", e.target.value)} /></label>
                  <label className="block"><span className={lbl}>Contact phone</span><input className={inp} value={sel.contact_phone ?? ""} onChange={(e) => setF("contact_phone", e.target.value)} /></label>
                  <label className="block"><span className={lbl}>Contact email</span><input className={inp} value={sel.contact_email ?? ""} onChange={(e) => setF("contact_email", e.target.value)} /></label>
                </div>
                <label className="block"><span className={lbl}>Resource links (one per line: Label | URL)</span><textarea className={`${inp} min-h-[70px]`} value={linksText} onChange={(e) => setLinksText(e.target.value)} placeholder="Order form | https://…" /></label>
                <label className="block"><span className={lbl}>Partner notes</span><input className={inp} value={sel.notes ?? ""} onChange={(e) => setF("notes", e.target.value)} /></label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm text-ink-800"><input type="checkbox" className="h-4 w-4 accent-crush-500" checked={!!sel.active} onChange={(e) => setF("active", e.target.checked)} /> Active</label>
                  <label className="flex items-center gap-2 text-sm text-ink-800"><input type="checkbox" className="h-4 w-4 accent-crush-500" checked={!!sel.featured} onChange={(e) => setF("featured", e.target.checked)} /> Featured</label>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button type="button" onClick={save} className="rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crush-600">Save partner</button>
                  {sel.id && <button type="button" onClick={() => del(sel.id!)} className="text-sm font-semibold text-muted hover:text-crush-600">Delete</button>}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

export default function AdminVendorsPage() {
  return (
    <AdminGuard>
      <VendorsInner />
    </AdminGuard>
  );
}
