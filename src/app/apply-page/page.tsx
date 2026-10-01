"use client";

import { useState } from "react";
import { Container, PageHero, Card, Eyebrow } from "@/components/ui";
import { useAuth } from "@/components/auth/AuthProvider";
import { fullName } from "@/lib/profile";
import { floifyUrl, requestFloifyPage, shareText } from "@/lib/floify";
import { qrImage } from "@/lib/openHouse";
import { site } from "@/lib/site";
import { toast } from "@/lib/toast";

/** Copy-to-clipboard that degrades to select-the-text rather than failing silently. */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          toast({
            emoji: "📋",
            title: "Couldn't copy automatically",
            body: "Select the text and copy it — your browser blocked clipboard access.",
          });
        }
      }}
      className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-surface-2"
    >
      {done ? "Copied ✓" : label}
    </button>
  );
}

/**
 * What the client sees, drawn from the pieces we know are on the Floify page:
 * Crush's branding (it is Crush's Floify account) and the agent's photo.
 *
 * A PREVIEW, AND LABELLED AS ONE. The real page is Floify's and its exact
 * layout is theirs to change. Showing an agent an approximation and letting
 * them believe it is pixel-exact would be worse than showing nothing — so the
 * frame says what it is and the link to the real thing sits next to it.
 */
function Preview({ headshot, name, brokerage }: { headshot: string | null; name: string; brokerage: string | null }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex items-center gap-3 border-b border-border bg-ink-900 px-5 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/crush-mortgage-logo-primary.png" alt="Crush Mortgage" className="h-7 w-auto" />
        <span className="text-xs font-semibold text-slate-300">Secure application</span>
      </div>
      <div className="flex items-center gap-4 px-5 py-5">
        {headshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={headshot} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover object-top" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-[10px] text-muted">
            Your photo
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-900">{name || "Your name"}</p>
          <p className="text-xs text-muted">{brokerage || "Your brokerage"}</p>
          <p className="mt-1 text-xs text-muted">
            Referred by your agent · financing by {site.company}
          </p>
        </div>
      </div>
      <div className="border-t border-border px-5 py-4">
        <span className="inline-block rounded-full bg-crush-500 px-5 py-2 text-xs font-semibold text-white">
          Start my application
        </span>
      </div>
    </div>
  );
}

export default function ApplyPagePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const url = floifyUrl(profile);
  const name = fullName(profile);
  const requested = !!profile?.floify_requested_at;

  async function request() {
    if (!user) return;
    setBusy(true);
    const { ok, notified } = await requestFloifyPage();
    setBusy(false);
    if (!ok) {
      toast({ emoji: "⚠️", title: "Couldn't send that", body: "Please try again in a moment." });
      return;
    }
    await refreshProfile();
    toast(
      notified
        ? {
            emoji: "📨",
            title: "Request sent",
            body: "We'll build your page and email you the link, usually within a business day.",
          }
        : {
            // Recorded but the team email did not go out. Saying so beats
            // promising a reply that nothing was told to send.
            emoji: "📝",
            title: "Request saved",
            body: "It's on our list. If you don't hear back in a couple of days, give us a nudge.",
          },
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Your tools"
        title={<>Your co-branded <span className="text-gradient">application page</span></>}
        subtitle="A secure loan application with your photo and your name on it. Send it to a buyer and they can apply in about ten minutes from their phone — and you stay in the loop."
      />

      <Container className="py-14">
        {url ? (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow>Your link</Eyebrow>
              <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
                <p className="break-all font-mono text-sm text-ink-900">{url}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyButton text={url} label="Copy link" />
                  <CopyButton text={shareText(name, url)} label="Copy a ready-to-send message" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-crush-500 px-4 py-2 text-sm font-semibold text-white hover:bg-crush-600"
                  >
                    Open it →
                  </a>
                </div>
              </div>

              <Card className="mt-6">
                <p className="text-sm font-bold text-ink-900">Where to put it</p>
                <ul className="mt-3 space-y-2.5">
                  {[
                    "In your email signature, under your phone number.",
                    "On the back of your business card as a QR code.",
                    "On open house flyers and sign-in sheets — a buyer who's serious will scan it standing in the kitchen.",
                    "In your listing presentation, as proof your buyers come pre-approved.",
                    "Texted to any buyer who says \"I should probably get pre-approved first\".",
                  ].map((s) => (
                    <li key={s} className="flex gap-3 text-sm text-ink-800">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crush-500" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div>
              <Eyebrow>QR code</Eyebrow>
              <div className="mt-4 rounded-2xl border border-border bg-white p-6 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrImage(url, 240)} alt="QR code for your application page" className="mx-auto h-[240px] w-[240px]" />
                <p className="mt-3 text-xs text-muted">
                  Right-click to save. Prints cleanly at about an inch square.
                </p>
              </div>

              <div className="mt-6">
                <Eyebrow>Roughly what they&apos;ll see</Eyebrow>
                <div className="mt-4">
                  <Preview
                    headshot={profile?.headshot_url ?? null}
                    name={name}
                    brokerage={profile?.brokerage ?? null}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  A preview, not the real page — the live one is Floify&apos;s and may
                  differ. Open your link to see it exactly.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <Card className="p-7">
              <h2 className="text-xl font-bold text-ink-900">
                {requested ? "We're building it" : "Get your own application page"}
              </h2>
              {requested ? (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Your request is in. We&apos;ll set the page up on our Floify account
                  with your photo and send you the link — usually within a business
                  day. Nothing else is needed from you.
                </p>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    We&apos;ll build you a secure application page carrying Crush
                    branding and your photo, at its own web address. Buyers you send
                    there apply in about ten minutes, upload documents from their
                    phone, and you&apos;re kept in the loop as it moves.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    It costs nothing and there&apos;s no setup on your end — we make
                    it and send you the link.
                  </p>
                </>
              )}

              {!profile?.headshot_url && (
                <p className="mt-4 rounded-xl border border-crush-200 bg-crush-50 px-4 py-3 text-sm text-crush-700">
                  Add a headshot to your profile first — it&apos;s the photo that goes
                  on the page.
                </p>
              )}

              {!requested && (
                <button
                  type="button"
                  onClick={request}
                  disabled={busy}
                  className="mt-6 rounded-full bg-crush-500 px-7 py-3 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Request my application page"}
                </button>
              )}
            </Card>

            <div className="mt-8">
              <Eyebrow>Roughly what they&apos;ll see</Eyebrow>
              <div className="mt-4">
                <Preview
                  headshot={profile?.headshot_url ?? null}
                  name={name}
                  brokerage={profile?.brokerage ?? null}
                />
              </div>
            </div>
          </div>
        )}

        <p className="mt-10 text-xs leading-relaxed text-muted">
          The application is hosted by Crush Mortgage on Floify. Co-marketing is
          provided under RESPA-compliant terms — nothing here requires you to send
          business to Crush Mortgage, and your clients choose their own lender.
          Crush Mortgage, NMLS #{site.companyNmls}. Equal Housing Lender.
        </p>
      </Container>
    </>
  );
}
