-- 0073_rls_lockdown.sql
--
-- Enable Row-Level Security on every table that was left without it.
--
-- WHAT WAS WRONG. The Supabase security advisor flagged this on 22 Nov 2026
-- and it was accurate: eighteen tables had RLS disabled, which means the anon
-- key could read, UPDATE and DELETE every row in them. The anon key is not a
-- secret — it ships in the browser bundle of crushyourmarket.com by design, so
-- "anyone with the project URL" is literally anyone who views source.
--
-- Verified exposed, read AND write, before this migration:
--   chat_transcripts       consumer email, phone and full conversation text
--   agent_profiles         agent name, DRE licence, phone, email
--   loan_officer_profiles  officer name, NMLS, phone, email, Lofty login
--   buyer_assumptions      borrower profile (first-time, veteran, down payment)
--   properties             addresses and purchase prices, linked to owners
--   scenarios              priced loan scenarios per owner
--   public_pages           published AND unpublished flyer snapshots
--   plus every catalog table: loan_programs, county_loan_limits, guides,
--   vendors, disclosures, tier_rewards, reward_rules, achievements, ...
--
-- WHY THIS IS SAFE TO RUN. The service-role key BYPASSES RLS, and every
-- server-side path already uses it (lib/supabase/admin.ts). The public flyer
-- page, the PDF route and the snapshot builder all call createAdminClient, so
-- none of them are affected. Neither app reads any of the sensitive tables
-- from a browser: a grep of both repos found zero client-side references to
-- agent_profiles, loan_officer_profiles, properties, scenarios,
-- buyer_assumptions, public_pages or crush_company. The one browser reader of
-- chat_transcripts is the crushit admin screen, which is given a policy below.
--
-- TWO TIERS, chosen to close every hole without changing what anyone can see:
--
--   LOCKED      RLS on, no policy at all. Unreachable with the anon key;
--               server code reaches it with the service role as before. This
--               is for anything carrying personal data.
--
--   READ-ONLY   RLS on, SELECT granted to everyone, no insert/update/delete
--               policy. These are catalogues the apps display — loan programs,
--               county limits, rewards, vendors. They were already world
--               readable, so granting SELECT changes nothing a visitor sees;
--               what it removes is the ability to EDIT or DELETE them. Anyone
--               could have rewritten your published rates.
--
-- Safe to run more than once.

-- ── Tier 1: personal data. No anon access at all. ───────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'agent_profiles',
    'loan_officer_profiles',
    'buyer_assumptions',
    'properties',
    'scenarios',
    'public_pages',
    'pricing_snapshots',
    'chat_transcripts'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;

-- ── Tier 2: public catalogues. Readable, never writable. ────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'achievements',
    'levels',
    'reward_rules',
    'tier_rewards',
    'county_loan_limits',
    'loan_programs',
    'crush_loan_programs',
    'disclosures',
    'guides',
    'vendors',
    'crush_company'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "public read" on public.%I', t);
      -- SELECT only. The absence of any other policy is what blocks writes:
      -- with RLS on, an operation with no permitting policy is denied.
      execute format(
        'create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    end if;
  end loop;
end $$;

-- ── The one browser reader we must preserve ─────────────────────────────────
-- crushit's admin transcripts screen reads this with the anon key as a signed-in
-- admin (src/lib/transcripts.ts says "admins only, via RLS" — this is the RLS
-- that comment assumed). Transcripts are WRITTEN server-side through
-- lib/chatTranscript.ts with the service role, so no insert policy is needed.
drop policy if exists "admins read transcripts" on public.chat_transcripts;
create policy "admins read transcripts" on public.chat_transcripts
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
