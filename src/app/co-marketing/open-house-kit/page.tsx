import type { Metadata } from "next";
import { Container, PageHero, Button, Eyebrow, Card } from "@/components/ui";
import { CopyCard } from "@/components/CopyCard";
import { PrintButton } from "@/components/PrintButton";
import { NearbyListingsTool } from "@/components/NearbyListingsTool";
import Link from "next/link";
import { site } from "@/lib/site";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";

export const metadata: Metadata = {
  title: "Open House Kit",
  description:
    "Everything you need to run a great open house — nearby-listings finder, printable sign-in sheet, checklist & supplies, neighbor invites, a feedback form, and follow-up templates. Co-branded with Crush Mortgage.",
};

const brandBlock = `<strong>${site.brand}</strong>In partnership with ${site.company}<br/>${site.phone} · NMLS #${site.companyNmls}`;
const printCss = `*{box-sizing:border-box}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:40px}
  .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #e62c2c;padding-bottom:14px}
  h1{font-size:26px;margin:0 0 4px}
  .sub{color:#555;font-size:13px;margin:0}
  .brand{text-align:right;font-size:12px;color:#333;line-height:1.5}
  .brand strong{color:#e62c2c;font-size:15px;display:block}
  .foot{margin-top:22px;font-size:11px;color:#666;text-align:center;border-top:1px solid #eee;padding-top:12px}
  @media print{body{padding:24px}}`;

