"use client";

import { useState } from "react";
import { Field, ResultCard, Row } from "./fields";
import { currency, monthlyPI } from "@/lib/calc";
import { openBrandedPdf } from "@/lib/pdf";

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

  function savePdf() {
    openBrandedPdf({
      title: "Refinance Analysis",
      heroLabel: monthlySavings >= 0 ? "Estimated monthly savings" : "Monthly increase",
      heroValue: currency(Math.abs(monthlySavings)),
      heroSub: Number.isFinite(breakEven)
        ? `Break even in ${breakEven.toFixed(1)} months`
        : undefined,
      sections: [
        {
          heading: "Current loan",
          rows: [
            { label: "Loan balance", value: currency(balance) },
            { label: "Current rate", value: `${currentRate}%` },
            { label: "Years left", value: `${currentYearsLeft} years` },
            { label: "Current payment (P&amp;I)", value: currency(oldPayment) },
          ],
        },
        {
          heading: "New loan",
          rows: [
            { label: "New rate", value: `${newRate}%` },
            { label: "New term", value: `${newTerm} years` },
            { label: "Estimated closing costs", value: currency(closingCosts) },
            { label: "New payment (P&amp;I)", value: currency(newPayment) },
            {
              label: "Monthly difference",
              value: `${monthlySavings >= 0 ? "−" : "+"}${currency(Math.abs(monthlySavings))}`,
            },
            {
              label: "Break-even point",
              value: Number.isFinite(breakEven) ? `${breakEven.toFixed(1)} months` : "—",
              strong: true,
            },
          ],
        },
      ],
      disclaimer:
        "Compares principal & interest only and is an estimate for educational purposes — not a commitment to lend or a rate quote. A full refinance analysis factors in escrow, cash-out, taxes, and how long you plan to stay. Contact " +
        "Crush Mortgage for personalized numbers. Equal Housing Opportunity.",
    });
  }

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
          Compares principal & interest only. A full refinance analysis factors
          in escrow, cash-out, and how long the borrower plans to stay.
        </p>
      </div>
    </div>
  );
}
