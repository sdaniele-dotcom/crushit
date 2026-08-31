"use client";

import { useState } from "react";
import { Field, ResultCard, Row, StackBar } from "./fields";
import {
  currency,
  purchaseBreakdown,
  DEFAULT_TAX_RATE_PCT,
  DEFAULT_INSURANCE_RATE_PCT,
  DEFAULT_PMI_RATE_PCT,
} from "@/lib/calc";
import { openBrandedPdf } from "@/lib/pdf";
import { recordUse } from "@/lib/rewards";

function qp(name: string): number | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get(name);
  if (v == null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function PaymentCalculator() {
  const [price, setPrice] = useState(() => qp("price") ?? 450000);
  const [downPct, setDownPct] = useState(() => qp("downPct") ?? 10);
  const [ratePct, setRatePct] = useState(6.5);
  const [years, setYears] = useState(30);
  const [taxRatePct, setTaxRatePct] = useState(DEFAULT_TAX_RATE_PCT);
  const [insuranceRatePct, setInsuranceRatePct] = useState(
    DEFAULT_INSURANCE_RATE_PCT,
  );
  const [hoaMonth, setHoaMonth] = useState(0);
  const [pmiRatePct, setPmiRatePct] = useState(DEFAULT_PMI_RATE_PCT);

  const b = purchaseBreakdown({
    price,
    downPct,
    ratePct,
    years,
    taxRatePct,
    insuranceRatePct,
    hoaMonth,
    pmiRatePct,
  });

  function savePdf() {
    openBrandedPdf({
      title: "Estimated Monthly Payment",
      heroLabel: "Estimated monthly payment",
      heroValue: currency(b.total),
      sections: [
        {
          heading: "Your scenario",
          rows: [
            { label: "Home price", value: currency(price) },
            { label: "Down payment", value: `${downPct}%  ·  ${currency(b.down)}` },
            { label: "Loan amount", value: currency(b.loan) },
            { label: "Interest rate", value: `${ratePct}%` },
            { label: "Loan term", value: `${years} years` },
          ],
        },
        {
          heading: "Monthly breakdown",
          rows: [
            { label: "Principal &amp; interest", value: currency(b.pi) },
            { label: "Property taxes", value: currency(b.tax) },
            { label: "Homeowners insurance", value: currency(b.insurance) },
            ...(b.pmi > 0 ? [{ label: "PMI", value: currency(b.pmi) }] : []),
            ...(b.hoa > 0 ? [{ label: "HOA dues", value: currency(b.hoa) }] : []),
            { label: "Total monthly payment", value: currency(b.total), strong: true },
          ],
        },
      ],
    });
    void recordUse("calculator_use", {
      events: ["financing_tool_used"],
      relatedType: "calculator",
      relatedId: "payment",
      description: "Used the payment calculator",
    });
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
            commas
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
          value={insuranceRatePct}
          onChange={setInsuranceRatePct}
          suffix="% / yr"
          min={0}
          max={2}
          step={0.05}
          help={currency((price * (insuranceRatePct / 100)) / 12) + " / mo"}
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