/** Blank "homes for sale nearby" comparison sheet — fill in from the MLS. */
const comparisonWorksheetHtml = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Homes for sale nearby — comparison sheet</title>
<style>${printCss}
  .top{align-items:center}
  .logo{height:52px;width:auto;display:block}
  .brand{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
  .brand .contact{color:#333;font-size:12px;line-height:1.5;text-align:right}
  .brand .contact strong{color:#e62c2c;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  th,td{border:1px solid #cfcfcf;padding:11px 8px;text-align:left;font-size:12px}
  th{background:#111;color:#fff;font-weight:600;text-transform:uppercase;font-size:11px}
  td{height:30px}tr:nth-child(even) td{background:#fafafa}
</style></head><body>
  <div class="top">
    <div><h1>Homes for sale nearby</h1><p class="sub">Area: ____________________ · Date: ____________ · Fill in from your MLS search</p></div>
    <div class="brand">
      <img class="logo" src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage"/>
      <div class="contact"><strong>${site.phone}</strong><br/>NMLS #${site.companyNmls} · ${site.website.replace(/^https?:\/\//, "")}</div>
    </div>
  </div>
  <table><thead><tr><th style="width:26%">Address</th><th>Price</th><th>Bd</th><th>Ba</th><th>SqFt</th><th>Days on mkt</th><th style="width:20%">Notes</th></tr></thead>
  <tbody>${Array.from({ length: 12 }).map(() => `<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`).join("")}</tbody></table>
  <p class="foot">Want the monthly payment on any of these for a buyer? Ask ${site.company} · ${site.phone} · ${site.website.replace(/^https?:\/\//, "")}</p>
</body></html>`;

/** Print-ready sign-in sheet — 4 large, easy-to-write guest blocks per page. */
const signInSheetHtml = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Open House Sign-In Sheet</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:38px}
  .band{display:flex;justify-content:space-between;align-items:center;background:#e62c2c;color:#fff;border-radius:14px;padding:16px 22px}
  .band h1{font-size:26px;margin:0}
  .band .sub{font-size:12px;margin:2px 0 0;opacity:.9}
  .band .brand{text-align:right;font-size:12px;line-height:1.4}
  .band .brand strong{font-size:16px;display:block}
  .meta{display:flex;gap:30px;margin:16px 2px 4px;font-size:14px;color:#333}
  .row{border:1.5px solid #ddd;border-radius:12px;padding:14px 18px;margin-top:14px}
  .num{font-size:12px;font-weight:800;color:#e62c2c;text-transform:uppercase;letter-spacing:.06em}
  .grid{display:flex;gap:20px;margin-top:8px}
  .fld{flex:1}
  .fld label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#999}
  .fld .line{border-bottom:2px solid #333;height:30px}
  .opts{margin-top:12px;font-size:12px;color:#555;display:flex;gap:34px}
  .foot{margin-top:20px;font-size:11px;color:#666;text-align:center;border-top:1px solid #eee;padding-top:12px}
  @media print{body{padding:22px}}
</style></head><body>
  <div class="band">
    <div><h1>Open House Sign-In</h1><p class="sub">Please sign in — we'd love to stay in touch.</p></div>
    <div class="brand"><strong>${site.brand}</strong>${site.company}<br/>${site.phone} · NMLS #${site.companyNmls}</div>
  </div>
  <div class="meta">
    <span><strong>Property:</strong> _________________________________</span>
    <span><strong>Date:</strong> ________________</span>
  </div>
  ${Array.from({ length: 4 })
    .map(
      (_, i) => `<div class="row">
      <div class="num">Guest ${i + 1}</div>
      <div class="grid"><div class="fld"><label>Name</label><div class="line"></div></div></div>
      <div class="grid">
        <div class="fld"><label>Phone number</label><div class="line"></div></div>
        <div class="fld"><label>Email</label><div class="line"></div></div>
      </div>
      <div class="opts"><span>Working with an agent?&nbsp;&nbsp;<strong>Y / N</strong></span><span>Pre-approved?&nbsp;&nbsp;<strong>Y / N</strong></span></div>
    </div>`,
    )
    .join("")}
  <p class="foot">Interested in what your monthly payment could look like? Ask about a free, same-day pre-approval with ${site.company}. ${site.website.replace(/^https?:\/\//, "")}</p>
</body></html>`;

const checklist: { phase: string; items: string[] }[] = [
  {
    phase: "Before (the week of)",
    items: [
      "Confirm date/time with the seller and put out directional signs the day before",
      "Order or print co-branded flyers with financing scenarios for the listing",
      "Print the sign-in sheet + grab pens and a tablet/phone for digital sign-ins",
      "Run the nearby-listings finder so you can speak to the competition",
      "Line up a lender partner to answer financing questions (or have rate sheets ready)",
      "Post the open house on social — use the 'Open house' caption from the social kit",
      "Drop neighbor invites on the block and prep a clean, well-lit walkthrough path",
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

const supplies = [
  "Directional / open-house yard signs + stakes",
  "'Welcome, please sign in' sign for the door",
  "Printed sign-in sheets + several pens",
  "Tablet or phone for digital sign-ins",
  "Co-branded property flyers + financing sheets",
  "Nearby-listings sheet (printed)",
  "Business cards",
  "Feedback forms for the seller recap",
  "Bottled water + light snacks",
  "Booties / shoe covers or a mat if requested",
  "Hand sanitizer + wipes",
  "Phone charger / battery pack",
];

/** Print-ready checklist + supplies list. */
const checklistSheetHtml = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Open House Checklist & Supplies</title>
<style>${printCss}
  h2{font-size:15px;margin:22px 0 8px;color:#e62c2c;text-transform:uppercase;letter-spacing:.04em}
  ul{margin:0;padding:0;list-style:none}
  li{font-size:13px;padding:6px 0 6px 26px;position:relative;border-bottom:1px solid #f0f0f0}
  li:before{content:"";position:absolute;left:0;top:7px;width:14px;height:14px;border:1.5px solid #999;border-radius:3px}
  .cols{display:flex;gap:40px}
  .cols>div{flex:1}
</style></head><body>
  <div class="top">
    <div><h1>Open House Checklist &amp; Supplies</h1><p class="sub">Property: ____________________  ·  Date: ____________</p></div>
    <div class="brand">${brandBlock}</div>
  </div>
  ${checklist
    .map(
      (c) =>
        `<h2>${c.phase}</h2><ul>${c.items.map((i) => `<li>${i}</li>`).join("")}</ul>`,
    )
    .join("")}
  <h2>Supplies to bring</h2>
  <div class="cols">
    <div><ul>${supplies.slice(0, 6).map((s) => `<li>${s}</li>`).join("")}</ul></div>
    <div><ul>${supplies.slice(6).map((s) => `<li>${s}</li>`).join("")}</ul></div>
  </div>
  <p class="foot">Financing questions on the day? ${site.company} · ${site.phone} · ${site.website.replace(/^https?:\/\//, "")}</p>
</body></html>`;

/** Print-ready neighbor invite — graphical, full-page, with photo spots. */
const neighborInviteHtml = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Open House Invite</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:0}
  .sheet{padding:34px}
  .hero{border-radius:18px;overflow:hidden;border:3px solid #e62c2c}
  .photo{height:240px;background:repeating-linear-gradient(45deg,#f7f7f7,#f7f7f7 14px,#efefef 14px,#efefef 28px);display:flex;align-items:center;justify-content:center;color:#a5a5a5;font-size:14px;text-align:center;padding:0 20px}
  .banner{background:#e62c2c;color:#fff;padding:8px 0;text-align:center;font-size:12px;letter-spacing:.34em;text-transform:uppercase;font-weight:800}
  .kicker{text-align:center;color:#e62c2c;font-weight:800;font-size:15px;text-transform:uppercase;letter-spacing:.22em;margin:22px 0 0}
  h1{font-size:52px;text-align:center;margin:2px 0 0;letter-spacing:-.02em}
  .addr{text-align:center;font-size:16px;color:#555;margin:16px 0 0}
  .addrline{width:72%;margin:8px auto 0;border-bottom:2px solid #333;height:26px}
  .when{display:flex;gap:18px;justify-content:center;margin:22px 0 0}
  .box{border:2px solid #e62c2c;border-radius:12px;padding:12px 24px;text-align:center;min-width:170px}
  .box label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#e62c2c;display:block}
  .box .line{border-bottom:2px solid #333;height:24px;margin-top:10px}
  .msg{text-align:center;color:#444;font-size:15px;max-width:640px;margin:20px auto 0;line-height:1.55}
  .thumbs{display:flex;gap:14px;margin:22px 0 0}
  .thumb{flex:1;height:118px;border:2px dashed #ccc;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:12px}
  .host{display:flex;justify-content:space-between;border-top:2px solid #eee;padding-top:16px;margin-top:22px;font-size:13px;line-height:1.5}
  .host .r{text-align:right}
  .host strong.b{color:#e62c2c;font-size:16px;display:block}
  @media print{.sheet{padding:22px}}
</style></head><body>
  <div class="sheet">
    <div class="hero">
      <div class="photo">📷  Tape or print your listing's best photo here</div>
      <div class="banner">A special invitation for the neighborhood</div>
    </div>
    <p class="kicker">Open House</p>
    <h1>You're Invited!</h1>
    <p class="addr">Come tour the home at</p>
    <div class="addrline"></div>
    <div class="when">
      <div class="box"><label>Date</label><div class="line"></div></div>
      <div class="box"><label>Time</label><div class="line"></div></div>
    </div>
    <p class="msg">Curious what your own home might be worth in today's market? Stop by, take a tour, grab a treat, and say hello — no pressure at all. And if you know someone who'd love this street, bring them along!</p>
    <div class="thumbs">
      <div class="thumb">Add a photo</div><div class="thumb">Add a photo</div><div class="thumb">Add a photo</div>
    </div>
    <div class="host">
      <div><strong>Hosted by</strong><br/>____________________<br/>____________________</div>
      <div class="r"><strong class="b">${site.company}</strong>Financing questions? We're happy to help.<br/>${site.phone} · NMLS #${site.companyNmls}</div>
    </div>
  </div>
</body></html>`;

/** Print-ready visitor feedback form — Crush-branded. */
const feedbackFormHtml = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Open House Feedback</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:38px}
  .band{display:flex;justify-content:space-between;align-items:center;background:#e62c2c;color:#fff;border-radius:14px;padding:16px 22px}
  .band h1{font-size:24px;margin:0}
  .band .sub{font-size:12px;margin:2px 0 0;opacity:.9}
  .band .brand{text-align:right;font-size:12px;line-height:1.4}
  .band .brand strong{font-size:16px;display:block}
  .q{margin:18px 2px 0}
  .q p{font-size:14px;font-weight:700;margin:0 0 7px}
  .scale{display:flex;flex-wrap:wrap;gap:20px;font-size:13px;color:#333}
  .line{border-bottom:1.5px solid #bbb;height:26px;margin-top:6px}
  .foot{margin-top:24px;font-size:11px;color:#666;text-align:center;border-top:1px solid #eee;padding-top:12px}
  .foot strong{color:#e62c2c}
  @media print{body{padding:24px}}
</style></head><body>
  <div class="band">
    <div><h1>How was the home?</h1><p class="sub">Property: ____________________  ·  Date: ____________</p></div>
    <div class="brand"><strong>${site.brand}</strong>${site.company}<br/>${site.phone} · NMLS #${site.companyNmls}</div>
  </div>
  <div class="q"><p>1. First impression of the home?</p><div class="scale"><span>◻ Loved it</span><span>◻ Liked it</span><span>◻ It's okay</span><span>◻ Not for me</span></div></div>
  <div class="q"><p>2. What did you think of the price?</p><div class="scale"><span>◻ Great value</span><span>◻ About right</span><span>◻ A bit high</span><span>◻ Too high</span></div></div>
  <div class="q"><p>3. How does it compare to other homes you've seen?</p><div class="line"></div></div>
  <div class="q"><p>4. What would make it a better fit for you?</p><div class="line"></div><div class="line"></div></div>
  <div class="q"><p>5. Are you working with an agent?</p><div class="scale"><span>◻ Yes</span><span>◻ No</span></div></div>
  <div class="q"><p>6. Are you pre-approved for financing?</p><div class="scale"><span>◻ Yes</span><span>◻ Not yet — I'd like info</span></div></div>
  <div class="q"><p>Name &amp; best contact (optional):</p><div class="line"></div></div>
  <p class="foot">Not pre-approved yet? Ask about a free, same-day pre-approval with <strong>${site.company}</strong> — ${site.phone}.</p>
</body></html>`;

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

const printBtnClass =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600";
const printBtnGhost =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-surface-2";

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
        subtitle="Find the nearby competition, print your sign-in sheet and checklist, invite the neighbors, and follow up like a pro — all co-branded with Crush Mortgage."
      />

      <Container className="py-14">
        {/* Nearby listings */}
        <Eyebrow>Step 1 · Know the competition</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
          Every home for sale nearby
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Enter your listing&apos;s address, pick a radius — 1, 5, 10, or 25
          miles — and pull up the active homes for sale nearby from the MLS,
          grouped by beds &amp; baths. Then hit{" "}
          <strong>Print all on one page</strong> for a co-branded comparison
          sheet for the sign-in table.
        </p>
        <div className="mt-6">
          <NearbyListingsTool />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/mls-search"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-surface-2"
          >
            Or open the full CRMLS search →
          </Link>
          <PrintButton
            html={comparisonWorksheetHtml}
            label="Print a blank comparison sheet"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-surface-2"
          />
        </div>

        {/* Sign-in sheet */}
        <div className="mt-14">
          <Eyebrow>Step 2 · At the door</Eyebrow>
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
                  tell you who&apos;s a real buyer.
                </p>
              </div>
            </div>
            <PrintButton
              html={signInSheetHtml}
              label="Print sign-in sheet"
              className={printBtnClass}
              rewardAction="open_house_kit"
              rewardEvents={["open_house_piece_created", "marketing_piece_created"]}
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
        </div>

        {/* Promote it */}
        <div className="mt-14">
          <Eyebrow>Step 3 · Fill the room</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            Invite the neighbors, gather feedback
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-3xl border border-border bg-white p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-crush-50 text-2xl">
                📮
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">
                Neighbor invite
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted">
                Two-per-page cards to drop on the block. Pulls in nearby lookers
                — and the neighbors who might be your next sellers.
              </p>
              <div className="mt-5">
                <PrintButton
                  html={neighborInviteHtml}
                  label="Print neighbor invites"
                  className={printBtnGhost}
                />
              </div>
            </div>
            <div className="flex flex-col rounded-3xl border border-border bg-white p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-crush-50 text-2xl">
                🗒️
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">
                Visitor feedback form
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted">
                Six quick questions that give you honest price/condition
                feedback for the seller recap — and surface hot buyers.
              </p>
              <div className="mt-5">
                <PrintButton
                  html={feedbackFormHtml}
                  label="Print feedback form"
                  className={printBtnGhost}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Step 4 · The playbook</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
                Before, during &amp; after
              </h2>
            </div>
            <PrintButton
              html={checklistSheetHtml}
              label="Print checklist & supplies"
              className={printBtnGhost}
            />
          </div>
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
          {/* Supplies */}
          <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-bold text-ink-900">Supplies to bring</h3>
            <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {supplies.map((s) => (
                <span key={s} className="flex items-center gap-2 text-sm text-ink-800">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-crush-500" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Follow-up templates */}
        <div className="mt-14">
          <Eyebrow>Step 5 · The follow-up</Eyebrow>
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
            <Button href="/resources" variant="secondary">
              Back to toolkit
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
