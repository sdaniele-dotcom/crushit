/**
 * California single-family median home-price appreciation, from the C.A.R.
 * (California Association of REALTORS®) 2026 Annual Historical Data Summary —
 * the complete 1968–2025 California Existing Single-Family Home series.
 * Annualized figures are CAGR (compound annual growth) ending in 2025.
 */

export const CA_MEDIAN_2025 = 875550;

export type AppreciationRow = {
  period: string;
  startYear: number;
  startMedian: number;
  annualizedPct: number; // CAGR to 2025
};

export const CA_APPRECIATION: AppreciationRow[] = [
  { period: "5 Years", startYear: 2020, startMedian: 659380, annualizedPct: 5.83 },
  { period: "10 Years", startYear: 2015, startMedian: 476320, annualizedPct: 6.28 },
  { period: "15 Years", startYear: 2010, startMedian: 305010, annualizedPct: 7.28 },
  { period: "20 Years", startYear: 2005, startMedian: 522670, annualizedPct: 2.61 },
  { period: "25 Years", startYear: 2000, startMedian: 241350, annualizedPct: 5.29 },
  { period: "30 Years", startYear: 1995, startMedian: 178160, annualizedPct: 5.45 },
  { period: "35 Years", startYear: 1990, startMedian: 193770, annualizedPct: 4.4 },
  { period: "40 Years", startYear: 1985, startMedian: 119860, annualizedPct: 5.1 },
  { period: "45 Years", startYear: 1980, startMedian: 99550, annualizedPct: 4.95 },
  { period: "50 Years", startYear: 1975, startMedian: 41600, annualizedPct: 6.28 },
  { period: "55 Years", startYear: 1970, startMedian: 24640, annualizedPct: 6.71 },
  { period: "1968–2025 · 57 Years", startYear: 1968, startMedian: 23210, annualizedPct: 6.58 },
];

/** Headline for the full 1968→2025 span. */
export const CA_HEADLINE = {
  startYear: 1968,
  startMedian: 23210,
  endYear: 2025,
  endMedian: CA_MEDIAN_2025,
  increasePct: 3672, // (end/start − 1)
  multiple: 37.7, // end / start
  annualizedPct: 6.58, // CAGR
};
