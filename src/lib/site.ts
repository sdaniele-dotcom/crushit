/**
 * CRUSH IT — Realtors Suite
 * Central configuration.
 *
 * ▶ TO CUSTOMIZE: replace every value marked with `[PLACEHOLDER]`
 *   with your real Crush Mortgage / loan-officer details.
 *   Everything on the site reads from this one file.
 */

export const site = {
  brand: "CRUSH IT",
  tagline: "The Realtors Suite by Crush Mortgage",
  shortDescription:
    "A complete toolkit of calculators, loan guides, and co-marketing resources built to help realtors win more clients and close more deals.",

  // ─── Loan officer / company details — REPLACE THESE ───────────────
  company: "Crush Mortgage",
  loanOfficer: "[LOAN OFFICER NAME]",
  title: "Mortgage Loan Officer",
  nmls: "[NMLS #]",
  companyNmls: "[COMPANY NMLS #]",
  phone: "[555-000-0000]",
  email: "[loans@crushmortgage.com]",
  website: "[https://crushmortgage.com]",
  address: "[123 Main St, Suite 100, Your City, ST 00000]",

  // Optional: where the contact / pre-approval form should submit.
  // Drop in a Formspree ID, Getform URL, or your own endpoint.
  formEndpoint: "" as string, // e.g. "https://formspree.io/f/xxxxxxx"

  social: {
    facebook: "[https://facebook.com/...]",
    instagram: "[https://instagram.com/...]",
    linkedin: "[https://linkedin.com/in/...]",
  },
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Calculators", href: "/calculators" },
  { label: "Loan Programs", href: "/loan-programs" },
  { label: "Resources", href: "/resources" },
  { label: "Co-Marketing", href: "/co-marketing" },
  { label: "Contact", href: "/contact" },
];
