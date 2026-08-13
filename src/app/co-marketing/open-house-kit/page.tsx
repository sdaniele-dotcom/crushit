import type { Metadata } from "next";
import { Container, PageHero, Button, Eyebrow, Card } from "@/components/ui";
import { CopyCard } from "@/components/CopyCard";
import { PrintButton } from "@/components/PrintButton";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Open House Kit",
  description:
    "Everything you need to run a great open house — a printable sign-in sheet, a step-by-step checklist, and copy-and-send follow-up templates. Co-branded with Crush Mortgage.",
};

/** Self-contained HTML for a print-ready sign-in sheet. */
const signInSheetHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Open House Sign-In Sheet</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 0; padding: 40px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #e62c2c; padding-bottom: 14px; }
  h1 { font-size: 26px; margin: 0 0 4px; }
  .sub { color: #555; font-size: 13px; margin: 0; }
  .brand { text-align: right; font-size: 12px; color: #333; line-height: 1.5; }
  .brand strong { color: #e62c2c; font-size: 15px; display: block; }
  .fields { display: flex; gap: 20px; margin: 18px 0 10px; font-size: 13px; color: #333; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { border: 1px solid #cfcfcf; padding: 12px 8px; text-align: left; font-size: 12px; }
  th { background: #111; color: #fff; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; font-size: 11px; }
  td { height: 34px; }
  tr:nth-child(even) td { background: #fafafa; }
  .foot { margin-top: 22px; font-size: 11px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h1>Open House Sign-In</h1>
      <p class="sub">Please sign in — we'd love to stay in touch.</p>
      <div class="fields">
        <span><strong>Property:</strong> _______________________________</span>
        <span><strong>Date:</strong> ______________</span>
      </div>
    </div>
    <div class="brand">
      <strong>${site.brand}</strong>
      Hosted by ______________________<br/>
      In partnership with ${site.company}<br/>
      ${site.phone} · NMLS #${site.companyNmls}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:22%">Name</th>
        <th style="width:20%">Phone</th>
        <th style="width:24%">Email</th>
        <th style="width:16%">Working with an agent?</th>
        <th style="width:18%">Pre-approved?</th>
      </tr>
    </thead>
    <tbody>
      ${Array.from({ length: 14 })
        .map(
          () =>
            `<tr><td></td><td></td><td></td><td>Y / N</td><td>Y / N</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>
  <p class="foot">Interested in what your monthly payment could look like? Ask about a free, same-day pre-approval with ${site.company}. ${site.website.replace(/^https?:\/\//, "")}</p>
</body>
</html>`;

const checklist: { phase: string; items: string[] }[] = [
  {
    phase: "Before (the week of)",
    items: [
      "Confirm date/time with the seller and put out directional signs the day before",
      "Order or print co-branded flyers with financing scenarios for the listing",
      "Print this sign-in sheet + grab pens and a tablet/phone for digital sign-ins",
      "Line up a lender partner to answer financing questions (or have rate sheets ready)",
      "Post the open house on social — use the 'Open house' caption from the social kit",
      "Prep a simple snack/water setup and a clean, well-lit walkthrough path",
    ],
  },
  {
    phase: "During",
    items: [
      "Greet every visitor and get them signed in before they tour",
      "Ask two questions: 'Are you working with an agent?' and 'Are you pre-approved?'",
      "Hand each buyer a financing sheet showing the monthly payment",
      "Note the hot prospects — who lingered, who asked about payments",
      "Capture at least name + phone + email for every serious visitor",
    ],
  },
  {
    phase: "After (within 24 hours)",
    items: [
      "Send the follow-up text to every visitor the same evening",
      "Email the detailed follow-up the next morning (template below)",
      "Connect any non-pre-approved buyers to your lender partner",
      "Send the seller a recap: traffic count, feedback, and next steps",
      "Add everyone to your CRM and tag them by interest level",
    ],
  },
];

const followUps: { title: string; meta: string; text: string }[] = [
  {
    title: "Same-night text",
    meta: "Send the evening of the open house",
    text: `Hi [FIRST NAME], it was great meeting you at the open house on [ADDRESS] today! What did you think? If you'd like, I can send over what the monthly payment could look like — my lender partner ${site.company} can get you real numbers fast. — [YOUR NAME], [BROKERAGE]`,
  },
  {
    title: "Next-morning email",
    meta: "Subject: Thanks for visiting [ADDRESS]",
    text: `Hi [FIRST NAME],\n\nThanks for stopping by the open house at [ADDRESS]! It was a pleasure meeting you.\n\nA few quick things that might help:\n• I've attached a financing sheet showing what the monthly payment could look like at a few different down payments.\n• If this home is a contender, the strongest next step is a quick pre-approval so your offer stands out. My lender partner, ${site.company}, usually turns it around the same day — no obligation.\n• If it wasn't quite the one, I've got a few similar listings I think you'll like. Just say the word.\n\nWhat questions can I answer?\n\nBest,\n[YOUR NAME]\n[BROKERAGE] · [PHONE]`,
  },
  {
    title: "Not-pre-approved nudge",
    meta: "For buyers who loved it but aren't pre-approved",
    text: `Hi [FIRST NAME],\n\nYou seemed to really connect with [ADDRESS] — I'd hate for you to miss it. In this market, sellers take pre-approved buyers seriously, so let's get you ready to move quickly.\n\nCan I introduce you to my lender partner at ${site.company}? It's free, same-day, and there's no pressure. Just reply "yes" and I'll connect you today.\n\nTalk soon,\n[YOUR NAME]\n[BROKERAGE] · [PHONE]`,
  },
  {
    title: "Seller recap",
    meta: "Send to the listing seller",
    text: `Hi [SELLER NAME],\n\nQuick recap from today's open house at [ADDRESS]:\n• Visitors: [#] groups\n• Feedback: [SUMMARIZE — price, condition, layout comments]\n• Serious interest: [# of buyers asking about offers/financing]\n\nNext steps: [e.g., following up with [#] interested buyers, adjusting [X], another open house on [DATE]].\n\nI'll keep you posted as follow-ups come in.\n\nBest,\n[YOUR NAME]\n[BROKERAGE]`,
  },
];

export default function OpenHouseKitPage() {
  return (
    <>
      <PageHero
        eyebrow="Co-marketing · Open house"
        title={
          <>
            Your complete <span className="text-gradient">open house kit</span>
          </>
        }
        subtitle="A printable sign-in sheet, a room-by-room checklist, and follow-up templates that turn open-house traffic into pre-approved buyers."
      />

      <Container className="py-14">
        {/* Sign-in sheet */}
        <Eyebrow>Step 1 · At the door</Eyebrow>
        <div className="mt-4 flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-white p-8 sm:flex-row sm:items-center">
          <div className="flex items-start gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-crush-50 text-3xl">
              📝
            </span>
            <div>
              <h3 className="text-xl font-bold text-ink-900">
                Printable sign-in sheet
              </h3>
              <p className="mt-1 max-w-xl text-muted">
                Co-branded with {site.company}, with columns for name, phone,
                email, agent status, and pre-approval — the two questions that
                tell you who&apos;s a real buyer. Opens a print-ready page.
              </p>
            </div>
          </div>
          <PrintButton
            html={signInSheetHtml}
            label="Print sign-in sheet"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
          />
        </div>

        {/* Matching flyer callout */}
        <Card className="mt-6 flex flex-col items-start justify-between gap-4 bg-surface sm:flex-row sm:items-center">
          <div>
            <h3 className="font-bold text-ink-900">
              Add the matching co-branded flyer
            </h3>
            <p className="mt-1 text-sm text-muted">
              Generate a property flyer with financing scenarios for the
              sign-in table — your name and photo alongside ours.
            </p>
          </div>
          <Button href="/co-brand" className="shrink-0">
            Make the flyer
          </Button>
        </Card>

        {/* Checklist */}
        <div className="mt-14">
          <Eyebrow>Step 2 · The playbook</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            Before, during &amp; after
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {checklist.map((col) => (
              <div
                key={col.phase}
                className="rounded-2xl border border-border bg-white p-6"
              >
                <h3 className="text-lg font-bold text-ink-900">{col.phase}</h3>
                <ul className="mt-4 space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-ink-800">
                      <svg
                        viewBox="0 0 20 20"
                        className="mt-0.5 h-4 w-4 shrink-0 text-crush-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <rect x="3" y="3" width="14" height="14" rx="3" />
                        <path d="M7 10l2 2 4-5" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up templates */}
        <div className="mt-14">
          <Eyebrow>Step 3 · The follow-up</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            Copy-and-send follow-ups
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            The money is in the follow-up. Copy these, swap the [BRACKETS], and
            send them within 24 hours while the visit is still fresh.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {followUps.map((f) => (
              <CopyCard
                key={f.title}
                title={f.title}
                meta={f.meta}
                text={f.text}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-3xl bg-ink-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Turn open-house traffic into pre-approvals
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            When a visitor is ready, connect them to a fast, no-obligation
            pre-approval with {site.company}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/co-brand">Make a flyer</Button>
            <Button href="/co-marketing/social-kit" variant="secondary">
              Get social captions
            </Button>
            <Button href="/co-marketing" variant="secondary">
              Back to toolkit
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
