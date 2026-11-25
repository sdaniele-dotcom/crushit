"use client";

import { site } from "@/lib/site";

/**
 * Down Payment Connect — opened in a new tab, NOT embedded.
 *
 * It used to be an iframe, and the iframe was broken in a way that looked
 * like it worked. The tool rendered, took every answer, and then returned
 * "Invalid request" the moment somebody submitted it. Agents reported the
 * page as broken; nothing in our logs showed anything wrong, because nothing
 * on our side was.
 *
 * THE CAUSE, confirmed against the live service on 24/11/2026. It sets two
 * cookies:
 *
 *   _wfr_workflow_state   SameSite=Lax    the multi-step form's state
 *   _session_id           SameSite=None   fine in a frame
 *
 * A SameSite=Lax cookie is not sent — or even stored — in a third-party
 * iframe. Loading the tool directly, the browser keeps `_wfr_workflow_state`;
 * loading the identical URL inside our frame, it is absent entirely. So the
 * questionnaire ran with no workflow state on the server, and the submit was
 * rejected. The form's own first screen worked because `_session_id` is
 * SameSite=None, which is exactly why this failed at the last step instead of
 * the first.
 *
 * NOTHING ON OUR SIDE CAN FIX THAT. No iframe attribute makes a browser
 * accept a Lax cookie cross-site; that is the entire point of the setting.
 * The earlier note in this file that "framing is allowed" was right about
 * X-Frame-Options and wrong about the consequence: the service permits the
 * frame to RENDER, and its cookies stop it from WORKING.
 *
 * If Down Payment Resource ever sets that cookie to `SameSite=None; Secure`,
 * as they already do for the session, embedding becomes possible again and
 * this can go back to a frame.
 */
export function DownPaymentTool({
  className = "",
  title = "Find down payment help",
}: {
  className?: string;
  title?: string;
}) {
  const url = site.downPaymentToolUrl;
  if (!url) return null;

  return (
    <div className={className}>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="block w-full rounded-3xl border border-crush-200 bg-crush-50 px-6 py-10 text-center transition-colors hover:bg-crush-100"
      >
        <span className="block text-lg font-bold text-ink-900">{title}</span>
        <span className="mx-auto mt-1 block max-w-xl text-sm text-muted">
          Answer a few questions about the home, your household and your income
          — it checks hundreds of California assistance programs and shows the
          ones you may qualify for.
        </span>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white">
          Check your eligibility
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M14 4h6v6M20 4l-9 9M18 13.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H11" />
          </svg>
        </span>
        {/* Said plainly, because a new tab the visitor did not ask for is
            worse than one they expected. */}
        <span className="mt-3 block text-xs text-muted">Opens in a new tab</span>
      </a>

      <p className="mt-3 text-xs text-muted">
        Provided by Down Payment Resource through CRMLS. Eligibility shown by
        the tool is an estimate from the program sponsors&apos; own rules —
        we&apos;ll confirm what you actually qualify for.
      </p>
    </div>
  );
}
