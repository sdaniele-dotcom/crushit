import type { Metadata } from "next";
import { Container, PageHero, Button } from "@/components/ui";
import { CopyCard } from "@/components/CopyCard";

export const metadata: Metadata = {
  title: "Video Scripts",
  description:
    "Short-form video scripts for realtors — reels and shorts on down payments, rates, first-time buying, and more. Copy and film in minutes.",
};

const scripts: { title: string; meta: string; text: string }[] = [
  {
    title: "The 20%-down myth",
    meta: "~30 sec · Reel/Short",
    text: `HOOK: "You do NOT need 20% down to buy a home. Let me prove it."\n\nBODY: Everyone thinks they need to save six figures before they can buy. Not true. Conventional loans can start at 3% down. FHA at 3.5%. And VA and USDA? Zero down if you qualify. On a $[PRICE] home, that 3% is around $[AMOUNT] — a lot closer than you think.\n\nCTA: "Want me to run your real numbers? I work with Crush Mortgage and can get you answers today. Comment 'HOME' or DM me."\n\n— [YOUR NAME], [BROKERAGE]`,
  },
  {
    title: "First-time buyer: 3 steps",
    meta: "~45 sec · Reel/Short",
    text: `HOOK: "Buying your first home? Do these 3 things first."\n\nBODY:\n1. Get pre-approved — it tells you your real budget and makes offers stronger. Free, and usually same-day with Crush Mortgage.\n2. Know your TRUE monthly payment — taxes, insurance, sometimes PMI. Not just principal and interest.\n3. Make a competitive offer — a verified pre-approval is your secret weapon.\n\nCTA: "Save this, then DM me when you're ready to start. I'll walk you through all of it."\n\n— [YOUR NAME], [BROKERAGE]`,
  },
  {
    title: "Rate update",
    meta: "~30 sec · timely",
    text: `HOOK: "Rates just moved — here's what it means for you."\n\nBODY: A small change in rate can shift your monthly payment by a lot — which changes how much house you can afford. If you've been waiting on the sidelines, this is worth a 5-minute conversation. I keep a pulse on the market with my lender partner, Crush Mortgage.\n\nCTA: "Want to know what you'd qualify for TODAY? Comment 'RATES' and I'll get you real numbers."\n\n— [YOUR NAME], [BROKERAGE]`,
  },
  {
    title: "Is now a good time to buy?",
    meta: "~45 sec · objection",
    text: `HOOK: "'Should I wait to buy?' Here's the honest answer."\n\nBODY: Nobody can time the market perfectly. But here's what I tell my clients: you marry the home, you date the rate. If you find the right home and the payment fits your budget today, waiting often costs more in rising prices and rent. And if rates drop later, we can look at refinancing with Crush Mortgage.\n\nCTA: "Let's figure out YOUR numbers, not the internet's. DM me."\n\n— [YOUR NAME], [BROKERAGE]`,
  },
  {
    title: "Self-employed? You can still buy",
    meta: "~30 sec · niche",
    text: `HOOK: "If you're self-employed and think you can't get a mortgage — watch this."\n\nBODY: Traditional loans lean on your tax returns, and business owners write a lot off. But there are programs built for you: bank-statement loans and P&L loans that qualify you on your real income, not your tax return. My lender partner Crush Mortgage does these all the time.\n\nCTA: "Self-employed and want to buy? DM me 'BUSINESS' and let's talk options."\n\n— [YOUR NAME], [BROKERAGE]`,
  },
  {
    title: "Listing walkthrough + payment",
    meta: "~45 sec · listing",
    text: `HOOK: "Just listed in [CITY] — and here's what it'd actually cost you."\n\nBODY: Walk the space — [BEDS] beds, [BATHS] baths, [BEST FEATURE]. Listed at $[PRICE]. With [DOWN]% down, the estimated payment lands around $[PAYMENT]/mo (I ran it with Crush Mortgage). That's [COMPARISON vs. rent, if relevant].\n\nCTA: "Want a private tour or the full financing breakdown? DM me — this one won't last."\n\n— [YOUR NAME], [BROKERAGE]`,
  },
];

export default function VideoScriptsPage() {
  return (
    <>
      <PageHero
        eyebrow="Co-marketing · Video"
        title={
          <>
            Short-form <span className="text-gradient">video scripts</span>
          </>
        }
        subtitle="Hook, body, call-to-action — written for reels and shorts. Copy one, fill in the brackets, and film it in a single take."
      />

      <Container className="py-14">
        <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
          <span className="font-semibold text-ink-800">How to use:</span> lead
          with the HOOK in the first 2 seconds, keep it punchy, and end on the
          CTA. Replace [BRACKETS] with your details.
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {scripts.map((s) => (
            <CopyCard key={s.title} title={s.title} meta={s.meta} text={s.text} />
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-ink-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Back your video with real numbers
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Generate a co-branded flyer with real payment scenarios to show
            on-screen or link in your bio.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/co-brand">Make a flyer</Button>
            <Button href="/resources" variant="secondary">
              Back to toolkit
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
