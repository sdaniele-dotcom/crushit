"use client";

import { getSupabase } from "@/lib/supabase";

export type LoanProgramRow = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  tagline: string | null;
  description: string | null;
  min_credit: number | null;
  min_down_pct: number | null;
  max_loan: number | null;
  dti_note: string | null;
  occupancy: string[];
  property_types: string[];
  professions: string[];
  benefits: string[];
  restrictions: string | null;
  disclaimer: string | null;
  veteran_only: boolean;
  self_employed_ok: boolean;
  first_time_friendly: boolean;
  active: boolean;
  sort: number;
  updated_at: string;
};

export async function fetchLoanPrograms(activeOnly = true): Promise<LoanProgramRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  let q = sb.from("crush_loan_programs").select("*").order("sort");
  if (activeOnly) q = q.eq("active", true);
  const { data } = await q;
  return (data as LoanProgramRow[]) ?? [];
}

export type BuyerAnswers = {
  creditRange: string; // "740+" | "680-739" | "620-679" | "580-619" | "<580"
  price: number;
  down: number; // dollars
  firstTime: boolean;
  veteran: boolean;
  selfEmployed: boolean;
  medical: boolean; // doctor/dentist — for physician programs
  propertyType: string; // single-family | condo | townhome | multi-unit
  occupancy: string; // primary | second | investment
  income?: number;
};

// Programs that specifically require self-employment to make sense.
const SELF_EMPLOYED_ONLY = ["bank-statement", "non-qm-self-employed", "self-employed-fha"];

const CREDIT_NUM: Record<string, number> = {
  "740+": 760, "680-739": 700, "620-679": 640, "580-619": 590, "<580": 550,
};

export type Match = { program: LoanProgramRow; reasons: string[]; considerations: string[]; score: number };

/** Compare a buyer's answers to the stored programs. Never states qualification —
 *  returns programs "worth exploring" with reasons and considerations. */
export function matchPrograms(a: BuyerAnswers, programs: LoanProgramRow[]): Match[] {
  const credit = CREDIT_NUM[a.creditRange] ?? 620;
  const downPct = a.price > 0 ? (a.down / a.price) * 100 : 0;

  const out: Match[] = [];
  for (const p of programs) {
    // HARD filters — a program only appears if it matches what they entered.
    if (p.veteran_only && !a.veteran) continue;
    if (p.occupancy.length && !p.occupancy.includes(a.occupancy)) continue;
    if (p.property_types.length && !p.property_types.includes(a.propertyType)) continue;
    if (p.min_credit != null && credit < p.min_credit) continue;                 // credit too low
    if (p.min_down_pct != null && downPct + 0.05 < p.min_down_pct) continue;      // not enough down
    if (SELF_EMPLOYED_ONLY.includes(p.slug) && !a.selfEmployed) continue;         // self-employed products
    if (p.slug === "doctor" && !a.medical) continue;                             // physician program

    const reasons: string[] = [];
    let score = 100 - p.sort;

    if (p.min_down_pct === 0) reasons.push("No down payment required");
    else if (p.min_down_pct != null && p.min_down_pct <= 3.5) reasons.push(`Low down payment (${p.min_down_pct}%)`);
    if (p.min_credit != null) reasons.push(`Fits your credit (${p.min_credit}+ typical minimum)`);

    if (a.veteran && p.slug === "va") { reasons.push("Matches your military service"); score += 40; }
    if (a.medical && p.slug === "doctor") { reasons.push("Physician program — matches the buyer's profession"); score += 35; }
    if (a.selfEmployed && p.self_employed_ok) { reasons.push("Built for self-employed / 1099 income"); score += 25; }
    if (a.occupancy === "investment" && p.slug === "dscr") { reasons.push("Qualifies on the property's rental income"); score += 20; }
    if (a.firstTime && p.first_time_friendly) { reasons.push("First-time-buyer friendly"); score += 10; }

    if (reasons.length === 0) reasons.push("Fits your credit, down payment, and property");
    out.push({ program: p, reasons, considerations: [], score });
  }
  return out.sort((x, y) => y.score - x.score);
}

/** Split matches into standard programs and exclusive/specialty ones. */
export function splitMatches(matches: Match[]): { standard: Match[]; exclusive: Match[] } {
  const exclusive = matches.filter((m) => (m.program.category ?? "").toLowerCase() === "exclusive");
  const standard = matches.filter((m) => (m.program.category ?? "").toLowerCase() !== "exclusive");
  return { standard: standard.slice(0, 4), exclusive: exclusive.slice(0, 4) };
}

export type AgentContact = { name?: string | null; email?: string | null; phone?: string | null };

/** Save a buyer scenario (loan-finder submission) for the logged-in agent.
 *  The agent's contact is snapshotted so the loan-officer email has it. */
export async function saveScenario(
  a: BuyerAnswers,
  matchedSlugs: string[],
  agent?: AgentContact,
  notes?: string,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const { error } = await sb.from("buyer_scenarios").insert({
    user_id: user.id,
    agent_name: agent?.name ?? null,
    agent_email: agent?.email ?? user.email ?? null,
    agent_phone: agent?.phone ?? null,
    credit_range: a.creditRange,
    price: a.price,
    down: a.down,
    first_time: a.firstTime,
    veteran: a.veteran,
    self_employed: a.selfEmployed,
    property_type: a.propertyType,
    occupancy: a.occupancy,
    income: a.income ?? null,
    notes: notes ?? null,
    matched_slugs: matchedSlugs,
    sent_to_lender: true,
  });
  return !error;
}
