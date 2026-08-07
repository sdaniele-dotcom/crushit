"use client";

import { useState } from "react";
import { PaymentCalculator } from "./PaymentCalculator";
import { AffordabilityCalculator } from "./AffordabilityCalculator";
import { RentVsBuyCalculator } from "./RentVsBuyCalculator";
import { RefinanceCalculator } from "./RefinanceCalculator";

const tabs = [
  { id: "payment", label: "Monthly Payment", icon: "🏠", C: PaymentCalculator },
  { id: "afford", label: "Affordability", icon: "💰", C: AffordabilityCalculator },
  { id: "rentbuy", label: "Rent vs. Buy", icon: "⚖️", C: RentVsBuyCalculator },
  { id: "refi", label: "Refinance", icon: "🔁", C: RefinanceCalculator },
] as const;

export function CalculatorTabs() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("payment");
  const Active = tabs.find((t) => t.id === active)!.C;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Calculators"
        className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface p-2"
      >
        {tabs.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(t.id)}
              className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                selected
                  ? "bg-white text-ink-900 shadow-sm"
                  : "text-muted hover:text-ink-900"
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <Active />
      </div>
    </div>
  );
}
