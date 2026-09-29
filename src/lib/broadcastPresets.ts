/**
 * Ready-written newsletter drafts for /admin/broadcast.
 *
 * WHY THESE ARE DRAFTS AND NOT A SCHEDULE. A broadcast goes to every opted-in
 * agent from our verified sending domain with our NMLS in the footer. Nothing
 * here sends on its own and nothing here should: loading a preset fills the
 * subject and message boxes, and a person still reads it, edits it, sends a
 * test to themselves, and confirms. The automation worth having is not having
 * to write it — the send stays a decision.
 *
 * {{first_name}} is substituted per recipient by the backend.
 */

export type BroadcastPreset = {
  key: string;
  /** Shown on the button. */
  label: string;
  /** One line about when to send it. */
  when: string;
  subject: string;
  body: string;
};

export const BROADCAST_PRESETS: BroadcastPreset[] = [
  {
    key: "dpa_launch",
    label: "Down payment assistance is live",
    when: "One-time announcement — the tool is new to the suite.",
    subject: "New in your suite: check any address for down payment assistance",
    body: `Hi {{first_name}},

There's something new in your Crush suite, and it's the kind of thing that wins listings rather than just helping buyers.

You can now run any California address against thousands of down payment assistance programs — grants, forgivable seconds, deferred loans, Mortgage Credit Certificates — from cities, counties, the state, and employers. It's the Down Payment Resource database, provided through CRMLS.

**Here's the part most agents miss.** Eligibility is frequently tied to the address, not the person. That means a listing can sit inside a program boundary no matter who ends up buying it. Run your listing before you go live and you may find you're marketing to a wider pool than the comps suggest — and "buyers at this address may qualify for down payment assistance" is a real reason a seller picks you over the agent who didn't check.

Three ways to use it this week:

- Run your active listings. Put what you find in the marketing.
- Take it to your next listing appointment. A bigger buyer pool is a bigger argument.
- Use it on the buyer who went quiet. Most of them stalled on the down payment, not the payment.

It takes about two minutes and asks for the address, an estimated price, household income and household size.

Check an address: https://crushyourmarket.com/down-payment-assistance

Found something? Send the buyer through a pre-approval and we'll confirm what it can be layered with, what it adds to the timeline, and what the monthly number actually becomes. A match from the tool is an estimate from the program sponsor's own rules — not an approval — so let's confirm it before it goes in a contract.

Go crush it,
Crush Mortgage`,
  },
  {
    key: "dpa_reminder",
    label: "Down payment assistance reminder",
    when: "A shorter nudge to send later, once the announcement has landed.",
    subject: "Did you run your listings through the assistance tool?",
    body: `Hi {{first_name}},

Quick reminder, because this one is easy to forget you have.

Down payment assistance eligibility often follows the **address** — so before your next listing goes live, run it. If it falls inside a program boundary, that's a wider buyer pool and a line in your marketing that your competition doesn't have.

Same tool works on the buyer who told you they need another year to save. A lot of them don't.

Run an address: https://crushyourmarket.com/down-payment-assistance

Programs open, close and refill, so a no from six months ago isn't a no today.

Go crush it,
Crush Mortgage`,
  },
];
