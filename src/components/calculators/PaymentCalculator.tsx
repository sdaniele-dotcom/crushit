"use client";

import { useState } from "react";
import { Field, ResultCard, Row, StackBar } from "./fields";
import { currency, purchaseBreakdown } from "@/lib/calc";

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
      </div>
    </div>
  );
}
