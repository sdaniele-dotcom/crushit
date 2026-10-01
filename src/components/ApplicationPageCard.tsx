"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { fullName } from "@/lib/profile";
import { floifyUrl, requestFloifyPage, shareText } from "@/lib/floify";
import { qrImage } from "@/lib/openHouse";
import { toast } from "@/lib/toast";

/**
 * The agent's co-branded loan application page, on their dashboard.
 *
 * ON THE DASHBOARD RATHER THAN ITS OWN PAGE. A link an agent is meant to put
 * in their email signature and on the back of a card is a thing they need to
 * COPY, repeatedly, months apart. A section they have to remember exists and
 * navigate to is one they will not find again; the dashboard is the page they
 * already land on.
 *
 * It stays compact for the same reason — this sits among their listings and
 * stars, so it earns one card, not a tour.
 */
export function ApplicationPageCard() {
  const { profile, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<"link" | "message" | null>(null);
  const url = floifyUrl(profile);
  const requested = !!profile?.floify_requested_at;

  async function copy(text: string, which: "link" | "message") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast({
        emoji: "📋",
        title: "Couldn't copy automatically",
        body: "Your browser blocked clipboard access — select the link and copy it.",
      });
    }
  }

  async function request() {
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
            emoji: "📝",
            title: "Request saved",
            body: "It's on our list. If you don't hear back in a couple of days, give us a nudge.",
          },
    );
  }

  if (url) {
    return (
      <section className="mt-8 rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">
              Your application page
            </h2>
            <p className="mt-1 text-sm text-muted">
              Your photo, your name, a secure application. Send it to any buyer who
              needs a pre-approval.
            </p>
            <p className="mt-3 break-all rounded-xl bg-surface px-3 py-2 font-mono text-xs text-ink-900">
              {url}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copy(url, "link")}
                className="rounded-full bg-crush-500 px-4 py-2 text-xs font-semibold text-white hover:bg-crush-600"
              >
                {copied === "link" ? "Copied ✓" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => copy(shareText(fullName(profile), url), "message")}
                className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-surface-2"
              >
                {copied === "message" ? "Copied ✓" : "Copy a text to send"}
              </button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-surface-2"
              >
                Open
              </a>
            </div>
          </div>
          <div className="shrink-0 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImage(url, 120)}
              alt="QR code for your application page"
              className="h-[120px] w-[120px] rounded-lg border border-border bg-white p-1"
            />
            <p className="mt-1 text-[10px] text-muted">Right-click to save</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-crush-200 bg-gradient-to-br from-crush-50 to-white p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-crush-700">
        Your application page
      </h2>
      {requested ? (
        <p className="mt-2 text-sm text-ink-800">
          We&apos;re building it — we&apos;ll email you the link, usually within a
          business day. Nothing else needed from you.
        </p>
      ) : (
        <>
          <p className="mt-2 max-w-2xl text-sm text-ink-800">
            Want your own secure loan application page, with your photo and name on
            it? Send it to a buyer and they apply in about ten minutes from their
            phone — and you stay in the loop. It&apos;s free and we build it for you.
          </p>
          {!profile?.headshot_url && (
            <p className="mt-3 text-xs font-medium text-crush-700">
              Add a headshot to your profile first — it&apos;s the photo that goes on
              the page.
            </p>
          )}
          <button
            type="button"
            onClick={request}
            disabled={busy}
            className="mt-4 rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Request my application page"}
          </button>
        </>
      )}
    </section>
  );
}
