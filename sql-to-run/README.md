# Lock down the database — two SQL files, in order

Right now **35 of your 37 tables accept writes from anyone on the internet.**
Not just reads: `UPDATE` and `DELETE`. No login, no key you control — the
`anon` key is in the page source of crushyourmarket.com by design, which is
fine, and is exactly why Row-Level Security has to be the thing stopping
people.

Only `flyer_records` and `listing_flyers` are protected today.

## What to do

1. Open <https://supabase.com/dashboard> → your project → **SQL Editor** →
   **New query**.
2. Paste the whole of `1-run-first-0073.sql`. Press **Run**.
3. New query. Paste the whole of `2-run-second-0074.sql`. Press **Run**.

Both are safe to run twice, so if you lose your place, just run them again.

## Why two files

`0073` was written earlier and covers 19 tables. When I actually probed the
live project I found it misses 16 more, and some of the misses matter more
than anything in `0073`:

| table | what anyone can do today |
|---|---|
| `profiles` | set `role = 'admin'` on any row, including their own |
| `star_transactions` | award themselves any number of Crush Stars, or wipe the ledger |
| `terms_acceptances` | delete the record that an agent accepted your terms |
| `email_templates` | rewrite the automated email you send every agent |
| `open_house_leads` | read and delete consumer names, phones and emails |
| `realtor_crm`, `contact_touches` | read your agent contacts and logged conversations |

`profiles` is the one that makes the order matter in spirit, if not in
sequence: `0073` adds a policy that grants transcript access to anyone whose
`profiles.role` is `'admin'`. Until `0074` locks `profiles`, that column is
editable by anybody — so `0073` alone would hand out admin by honour system.
Run both.

## After running — check it worked

Two things, both quick.

**1. Confirm the hole is closed.** In a terminal:

```
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH \
  -H "apikey: YOUR_ANON_KEY" -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" --data '{}' \
  "https://YOUR-PROJECT.supabase.co/rest/v1/profiles?id=eq.00000000-0000-4000-8000-000000000000"
```

You want **401**. If it still says **204**, the migration did not take.
(The `id` matches no row, so this writes nothing either way.)

**2. Smoke-test the app**, because `0074` is the riskier of the two — it adds
real policies rather than just switching RLS on, and a wrong policy locks
people out of their own data rather than letting strangers in. Sign in and
check:

- [ ] Your dashboard loads and shows your star balance
- [ ] **Profile → save** works
- [ ] The **leaderboard** loads (it goes through an RPC, so it should be unaffected)
- [ ] **Admin → Users** lists agents; **Admin → Chat transcripts** loads
- [ ] An **open-house QR form** still submits while signed out — this one is
      easy to break, because the visitor filling it in has no account

If any of those breaks, tell me which and I'll fix the policy. Nothing in
either file deletes data, so a bad policy is always recoverable.

## What I could not check

I have no access to your Supabase project beyond the public anon key, so
these policies are written from the table definitions in
`supabase/migrations/` and from how the app actually calls each table. I
could not run them against your schema. That is the reason for the
smoke-test list above rather than a promise that it all just works.
