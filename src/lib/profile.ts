/** Agent profile shape (mirrors public.profiles). */
export type Profile = {
  id: string;
  role: "agent" | "admin";
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  brokerage: string | null;
  dre_license: string | null;
  headshot_url: string | null;
  brokerage_logo_url: string | null;
  team_logo_url: string | null;
  instagram: string | null;
  website: string | null;
  market_city: string | null;
  leaderboard_visible: boolean;
  /** Opt-in: auto-send a marketing package when their listing hits the MLS. */
  listing_marketing_opt_in: boolean;
  listing_marketing_opt_in_at: string | null;
  /**
   * Where open-house sign-ins and feedback are forwarded, on top of being
   * stored here (migration 0058). Both blank means nothing is forwarded.
   *
   * `crm_email` is the CRM's own lead-capture address; `crm_webhook_url` is an
   * https endpoint that receives the lead as JSON. Neither is a credential,
   * which is the whole reason the integration is shaped this way.
   */
  crm_email: string | null;
  crm_webhook_url: string | null;
  /**
   * Which CRM they picked, by name. Display and analytics only — delivery does
   * not depend on it, and an agent who pastes an address without choosing a CRM
   * is fully connected.
   */
  crm_name: string | null;
  /**
   * The terms version this agent accepted, and when (migration 0059). A value
   * that is null or older than TERMS_VERSION puts the consent gate in front of
   * the app. The durable evidence lives in `terms_acceptances`; this is just
   * the flag the gate reads.
   */
  terms_version: string | null;
  terms_accepted_at: string | null;
  /**
   * The agent's co-branded Floify application page (migration 0061).
   *
   * Set by an admin after building it in Floify — see lib/floify.ts for why it
   * is not created automatically. `floify_requested_at` is the agent asking;
   * `floify_url` is it existing.
   */
  floify_url: string | null;
  floify_requested_at: string | null;
  is_active: boolean;
  profile_completed: boolean;
  current_stars: number;
  lifetime_stars: number;
  created_at: string;
  updated_at: string;
  last_active_at: string | null;
};

export function fullName(p: Partial<Profile> | null | undefined): string {
  if (!p) return "";
  return (
    p.display_name?.trim() ||
    [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
    p.email ||
    ""
  );
}
