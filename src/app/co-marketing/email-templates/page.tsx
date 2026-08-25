import type { Metadata } from "next";
import { ActiveListingProvider, ListingPicker } from "@/components/ActiveListing";
import { Container, PageHero, Button } from "@/components/ui";
import { CopyCard } from "@/components/CopyCard";

export const metadata: Metadata = {
  title: "Email Templates",
  description:
    "Copy-and-send email templates for agents — new leads, pre-approval follow-ups, past clients, and 'thinking of selling' homeowners.",
};

const emails: { title: string; meta: string; text: string }[] = [
  {
    title: "New lead — intro",
    meta: "Subject: Great to connect, [FIRST NAME]!",
    text: `Hi [FIRST NAME],\n\nThanks for reaching out — I'd love to help you find the right home in [CITY].\n\nThe best first step is a quick pre-approval so we know your true budget before we start touring. It's free, no obligation, and my lender partner Crush Mortgage usually turns it around the same day.\n\nWant me to connect you? Just reply here and I'll set it up.\n\nTalk soon,\n[YOUR NAME]\n[BROKERAGE] · [PHONE]`,
  },
  {
    title: "Pre-approval nudge",
    meta: "Subject: One quick step before we tour homes",
    text: `Hi [FIRST NAME],\n\nExcited to start looking at homes with you! Before we do, let's get you pre-approved so your offer stands out and we shop in the right price range.\n\nMy lender partner at Crush Mortgage makes it painless — no credit surprises, and they'll lay out the monthly payment clearly.\n\nCan I introduce you today? Reply "yes" and I'll make the connection.\n\nBest,\n[YOUR NAME]\n[BROKERAGE] · [PHONE]`,
  },
  {
    title: "Open house follow-up",
    meta: "Subject: Thanks for stopping by [ADDRESS]",
    text: `Hi [FIRST NAME],\n\nGreat meeting you at the open house on [ADDRESS]! What did you think?\n\nIf it's a contender, I can pull together financing scenarios (with Crush Mortgage) so you know exactly what the payment would look like. And if it wasn't the one, I've got a few others that might fit better.\n\nWant me to send options? Just reply here.\n\nCheers,\n[YOUR NAME]\n[BROKERAGE] · [PHONE]`,
  },
  {
    title: "Past client check-in",
    meta: "Subject: Happy home-iversary, [FIRST NAME]! 🏡",
    text: `Hi [FIRST NAME],\n\nCan you believe it's been [X] year(s) since you got the keys to [ADDRESS]? Time flies!\n\nJust checking in — if you ever want to know what your home is worth now, or you're thinking about a move (or a refinance with Crush Mortgage), I'm always here.\n\nAnd if you know anyone looking to buy or sell, I'd be grateful for the intro.\n\nWarmly,\n[YOUR NAME]\n[BROKERAGE] · [PHONE]`,
  },
  {
    title: "Thinking of selling?",
    meta: "Subject: Curious what [ADDRESS] could sell for?",
    text: `Hi [FIRST NAME],\n\nHomes in [NEIGHBORHOOD] have been moving, and I've had buyers asking about your area specifically.\n\nIf you've ever wondered what your home could sell for — or what buying your next place would look like — I'm happy to put together a no-pressure estimate. I'll even include financing numbers from Crush Mortgage so you can plan the whole move.\n\nWant me to run it? Just reply here.\n\nBest,\n[YOUR NAME]\n[BROKERAGE] · [PHONE]`,
  },
  {
    title: "Rate-drop / refi alert",
    meta: "Subject: Rates moved — worth a quick look?",
    text: `Hi [FIRST NAME],\n\nRates have shifted, and it might be a good time to revisit your options — whether that's buying sooner than planned or refinancing your current loan.\n\nMy lender partner Crush Mortgage can run the numbers in a few minutes with no obligation. Want me to have them take a look for you?\n\nReply here and I'll connect you.\n\nBest,\n[YOUR NAME]\n[BROKERAGE] · [PHONE]`,
  },
];

export default function EmailTemplatesPage() {
  return (
    <ActiveListingProvider>
      <PageHero
        eyebrow="Co-marketing · Email"
        title={
          <>
            Copy-and-send <span className="text-gradient">email templates</span>
          </>
        }
        subtitle="Six proven emails for every stage — from a fresh lead to a past client. Copy, personalize the brackets, and send."
      />

      <Container className="py-14">
        <ListingPicker />
        <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
          <span className="font-semibold text-ink-800">How to use:</span> tap
          Copy, paste into your email or CRM, and replace [BRACKETS]. The subject
          line is in the card&apos;s subtitle.
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {emails.map((e) => (
            <CopyCard key={e.title} title={e.title} meta={e.meta} text={e.text} />
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-ink-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Turn a reply into a pre-approval
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            When a client says yes, send them straight to a fast, no-obligation
            pre-approval.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/about/#contact">Connect a client</Button>
            <Button href="/resources" variant="secondary">
              Back to toolkit
            </Button>
          </div>
        </div>
      </Container>
    </ActiveListingProvider>
  );
}
