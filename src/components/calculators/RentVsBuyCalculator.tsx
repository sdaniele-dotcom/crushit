"use client";

import { useState } from "react";
import { Field, ResultCard, Row } from "./fields";
import { currency, purchaseBreakdown } from "@/lib/calc";

export function RentVsBuyCalculator() {
  const [rent, setRent] = useState(2600);
  const [rentGrowthPct, setRentGrowthPct] = useState(4);
  const [price, setPrice] = useState(450000);
  const [downPct, setDownPct] = useState(10);
  const [ratePct, setRatePct] = useState(6.5);
  const [apprecPct, setApprecPct] = useState(3.5);
  const [years, setYears] = useState(7);

  const b = purchaseBreakdown({
    price,
    downPct,
    ratePct,
    years: 30,
    taxRatePct: 1.1,
    insuranceYr: 1800,
    hoaMonth: 0,
    pmiRatePct: 0.6,
  });

  // Simple horizon model
  const months = years * 12;

  // Total rent paid over horizon with annual growth
  let totalRent = 0;
  let r = rent;
  for (let y = 0; y < years; y++) {
    totalRent += r * 12;
    r *= 1 + rentGrowthPct / 100;
  }

  // Owning: down + total monthly outlay over horizon
  const totalOwnPayments = b.total * months;
  const totalOwnOutlay = b.down + totalOwnPayments;

  // Rough equity at horizon: appreciation + principal paid down
  const futureValue = price * Math.pow(1 + apprecPct / 100, years);
  const r_m = ratePct / 100 / 12;
  // remaining balance after `months` payments on the P&I portion
  const nTotal = 30 * 12;
  const balance =
    r_m === 0
      ? b.loan * (1 - months / nTotal)
      : b.loan *
        ((Math.pow(1 + r_m, nTotal) - Math.pow(1 + r_m, months)) /
          (Math.pow(1 + r_m, nTotal) - 1));
  const sellingCosts = futureValue * 0.07; // ~7% to sell
  const equity = futureValue - balance - sellingCosts;

  // Net cost of owning = money out - equity recovered on sale
  const netOwnCost = totalOwnOutlay - equity;
  const buyingWins = netOwnCost < totalRent;
  const advantage = Math.abs(totalRent - netOwnCost);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Current monthly rent"
          value={rent}
          onChange={setRent}
          prefix="$"
          min={500}
          max={10000}
          step={50}
          slider
        />
        <Field
          label="Annual rent increase"
          value={rentGrowthPct}
          onChange={setRentGrowthPct}
          suffix="%"
          min={0}
          max={10}
          step={0.5}
          slider
        />
        <Field
          label="Home price"
          value={price}
          onChange={setPrice}
          prefix="$"
          min={100000}
          max={2000000}
          step={5000}
          slider
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
          label="Home appreciation"
          value={apprecPct}
          onChange={setApprecPct}
          suffix="% / yr"
          min={0}
          max={8}
          step={0.5}
          slider
        />
        <div className="sm:col-span-2">
          <Field
            label="How long they'll stay"
            value={years}
            onChange={setYears}
            suffix="yrs"
            min={1}
            max={15}
            step={1}
            slider
          />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <ResultCard
          label={`After ${years} year${years > 1 ? "s" : ""}`}
          value={buyingWins ? "Buying wins" : "Renting wins"}
          sub={`by about ${currency(advantage)}`}
        />
        <div className="rounded-2xl border border-border bg-white p-6">
          <Row label="Total rent paid" value={currency(totalRent)} />
          <Row label="Total spent owning" value={currency(totalOwnOutlay)} />
          <Row label="Est. home value at sale" value={currency(futureValue)} />
          <Row label="Equity recovered" value={currency(equity)} accent />
          <Row label="Net cost of owning" value={currency(netOwnCost)} strong />
        </div>
        <p className="text-xs text-muted">
          A simplified comparison including ~7% selling costs. It ignores
          maintenance and tax deductions, so treat it as a directional guide for
          the conversation — not financial advice.
        </p>
      </div>
    </div>
  );
}
