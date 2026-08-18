/**
 * rentVsOwn.ts — Rent vs. Own model, ported from the Crush Mortgage
 * "Starter House / Rent vs Buy" spreadsheet. Pure functions, no UI.
 *
 * The headline the sheet produces is "money lost by renting": over N years,
 * renting costs you (a) the accumulated amount rent runs above your net
 * (after-tax) mortgage payment, plus (b) the home equity you would have built.
 * Owning's advantage = that accumulated rent surplus + your equity.
 */

export type RentVsOwnInputs = {
  purchasePrice: number;
  downPct: number; // % of price
  ratePct: number; // annual interest %
  termYears: number;
  currentRent: number; // today's monthly rent
  appreciationPct: number; // annual home appreciation %
  rentIncreasePct: number; // annual rent increase %
  propertyTaxPct: number; // annual, % of price
  insurancePct: number; // annual homeowners insurance, % of price
  pmiPct: number; // annual PMI, % of loan (applies if down < 20%)
  hoaMonthly: number;
  incomeTaxPct: number; // marginal income tax rate, for the mortgage/tax deduction
  closingCosts: number; // estimated cash closing costs
  horizonYears: number; // comparison window
};

export type RentVsOwnYear = {
  year: number;
  rentMonthly: number;
  netMortgageMonthly: number;
  annualRentSurplus: number; // (rent − net mortgage) × 12 for the year
  cumRentSurplus: number; // running total
  homeValue: number;
  loanBalance: number;
  equity: number;
  ownAdvantage: number; // cumRentSurplus + equity
};

export type RentVsOwnResult = {
  loanAmount: number;
  downPayment: number;
  cashToClose: number;
  monthly: {
    principalInterest: number;
    pmi: number;
    tax: number;
    insurance: number;
    hoa: number;
    totalHousing: number;
    taxSavings: number;
    netMortgage: number; // total housing − monthly tax savings
  };
  firstYearRentMonthly: number;
  rows: RentVsOwnYear[];
  summary: {
    horizonYears: number;
    ownAdvantage: number; // how much better off owning is at the horizon
    equity: number;
    cumRentSurplus: number;
    homeValue: number;
    totalRentPaid: number; // total rent paid over the horizon
    monthlyRentAtHorizon: number;
  };
};

/** Standard fixed monthly principal + interest (PMT). */
function pmt(principal: number, monthlyRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

/** Remaining loan balance after `elapsed` months (closed-form amortization). */
function remainingBalance(
  principal: number,
  monthlyRate: number,
  months: number,
  elapsed: number,
): number {
  if (principal <= 0) return 0;
  const p = Math.min(elapsed, months);
  if (monthlyRate === 0) return principal * (1 - p / months);
  const factor = Math.pow(1 + monthlyRate, months);
  const bal =
    (principal * (factor - Math.pow(1 + monthlyRate, p))) / (factor - 1);
  return Math.max(0, bal);
}

export function rentVsOwn(input: RentVsOwnInputs): RentVsOwnResult {
  const price = Math.max(0, input.purchasePrice);
  const downPct = Math.max(0, input.downPct);
  const i = input.ratePct / 100 / 12;
  const n = Math.max(1, Math.round(input.termYears * 12));

  const downPayment = price * (downPct / 100);
  const loanAmount = price - downPayment;
  const financed = loanAmount;

  const principalInterest = pmt(financed, i, n);
  const pmi =
    downPct >= 20 ? 0 : (financed * (input.pmiPct / 100)) / 12;
  const tax = (price * (input.propertyTaxPct / 100)) / 12;
  const insurance = (price * (input.insurancePct / 100)) / 12;
  const hoa = Math.max(0, input.hoaMonthly);
  const totalHousing = principalInterest + pmi + tax + insurance + hoa;

  // Monthly tax savings from the mortgage-interest + property-tax deduction
  // (first-month interest approximation, matching the sheet).
  const interestPerMonth = financed * i;
  const taxDeductible = interestPerMonth + tax;
  const taxSavings = taxDeductible * (input.incomeTaxPct / 100);
  const netMortgage = totalHousing - taxSavings;

  const horizon = Math.max(1, Math.round(input.horizonYears));
  const appr = input.appreciationPct / 100;
  const rentInc = input.rentIncreasePct / 100;

  const rows: RentVsOwnYear[] = [];
  let cumRentSurplus = 0;
  let totalRentPaid = 0;
  for (let y = 1; y <= horizon; y++) {
    const rentMonthly = input.currentRent * Math.pow(1 + rentInc, y - 1);
    const annualRentSurplus = (rentMonthly - netMortgage) * 12;
    cumRentSurplus += annualRentSurplus;
    totalRentPaid += rentMonthly * 12;
    const homeValue = price * Math.pow(1 + appr, y);
    // Matches the spreadsheet's IPMT(...)/i, i.e. the balance at the start of
    // month y*12 (after y*12 − 1 payments).
    const loanBalance = remainingBalance(financed, i, n, y * 12 - 1);
    const equity = homeValue - loanBalance;
    rows.push({
      year: y,
      rentMonthly,
      netMortgageMonthly: netMortgage,
      annualRentSurplus,
      cumRentSurplus,
      homeValue,
      loanBalance,
      equity,
      ownAdvantage: cumRentSurplus + equity,
    });
  }

  const last = rows[rows.length - 1];
  return {
    loanAmount,
    downPayment,
    cashToClose: downPayment + Math.max(0, input.closingCosts),
    monthly: {
      principalInterest,
      pmi,
      tax,
      insurance,
      hoa,
      totalHousing,
      taxSavings,
      netMortgage,
    },
    firstYearRentMonthly: input.currentRent,
    rows,
    summary: {
      horizonYears: horizon,
      ownAdvantage: last.ownAdvantage,
      equity: last.equity,
      cumRentSurplus: last.cumRentSurplus,
      homeValue: last.homeValue,
      totalRentPaid,
      monthlyRentAtHorizon: last.rentMonthly,
    },
  };
}

/** Sensible defaults, taken from the spreadsheet's example scenario. */
export const RENT_VS_OWN_DEFAULTS: RentVsOwnInputs = {
  purchasePrice: 600000,
  downPct: 5,
  ratePct: 6.5,
  termYears: 30,
  currentRent: 4000,
  appreciationPct: 5,
  rentIncreasePct: 5,
  propertyTaxPct: 1.25,
  insurancePct: 0.199,
  pmiPct: 0.2,
  hoaMonthly: 0,
  incomeTaxPct: 35,
  closingCosts: 8000,
  horizonYears: 10,
};
