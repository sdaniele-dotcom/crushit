# CRUSH IT — Realtors Suite

A complete resource website for real-estate agents, powered by **Crush Mortgage**.
It gives partner realtors a toolkit of interactive calculators, plain-English loan
guides, buyer resources, and co-marketing materials — all in one branded site.

Built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS v4**,
and exported as a fully static site so it deploys anywhere for free.

## What's inside

| Page | What it does |
| --- | --- |
| **Home** (`/`) | Hero + hub linking to every tool, plus a "why partner with us" pitch. |
| **Calculators** (`/calculators`) | Four live tools: **monthly payment**, **affordability**, **rent vs. buy**, and **refinance** — with sliders and instant results. |
| **Loan Programs** (`/loan-programs`) | Quick-compare table + detail cards for Conventional, FHA, VA, USDA, Jumbo, and DSCR loans. |
| **Resources** (`/resources`) | The homebuying journey plus share-ready checklists (first-time buyer, documents, glossary, closing prep). |
| **Co-Marketing** (`/co-marketing`) | Co-branded flyers, social kit, open-house pack, and the partnership playbook. |
| **Contact** (`/contact`) | Pre-approval / partner lead form + direct loan-officer details. |

## Customize it (start here)

**All of your branding lives in one file:** [`src/lib/site.ts`](src/lib/site.ts).
Replace every `[PLACEHOLDER]` value — loan officer name, NMLS #, phone, email,
address, website, and social links. Everything on the site reads from that file.

To make the contact form deliver leads to an inbox or CRM, set `formEndpoint`
in the same file to a [Formspree](https://formspree.io) / [Getform](https://getform.io)
URL (or your own endpoint). If left blank, the form falls back to opening a
pre-filled email to the loan officer.

Editable page content (loan programs, resources) lives in
[`src/lib/data.ts`](src/lib/data.ts) — safe to edit without touching components.

## Develop locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build    # outputs a static site to ./out
```

## Deploy

The site is a static export (`output: "export"`), so `./out` can be dropped on
any static host — Netlify, Vercel, Cloudflare Pages, S3, etc.

**GitHub Pages:** a workflow at `.github/workflows/deploy.yml` builds and
publishes on every push to `main`. In your repo, go to
**Settings → Pages → Source → GitHub Actions**. If you deploy to a *project*
site (`https://<user>.github.io/<repo>`), set `BASE_PATH=/<repo>` — see the
commented lines in the workflow and in `next.config.ts`.

## Tech notes

- Design tokens (brand navy + crush orange) are defined in `src/app/globals.css`.
- Mortgage math is isolated in `src/lib/calc.ts` (pure functions, easy to verify).
- Fully responsive, keyboard-accessible, and light-mode branded.

---

> **Compliance:** All calculators produce estimates for educational use only and
> are not a commitment to lend. Co-marketing materials should follow RESPA
> guidelines. Update NMLS numbers and disclosures in `src/lib/site.ts` and the
> footer before going live. Equal Housing Opportunity.
