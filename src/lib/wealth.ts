/**
 * wealth.ts — Real-estate wealth-building model, ported from the Crush Mortgage
 * "Property 1/2/3" and "Future Income" spreadsheet tabs. Pure functions.
 *
 * Each property is: buy with a down payment (+ optional HELOC/2nd trust deed),
 * hold while it appreciates, then look at the equity, return on investment,
 * tax savings, and how much equity is freed up for a HELOC (to buy the next
 * one). `projectRentalIncome` turns the portfolio into a rental cash-flow
 * timeline once each property converts to a rental.
 */

export type PropertyInput = {
  purchasePrice: number;
  downPct: number;
  ratePct: number; // 1st trust deed interest
  termYears: number;
  appreciationPct: number; // annual
  yearsUntilRental: number; // hold period before it becomes a rental
  propertyTaxPct: number; // annual, % of price
  insurancePct: number; // annual homeowners insurance, % of price
  miPct: number; // annual mortgage insurance, % of loan (0 when 20%+ down)
  hoaMonthly: number;
  titleInsPct: number; // title insurance, % of loan (closing cost)
  incomeTaxPct: number; // for the interest + property-tax deduction
  helocAmount: number; // 2nd trust deed used to help buy this one
  helocRatePct: number;
  flatFees: number; // fixed closing fees (processing, appraisal, escrow, etc.)
};

export type PropertyResult = {
  downPayment: number;
  closingCosts: number;
  totalInvestment: number;
  loanAmount: number;
  monthly: {
    principalInterest: number;
    mortgageInsurance: number;
    tax: number;
    insurance: number;
    hoa: number;
    piti: number;
    helocPayment: number;
    total: number;
  };
  atRental: {
    estimatedValue: number;
    firstLoanBalance: number;
    helocBalance: number;
    equity: number;
  };
  totalReturn: number;
  totalReturnPct: number; // e.g. 47.45 = 4745%
  annualReturnPct: number;
  taxSavings: number;
  returnWithTaxSavings: number;
  ltvAtRental: number;
  helocAvailable: number; // up to 75% LTV
};

function pmt(P: number, i: number, n: number): number {
  if (P <= 0 || n <= 0) return 0;
  if (i === 0) return P / n;
  return (P * i) / (1 - Math.pow(1 + i, -n));
}

/** Balance at the START of month `elapsed` (the sheet's IPMT(...)/i convention). */
function balanceAtStart(P: number, i: number, n: number, elapsed: number): number {
  if (P <= 0) return 0;
  const p = Math.min(Math.max(0, elapsed - 1), n);
  if (i === 0) return Math.max(0, P * (1 - p / n));
  const f = Math.pow(1 + i, n);
  return Math.max(0, (P * (f - Math.pow(1 + i, p))) / (f - 1));
}

export function analyzeProperty(input: PropertyInput): PropertyResult {
  const price = Math.max(0, input.purchasePrice);
  const downPct = Math.max(0, input.downPct);
  const i = input.ratePct / 100 / 12;
  const n = Math.max(1, Math.round(input.termYears * 12));
  const years = Math.max(0, input.yearsUntilRental);

  const downPayment = price * (downPct / 100);
  const loanAmount = price - downPayment;
  const monthlyTax = (price * (input.propertyTaxPct / 100)) / 12;
  const monthlyIns = (price * (input.insurancePct / 100)) / 12;

  // Closing costs (matches the sheet's itemized total).
  const prepaidTax = (input.propertyTaxPct / 100) * price * 0.5; // 6 months
  const prepaidInterest = (15 * (input.ratePct / 100) * loanAmount) / 360;
  const titleInsurance = (input.titleInsPct / 100) * loanAmount;
  const hoInsuranceYr = (input.insurancePct / 100) * price;
  const impoundTax = 2 * monthlyTax;
  const impoundIns = 2 * monthlyIns;
  const closingCosts =
    Math.max(0, input.flatFees) +
    prepaidTax +
    prepaidInterest +
    titleInsurance +
    hoInsuranceYr +
    impoundTax +
    impoundIns;

  const totalInvestment = downPayment + closingCosts;

  const principalInterest = pmt(loanAmount, i, n);
  const mortgageInsurance =
    downPct >= 20 ? 0 : (loanAmount * (input.miPct / 100)) / 12;
  const hoa = Math.max(0, input.hoaMonthly);
  const piti = principalInterest + mortgageInsurance + monthlyTax + monthlyIns + hoa;
  const helocPayment =
    (Math.max(0, input.helocAmount) * (input.helocRatePct / 100)) / 12;
  const totalMonthly = piti + helocPayment;

  const estimatedValue = price * Math.pow(1 + input.appreciationPct / 100, years);
  const firstLoanBalance = balanceAtStart(loanAmount, i, n, years * 12);
  const helocBalance = balanceAtStart(
    Math.max(0, input.helocAmount),
    input.helocRatePct / 100 / 12,
    n,
    years * 12,
  );
  const equity = estimatedValue - firstLoanBalance - helocBalance;

  const totalReturn = equity - totalInvestment;
  const totalReturnPct = totalInvestment > 0 ? totalReturn / totalInvestment : 0;
  const annualReturnPct = years > 0 ? totalReturnPct / years : totalReturnPct;

  // Tax savings from interest + property tax deducted over the hold.
  const interestPaid = principalInterest * 12 * years - loanAmount + firstLoanBalance;
  const reTaxesPaid = monthlyTax * 12 * years;
  const taxSavings = (interestPaid + reTaxesPaid) * (input.incomeTaxPct / 100);
  const returnWithTaxSavings = totalReturn + taxSavings;

  const ltvAtRental = estimatedValue > 0 ? firstLoanBalance / estimatedValue : 0;
  const helocAvailable = Math.max(0, estimatedValue * (0.75 - ltvAtRental));

  return {
    downPayment,
    closingCosts,
    totalInvestment,
    loanAmount,
    monthly: {
      principalInterest,
      mortgageInsurance,
      tax: monthlyTax,
      insurance: monthlyIns,
      hoa,
      piti,
      helocPayment,
      total: totalMonthly,
    },
    atRental: {
      estimatedValue,
      firstLoanBalance,
      helocBalance,
      equity,
    },
    totalReturn,
    totalReturnPct,
    annualReturnPct,
    taxSavings,
    returnWithTaxSavings,
    ltvAtRental,
    helocAvailable,
  };
}

