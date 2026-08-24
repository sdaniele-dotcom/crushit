/**
 * Centralized print/PDF branding (spec §10). One place that builds the two
 * branding blocks every printable shares, so the hierarchy is always:
 *   TOP  = Realtor / their brokerage  (primary)
 *   BOTTOM = Crush Mortgage  (financing partner)
 *
 * The Crush Mortgage mark always comes from the ONE canonical asset
 * (crushLogoPrimaryDataUri) — never re-created with text.
 */
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";
import { site } from "@/lib/site";
import type { Profile } from "@/lib/profile";
import { fullName } from "@/lib/profile";

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Top-of-page realtor branding: company logo, headshot, name + contact. */
export function realtorBrandHtml(profile: Profile | null | undefined): string {
  const name = fullName(profile) || "Your Name";
  const logo = profile?.brokerage_logo_url || profile?.team_logo_url || "";
  const headshot = profile?.headshot_url || "";
  const contact = [
    profile?.phone && esc(profile.phone),
    profile?.email && esc(profile.email),
    profile?.brokerage && esc(profile.brokerage),
    profile?.dre_license && `DRE #${esc(profile.dre_license)}`,
  ]
    .filter(Boolean)
    .join("&nbsp;&nbsp;·&nbsp;&nbsp;");

  return `<div class="rb">
    <div class="rb-id">
      ${headshot ? `<img class="rb-head" src="${esc(headshot)}" alt="">` : ""}
      <div>
        <div class="rb-name">${esc(name)}</div>
        <div class="rb-contact">${contact}</div>
      </div>
    </div>
    ${logo ? `<img class="rb-logo" src="${esc(logo)}" alt="">` : ""}
  </div>`;
}

/** Bottom-of-page Crush Mortgage partner branding + disclosure. */
export function crushFooterHtml(): string {
  return `<div class="cf">
    <div class="cf-inner">
      <span class="cf-powered">Financing partner</span>
      <img class="cf-logo" src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage">
    </div>
    <div class="cf-disc">Company NMLS #${site.companyNmls} · ${esc(site.phone)} · Equal Housing Opportunity. This is not a commitment to lend. Information deemed reliable but not guaranteed.</div>
  </div>`;
}

/** Shared CSS for the branding blocks (drop into the print doc's &lt;style&gt;). */
export const brandingCss = `
  .rb{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:12px;border-bottom:2px solid #111}
  .rb-id{display:flex;align-items:center;gap:12px}
  .rb-head{width:54px;height:54px;border-radius:10px;object-fit:cover}
  .rb-name{font-family:'Poppins',Arial,sans-serif;font-weight:800;font-size:15pt;color:#111}
  .rb-contact{font-size:9pt;color:#444;margin-top:2px}
  .rb-logo{max-height:46px;max-width:220px;object-fit:contain}
  .cf{position:fixed;bottom:0;left:0;right:0;padding:8px 0.5in 10px;border-top:1px solid #ddd;background:#fff}
  .cf-inner{display:flex;align-items:center;justify-content:center;gap:10px}
  .cf-powered{font-size:8pt;letter-spacing:1px;text-transform:uppercase;color:#888}
  .cf-logo{height:26px;object-fit:contain}
  .cf-disc{margin-top:4px;text-align:center;font-size:6.5pt;color:#999;line-height:1.3}
`;
