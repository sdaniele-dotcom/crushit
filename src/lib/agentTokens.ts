import type { Profile } from "@/lib/profile";
import { fullName } from "@/lib/profile";
import type { Listing } from "@/lib/listings";

function money(n: number | null | undefined): string {
  return n == null ? "" : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function numStr(n: number | null | undefined): string {
  return n == null ? "" : String(n);
}

/**
 * Replace the agent placeholders in a copy/print template with the logged-in
 * agent's saved profile info, so guides and co-marketing pieces come out
 * personalized — the same "enter it once, reused everywhere" idea as the flyer.
 *
 * Only agent-identity tokens are filled. Listing/recipient placeholders
 * ([FIRST NAME], [ADDRESS], [CITY], [PRICE]…) are intentionally left for the
 * agent to fill per use. A token is only substituted when the profile actually
 * has that value — otherwise the placeholder stays so nothing goes out blank.
 */
export function fillAgentTokens(text: string, profile: Profile | null | undefined): string {
  if (!profile || !text) return text;

  const name = fullName(profile);
  const map: Record<string, string> = {
    "[YOUR NAME]": name,
    "[AGENT NAME]": name,
    "[BROKERAGE]": profile.brokerage ?? "",
    "[PHONE]": profile.phone ?? "",
    "[YOUR PHONE]": profile.phone ?? "",
    "[YOUR EMAIL]": profile.email ?? "",
    "[EMAIL]": profile.email ?? "",
    "[DRE]": profile.dre_license ? `DRE #${profile.dre_license}` : "",
    "[DRE #]": profile.dre_license ? `DRE #${profile.dre_license}` : "",
  };

  let out = text;
  for (const [token, value] of Object.entries(map)) {
    if (value) out = out.split(token).join(value);
  }
  return out;
}

/**
 * Fill both agent-identity tokens and, when a listing is selected, the
 * listing/property tokens ([ADDRESS], [CITY], [PRICE], [BEDS], [BATHS]…).
 * Property tokens are only filled when the listing actually has that value, so
 * anything missing stays a placeholder for the agent to complete.
 */
export function fillTokens(
  text: string,
  profile: Profile | null | undefined,
  listing?: Listing | null,
): string {
  let out = fillAgentTokens(text, profile);
  if (!listing || !out) return out;

  const oh = listing.open_house_at ? new Date(listing.open_house_at) : null;
  const ohEnd = listing.open_house_end ? new Date(listing.open_house_end) : null;
  const timeFmt = (d: Date | null) => (d ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "");
  const ohDate = oh ? oh.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "";
  const ohTime = oh ? [timeFmt(oh), timeFmt(ohEnd)].filter(Boolean).join("–") : "";

  const map: Record<string, string> = {
    "[ADDRESS]": listing.address ?? "",
    "[CITY]": listing.city ?? "",
    "[STATE]": listing.state ?? "",
    "[ZIP]": listing.zip ?? "",
    "[NEIGHBORHOOD]": listing.city ?? "",
    "[PRICE]": money(listing.price),
    "[BEDS]": numStr(listing.beds),
    "[BATHS]": numStr(listing.baths),
    "[SQFT]": listing.sqft != null ? listing.sqft.toLocaleString() : "",
    "[DATE]": ohDate,
    "[OPEN HOUSE DATE]": ohDate,
    "[TIME]": ohTime,
    "[OPEN HOUSE TIME]": ohTime,
  };
  for (const [token, value] of Object.entries(map)) {
    if (value) out = out.split(token).join(value);
  }
  return out;
}
