"use client";

import { useState } from "react";
import { Field } from "@/components/calculators/fields";
import { currency } from "@/lib/calc";
import {
  rentVsOwn,
  RENT_VS_OWN_DEFAULTS,
  type RentVsOwnInputs,
} from "@/lib/rentVsOwn";
import { site } from "@/lib/site";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";
import { recordUse } from "@/lib/rewards";

const HORIZONS = [5, 10, 15, 20, 30];
const money0 = (n: number) => currency(Math.round(n));

/** Small inline SVG area chart of owning's advantage over renting, by year. */
function AdvantageChart({
  data,
}: {
  data: { year: number; value: number }[];
}) {
  const W = 640;
  const H = 220;
  const padL = 56;
  const padB = 26;
  const padT = 12;
  const padR = 12;
  const maxV = Math.max(1, ...data.map((d) => d.value));
  const maxYear = Math.max(1, ...data.map((d) => d.year));
  const x = (yr: number) => padL + ((yr - 1) / Math.max(1, maxYear - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - v / maxV) * (H - padT - padB);
  const pts = data.map((d) => `${x(d.year)},${y(d.value)}`).join(" ");
  const area = `${padL},${H - padB} ${pts} ${x(maxYear)},${H - padB}`;
  const ticks = 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Owning advantage over time">
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const v = (maxV / ticks) * i;
        const yy = y(v);
        return (
          <g key={i}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="#eee" strokeWidth={1} />
            <text x={padL - 8} y={yy + 3} textAnchor="end" fontSize="10" fill="#999">
              {v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`}
            </text>
          </g>
        );
      })}
      <polygon points={area} fill="#e62c2c" opacity={0.12} />
      <polyline points={pts} fill="none" stroke="#e62c2c" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d) =>
        d.year === 1 || d.year % 5 === 0 || d.year === maxYear ? (
          <text key={d.year} x={x(d.year)} y={H - padB + 16} textAnchor="middle" fontSize="10" fill="#999">
            Yr {d.year}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function RentVsOwnCalculator() {
  const [inp, setInp] = useState<RentVsOwnInputs>(RENT_VS_OWN_DEFAULTS);
  const set =
    (k: keyof RentVsOwnInputs) =>
    (v: number) =>
      setInp((s) => ({ ...s, [k]: v }));

  const r = rentVsOwn(inp);
  const m = r.monthly;
  const s = r.summary;
  const ahead = s.ownAdvantage;

  function savePdf() {
    const rowsHtml = r.rows
      .map(
        (row) =>
          `<tr><td>${row.year}</td><td class="r">${money0(row.rentMonthly)}</td><td class="r">${money0(row.netMortgageMonthly)}</td><td class="r">${money0(row.homeValue)}</td><td class="r">${money0(row.loanBalance)}</td><td class="r">${money0(row.equity)}</td><td class="r strong">${money0(row.ownAdvantage)}</td></tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"/>
      <title>Rent vs. Own analysis</title><style>
      *{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:40px}
      .top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #e62c2c;padding-bottom:14px}
      h1{font-size:23px;margin:0 0 4px}.sub{color:#555;font-size:13px;margin:0}
      .brand{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
      .brand img{height:50px;width:auto}.brand .c{font-size:12px;color:#333;text-align:right;line-height:1.5}.brand .c strong{color:#e62c2c;font-size:13px}
      .hero{margin:22px 0;padding:16px 18px;border-radius:12px;background:#fff5f5;border:1px solid #f6caca}
      .hero .big{font-size:30px;font-weight:800;color:#e62c2c;margin:2px 0 0}
      h2{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#e62c2c;margin:22px 0 8px}
      table{width:100%;border-collapse:collapse;margin-top:4px}th,td{border:1px solid #d8d8d8;padding:6px 8px;font-size:11.5px;text-align:left}
      td.r,th.r{text-align:right}.strong{font-weight:700}th{background:#111;color:#fff;text-transform:uppercase;font-size:10px}
      tr:nth-child(even) td{background:#fafafa}.foot{margin-top:18px;font-size:10.5px;color:#777;border-top:1px solid #eee;padding-top:12px;line-height:1.5}
      @media print{body{padding:24px}}
    </style></head><body>
      <div class="top"><div><h1>Rent vs. Own</h1><p class="sub">${inp.horizonYears}-year comparison · ${money0(inp.purchasePrice)} home · prepared ${new Date().toLocaleDateString("en-US")}</p></div>
      <div class="brand"><img src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage"/><div class="c"><strong>${site.phone}</strong><br/>NMLS #${site.companyNmls} · ${site.website.replace(/^https?:\/\//, "")}</div></div></div>
      <div class="hero">After ${inp.horizonYears} years, owning could leave you about<div class="big">${money0(ahead)} ahead of renting</div>
      <div class="sub">Equity built ${money0(s.equity)} + rent you'd avoid paying above your net house payment ${money0(s.cumRentSurplus)}.</div></div>
      <h2>Your monthly house payment</h2>
      <table>
        <tr><td>Principal &amp; interest</td><td class="r">${money0(m.principalInterest)}</td></tr>
        <tr><td>Property taxes</td><td class="r">${money0(m.tax)}</td></tr>
        <tr><td>Homeowners insurance</td><td class="r">${money0(m.insurance)}</td></tr>
        ${m.pmi > 0 ? `<tr><td>Mortgage insurance (PMI)</td><td class="r">${money0(m.pmi)}</td></tr>` : ""}
        ${m.hoa > 0 ? `<tr><td>HOA</td><td class="r">${money0(m.hoa)}</td></tr>` : ""}
        <tr><td class="strong">Total housing payment</td><td class="r strong">${money0(m.totalHousing)}</td></tr>
        <tr><td>Est. monthly tax savings</td><td class="r">− ${money0(m.taxSavings)}</td></tr>
        <tr><td class="strong">Net (after-tax) house payment</td><td class="r strong">${money0(m.netMortgage)}</td></tr>
        <tr><td>Today's rent</td><td class="r">${money0(inp.currentRent)}</td></tr>
      </table>
      <h2>Year by year</h2>
      <table><thead><tr><th>Year</th><th class="r">Rent/mo</th><th class="r">Net house pmt/mo</th><th class="r">Home value</th><th class="r">Loan balance</th><th class="r">Equity</th><th class="r">Owning advantage</th></tr></thead><tbody>${rowsHtml}</tbody></table>
      <p class="foot">Estimates for educational purposes only — not a commitment to lend, a rate quote, or tax advice. Assumes ${inp.appreciationPct}% annual home appreciation, ${inp.rentIncreasePct}% annual rent increases, a ${inp.incomeTaxPct}% tax rate for the mortgage-interest/property-tax deduction, and that you itemize. Actual results vary. Consult a tax professional. Ready to run your real numbers? Contact ${site.company} at ${site.phone}. Equal Housing Opportunity.</p>
    </body></html>`;
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      w.print();
    };
    const imgs = Array.from(w.document.images);
    const pending = imgs.filter((img) => !img.complete);
    if (pending.length === 0) setTimeout(go, 150);
    else {
      let left = pending.length;
      const tick = () => {
        left -= 1;
        if (left <= 0) setTimeout(go, 50);
      };
      pending.forEach((img) => {
        img.addEventListener("load", tick);
        img.addEventListener("error", tick);
      });
      setTimeout(go, 2000);
    }
    void recordUse("calculator_use", {
      events: ["financing_tool_used"],
      relatedType: "calculator",
      relatedId: "rent-vs-own",
      description: "Used the rent vs. own calculator",
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
      {/* ── Inputs ─────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-white p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">
          The home
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Home price" value={inp.purchasePrice} onChange={set("purchasePrice")} prefix="$" min={50000} max={5000000} step={5000} slider />
          </div>
          <Field label="Down payment" value={inp.downPct} onChange={set("downPct")} suffix="%" min={0} max={50} step={0.5} slider help={money0(r.downPayment)} />
          <Field label="Interest rate" value={inp.ratePct} onChange={set("ratePct")} suffix="%" min={1} max={12} step={0.125} slider />
          <Field label="Loan term" value={inp.termYears} onChange={set("termYears")} suffix="yrs" min={10} max={30} step={5} />
          <Field label="Current rent" value={inp.currentRent} onChange={set("currentRent")} prefix="$" suffix="/mo" min={500} max={20000} step={50} />
        </div>

        <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-crush-700">
          Assumptions
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Home appreciation" value={inp.appreciationPct} onChange={set("appreciationPct")} suffix="% / yr" min={0} max={12} step={0.25} />
          <Field label="Rent increase" value={inp.rentIncreasePct} onChange={set("rentIncreasePct")} suffix="% / yr" min={0} max={12} step={0.25} />
          <Field label="Property tax" value={inp.propertyTaxPct} onChange={set("propertyTaxPct")} suffix="% / yr" min={0} max={4} step={0.05} />
          <Field label="Homeowners insurance" value={inp.insurancePct} onChange={set("insurancePct")} suffix="% / yr" min={0} max={2} step={0.01} />
          <Field label="Mortgage insurance (PMI)" value={inp.pmiPct} onChange={set("pmiPct")} suffix="% / yr" min={0} max={2} step={0.05} help={inp.downPct >= 20 ? "Waived at 20% down" : undefined} />
          <Field label="HOA dues" value={inp.hoaMonthly} onChange={set("hoaMonthly")} prefix="$" suffix="/ mo" min={0} step={25} />
          <Field label="Income tax rate" value={inp.incomeTaxPct} onChange={set("incomeTaxPct")} suffix="%" min={0} max={50} step={1} help="For the tax deduction" />
          <Field label="Closing costs" value={inp.closingCosts} onChange={set("closingCosts")} prefix="$" min={0} step={500} />
        </div>
      </div>

      {/* ── Results ────────────────────────────── */}
      <div className="flex flex-col gap-6">
        {/* Horizon selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted">Compare over</span>
          {HORIZONS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setInp((st) => ({ ...st, horizonYears: h }))}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                inp.horizonYears === h
                  ? "bg-crush-500 text-white"
                  : "bg-surface-2 text-ink-700 hover:bg-surface"
              }`}
            >
              {h} yrs
            </button>
          ))}
        </div>

        {/* Hero */}
        <div className="rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-7">
          <p className="text-sm font-medium text-ink-700">
            After {inp.horizonYears} years, owning could leave you about
          </p>
          <p className="mt-1 text-4xl font-extrabold text-crush-600 sm:text-5xl">
            {money0(ahead)} ahead
          </p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            That&apos;s <strong className="text-ink-800">{money0(s.equity)}</strong> of
            equity built, plus <strong className="text-ink-800">{money0(s.cumRentSurplus)}</strong>{" "}
            in rent you&apos;d avoid paying above your net house payment.
          </p>
        </div>

        {/* Rent vs Own columns */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">If you keep renting</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Rent paid over {inp.horizonYears} yrs</dt><dd className="font-semibold text-ink-900">{money0(s.totalRentPaid)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Rent in year {inp.horizonYears}</dt><dd className="font-semibold text-ink-900">{money0(s.monthlyRentAtHorizon)}/mo</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Equity built</dt><dd className="font-semibold text-ink-900">$0</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border border-crush-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-crush-700">If you own</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Home value</dt><dd className="font-semibold text-ink-900">{money0(s.homeValue)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Equity built</dt><dd className="font-semibold text-ink-900">{money0(s.equity)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Net house payment</dt><dd className="font-semibold text-ink-900">{money0(m.netMortgage)}/mo</dd></div>
            </dl>
          </div>
        </div>

        {/* Monthly breakdown */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Your monthly house payment</p>
          <dl className="mt-3 space-y-1.5 text-sm">
            <Line label="Principal & interest" value={money0(m.principalInterest)} />
            <Line label="Property taxes" value={money0(m.tax)} />
            <Line label="Homeowners insurance" value={money0(m.insurance)} />
            {m.pmi > 0 && <Line label="Mortgage insurance (PMI)" value={money0(m.pmi)} />}
            {m.hoa > 0 && <Line label="HOA dues" value={money0(m.hoa)} />}
            <Line label="Total housing payment" value={money0(m.totalHousing)} strong />
            <Line label="Est. monthly tax savings" value={`− ${money0(m.taxSavings)}`} accent />
            <Line label="Net (after-tax) house payment" value={money0(m.netMortgage)} strong />
          </dl>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Owning advantage over time</p>
          <div className="mt-3">
            <AdvantageChart data={r.rows.map((row) => ({ year: row.year, value: row.ownAdvantage }))} />
          </div>
        </div>

        {/* Year table */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase text-muted">
                <th className="px-3 py-2 font-semibold">Year</th>
                <th className="px-3 py-2 text-right font-semibold">Rent/mo</th>
                <th className="px-3 py-2 text-right font-semibold">Net pmt/mo</th>
                <th className="px-3 py-2 text-right font-semibold">Home value</th>
                <th className="px-3 py-2 text-right font-semibold">Equity</th>
                <th className="px-3 py-2 text-right font-semibold">Own advantage</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((row) => (
                <tr key={row.year} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2 font-medium text-ink-900">{row.year}</td>
                  <td className="px-3 py-2 text-right text-ink-700">{money0(row.rentMonthly)}</td>
                  <td className="px-3 py-2 text-right text-ink-700">{money0(row.netMortgageMonthly)}</td>
                  <td className="px-3 py-2 text-right text-ink-700">{money0(row.homeValue)}</td>
                  <td className="px-3 py-2 text-right text-ink-700">{money0(row.equity)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-crush-700">{money0(row.ownAdvantage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <button
            type="button"
            onClick={savePdf}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 9V3h8v6M6 15h8v3H6zM4 9h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1" />
            </svg>
            Save as PDF (Crush-branded)
          </button>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Estimates for education only — not a commitment to lend, a rate quote, or tax
            advice. Assumes you itemize deductions and that appreciation and rent
            increases hold steady. A tax professional can confirm your savings.
          </p>
        </div>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        strong ? "border-t border-border pt-1.5" : ""
      }`}
    >
      <dt className={strong ? "font-semibold text-ink-900" : "text-muted"}>{label}</dt>
      <dd
        className={
          accent
            ? "font-semibold text-mint-500"
            : strong
              ? "font-bold text-ink-900"
              : "font-medium text-ink-800"
        }
      >
        {value}
      </dd>
    </div>
  );
}
