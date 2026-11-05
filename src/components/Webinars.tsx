"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchWebinars, formatWhen, webinarState, type Webinar } from "@/lib/webinars";
import { site } from "@/lib/site";
import { toast } from "@/lib/toast";

/**
 * The webinar list, with registration inline.
 *
 * ONE PAGE, NOT A PAGE PER WEBINAR. The site is a static export: a
 * /webinars/[slug] route would need its params known at build time, so adding
 * a webinar in the admin would not produce a page until somebody redeployed.
 * Expanding a card in place means a new webinar is live the moment it is
 * published.
 *
 * THE CONSENT SENTENCE IS RENDERED FROM THE SAME WORDS THE SERVER STORES. It
 * is duplicated here deliberately rather than fetched — the server writes its
 * own constant to the database and never trusts this copy, so the only failure
 * mode is the two drifting visually, not a forged consent record. The test on
 * the server side pins the wording.
 */

const CONSENT_TEXT =
  "I agree that Crush Mortgage may contact me about this webinar and my home "
  + "financing options by phone, text or email, including with automated "
  + "technology. Consent is not a condition of attending or of any purchase. "
  + "Message and data rates may apply.";

const input =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

function RegisterForm({ w, onDone }: { w: Webinar; onDone: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timeline, setTimeline] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const opened = useRef(Date.now());

  const replay = webinarState(w) === "replay";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/webinar-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: w.slug,
          name,
          email,
          phone,
          buyingTimeline: timeline,
          consent,
          website,
          elapsedMs: Date.now() - opened.current,
        }),
      });
      const d = (await res.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        error?: string;
        errors?: { field: string; message: string }[];
      };
      if (!res.ok || !d.ok) {
        if (d.errors?.length) {
          setErrors(Object.fromEntries(d.errors.map((x) => [x.field, x.message])));
        }
        toast({ emoji: "⚠️", title: "Couldn't sign you up", body: d.error || "Please try again." });
        return;
      }
      toast({
        emoji: replay ? "▶️" : "✅",
        title: replay ? "Check your email" : "You're registered",
        body: replay
          ? "The replay link is on its way."
          : "We've emailed you the link. See you there.",
      });
      onDone();
    } catch {
      toast({ emoji: "⚠️", title: "Network error", body: "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-3 border-t border-border pt-5">
      {/* Honeypot. Hidden from people, irresistible to bots. */}
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input
            className={input}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <input
            className={input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <input
            className={input}
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>
        <select className={input} value={timeline} onChange={(e) => setTimeline(e.target.value)}>
          <option value="">When are you hoping to buy?</option>
          <option>Just starting to look</option>
          <option>In the next 3 months</option>
          <option>In the next 6–12 months</option>
          <option>Already working with an agent</option>
          <option>I just want the numbers</option>
        </select>
      </div>

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
        />
        <span>{CONSENT_TEXT}</span>
      </label>
      {errors.consent && <p className="text-xs text-red-600">{errors.consent}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Sending…" : replay ? "Send me the replay" : "Save my seat"}
      </button>
    </form>
  );
}

function Card({ w }: { w: Webinar }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const state = webinarState(w);
  const when = formatWhen(w.starts_at);

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
            state === "upcoming" ? "bg-crush-50 text-crush-700" : "bg-surface-2 text-muted"
          }`}
        >
          {state === "upcoming" ? "Live webinar" : "Watch the replay"}
        </span>
        {w.topic && <span className="text-xs font-semibold uppercase tracking-wide text-muted">{w.topic}</span>}
      </div>

      <h3 className="mt-3 text-xl font-bold text-ink-900">{w.title}</h3>
      {w.blurb && <p className="mt-2 text-sm text-muted">{w.blurb}</p>}

      <div className="mt-3 space-y-1 text-sm text-ink-700">
        {state === "upcoming" && when && (
          <p>
            <strong>{when}</strong>
            {w.duration_mins ? ` · about ${w.duration_mins} minutes` : ""}
          </p>
        )}
        {w.host_name && <p className="text-muted">With {w.host_name}</p>}
      </div>

      {w.description && open && (
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink-700">
          {w.description.split(/\n{2,}/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {done ? (
        <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {state === "replay" ? "Replay sent — check your email." : "You're registered. Check your email for the link."}
        </p>
      ) : open ? (
        <RegisterForm w={w} onDone={() => setDone(true)} />
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-5 rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crush-600"
        >
          {state === "upcoming" ? "Save my seat" : "Watch the replay"}
        </button>
      )}
    </div>
  );
}

export function Webinars({ limit }: { limit?: number }) {
  const [rows, setRows] = useState<Webinar[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchWebinars().then((r) => {
      if (alive) setRows(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => (limit ? (rows ?? []).slice(0, limit) : rows ?? []), [rows, limit]);

  if (rows === null) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-surface-2" />
        ))}
      </div>
    );
  }

  if (shown.length === 0) {
    /*
      Said plainly rather than hidden. An empty section with no explanation
      reads as a broken page; this reads as "nothing scheduled", which is a
      fact, and still offers the thing they came for.
    */
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-semibold text-ink-900">No webinars scheduled right now.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          New ones go up most months. In the meantime, the calculators below will give you
          the same numbers we walk through live.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {shown.map((w) => (
        <Card key={w.id} w={w} />
      ))}
    </div>
  );
}
