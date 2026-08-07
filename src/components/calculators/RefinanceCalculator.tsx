"use client";

import { useState } from "react";
import { Field, ResultCard, Row } from "./fields";
import { currency, monthlyPI } from "@/lib/calc";

export function RefinanceCalculator() {
  const [balance, setBalance] = useState(360000);
  const [currentRate, setCurrentRate] = useState(7.25);
  const [currentYearsLeft, setCurrentYearsLeft] = useState(27);
  const [newRate, setNewRate] = useState(6.0);
  const [newTerm, setNewTerm] = useState(30);
  const [closingCosts, setClosingCosts] = useState(6000);

  const oldPayment = monthlyPI(balance, currentRate, currentYearsLeft);
  const newPayment = monthlyPI(balance, newRate, newTerm);
  const monthlySavings = oldPayment - newPayment;
  const breakEven =
    monthlySavings > 0 ? closingCosts / monthlySavings : Infinity;
  const worthIt = monthlySavings > 0 && breakEven <= newTerm * 12;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="Current loan balance"
            value={balance}
            onChange={setBalance}
            prefix="$"
            min={50000}
            max={2000000}
            step={5000}
            slider
          />
        </div>
        <Field
          label="Current rate"
          value={currentRate}
          onChange={setCurrentRate}
          suffix="%"
          min={2}
          max={12}
          step={0.125}
          slider
        />
        <Field
          label="Years left on loan"
          value={currentYearsLeft}
          onChange={setCurrentYearsLeft}
          suffix="yrs"
          min={1}
          max={30}
          step={1}
          slider
        />
        <Field
          label="New rate"
          value={newRate}
          onChange={setNewRate}
          suffix="%"
          min={2}
          max={12}
          step={0.125}
          slider
        />
        <Field
          label="New loan term"
          value={newTerm}
          onChange={setNewTerm}
          suffix="yrs"
          min={10}
          max={30}
          step={5}
          slider
        />
        <div className="sm:col-span-2">
          <Field
            label="Estimated closing costs"
            value={closingCosts}
            onChange={setClosingCosts}
            prefix="$"
            min={0}
            max={30000}
            step={500}
            slider
          />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <ResultCard
          label={monthlySavings >= 0 ? "Monthly savings" : "Monthly increase"}
          value={currency(Math.abs(monthlySavings))}
          sub={
            worthIt
              ? `Break even in ${breakEven.toFixed(1)} months`
              : monthlySavings > 0
                ? "Break-even is longer than the new term"
                : "New payment is higher — but term may be shorter"
          }
        />
        <div className="rounded-2xl border border-border bg-white p-6">
          <Row label="Current payment (P&I)" value={currency(oldPayment)} />
          <Row label="New payment (P&I)" value={currency(newPayment)} />
          <Row
            label="Monthly difference"
            value={`${monthlySavings >= 0 ? "−" : "+"}${currency(Math.abs(monthlySavings))}`}
            accent
          />
          <Row
            label="Break-even point"
            value={
              Number.isFinite(breakEven)
                ? `${breakEven.toFixed(1)} months`
                : "—"
            }
            strong
          />
        </div>
        <p className="text-xs text-muted">
          Compares principal & interest only. A full refinance analysis factors
          in escrow, cash-out, and how long the borrower plans to stay.
        </p>
      </div>
    </div>
  );
}
