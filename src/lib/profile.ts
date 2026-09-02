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
