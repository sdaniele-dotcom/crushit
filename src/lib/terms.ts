/**
 * terms.ts — the agent terms of use, and the version stamp that drives consent.
 *
 * ⚠️ BEFORE THIS GOES LIVE: have the broker's counsel read §3. It grants Crush
 * a licence over an agent's name, likeness and marketing materials, and a
 * licence like that is the part of a terms page that actually gets litigated.
 * Nothing here is legal advice; it is a draft written to be reviewed.
 *
 * WHY §3.3 IS SHAPED THE WAY IT IS, because it will look over-careful to
 * anyone who has not run into it. Listing photographs are usually owned by the
 * PHOTOGRAPHER, who licenses them to the listing agent for marketing that
 * listing — often not sublicensable, often expiring when the listing closes.
 * MLS rules add their own layer. So an agent frequently CANNOT grant us rights
 * to their listing photos, and a clause claiming they did would be void where
 * it mattered and would hand us the liability when the photographer invoiced.
 * §3.3 therefore takes a licence only "to the extent you have the right to
 * grant it", asks for a promise, and puts the indemnity where the knowledge
 * is. That is the honest structure and the one that survives contact.
 *
 * VERSIONING. TERMS_VERSION is stored on the profile when an agent accepts.
 * Change the text materially → bump the version → every agent is asked again
 * on their next page load. Bumping it for a typo fix is a bad idea: it logs
 * everyone out of their consent and trains people to click through.
 */

/** Bump ONLY for a material change. Stored verbatim in profiles.terms_version. */
export const TERMS_VERSION = "2026-10-01-rev2";

/**
 * Shown on the consent gate as the plain-English summary of §3.
 *
 * ORDER IS DELIBERATE: what we will not do comes before what we are asking
 * for. An agent is being handed a licence request at the door, and the first
 * line they read decides whether they read the second.
 */
export const CONSENT_SUMMARY: string[] = [
  "We never sell your information, never suggest you work for Crush Mortgage, and never put you behind an endorsement you didn't give.",
  "When we feature you, it's as a partner agent: your co-branded flyer on our social, your headshot on a post about a closing we did together.",
  "Say the word and we stop — any time, no reason needed.",
  "For listing photos, only upload what you have the right to share. Not sure who owns one? Don't upload it, tell us, and we'll sort it out.",
];

export type TermsSection = { heading: string; body: string[] };

