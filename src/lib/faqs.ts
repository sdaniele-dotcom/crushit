/**
 * The questions buyers actually ask, in one place.
 *
 * Shared so the homepage can show a handful and /faq can show all of them
 * without two lists drifting into disagreement — which, on questions about
 * credit scores and down payments, would be worse than having no answers.
 *
 * EVERYTHING HERE IS GENERAL EDUCATION, deliberately. No rate, no APR, no
 * "you qualify for" — a specific figure on a public page is an advertisement
 * with trigger terms attached, and it would be stale within a week besides.
 * Anything numeric is a programme minimum that is set by the agency, not by us.
 */

export type Faq = { q: string; a: string; topic: string };

export const faqs: Faq[] = [
  {
    topic: "Down payment",
    q: "How much do I actually need for a down payment?",
    a: "Less than most people think. Conventional loans start at 3% down for first-time buyers, FHA at 3.5%, and VA at zero for those who qualify. On top of that, California has down-payment assistance programs that many buyers never hear about. The bigger number to plan for is usually closing costs, which run roughly 2–5% of the price.",
  },
  {
    topic: "Down payment",
    q: "Can my down payment be a gift?",
    a: "Usually yes. FHA allows the entire down payment to be gifted, and conventional loans allow gifts too, with some limits depending on the loan and the property. The lender will want a short letter from whoever gives it, confirming it is a gift and not a loan, plus a record of the transfer.",
  },
  {
    topic: "Credit",
    q: "What credit score do I need?",
    a: "FHA can work from 580, and conventional generally from 620. A higher score does not just change whether you qualify — it changes your rate and your mortgage insurance, which is why it is worth knowing where you stand before you shop rather than after.",
  },
  {
    topic: "Credit",
    q: "Does getting pre-approved hurt my credit?",
    a: "A pre-approval involves a credit pull, which can move a score by a few points. Mortgage inquiries made within a short shopping window are generally counted as one inquiry, so comparing lenders does not multiply the effect.",
  },
  {
    topic: "Payments",
    q: "What's actually in a monthly payment?",
    a: "Principal and interest, property taxes, homeowners insurance, mortgage insurance if you put less than 20% down, and HOA dues if the property has them. A quote that shows only principal and interest is not wrong, it is just incomplete — and the gap is often several hundred dollars.",
  },
  {
    topic: "Payments",
    q: "What is mortgage insurance, and can I avoid it?",
    a: "It protects the lender, not you, and it is generally required when you put down less than 20%. On a conventional loan it falls away once you have built enough equity. On an FHA loan it usually stays for the life of the loan, which is the main reason somebody with the credit for either would weigh them against each other.",
  },
  {
    topic: "Buying",
    q: "Is it really cheaper to buy than to rent?",
    a: "Sometimes, and not always — it depends on your rent, the price, the rate and how long you stay. That is a question with an arithmetic answer rather than a slogan, which is why the rent-vs-own calculator on this site shows the year-by-year numbers instead of a verdict.",
  },
  {
    topic: "Buying",
    q: "What's the difference between pre-qualified and pre-approved?",
    a: "A pre-qualification is an estimate based on what you tell somebody. A pre-approval means a lender has looked at your documents and your credit. In a competitive offer, sellers take the second one seriously and often disregard the first.",
  },
  {
    topic: "Buying",
    q: "How long does the whole thing take?",
    a: "A pre-approval is usually same-day or next-day once your documents are in. From an accepted offer to keys is commonly around 30 days, though it moves with the appraisal, the title work and how quickly everyone returns paperwork.",
  },
  {
    topic: "Working with us",
    q: "What does any of this cost me?",
    a: "Nothing to ask. The calculators, the webinars and the guides are free, and a conversation about your numbers is free. You are not charged anything unless you close a loan.",
  },
  {
    topic: "Working with us",
    q: "I'm self-employed. Is that a problem?",
    a: "It is a complication, not a barrier. Traditional underwriting looks at your tax returns, which for a self-employed borrower often understate what you actually earn. There are bank-statement programs built for exactly that, and they are worth asking about before you assume the answer is no.",
  },
  {
    topic: "Working with us",
    q: "I already have a loan estimate from another lender. Will you look at it?",
    a: "Yes, and that is a sensible thing to ask for. Bring it over and we will go through the rate, the fees and the terms line by line, whether or not you end up moving. Knowing what you have been quoted is worth something even if you stay where you are.",
  },
];

/** The handful worth putting on the homepage. */
export const topFaqs = faqs.slice(0, 6);

/** Distinct topics, in the order they first appear. */
export function faqTopics(): string[] {
  return [...new Set(faqs.map((f) => f.topic))];
}
