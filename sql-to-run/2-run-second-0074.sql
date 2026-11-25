-- 0074_rls_lockdown_part2.sql
--
-- The sixteen tables 0073 missed.
--
-- WHY THIS EXISTS. 0073 closed eighteen tables. A probe of the live project
-- with the public anon key on 25 Nov 2026 found thirty-five of thirty-seven
-- tables still accepting anonymous UPDATE and DELETE. Only flyer_records and
-- listing_flyers were protected. 0073 covers nineteen of the rest; these are
-- the others, and some matter more than anything in 0073:
--
--   profiles           role lives here. Anyone could set role='admin' on any
--                      row — INCLUDING their own — and 0073's own
--                      "admins read transcripts" policy trusts this column.
--                      Run 0073 without this file and that policy is only as
--                      strong as a table anybody can edit.
--   star_transactions  the points ledger. Points are backend-managed; anyone
--                      could award themselves any balance, or delete the
--                      ledger.
--   terms_acceptances  the record that an agent accepted the terms. A legal
--                      record that anyone could delete.
--   email_templates    the automated mail sent to every agent. Anyone could
--                      rewrite the body.
--   open_house_leads   consumer name, phone and email captured at showings.
--   realtor_crm,
--   contact_touches    agent contact details and logged conversations.
--
-- HOW THE PROBE WORKED, so it can be repeated: PATCH and DELETE against
-- ?id=eq.<a uuid that matches no row>. A 204 means the statement ran and
-- affected nothing — permitted. A 401/403 means RLS refused. Nothing was
-- written. (An earlier probe using a malformed uuid was NOT valid evidence:
-- that fails during type casting, before RLS is consulted.)
--
-- Re-run the probe after applying this and 0073. Every table should answer
-- 401 to an anonymous PATCH.
--
-- Safe to run more than once. Run 0073 first, though either order works.

-- ── Who is an admin ─────────────────────────────────────────────────────────
-- A function, not a repeated subquery: it is referenced by a dozen policies
-- below, and security definer lets it read profiles.role while profiles is
-- itself locked down, without each policy needing its own read path.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── profiles ────────────────────────────────────────────────────────────────
-- Read and update your own row; admins see and manage all. No INSERT policy:
-- the row is created by the signup trigger, which runs as definer. No DELETE.
alter table public.profiles enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- RLS decides WHICH ROWS, never WHICH COLUMNS, so the update policy above
-- would still let an agent set their own role to 'admin' or hand themselves
-- a star balance. Column privileges are the only thing that stops that, and
-- they apply to admins too — which is correct: a role change or a manual
-- star adjustment should go through SQL or a definer function, not through
-- a browser session that has been talked into sending an extra field.
--
-- The admin users screen only toggles is_active, so it is left grantable.
revoke update (role, current_stars) on public.profiles from anon, authenticated;

-- ── star_transactions: readable by its owner, written only by the server ────
alter table public.star_transactions enable row level security;

drop policy if exists "own stars read" on public.star_transactions;
create policy "own stars read" on public.star_transactions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
-- Deliberately no insert/update/delete policy. Awards come from definer
-- functions and the service role; with RLS on, an operation with no
-- permitting policy is denied.

-- ── terms_acceptances: append-only, your own ────────────────────────────────
alter table public.terms_acceptances enable row level security;

drop policy if exists "own acceptance read" on public.terms_acceptances;
create policy "own acceptance read" on public.terms_acceptances
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "own acceptance insert" on public.terms_acceptances;
create policy "own acceptance insert" on public.terms_acceptances
  for insert to authenticated
  with check (user_id = auth.uid());
-- No update or delete, by anyone. It is a record of what happened.

-- ── The agent's own working data: full CRUD on your own rows ────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'listings',
    'saved_projects',
    'buyer_scenarios'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "own rows" on public.%I', t);
      execute format(
        'create policy "own rows" on public.%I for all to authenticated '
        'using (user_id = auth.uid() or public.is_admin()) '
        'with check (user_id = auth.uid() or public.is_admin())', t);
    end if;
  end loop;
end $$;

-- ── Requests an agent raises and an admin works: create and read your own ───
do $$
declare t text;
begin
  foreach t in array array[
    'flyer_requests',
    'promotion_requests',
    'reward_claims'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "own request read" on public.%I', t);
      execute format('drop policy if exists "own request insert" on public.%I', t);
      execute format('drop policy if exists "admin manages requests" on public.%I', t);
      execute format(
        'create policy "own request read" on public.%I for select to authenticated '
        'using (user_id = auth.uid() or public.is_admin())', t);
      execute format(
        'create policy "own request insert" on public.%I for insert to authenticated '
        'with check (user_id = auth.uid())', t);
      -- Status changes are the admin screens' job, not the requester's.
      execute format(
        'create policy "admin manages requests" on public.%I for update to authenticated '
        'using (public.is_admin()) with check (public.is_admin())', t);
    end if;
  end loop;
end $$;

-- ── Awarded, not claimed: read your own, no writes ──────────────────────────
alter table public.user_achievements enable row level security;

drop policy if exists "own achievements read" on public.user_achievements;
create policy "own achievements read" on public.user_achievements
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ── Open house: a logged-out visitor fills these in on a phone at a showing ─
-- INSERT therefore has to stay open to anon — that is the whole point of the
-- QR form. Reading is not open: the leads belong to whoever owns the listing.
do $$
declare t text;
begin
  foreach t in array array['open_house_leads', 'open_house_feedback'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "visitor submits" on public.%I', t);
      execute format('drop policy if exists "listing owner reads" on public.%I', t);
      execute format(
        'create policy "visitor submits" on public.%I for insert to anon, authenticated '
        'with check (true)', t);
      execute format(
        'create policy "listing owner reads" on public.%I for select to authenticated '
        'using (public.is_admin() or exists ('
        '  select 1 from public.listings l '
        '  where l.id = %I.listing_id and l.user_id = auth.uid()))', t, t);
    end if;
  end loop;
end $$;

-- ── Admin-only surfaces ─────────────────────────────────────────────────────
-- realtor_crm and contact_touches are read by the admin realtors screen and
-- written server-side. email_log and email_templates are admin screens too.
-- Nothing agent-facing touches any of them from a browser.
do $$
declare t text;
begin
  foreach t in array array[
    'realtor_crm',
    'contact_touches',
    'email_log'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "admin reads" on public.%I', t);
      execute format(
        'create policy "admin reads" on public.%I for select to authenticated '
        'using (public.is_admin())', t);
    end if;
  end loop;
end $$;

-- email_templates: the admin screen edits these in place, so it needs write.
alter table public.email_templates enable row level security;

drop policy if exists "admin reads templates" on public.email_templates;
create policy "admin reads templates" on public.email_templates
  for select to authenticated
  using (public.is_admin());

drop policy if exists "admin writes templates" on public.email_templates;
create policy "admin writes templates" on public.email_templates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
