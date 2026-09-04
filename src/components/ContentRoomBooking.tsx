"use client";

/**
 * ContentRoomBooking — a dedicated booking form (separate from the pre-approval
 * lead form) for reserving the in-office content room. Submits via FormSubmit,
 * so every booking emails the address in site.contentRoomFormEndpoint.
 */

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { fullName } from "@/lib/profile";
import { site } from "@/lib/site";
import { Eyebrow } from "@/components/ui";

type Status = "idle" | "submitting" | "success" | "error";

const inputCls =
  "mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-ink-900 outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-500/20";

export function ContentRoomBooking() {
  const { profile } = useAuth();
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("submitting");
    try {
      const res = await fetch(site.contentRoomFormEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-8 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <Eyebrow>Record your own</Eyebrow>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Book our in-office content room
          </h2>
          <p className="mt-3 text-muted">
            Come film your own reels, market updates, and listing walkthroughs in
            our studio space — lighting, backdrop, and setup ready to go. Request a
            time below and we&apos;ll confirm your slot.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-ink-700">
            {[
              "Professional lighting & backdrop",
              "Space for reels, testimonials & walkthroughs",
              "Free for our partner agents",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-crush-500 text-white">
                  <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4 10l4 4 8-9" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div>
          {status === "success" ? (
            <div className="rounded-2xl border border-mint-500/30 bg-mint-500/5 p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint-500 text-white">
                <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 10l4 4 8-9" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-bold text-ink-900">Booking request sent!</h3>
              <p className="mt-2 text-muted">We&apos;ll email you to confirm your content-room time shortly.</p>
              <button onClick={() => setStatus("idle")} className="mt-4 text-sm font-semibold text-crush-600 hover:text-crush-700">
                Book another time
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="_subject" value="New content room booking request" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-ink-800">Your name *</span>
                <input name="name" required defaultValue={fullName(profile) || ""} className={inputCls} placeholder="Jane Agent" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink-800">Email *</span>
                <input name="email" type="email" required defaultValue={profile?.email || ""} className={inputCls} placeholder="jane@email.com" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink-800">Phone</span>
                <input name="phone" type="tel" defaultValue={profile?.phone || ""} className={inputCls} placeholder="(555) 000-0000" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink-800">Preferred date *</span>
                <input name="preferred_date" type="date" required className={inputCls} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink-800">Preferred time *</span>
                <input name="preferred_time" type="time" required className={inputCls} />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-ink-800">What are you filming?</span>
                <textarea name="notes" rows={3} className={inputCls} placeholder="Reels, a listing walkthrough, a market update…" />
              </label>

              {status === "error" && (
                <p className="rounded-lg bg-crush-50 px-4 py-3 text-sm text-crush-700 sm:col-span-2">
                  Something went wrong. Please try again or call {site.phone}.
                </p>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex w-full items-center justify-center rounded-full bg-crush-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600 disabled:opacity-60 sm:w-auto"
                >
                  {status === "submitting" ? "Sending…" : "Request this time"}
                </button>
                <p className="mt-3 text-xs text-muted">
                  We&apos;ll confirm availability by email. Times are requests, not guaranteed until confirmed.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
