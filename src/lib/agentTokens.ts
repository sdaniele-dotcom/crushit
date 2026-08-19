import type { Profile } from "@/lib/profile";
import { fullName } from "@/lib/profile";

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
