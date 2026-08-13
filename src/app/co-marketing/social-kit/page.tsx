import type { Metadata } from "next";
import { Container, PageHero, Button, Eyebrow, Card } from "@/components/ui";
import { CopyCard } from "@/components/CopyCard";

export const metadata: Metadata = {
  title: "Social Media Kit",
  description:
    "Ready-to-post, copy-and-paste social captions for realtors — new listings, open houses, buyer tips, and more. Co-branded with Crush Mortgage.",
};

const captions: { title: string; meta: string; text: string }[] = [
  {
    title: "Just listed",
    meta: "New listing announcement",
    text: `✨ JUST LISTED ✨\n[ADDRESS], [CITY]\n[BEDS] bd | [BATHS] ba | [SQFT] sqft — $[PRICE]\n\nThis one won't last. Want to know what the monthly payment could look like? I partner with Crush Mortgage to get you real numbers fast.\n\nDM me for a private showing 🔑\n— [YOUR NAME], [BROKERAGE]\n\n#justlisted #[CITY]realestate #homeforsale #realtor`,
  },
  {
    title: "Open house",
    meta: "Weekend open house invite",
    text: `🏡 OPEN HOUSE this [DAY] [TIME]\n[ADDRESS], [CITY]\n\nSwing by, tour the home, and grab a financing sheet showing exactly what the payment could look like — courtesy of my lender partner, Crush Mortgage.\n\nCan't make it? DM me and I'll send the details.\n— [YOUR NAME], [BROKERAGE]\n\n#openhouse #[CITY]homes #househunting`,
  },
  {
    title: "Just sold",
    meta: "Closing / social proof",
    text: `🎉 SOLD & CLOSED! 🎉\nAnother happy homeowner in [CITY].\n\nFrom offer to keys, my team + Crush Mortgage made it smooth and on time. If you're thinking about buying or selling in [YEAR], let's talk.\n\n— [YOUR NAME], [BROKERAGE] 📲 [PHONE]\n\n#sold #closingday #realestate #[CITY]realtor`,
  },
  {
    title: "Down payment myth",
    meta: "Educational / engagement",
    text: `MYTH: "I need 20% down to buy a home." ❌\n\nTRUTH: Plenty of buyers get in with 3% down — and some qualify for $0 down. 👀\n\nMy lender partner Crush Mortgage has programs most people don't even know exist. Want me to connect you? Drop a 🏡 below or DM me.\n\n— [YOUR NAME], [BROKERAGE]\n\n#firsttimehomebuyer #homebuyingtips #realestate`,
  },
  {
    title: "First-time buyer tip",
    meta: "Value post",
    text: `First-time buyer? Do THIS before you tour a single home 👇\n\nGet pre-approved. It tells you your real budget and makes your offer stand out. It's free, and with Crush Mortgage it's usually same-day.\n\nSave this 📌 and DM me when you're ready — I'll walk you through it.\n\n— [YOUR NAME], [BROKERAGE]\n\n#firsttimehomebuyer #preapproval #homebuying101`,
  },
  {
    title: "Rate / market update",
    meta: "Timely post",
    text: `📉 Rates just moved — here's what it means for buyers in [CITY].\n\nEven a small change can shift your monthly payment (and your budget). I keep a pulse on it with my lender partner, Crush Mortgage.\n\nCurious what you'd qualify for today? DM "RATES" and I'll get you real numbers.\n\n— [YOUR NAME], [BROKERAGE]\n\n#mortgagerates #[CITY]realestate #housingmarket`,
  },
  {
    title: "Self-employed buyers",
    meta: "Niche / bank-statement loans",
    text: `Self-employed and been told you "don't qualify"? Not so fast. 💼\n\nCrush Mortgage has bank-statement and P&L programs built for business owners — no tax returns required. I help my clients tap into them all the time.\n\nDM me and let's see what's possible.\n\n— [YOUR NAME], [BROKERAGE]\n\n#selfemployed #bankstatementloan #realestate`,
  },
  {
    title: "Testimonial repost",
    meta: "Social proof",
    text: `"[PASTE A CLIENT QUOTE HERE]" ⭐️⭐️⭐️⭐️⭐️\n\nNothing means more than a happy client. Buying or selling in [CITY]? I'd love to help you write the next one.\n\n— [YOUR NAME], [BROKERAGE] 📲 [PHONE]\n\n#clientlove #testimonial #realestate`,
  },
];

const hashtags = [
  "#realtor",
  "#realestate",
  "#[CITY]realestate",
  "#homebuying",
  "#firsttimehomebuyer",
  "#justlisted",
  "#openhouse",
  "#dreamhome",
  "#preapproved",
  "#househunting",
  "#mortgagetips",
  "#newhome",
];

export default function SocialKitPage() {
  return (
    <>
      <PageHero
        eyebrow="Co-marketing · Social kit"
        title={
          <>
            Ready-to-post <span className="text-gradient">captions</span>
          </>
        }
        subtitle="Copy, paste, fill in the brackets, and post. Every caption pairs you with Crush Mortgage — compliant and on-brand."
      />

      <Container className="py-14">
        <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
          <span className="font-semibold text-ink-800">How to use:</span> tap
          Copy, paste into Instagram/Facebook, and replace anything in
          [BRACKETS] with your details. Pair with a listing photo or a flyer from
          the{" "}
          <span className="font-semibold text-crush-600">flyer generator</span>.
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {captions.map((c) => (
            <CopyCard key={c.title} title={c.title} meta={c.meta} text={c.text} />
          ))}
        </div>

        <Card className="mt-8">
          <Eyebrow>Hashtag bank</Eyebrow>
          <div className="mt-4 flex flex-wrap gap-2">
            {hashtags.map((h) => (
              <span
                key={h}
                className="rounded-full bg-surface-2 px-3 py-1 text-sm font-medium text-ink-700"
              >
                {h}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Mix 5–10 per post. Swap [CITY] for your market.
          </p>
        </Card>

        <div className="mt-12 rounded-3xl bg-ink-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Need the matching flyer?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Generate a co-branded property flyer to post alongside these
            captions.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/co-brand">Make a flyer</Button>
            <Button href="/co-marketing" variant="secondary">
              Back to toolkit
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
