"use client";

import { useState } from "react";
import { Field, ResultCard, Row } from "./fields";
import {
  affordablePrice,
  budgetFromIncome,
  currency,
  purchaseBreakdown,
} from "@/lib/calc";

export function AffordabilityCalculator() {
  const [income, setIncome] = useState(8500); // monthly gross
  const [debts, setDebts] = useState(600); // monthly debt payments
  const [dtiPct, setDtiPct] = useState(43);
  const [downPct, setDownPct] = useState(10);
  const [ratePct, setRatePct] = useState(6.5);
  const [years, setYears] = useState(30);

  // Payment room = (income * DTI) - existing debts
  const maxHousing = Math.max(0, budgetFromIncome(income, dtiPct) - debts);

  const price = affordablePrice({
    monthlyBudget: maxHousing,
    downPct,
    ratePct,
    years,
    taxRatePct: 1.1,
    insuranceYr: 1800,
    hoaMonth: 0,
    pmiRatePct: 0.6,
  });

  const b = purchaseBreakdown({
    price,
    downPct,
    ratePct,
    years,
    taxRatePct: 1.1,
    insuranceYr: 1800,
    hoaMonth: 0,
    pmiRatePct: 0.6,
  });

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
          value={currency(Math.round(price / 1000) * 1000)}
          sub={`Up to ${currency(maxHousing)}/mo toward housing`}
        />
        <div className="rounded-2xl border border-border bg-white p-6">
          <Row label="Target monthly payment" value={currency(maxHousing)} accent />
          <Row label="Down payment needed" value={currency(b.down)} />
          <Row label="Loan amount" value={currency(b.loan)} />
          <Row label="Est. principal & interest" value={currency(b.pi)} />
          <Row label="Est. total payment" value={currency(b.total)} strong />
        </div>
        <p className="text-xs text-muted">
          Estimate uses a {dtiPct}% debt-to-income ceiling with typical tax,
          insurance, and PMI assumptions. A full pre-approval confirms real
          numbers.
        </p>
      </div>
    </div>
  );
}
