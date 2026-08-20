"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { getSupabase } from "@/lib/supabase";
import { fetchLoanPrograms, type LoanProgramRow } from "@/lib/loanPrograms";

const inp = "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
const lbl = "text-xs font-semibold uppercase tracking-wide text-muted";

type Draft = Partial<LoanProgramRow>;

function ProgramsInner() {
  const [programs, setPrograms] = useState<LoanProgramRow[]>([]);
  const [sel, setSel] = useState<Draft | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => setPrograms(await fetchLoanPrograms(false)), []);
  useEffect(() => { load(); }, [load]);

  function edit(p: LoanProgramRow) { setSel({ ...p }); setMsg(""); }
  function add() {
    setSel({ slug: "", name: "", category: "", active: true, sort: (programs.at(-1)?.sort ?? 0) + 1, occupancy: ["primary"], property_types: [], benefits: [] });
    setMsg("");
  }
  const setF = (k: keyof LoanProgramRow, v: unknown) => setSel((s) => (s ? { ...s, [k]: v } : s));

  async function save() {
    const sb = getSupabase();
    if (!sb || !sel) return;
    if (!sel.slug?.trim() || !sel.name?.trim()) { setMsg("Slug and name are required."); return; }
    const row = {
      slug: sel.slug.trim(), name: sel.name.trim(), category: sel.category ?? null, tagline: sel.tagline ?? null,
      description: sel.description ?? null, min_credit: sel.min_credit ?? null, min_down_pct: sel.min_down_pct ?? null,
      max_loan: sel.max_loan ?? null, dti_note: sel.dti_note ?? null,
      occupancy: sel.occupancy ?? ["primary"], property_types: sel.property_types ?? [], professions: sel.professions ?? [],
      benefits: sel.benefits ?? [], restrictions: sel.restrictions ?? null, disclaimer: sel.disclaimer ?? null,
      veteran_only: !!sel.veteran_only, self_employed_ok: !!sel.self_employed_ok, first_time_friendly: !!sel.first_time_friendly,
      active: sel.active ?? true, sort: sel.sort ?? 0,
    };
    const { error } = sel.id
      ? await sb.from("crush_loan_programs").update(row).eq("id", sel.id)
      : await sb.from("crush_loan_programs").insert(row);
    if (error) { setMsg(error.message); return; }
    setMsg("Saved.");
    setSel(null);
    load();
  }

  async function del(id: string) {
    const sb = getSupabase();
    if (!sb) return;
    await sb.from("crush_loan_programs").delete().eq("id", id);
    setSel(null);
    load();
  }

  const arr = (v: string[] | undefined) => (v ?? []).join(", ");
  const toArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  return (
    <>
      <PageHero eyebrow="Admin" title={<>Loan <span className="text-gradient">programs</span></>} subtitle="Manage the programs the finder matches against. Changes are live immediately." />
      <Container className="py-12">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="text-sm font-semibold text-crush-600">← Admin overview</Link>
          <button type="button" onClick={add} className="rounded-full bg-crush-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-crush-600">+ New program</button>
        </div>
        {msg && <p className="mt-4 text-sm font-semibold text-crush-600">{msg}</p>}

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
          {/* List */}
          <div className="space-y-2">
            {programs.map((p) => (
              <button key={p.id} type="button" onClick={() => edit(p)} className={`block w-full rounded-xl border px-4 py-3 text-left ${sel?.id === p.id ? "border-crush-400 bg-crush-50" : "border-border bg-white hover:bg-surface-2"}`}>
                <p className="font-semibold text-ink-900">{p.name} {!p.active && <span className="text-xs text-muted">· inactive</span>}</p>
                <p className="text-xs text-muted">{p.category} · updated {new Date(p.updated_at).toLocaleDateString("en-US")}</p>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div>
            {!sel ? (
              <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">Select a program to edit, or add a new one.</p>
            ) : (
              <div className="space-y-4 rounded-2xl border border-border bg-white p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className={lbl}>Name *</span><input className={inp} value={sel.name ?? ""} onChange={(e) => setF("name", e.target.value)} /></label>
                  <label className="block"><span className={lbl}>Slug *</span><input className={inp} value={sel.slug ?? ""} onChange={(e) => setF("slug", e.target.value)} placeholder="fha" /></label>
                  <label className="block"><span className={lbl}>Category</span><input className={inp} value={sel.category ?? ""} onChange={(e) => setF("category", e.target.value)} /></label>
                  <label className="block"><span className={lbl}>Sort</span><input className={inp} type="number" value={sel.sort ?? 0} onChange={(e) => setF("sort", parseInt(e.target.value, 10) || 0)} /></label>
                </div>
                <label className="block"><span className={lbl}>Tagline</span><input className={inp} value={sel.tagline ?? ""} onChange={(e) => setF("tagline", e.target.value)} /></label>
                <label className="block"><span className={lbl}>Description</span><textarea className={`${inp} min-h-[70px]`} value={sel.description ?? ""} onChange={(e) => setF("description", e.target.value)} /></label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block"><span className={lbl}>Min credit</span><input className={inp} type="number" value={sel.min_credit ?? ""} onChange={(e) => setF("min_credit", e.target.value ? parseInt(e.target.value, 10) : null)} /></label>
                  <label className="block"><span className={lbl}>Min down %</span><input className={inp} type="number" step="0.5" value={sel.min_down_pct ?? ""} onChange={(e) => setF("min_down_pct", e.target.value ? parseFloat(e.target.value) : null)} /></label>
                  <label className="block"><span className={lbl}>Max loan</span><input className={inp} type="number" value={sel.max_loan ?? ""} onChange={(e) => setF("max_loan", e.target.value ? parseFloat(e.target.value) : null)} /></label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className={lbl}>Occupancy (comma)</span><input className={inp} value={arr(sel.occupancy)} onChange={(e) => setF("occupancy", toArr(e.target.value))} placeholder="primary, second, investment" /></label>
                  <label className="block"><span className={lbl}>Property types (comma)</span><input className={inp} value={arr(sel.property_types)} onChange={(e) => setF("property_types", toArr(e.target.value))} placeholder="single-family, condo" /></label>
                </div>
                <label className="block"><span className={lbl}>Benefits (one per line)</span><textarea className={`${inp} min-h-[80px]`} value={(sel.benefits ?? []).join("\n")} onChange={(e) => setF("benefits", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))} /></label>
                <label className="block"><span className={lbl}>DTI note</span><input className={inp} value={sel.dti_note ?? ""} onChange={(e) => setF("dti_note", e.target.value)} /></label>
                <label className="block"><span className={lbl}>Restrictions</span><input className={inp} value={sel.restrictions ?? ""} onChange={(e) => setF("restrictions", e.target.value)} /></label>
                <label className="block"><span className={lbl}>Disclaimer</span><input className={inp} value={sel.disclaimer ?? ""} onChange={(e) => setF("disclaimer", e.target.value)} /></label>
                <div className="flex flex-wrap gap-4">
                  {([["veteran_only", "Veteran only"], ["self_employed_ok", "Self-employed OK"], ["first_time_friendly", "First-time friendly"], ["active", "Active"]] as const).map(([k, l]) => (
                    <label key={k} className="flex items-center gap-2 text-sm text-ink-800">
                      <input type="checkbox" className="h-4 w-4 accent-crush-500" checked={!!sel[k]} onChange={(e) => setF(k, e.target.checked)} /> {l}
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button type="button" onClick={save} className="rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crush-600">Save program</button>
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

export default function AdminLoanProgramsPage() {
  return (
    <AdminGuard>
      <ProgramsInner />
    </AdminGuard>
  );
}
