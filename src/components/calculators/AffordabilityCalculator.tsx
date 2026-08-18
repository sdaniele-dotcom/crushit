"use client";

import { useState } from "react";
import { Field, ResultCard, Row } from "./fields";
import {
  affordablePrice,
  budgetFromIncome,
  currency,
  purchaseBreakdown,
  DEFAULT_TAX_RATE_PCT,
  DEFAULT_INSURANCE_RATE_PCT,
  DEFAULT_PMI_RATE_PCT,
} from "@/lib/calc";
import { openBrandedPdf } from "@/lib/pdf";

export function AffordabilityCalculator() {
  const [income, setIncome] = useState(8500); // monthly gross
  const [debts, setDebts] = useState(600); // monthly debt payments
  const [dtiPct, setDtiPct] = useState(43);
  const [downPct, setDownPct] = useState(10);
  const [ratePct, setRatePct] = useState(6.5);
  const [years, setYears] = useState(30);

  // Payment room = (income * DTI) - existing debts
  const maxHousing = Math.max(0, budgetFromIncome(income, dtiPct) - debts);

  const assumptions = {
    taxRatePct: DEFAULT_TAX_RATE_PCT,
    insuranceRatePct: DEFAULT_INSURANCE_RATE_PCT,
    hoaMonth: 0,
    pmiRatePct: DEFAULT_PMI_RATE_PCT,
  };

  const price = affordablePrice({
    monthlyBudget: maxHousing,
    downPct,
    ratePct,
    years,
    ...assumptions,
  });

  const b = purchaseBreakdown({
    price,
    downPct,
    ratePct,
    years,
    ...assumptions,
  });

  const roundedPrice = Math.round(price / 1000) * 1000;

  function savePdf() {
    openBrandedPdf({
      title: "Home Affordability Estimate",
      heroLabel: "Estimated home price they can afford",
      heroValue: currency(roundedPrice),
      heroSub: `Up to ${currency(maxHousing)}/mo toward housing`,
      sections: [
        {
          heading: "Their numbers",
          rows: [
            { label: "Gross monthly income", value: currency(income) },
            { label: "Monthly debt payments", value: currency(debts) },
            { label: "Max DTI ratio", value: `${dtiPct}%` },
            { label: "Down payment", value: `${downPct}%` },
            { label: "Interest rate", value: `${ratePct}%` },
            { label: "Loan term", value: `${years} years` },
          ],
        },
        {
          heading: "What that buys",
          rows: [
            { label: "Target monthly payment", value: currency(maxHousing) },
            { label: "Down payment needed", value: currency(b.down) },
            { label: "Loan amount", value: currency(b.loan) },
            { label: "Est. principal &amp; interest", value: currency(b.pi) },
            { label: "Est. total payment", value: currency(b.total), strong: true },
          ],
        },
      ],
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Gross monthly income"
          value={income}
          onChange={setIncome}
          prefix="$"
          min={1000}
          max={40000}
          step={250}
          slider
        />
        <Field
          label="Monthly debt payments"
          value={debts}
          onChange={setDebts}
          prefix="$"
          min={0}
          max={10000}
          step={50}
          slider
          help="Cards, auto, student loans"
        />
        <Field
          label="Max DTI ratio"
          value={dtiPct}
          onChange={setDtiPct}
          suffix="%"
          min={28}
          max={50}
          step={1}
          slider
          help="43% is a common cap"
        />
        <Field
          label="Down payment"
          value={downPct}
          onChange={setDownPct}
          suffix="%"
          min={0}
          max={50}
          step={0.5}
          slider
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
          min={10}
          max={30}
          step={5}
          slider
        />
      </div>

      <div className="flex flex-col gap-5">
        <ResultCard
          label="Estimated home price they can afford"
          value={currency(roundedPrice)}
          sub={`Up to ${currency(maxHousing)}/mo toward housing`}
        />
        <div className="rounded-2xl border border-border bg-white p-6">
          <Row label="Target monthly payment" value={currency(maxHousing)} accent />
          <Row label="Down payment needed" value={currency(b.down)} />
          <Row label="Loan amount" value={currency(b.loan)} />
          <Row label="Est. principal & interest" value={currency(b.pi)} />
          <Row label="Est. total payment" value={currency(b.total)} strong />
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
        <p className="text-xs text-muted">
          Estimate uses a {dtiPct}% debt-to-income ceiling with{" "}
          {DEFAULT_TAX_RATE_PCT}% property tax and {DEFAULT_INSURANCE_RATE_PCT}%
          insurance assumptions. A full pre-approval confirms real numbers.
        </p>
      </div>
    </div>
  );
}
