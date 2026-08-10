"use client";

import { useState } from "react";
import { site } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

const inputCls =
  "mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-ink-900 outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-500/20";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // If a form endpoint is configured, POST to it (e.g. Formspree/Getform).
    if (site.formEndpoint) {
      setStatus("submitting");
      try {
        const res = await fetch(site.formEndpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        setStatus(res.ok ? "success" : "error");
        if (res.ok) form.reset();
      } catch {
        setStatus("error");
      }
      return;
    }

    // Fallback with no backend: open a pre-filled email to the loan officer.
    const subject = encodeURIComponent(
      `Pre-approval request — ${data.name || "New lead"}`
    );
    const body = encodeURIComponent(
      [
        `Name: ${data.name || ""}`,
        `Email: ${data.email || ""}`,
        `Phone: ${data.phone || ""}`,
        `Role: ${data.role || ""}`,
        `Timeline: ${data.timeline || ""}`,
        `Price range: ${data.price || ""}`,
        "",
        `Message:`,
        `${data.message || ""}`,
      ].join("\n")
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-mint-500/30 bg-mint-500/5 p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint-500 text-white">
          <svg
            viewBox="0 0 20 20"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 10l4 4 8-9" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-bold text-ink-900">Thank you!</h3>
        <p className="mt-2 text-muted">
          Your request is on its way. {site.loanOfficer} will reach out shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-crush-600 hover:text-crush-700"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {/* FormSubmit config (no-op if a different endpoint is used) */}
      <input
        type="hidden"
        name="_subject"
        value="New CRUSH IT Realtors Suite inquiry"
      />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />
      {/* Honeypot: bots fill this, humans never see it */}
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <label className="block sm:col-span-2">
        <span className="text-sm font-medium text-ink-800">Full name *</span>
        <input name="name" required className={inputCls} placeholder="Jane Buyer" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink-800">Email *</span>
        <input
          name="email"
          type="email"
          required
          className={inputCls}
          placeholder="jane@email.com"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink-800">Phone</span>
        <input
          name="phone"
          type="tel"
          className={inputCls}
          placeholder="(555) 000-0000"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink-800">I am a…</span>
        <select name="role" className={inputCls} defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          <option>Realtor / agent</option>
          <option>Homebuyer</option>
          <option>Homeowner (refinance)</option>
          <option>Real-estate investor</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink-800">Timeline</span>
        <select name="timeline" className={inputCls} defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          <option>ASAP</option>
          <option>1–3 months</option>
          <option>3–6 months</option>
          <option>Just exploring</option>
        </select>
      </label>

      <label className="block sm:col-span-2">
        <span className="text-sm font-medium text-ink-800">
          Target price range
        </span>
        <input
          name="price"
          className={inputCls}
          placeholder="$350,000 – $500,000"
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="text-sm font-medium text-ink-800">
          How can we help?
        </span>
        <textarea
          name="message"
          rows={4}
          className={inputCls}
          placeholder="Tell us a little about your goals…"
        />
      </label>

      {status === "error" && (
        <p className="sm:col-span-2 rounded-lg bg-crush-50 px-4 py-3 text-sm text-crush-700">
          Something went wrong. Please try again or call {site.phone}.
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center rounded-full bg-crush-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600 disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" ? "Sending…" : "Request pre-approval"}
        </button>
        <p className="mt-3 text-xs text-muted">
          By submitting, you agree to be contacted about your inquiry. We
          respect your privacy and never sell your information.
        </p>
      </div>
    </form>
  );
}