export const TERMS: TermsSection[] = [
  {
    heading: "1. Who this is between",
    body: [
      "These terms are between you — a licensed real estate agent or broker using the CRUSH IT Agent Suite — and Crush Mortgage. “We”, “us” and “Crush” mean Crush Mortgage. “The suite” means crushyourmarket.com and the tools on it.",
      "You use the suite as an independent real estate professional. Nothing here makes you our employee, our agent, or a partner in a legal sense, and nothing here obliges you or your clients to use Crush Mortgage for financing.",
    ],
  },
  {
    heading: "2. Your account",
    body: [
      "Keep your login to yourself and keep the details on your profile accurate — your licence number and brokerage appear on materials that go out to the public with our name on them too.",
      "You are responsible for what happens under your account. Tell us promptly if you think someone else has access to it.",
      "We may suspend or close an account that is being used to break these terms, to break real estate or advertising law, or to harm someone.",
    ],
  },
  {
    heading: "3. Showing off the work we do together",
    body: [
      "You are the face of your business and we are not trying to change that. When we feature you, it is as a partner agent we co-market with — your co-branded flyer on our Instagram, your headshot on a post about a closing we worked on together, an open house kit we built for you shown as an example of what we make for agents.",
      "That is the whole of what this section is for. The next four parts say what that means in practice, starting with the limits.",
    ],
  },
  {
    heading: "3.1 What we will never do",
    body: [
      "We will never sell your personal information.",
      "We will never present you as endorsing a loan product, a rate, or a position you have not actually endorsed.",
      "We will never imply you are employed by Crush Mortgage, or that your clients have to use us.",
      "We will never publish your production figures, sales volume or income unless you have told us in writing that we can.",
      "We will never use a photo of a client, a child, or anyone other than you without that person's own permission.",
      "We will never edit a photo of you in a way that misrepresents you.",
    ],
  },
  {
    heading: "3.2 What we may use, and what for",
    body: [
      "You give us permission to use your name, headshot, logo, licence number and brokerage, together with the co-branded pieces the suite makes for you, to show the co-marketing we do with agents — on social media, our website, email, print and at events.",
      "If you give us a testimonial, or say something about working with us that you are happy for us to repeat, we may use that too, with your name and photo. We may also mention transactions we worked on together, the ordinary way a lender and an agent describe their work.",
      "We may resize, crop and lay your materials out next to our own branding so they fit the format. That is the extent of it — this permission is for showing the work, not for anything else.",
    ],
  },
  {
    heading: "3.3 Photos of a property",
    body: [
      "Worth knowing, because it catches people out: listing photographs usually belong to the photographer who took them, and are licensed to you for marketing that listing. That licence often does not let you pass them on, and your MLS adds rules of its own.",
      "So we only take what you are actually able to give. Upload what you have the right to share, and we will use it the way this section describes.",
      "If you are not sure who owns a photo, do not upload it — tell us, and we will get the permission or shoot a replacement at our cost.",
      "If a claim lands on us because something you uploaded was not yours to share, we will come to you about the reasonable costs of sorting it out. We will tell you as soon as we hear about it and handle it together.",
    ],
  },
  {
    heading: "3.4 Changing your mind, any time",
    body: [
      "Email us and we stop. No reason needed, and it does not affect your account or anything else you get from us.",
      "We will take your name, photo and materials out of new marketing promptly, and in any case within 30 days. We cannot recall what is already printed, already mailed, or already posted and shared on by other people, and copies stay in our own records and backups.",
      "Stopping does not undo anything we did while the permission was in place.",
    ],
  },
  {
    heading: "3.5 Our templates stay ours",
    body: [
      "The templates, designs and software behind the suite are ours. Use them for your real estate marketing for as long as you have an account — that is what they are for.",
      "Please do not resell them, license them on to someone else, or strip our branding out and present the designs as your own.",
    ],
  },
  {
    heading: "4. Advertising rules you are agreeing to follow",
    body: [
      "Anything you distribute from the suite is your advertising, and it has to meet the rules that apply to you: your DRE licence number and brokerage name on it, your broker's own advertising policy, the NAR and local association rules you are bound by, and MLS rules about listing data and photos.",
      "Do not alter the loan terms, rates, payments or disclosures on a co-branded piece. The numbers come from a lender and the disclosures go with them — editing one and not the other turns a compliant flyer into a false advertisement, and your name is on it as well as ours.",
      "Do not use the suite to send unsolicited texts or emails in breach of the rules that govern them.",
    ],
  },
  {
    heading: "5. Co-marketing, plainly",
    body: [
      "Crush Mortgage pays for the suite and the materials in it. Our name and NMLS appear alongside yours on co-branded pieces because we are paying for our share of the advertising, and the arrangement is intended to comply with RESPA, including Section 8.",
      "Nothing in these terms is payment for a referral, and nothing here requires you to send us business, to recommend us, or to discourage a client from using another lender. Your clients choose their own lender. If anyone at Crush ever suggests otherwise to you, we want to know.",
    ],
  },
  {
    heading: "6. The numbers in the suite are estimates",
    body: [
      "Payment scenarios, calculators, program matches and down payment assistance results are estimates for marketing and education. They are not a loan approval, a rate lock, or a commitment to lend. Actual terms depend on a full application, credit approval and underwriting.",
      "Programs, rates and guidelines change without notice. Check anything time-sensitive with us before it goes in a contract.",
      "Some tools, including the down payment assistance search, are provided by third parties. We do not control their data and cannot guarantee it.",
    ],
  },
  {
    heading: "7. Your data, and your clients' data",
    body: [
      "We store your profile, your listings, and the open house sign-ins and feedback collected through your account. If you connect a CRM, we forward those leads to the destination you give us; we never ask for or store your CRM password.",
      "The people who sign in at your open houses are your contacts. We use their details to deliver them to you and to run the suite, not to market to them on our own behalf without a lawful basis for doing so.",
      "Tell the people whose details you collect what you are doing with them. The sign-in and feedback forms carry a short notice for exactly that reason.",
      "You can ask us for a copy of your data, or for your account and its data to be deleted, by emailing the address below.",
    ],
  },
  {
    heading: "8. Availability",
    body: [
      "We will try to keep the suite running and the content accurate, but we provide it as it is. We do not promise it will be uninterrupted or error-free, and we are not responsible for a marketing opportunity missed because a tool was down.",
      "To the extent the law allows, our total liability to you connected with the suite is limited to what you paid us for it, which for most agents is nothing. Nothing here limits liability that cannot legally be limited.",
    ],
  },
  {
    heading: "9. Changes to these terms",
    body: [
      "If we change these terms materially, we will ask you to accept the new version the next time you log in. You will be able to read what changed before you accept.",
      "If you do not want to accept a new version, you can close your account instead. For marketing already published, section 3.4 is what applies.",
    ],
  },
  {
    heading: "10. Ending it",
    body: [
      "You can close your account at any time by emailing us. We can close an account that breaches these terms, or stop offering the suite, with reasonable notice where we can give it.",
      "Sections 3.3 (photos), 3.4 (stopping), 3.5 (our templates stay ours), 6, 8 and 11 carry on after an account closes.",
    ],
  },
  {
    heading: "11. Law and disputes",
    body: [
      "California law governs these terms, and the state and federal courts serving Los Angeles County are where disputes about them belong.",
      "If part of these terms turns out to be unenforceable, the rest still stands.",
    ],
  },
  {
    heading: "12. Reaching us",
    body: [
      "Crush Mortgage, 3750 Schaufele Ave, Suite 270A, Long Beach, CA 90808. NMLS #169136. Equal Housing Lender.",
      "Questions, permission withdrawals and data requests: info@crushmortgage.com.",
    ],
  },
];
