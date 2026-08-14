"use client";

import { useState } from "react";
import { Field, ResultCard, Row, StackBar } from "./fields";
import { currency, purchaseBreakdown } from "@/lib/calc";
import { site } from "@/lib/site";

export function PaymentCalculator() {
  const [price, setPrice] = useState(450000);
  const [downPct, setDownPct] = useState(10);
  const [ratePct, setRatePct] = useState(6.5);
  const [years, setYears] = useState(30);
  const [taxRatePct, setTaxRatePct] = useState(1.1);
  const [insuranceYr, setInsuranceYr] = useState(1800);
  const [hoaMonth, setHoaMonth] = useState(0);
  const [pmiRatePct, setPmiRatePct] = useState(0.6);

  const b = purchaseBreakdown({
    price,
    downPct,
    ratePct,
    years,
    taxRatePct,
    insuranceYr,
    hoaMonth,
    pmiRatePct,
  });

  function savePdf() {
    const row = (label: string, value: string, strong = false) =>
      `<tr${strong ? ' style="font-weight:700;border-top:2px solid #111"' : ""}><td>${label}</td><td style="text-align:right">${value}</td></tr>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"/>
      <title>Estimated Monthly Payment</title>
      <style>
        *{box-sizing:border-box}
        body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:44px}
        .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #e62c2c;padding-bottom:14px}
        h1{font-size:24px;margin:0 0 4px}
        .sub{color:#555;font-size:13px;margin:0}
        .brand{text-align:right;font-size:12px;color:#333;line-height:1.5}
        .brand strong{color:#e62c2c;font-size:16px;display:block}
        .big{margin:26px 0 6px;font-size:15px;color:#555}
        .amt{font-size:42px;font-weight:800;color:#e62c2c;margin:0}
        h2{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#e62c2c;margin:26px 0 8px}
        table{width:100%;border-collapse:collapse}
        td{padding:8px 4px;font-size:14px;border-bottom:1px solid #eee}
        .foot{margin-top:26px;font-size:10.5px;color:#777;line-height:1.5;border-top:1px solid #eee;padding-top:12px}
        @media print{body{padding:28px}}
      </style></head><body>
      <div class="top">
        <div><h1>Estimated Monthly Payment</h1><p class="sub">Prepared by ${site.company} · ${new Date().toLocaleDateString("en-US")}</p></div>
        <div class="brand"><strong>${site.brand}</strong>${site.company}<br/>${site.phone} · NMLS #${site.companyNmls}<br/>${site.website.replace(/^https?:\/\//, "")}</div>
      </div>
      <p class="big">Estimated monthly payment</p>
      <p class="amt">${currency(b.total)}</p>
      <h2>Your scenario</h2>
      <table>
        ${row("Home price", currency(price))}
        ${row("Down payment", `${downPct}%  ·  ${currency(b.down)}`)}
        ${row("Loan amount", currency(b.loan))}
        ${row("Interest rate", `${ratePct}%`)}
        ${row("Loan term", `${years} years`)}
      </table>
      <h2>Monthly breakdown</h2>
      <table>
        ${row("Principal &amp; interest", currency(b.pi))}
        ${row("Property taxes", currency(b.tax))}
        ${row("Homeowners insurance", currency(b.insurance))}
        ${b.pmi > 0 ? row("PMI", currency(b.pmi)) : ""}
        ${b.hoa > 0 ? row("HOA dues", currency(b.hoa)) : ""}
        ${row("Total monthly payment", currency(b.total), true)}
      </table>
      <p class="foot">This is an estimate for educational purposes only and is not a commitment to lend, a rate quote, or an offer of credit. Actual payment, rate, and APR depend on a full application, credit approval, and current market rates. Taxes and insurance are estimates. Ready for a real, personalized quote? Contact ${site.company} at ${site.phone}. Equal Housing Opportunity.</p>
      </body></html>`;
    const w = window.open("", "_blank", "width=850,height=1100");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="Home price"
            value={price}
            onChange={setPrice}
            prefix="$"
            min={50000}
            max={2000000}
            step={5000}
            slider
          />
        </div>
        <Field
          label="Down payment"
          value={downPct}
          onChange={setDownPct}
          suffix="%"
          min={0}
          max={50}
          step={0.5}
          slider
          help={currency(price * (downPct / 100))}
        />
        <Field
          label="Interest rate"
          value={ratePct}
          onChange={setRatePct}
          suffix="%"
          min={1}
          max={12}
          step={0.125}
          slider
        />
        <Field
          label="Loan term"
          value={years}
          onChange={setYears}
          suffix="yrs"
          min={5}
          max={30}
          step={5}
          slider
        />
        <Field
          label="Property tax"
          value={taxRatePct}
          onChange={setTaxRatePct}
          suffix="% / yr"
          min={0}
          max={4}
          step={0.05}
        />
        <Field
          label="Homeowners insurance"
          value={insuranceYr}
          onChange={setInsuranceYr}
          prefix="$"
          suffix="/ yr"
          min={0}
          step={100}
        />
        <Field
          label="HOA dues"
          value={hoaMonth}
          onChange={setHoaMonth}
          prefix="$"
          suffix="/ mo"
          min={0}
          step={25}
        />
        {downPct < 20 && (
          <Field
            label="PMI rate"
            value={pmiRatePct}
            onChange={setPmiRatePct}
            suffix="% / yr"
            min={0}
            max={2}
            step={0.05}
            help="Ends at 20% equity"
          />
        )}
      </div>

      <div className="flex flex-col gap-5">
        <ResultCard
          label="Estimated monthly payment"
          value={currency(b.total)}
          sub={`${currency(b.loan)} loan · ${currency(b.down)} down`}
        >
          <div className="mt-5">
            <StackBar
              segments={[
                { label: "Principal & interest", value: b.pi, color: "#e11b22" },
                { label: "Taxes", value: b.tax, color: "#0ea5e9" },
                { label: "Insurance", value: b.insurance, color: "#10b981" },
                { label: "PMI", value: b.pmi, color: "#f59e0b" },
                { label: "HOA", value: b.hoa, color: "#a78bfa" },
              ]}
            />
          </div>
        </ResultCard>

        <div className="rounded-2xl border border-border bg-white p-6">
          <Row label="Principal & interest" value={currency(b.pi)} />
          <Row label="Property taxes" value={currency(b.tax)} />
          <Row label="Homeowners insurance" value={currency(b.insurance)} />
          {b.pmi > 0 && <Row label="PMI" value={currency(b.pmi)} accent />}
          {b.hoa > 0 && <Row label="HOA dues" value={currency(b.hoa)} />}
          <Row label="Total monthly" value={currency(b.total)} strong />
        </div>

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
        <p className="-mt-2 text-center text-xs text-muted">
          Opens a print-ready, co-branded summary you can save as a PDF or hand
          to your client.
        </p>
      </div>
    </div>
  );
}
