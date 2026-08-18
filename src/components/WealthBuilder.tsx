"use client";

import { useState } from "react";
import { Field } from "@/components/calculators/fields";
import { currency } from "@/lib/calc";
import { RentVsOwnCalculator } from "@/components/RentVsOwnCalculator";
import {
  analyzeProperty,
  projectRentalIncome,
  PROPERTY_DEFAULTS,
  type PropertyInput,
} from "@/lib/wealth";

const money0 = (n: number) => currency(Math.round(n));
function bigMoney(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${n < 0 ? "−" : ""}$${(a / 1_000_000).toFixed(2)}M`;
  if (a >= 1_000) return `${n < 0 ? "−" : ""}$${Math.round(a / 1000)}k`;
  return money0(n);
}

const TABS = [
  { id: "rent", label: "Rent vs. Own", icon: "⚖️" },
  { id: "invest", label: "Investment Properties", icon: "🏘️" },
  { id: "income", label: "Rental Income", icon: "💵" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function WealthBuilder() {
  const [tab, setTab] = useState<TabId>("rent");
  const [count, setCount] = useState(2);
  const [props, setProps] = useState<PropertyInput[]>(PROPERTY_DEFAULTS);
  const [active, setActive] = useState(0);

  // Rental income projection assumptions
  const [rentalPct, setRentalPct] = useState(10);
  const [rentInc, setRentInc] = useState(6);
  const [payroll, setPayroll] = useState(12500);
  const [payrollInc, setPayrollInc] = useState(5);
  const [projYears, setProjYears] = useState(25);

  const included = props.slice(0, count);
  const analyzed = included.map((p, idx) => ({
    label: `Property ${idx + 1}`,
    input: p,
    result: analyzeProperty(p),
  }));

  function setProp(idx: number, key: keyof PropertyInput) {
    return (v: number) =>
      setProps((s) => s.map((p, i) => (i === idx ? { ...p, [key]: v } : p)));
  }

  return (
    <div>
      {/* Top tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface p-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-white text-ink-900 shadow-sm" : "text-muted hover:text-ink-900"
            }`}
          >
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "rent" && <RentVsOwnCalculator />}

        {tab === "invest" && (
          <div>
            <p className="max-w-3xl text-muted">
              Buy a property with a modest down payment, hold it while it
              appreciates, and watch the equity build. Each property&apos;s equity
              can fund a HELOC to buy the next one — that&apos;s how a portfolio
              compounds. Configure up to three below.
            </p>

            {/* How many */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted">Properties:</span>
              {[1, 2, 3].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCount(c);
                    if (active >= c) setActive(0);
                  }}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    count === c ? "bg-crush-500 text-white" : "bg-surface-2 text-ink-700 hover:bg-surface"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Portfolio summary */}
            <PortfolioSummary analyzed={analyzed} />

            {/* Property selector */}
            {count > 1 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {analyzed.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                      active === i
                        ? "border-crush-400 bg-crush-50 text-crush-700"
                        : "border-border bg-white text-ink-700 hover:bg-surface-2"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            {analyzed[active] && (
              <PropertyPanel
                idx={active}
                input={analyzed[active].input}
                set={(k) => setProp(active, k)}
                result={analyzed[active].result}
              />
            )}
          </div>
        )}

        {tab === "income" && (
          <RentalIncomePanel
            analyzed={analyzed}
            rentalPct={rentalPct}
            setRentalPct={setRentalPct}
            rentInc={rentInc}
            setRentInc={setRentInc}
            payroll={payroll}
            setPayroll={setPayroll}
            payrollInc={payrollInc}
            setPayrollInc={setPayrollInc}
            projYears={projYears}
            setProjYears={setProjYears}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Portfolio summary ─────────────────────────── */
function PortfolioSummary({
  analyzed,
}: {
  analyzed: { label: string; result: ReturnType<typeof analyzeProperty> }[];
}) {
  const invested = analyzed.reduce((s, a) => s + a.result.totalInvestment, 0);
  const equity = analyzed.reduce((s, a) => s + a.result.atRental.equity, 0);
  const heloc = analyzed.reduce((s, a) => s + a.result.helocAvailable, 0);
  const withTax = analyzed.reduce((s, a) => s + a.result.returnWithTaxSavings, 0);
  const stats = [
    { label: "Total invested", value: money0(invested) },
    { label: "Equity at rental", value: bigMoney(equity) },
    { label: "Return incl. tax savings", value: bigMoney(withTax) },
    { label: "HELOC available (75% LTV)", value: bigMoney(heloc) },
  ];
  return (
    <div className="mt-6 grid gap-4 rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{s.label}</p>
          <p className="mt-1 text-2xl font-extrabold text-crush-600">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Property panel ────────────────────────────── */
function PropertyPanel({
  idx,
  input,
  set,
  result,
}: {
  idx: number;
  input: PropertyInput;
  set: (k: keyof PropertyInput) => (v: number) => void;
  result: ReturnType<typeof analyzeProperty>;
}) {
  const m = result.monthly;
  const r = result.atRental;
  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
      {/* Inputs */}
      <div className="rounded-3xl border border-border bg-white p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-crush-700">
          Property {idx + 1}
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Purchase price" value={input.purchasePrice} onChange={set("purchasePrice")} prefix="$" min={50000} max={5000000} step={5000} slider />
          </div>
          <Field label="Down payment" value={input.downPct} onChange={set("downPct")} suffix="%" min={0} max={50} step={0.5} slider help={money0(result.downPayment)} />
          <Field label="Interest rate" value={input.ratePct} onChange={set("ratePct")} suffix="%" min={1} max={12} step={0.125} slider />
          <Field label="Loan term" value={input.termYears} onChange={set("termYears")} suffix="yrs" min={10} max={30} step={5} />
          <Field label="Hold before renting" value={input.yearsUntilRental} onChange={set("yearsUntilRental")} suffix="yrs" min={1} max={30} step={1} slider />
          <Field label="Appreciation" value={input.appreciationPct} onChange={set("appreciationPct")} suffix="% / yr" min={0} max={12} step={0.25} />
          <Field label="Property tax" value={input.propertyTaxPct} onChange={set("propertyTaxPct")} suffix="% / yr" min={0} max={4} step={0.05} />
          <Field label="Insurance" value={input.insurancePct} onChange={set("insurancePct")} suffix="% / yr" min={0} max={2} step={0.01} />
          <Field label="Mortgage insurance" value={input.miPct} onChange={set("miPct")} suffix="% / yr" min={0} max={2} step={0.05} help={input.downPct >= 20 ? "Waived at 20%+" : undefined} />
          <Field label="HOA dues" value={input.hoaMonthly} onChange={set("hoaMonthly")} prefix="$" suffix="/ mo" min={0} step={20} />
          <Field label="HELOC used to buy" value={input.helocAmount} onChange={set("helocAmount")} prefix="$" min={0} step={5000} help="2nd trust deed from another property" />
          <Field label="HELOC rate" value={input.helocRatePct} onChange={set("helocRatePct")} suffix="%" min={0} max={15} step={0.25} />
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-7">
          <p className="text-sm font-medium text-ink-700">
            After {input.yearsUntilRental} years, this property builds
          </p>
          <p className="mt-1 text-4xl font-extrabold text-crush-600 sm:text-5xl">
            {bigMoney(r.equity)} in equity
          </p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            On {money0(result.totalInvestment)} invested — a{" "}
            <strong className="text-ink-800">{result.totalReturnPct.toFixed(1)}×</strong> return
            (about {(result.annualReturnPct * 100).toFixed(0)}%/yr), and{" "}
            <strong className="text-ink-800">{bigMoney(result.helocAvailable)}</strong> freed up
            for a HELOC to buy the next one.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Getting in</p>
            <dl className="mt-3 space-y-2 text-sm">
              <RowKV k="Down payment" v={money0(result.downPayment)} />
              <RowKV k="Closing costs" v={money0(result.closingCosts)} />
              <RowKV k="Total invested" v={money0(result.totalInvestment)} strong />
              <RowKV k="Loan amount" v={money0(result.loanAmount)} />
            </dl>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Monthly payment</p>
            <dl className="mt-3 space-y-2 text-sm">
              <RowKV k="Principal & interest" v={money0(m.principalInterest)} />
              <RowKV k="Taxes + insurance" v={money0(m.tax + m.insurance)} />
              {m.mortgageInsurance > 0 && <RowKV k="Mortgage insurance" v={money0(m.mortgageInsurance)} />}
              {m.hoa > 0 && <RowKV k="HOA" v={money0(m.hoa)} />}
              {m.helocPayment > 0 && <RowKV k="HELOC payment" v={money0(m.helocPayment)} />}
              <RowKV k="Total / month" v={money0(m.total)} strong />
            </dl>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            At year {input.yearsUntilRental} (time to rent it out)
          </p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <RowKV k="Estimated value" v={money0(r.estimatedValue)} />
            <RowKV k="Loan balance" v={money0(r.firstLoanBalance + r.helocBalance)} />
            <RowKV k="Equity" v={money0(r.equity)} strong />
            <RowKV k="Return incl. tax savings" v={money0(result.returnWithTaxSavings)} strong />
          </dl>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Rental income panel ───────────────────────── */
function RentalIncomePanel({
  analyzed,
  rentalPct,
  setRentalPct,
  rentInc,
  setRentInc,
  payroll,
  setPayroll,
  payrollInc,
  setPayrollInc,
  projYears,
  setProjYears,
}: {
  analyzed: { label: string; input: PropertyInput; result: ReturnType<typeof analyzeProperty> }[];
  rentalPct: number;
  setRentalPct: (n: number) => void;
  rentInc: number;
  setRentInc: (n: number) => void;
  payroll: number;
  setPayroll: (n: number) => void;
  payrollInc: number;
  setPayrollInc: (n: number) => void;
  projYears: number;
  setProjYears: (n: number) => void;
}) {
  const rows = projectRentalIncome({
    properties: analyzed,
    years: projYears,
    rentalIncomePctOfValue: rentalPct,
    rentIncreasePct: rentInc,
    monthlyPayroll: payroll,
    payrollIncreasePct: payrollInc,
  });
  const last = rows[rows.length - 1];
  const firstRentalYear = Math.min(...analyzed.map((a) => Math.round(a.input.yearsUntilRental)));

  // simple line chart of total monthly income
  const W = 640, H = 200, padL = 56, padB = 24, padT = 10, padR = 10;
  const maxV = Math.max(1, ...rows.map((r) => r.totalMonthlyIncome));
  const x = (yr: number) => padL + ((yr - 1) / Math.max(1, projYears - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - v / maxV) * (H - padT - padB);
  const line = rows.map((r) => `${x(r.year)},${y(r.totalMonthlyIncome)}`).join(" ");

  return (
    <div>
      <p className="max-w-3xl text-muted">
        Once each property has appreciated, converting it to a rental turns
        equity into monthly cash flow. This projects your rental income (net of
        the mortgage) plus your growing payroll income over time.
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-white p-5 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Rental income" value={rentalPct} onChange={setRentalPct} suffix="% of value/yr" min={2} max={20} step={0.5} />
        <Field label="Rent increase" value={rentInc} onChange={setRentInc} suffix="% / yr" min={0} max={12} step={0.5} />
        <Field label="Your income" value={payroll} onChange={setPayroll} prefix="$" suffix="/ mo" min={0} step={500} />
        <Field label="Income increase" value={payrollInc} onChange={setPayrollInc} suffix="% / yr" min={0} max={12} step={0.5} />
        <Field label="Project years" value={projYears} onChange={setProjYears} suffix="yrs" min={5} max={30} step={1} />
      </div>

      <div className="mt-6 rounded-3xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-7">
        <p className="text-sm font-medium text-ink-700">
          By year {projYears}, your rentals + income could generate
        </p>
        <p className="mt-1 text-4xl font-extrabold text-crush-600 sm:text-5xl">
          {money0(last.totalMonthlyIncome)}/mo
        </p>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Including <strong className="text-ink-800">{money0(last.netRentalIncome)}/mo</strong> net
          rental cash flow. First rental comes online around year {firstRentalYear}.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Total monthly income over time</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label="Income over time">
          {Array.from({ length: 5 }).map((_, i) => {
            const v = (maxV / 4) * i;
            const yy = y(v);
            return (
              <g key={i}>
                <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="#eee" />
                <text x={padL - 8} y={yy + 3} textAnchor="end" fontSize="10" fill="#999">{bigMoney(v)}</text>
              </g>
            );
          })}
          <polyline points={line} fill="none" stroke="#e62c2c" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {rows.map((r) =>
            r.year === 1 || r.year % 5 === 0 || r.year === projYears ? (
              <text key={r.year} x={x(r.year)} y={H - padB + 15} textAnchor="middle" fontSize="10" fill="#999">Yr {r.year}</text>
            ) : null,
          )}
        </svg>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase text-muted">
              <th className="px-3 py-2 font-semibold">Year</th>
              <th className="px-3 py-2 text-right font-semibold">Rental income/mo</th>
              <th className="px-3 py-2 text-right font-semibold">Mortgages/mo</th>
              <th className="px-3 py-2 text-right font-semibold">Net rental/mo</th>
              <th className="px-3 py-2 text-right font-semibold">Your income/mo</th>
              <th className="px-3 py-2 text-right font-semibold">Total/mo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2 font-medium text-ink-900">{r.year}</td>
                <td className="px-3 py-2 text-right text-ink-700">{money0(r.rentalIncome)}</td>
                <td className="px-3 py-2 text-right text-ink-700">{money0(r.mortgagePayments)}</td>
                <td className="px-3 py-2 text-right text-ink-700">{money0(r.netRentalIncome)}</td>
                <td className="px-3 py-2 text-right text-ink-700">{money0(r.payrollIncome)}</td>
                <td className="px-3 py-2 text-right font-semibold text-crush-700">{money0(r.totalMonthlyIncome)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowKV({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "border-t border-border pt-1.5" : ""}`}>
      <dt className={strong ? "font-semibold text-ink-900" : "text-muted"}>{k}</dt>
      <dd className={strong ? "font-bold text-ink-900" : "font-medium text-ink-800"}>{v}</dd>
    </div>
  );
}
