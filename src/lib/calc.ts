/** Pure mortgage math helpers — no UI, easy to test. */

/** Fixed monthly principal + interest payment. */
export function monthlyPI(
  principal: number,
  annualRatePct: number,
  years: number
): number {
  if (principal <= 0 || years <= 0) return 0;
  const n = years * 12;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export const currency = (n: number, digits = 0) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

/** Crush Mortgage default estimating assumptions (annual, as % of home price). */
export const DEFAULT_TAX_RATE_PCT = 1.25;
export const DEFAULT_INSURANCE_RATE_PCT = 0.25;
export const DEFAULT_PMI_RATE_PCT = 0.6;

/** Full monthly payment breakdown for a purchase. */
export function purchaseBreakdown(opts: {
  price: number;
  downPct: number;
  ratePct: number;
  years: number;
  taxRatePct: number; // annual property tax as % of price
  insuranceRatePct: number; // annual homeowners insurance as % of price
  hoaMonth: number; // monthly HOA $
  pmiRatePct: number; // annual PMI as % of loan (applies if down < 20%)
}) {
  const down = opts.price * (opts.downPct / 100);
  const loan = opts.price - down;
  const pi = monthlyPI(loan, opts.ratePct, opts.years);
  const tax = (opts.price * (opts.taxRatePct / 100)) / 12;
  const insurance = (opts.price * (opts.insuranceRatePct / 100)) / 12;
  const pmi =
    opts.downPct < 20 ? (loan * (opts.pmiRatePct / 100)) / 12 : 0;
  const hoa = opts.hoaMonth;
  const total = pi + tax + insurance + pmi + hoa;
  return { down, loan, pi, tax, insurance, pmi, hoa, total };
}

/**
 * Maximum affordable home price from a target monthly payment,
 * solved by binary search over price (handles tax/insurance/PMI coupling).
 */
export function affordablePrice(opts: {
  monthlyBudget: number;
  downPct: number;
  ratePct: number;
  years: number;
  taxRatePct: number;
  insuranceRatePct: number;
  hoaMonth: number;
  pmiRatePct: number;
}): number {
  let lo = 0;
  let hi = 5_000_000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const { total } = purchaseBreakdown({ ...opts, price: mid });
    if (total > opts.monthlyBudget) hi = mid;
    else lo = mid;
  }
  return lo;
}

/** Payment from a monthly budget & standard DTI, as a sanity helper. */
export function budgetFromIncome(monthlyIncome: number, dtiPct: number) {
  return monthlyIncome * (dtiPct / 100);
}
