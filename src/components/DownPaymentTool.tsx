"use client";

import { useState } from "react";
import { site } from "@/lib/site";

/**
 * Down Payment Connect, embedded in the page rather than linked out.
 *
 * WHY AN IFRAME. The tool is Down Payment Resource's, fed by CRMLS and
 * subscribed under Shannon — its eligibility rules cover thousands of programs
 * and change constantly, and there is no API. Rebuilding the questionnaire
 * would mean maintaining a copy of someone else's eligibility logic that goes
 * wrong silently. The frame is the honest version: their tool, their data, our
 * page around it.
 *
 * FRAMING IS ALLOWED, and that is worth knowing rather than assuming. Checked
 * 9/29: the response carries no `frame-ancestors` directive, and its
 * `X-Frame-Options: ALLOWALL` is not a valid value, so browsers apply no
 * restriction. If Down Payment Resource ever tightens that, the frame goes
 * blank — which is why the "open it in a new tab" link below is always visible
 * rather than being a fallback that only appears when something detects the
 * failure. Nothing can detect it: a cross-origin frame that refuses to load
 * looks, from this side, exactly like one that is still loading.
 *
 * HEIGHT IS FIXED, and it has to be. The frame is cross-origin, so the page
 * cannot measure its content, and the tool grows as results come back. A tall
 * frame that scrolls inside itself is the least-bad option; anything shorter
 * hides the results, which are the entire point.
 */
export function DownPaymentTool({
  className = "",
  title = "Find down payment help",
}: {
  className?: string;
  title?: string;
}) {
  const [show, setShow] = useState(false);
  const url = site.downPaymentToolUrl;
  if (!url) return null;

  return (
    <div className={className}>
      {show ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-white">
          <iframe
            src={url}
            title={title}
            /*
              The tool asks for a household income and an address. `referrerPolicy`
              keeps our page's URL off their request, and the sandbox is the
              narrowest set that still lets a form submit and navigate within
              the frame — no top-level navigation, so it cannot redirect the
              page out from under someone mid-form.
            */
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
            loading="lazy"
            className="h-[1500px] w-full border-0 sm:h-[1400px]"
          />
        </div>
      ) : (
        /*
          Loaded on click, not on page load. It is a third-party page with its
          own analytics, and on a page most visitors are reading for something
          else, loading it unasked means every one of them is counted as a
          visitor to a tool they never opened — which makes the tool's own
          numbers useless to the person who subscribed to it.
        */
        <button
          type="button"
          onClick={() => setShow(true)}
          className="w-full rounded-3xl border border-dashed border-crush-300 bg-crush-50 px-6 py-10 text-center transition-colors hover:bg-crush-100"
        >
          <span className="block text-lg font-bold text-ink-900">{title}</span>
          <span className="mt-1 block text-sm text-muted">
            Answer a few questions about the home, your household and your income — it checks
            thousands of assistance programs and shows the ones you may qualify for.
          </span>
          <span className="mt-4 inline-block rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white">
            Check your eligibility
          </span>
        </button>
      )}

      <p className="mt-3 text-xs text-muted">
        Provided by Down Payment Resource through CRMLS.{" "}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-ink-800"
        >
          Open it in a new tab
        </a>{" "}
        if it doesn&apos;t load here. Eligibility shown by the tool is an estimate from the
        program sponsors&apos; own rules — we&apos;ll confirm what you actually qualify for.
      </p>
    </div>
  );
}
