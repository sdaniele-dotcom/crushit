import { site } from "@/lib/site";

/**
 * The licensing line every consumer page carries.
 *
 * A mortgage site states who is lending, under what licence, and that it is
 * an equal housing lender — on every page, not only the one with the form.
 * Putting it in a component rather than in each page's footer copy is what
 * stops it drifting out of date in five places at once.
 *
 * `site.company` and not `site.brand`: this names the LICENSED ENTITY. See
 * the header of lib/site.ts.
 */
export function TrustStrip({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      {site.loanOfficer}, {site.title} · NMLS #{site.nmls} · Loans offered through{" "}
      {site.company} · Company NMLS #{site.companyNmls} · Equal Housing Opportunity.
      This is not a commitment to lend. Rates and programs are subject to change and to
      credit approval.
    </p>
  );
}

/**
 * The short version, for a dark band.
 *
 * Same facts, fewer words, because a dark CTA block is read at a glance and a
 * four-line disclosure there just gets skipped — which defeats the point of
 * putting it in front of somebody.
 */
export function TrustStripCompact({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-slate-500 ${className}`}>
      {site.company} · NMLS #{site.companyNmls} · Equal Housing Opportunity · Not a
      commitment to lend
    </p>
  );
}
