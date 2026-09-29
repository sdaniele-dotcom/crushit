/**
 * The CRMs an agent can pick, and where each one hides its lead address.
 *
 * NOTHING HERE AFFECTS DELIVERY. A lead-capture address works the same whoever
 * issued it, and the webhook is a URL. This list exists so the form can tell an
 * agent where to look in THEIR CRM, rather than printing one line that names
 * six of them and hopes one is theirs.
 *
 * ON THE INSTRUCTIONS. Menu paths move, and a confidently wrong one costs an
 * agent more time than no instruction at all — they go looking for a screen
 * that isn't there and conclude the feature is broken. So each entry says only
 * what is stable about that CRM (Follow Up Boss's address really does end in
 * @followupboss.me) and otherwise names the SETTING to search for. "Search your
 * CRM's help for 'lead email address'" is a worse sentence and a better
 * instruction.
 */

export type CrmOption = {
  /** Stored on the profile, so keep these stable. */
  value: string;
  label: string;
  /** Where to find the lead-capture address. */
  hint: string;
  /** Shown in the email field when this CRM is chosen. */
  placeholder?: string;
  /** True when the CRM is better reached by webhook than by email. */
  webhookFirst?: boolean;
};

export const CRM_OPTIONS: CrmOption[] = [
  {
    value: "follow_up_boss",
    label: "Follow Up Boss",
    hint:
      "Your lead email address ends in @followupboss.me. It's in the lead-flow settings — Follow Up Boss calls it your lead email address, so searching their help for that phrase lands on it.",
    placeholder: "yourname@followupboss.me",
  },
  {
    value: "boldtrail",
    label: "BoldTrail / kvCORE",
    hint:
      "Look for lead routing or email parsing in your settings, or ask your brokerage admin — on a brokerage account the parsing address is often issued by them rather than shown to you.",
  },
  {
    value: "lofty",
    label: "Lofty (formerly Chime)",
    hint:
      "In your lead settings, look for the lead-capture or parsing email address. If your brokerage set up the account, they may hold it.",
  },
  {
    value: "sierra",
    label: "Sierra Interactive",
    hint: "Under lead routing / email parsing in your account settings.",
  },
  {
    value: "real_geeks",
    label: "Real Geeks",
    hint: "Under lead routing in your account settings.",
  },
  {
    value: "wise_agent",
    label: "Wise Agent",
    hint: "Wise Agent issues an address that files inbound leads into your contacts. It's in your lead settings.",
  },
  {
    value: "top_producer",
    label: "Top Producer",
    hint: "Under lead routing / lead capture in your settings.",
  },
  {
    value: "other_email",
    label: "Something else (I have a lead email address)",
    hint:
      "Paste it below. Almost every CRM has one — search your CRM's help for “lead email address” or “email parsing”.",
  },
  {
    value: "zapier",
    label: "Zapier / Make (webhook)",
    hint:
      "Create a Catch Hook in Zapier or a Webhook trigger in Make, copy the URL it gives you, and paste it into the webhook field. You'll get each lead as JSON and can route it anywhere.",
    webhookFirst: true,
  },
];

export function crmOption(value: string | null | undefined): CrmOption | null {
  return CRM_OPTIONS.find((o) => o.value === value) ?? null;
}