/** A property's monthly total payment while held (for rental cash flow). */
export type RentalProperty = {
  label: string;
  result: PropertyResult;
  input: PropertyInput;
};

export type PortfolioYear = {
  year: number;
  rentalIncome: number; // total monthly rental income across active rentals
  mortgagePayments: number;
  netRentalIncome: number;
  payrollIncome: number;
  totalMonthlyIncome: number;
};

/** Project monthly income over time as each property converts to a rental. */
export function projectRentalIncome(opts: {
  properties: RentalProperty[];
  years: number;
  rentalIncomePctOfValue: number; // annual, e.g. 10
  rentIncreasePct: number; // annual
  monthlyPayroll: number;
  payrollIncreasePct: number; // annual
}): PortfolioYear[] {
  const rows: PortfolioYear[] = [];
  for (let y = 1; y <= Math.max(1, Math.round(opts.years)); y++) {
    let rentalIncome = 0;
    let mortgage = 0;
    for (const p of opts.properties) {
      const start = Math.max(1, Math.round(p.input.yearsUntilRental));
      if (y >= start) {
        // Rent starts at (rental-income % of value-at-rental)/12, then grows.
        const base =
          (p.result.atRental.estimatedValue *
            (opts.rentalIncomePctOfValue / 100)) /
          12;
        rentalIncome += base * Math.pow(1 + opts.rentIncreasePct / 100, y - start);
        mortgage += p.result.monthly.total;
      }
    }
    const payrollIncome =
      opts.monthlyPayroll * Math.pow(1 + opts.payrollIncreasePct / 100, y - 1);
    const netRentalIncome = rentalIncome - mortgage;
    rows.push({
      year: y,
      rentalIncome,
      mortgagePayments: mortgage,
      netRentalIncome,
      payrollIncome,
      totalMonthlyIncome: netRentalIncome + payrollIncome,
    });
  }
  return rows;
}

export const PROPERTY_DEFAULTS: PropertyInput[] = [
  {
    purchasePrice: 550000,
    downPct: 3,
    ratePct: 4.5,
    termYears: 30,
    appreciationPct: 5,
    yearsUntilRental: 21,
    propertyTaxPct: 1.25,
    insurancePct: 0.1,
    miPct: 0.85,
    hoaMonthly: 220,
    titleInsPct: 0.13,
    incomeTaxPct: 35,
    helocAmount: 0,
    helocRatePct: 10,
    flatFees: 3225,
  },
  {
    purchasePrice: 750000,
    downPct: 5,
    ratePct: 5.5,
    termYears: 30,
    appreciationPct: 5,
    yearsUntilRental: 14,
    propertyTaxPct: 1.1,
    insurancePct: 0.25,
    miPct: 1.35,
    hoaMonthly: 0,
    titleInsPct: 0.13,
    incomeTaxPct: 35,
    helocAmount: 75000,
    helocRatePct: 10,
    flatFees: 2575,
  },
  {
    purchasePrice: 900000,
    downPct: 20,
    ratePct: 4.5,
    termYears: 30,
    appreciationPct: 5,
    yearsUntilRental: 7,
    propertyTaxPct: 1.1,
    insurancePct: 0.25,
    miPct: 0,
    hoaMonthly: 280,
    titleInsPct: 0.13,
    incomeTaxPct: 35,
    helocAmount: 80000,
    helocRatePct: 8,
    flatFees: 2575,
  },
];
