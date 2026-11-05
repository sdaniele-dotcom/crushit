"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchGuides, type Guide } from "@/lib/guides";
import { site } from "@/lib/site";
import { toast } from "@/lib/toast";

/**
 * The buyer guide library.
 *
 * TWO KINDS OF CARD, decided per guide by `requires_email`. An ungated guide
 * is a plain link — no form, no friction, because a one-page explainer works
 * harder in front of more people. A gated one asks for a name and an email
 * first, which is worth it for something longer.
 *
 * THE LINK OPENS IMMEDIATELY AFTER THE FORM, as well as being emailed. The
 * gate is a courtesy, not a lock — the URL sits on a row anyone can read — so
 * making somebody wait for an inbox buys nothing and costs the thing they came
 * for.
 */

const CONSENT_TEXT =
  "I agree that Crush Mortgage may contact me about this guide and my home "
  + "financing options by phone, text or email, including with automated "
  + "technology. Consent is not a condition of downloading it or of any purchase. "
  + "Message and data rates may apply.";

const input =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-100";

function GateForm({ g, onDone }: { g: Guide; onDone: (url: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timeline, setTimeline] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const opened = useRef(Date.now());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch(`${site.flyerApiBase}/api/public/guide-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: g.slug,
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
        url?: string;
        error?: string;
        errors?: { field: string; message: string }[];
      };
      if (!res.ok || !d.ok) {
        if (d.errors?.length) {
          setErrors(Object.fromEntries(d.errors.map((x) => [x.field, x.message])));
        }
        toast({ emoji: "⚠️", title: "Couldn't send it", body: d.error || "Please try again." });
        return;
      }
      toast({ emoji: "📩", title: "Sent", body: "It's open now, and in your inbox too." });
      onDone(d.url || g.file_url || "");
    } catch {
      toast({ emoji: "⚠️", title: "Network error", body: "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 border-t border-border pt-4">
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <input className={input} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
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
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-border" />
        <span>{CONSENT_TEXT}</span>
      </label>
      {errors.consent && <p className="text-xs text-red-600">{errors.consent}</p>}

      <button type="submit" disabled={busy} className="w-full rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crush-600 disabled:opacity-50 sm:w-auto">
        {busy ? "Sending…" : "Send it to me"}
      </button>
    </form>
  );
}

function Card({ g }: { g: Guide }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-white p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-crush-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-crush-700">
          Free guide
        </span>
        {g.topic && <span className="text-xs font-semibold uppercase tracking-wide text-muted">{g.topic}</span>}
        {g.page_count ? <span className="text-xs text-muted">{g.page_count} pages</span> : null}
      </div>

      <h3 className="mt-3 text-lg font-bold text-ink-900">{g.title}</h3>
      {g.blurb && <p className="mt-2 flex-1 text-sm text-muted">{g.blurb}</p>}

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-fit items-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Open it now →
        </a>
      ) : !g.requires_email ? (
        <a
          href={g.file_url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-fit items-center rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crush-600"
        >
          Read it
        </a>
      ) : open ? (
        <GateForm g={g} onDone={setUrl} />
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-5 w-fit rounded-full bg-crush-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crush-600"
        >
          Send it to me
        </button>
      )}
    </div>
  );
}

export function Guides({ limit }: { limit?: number }) {
  const [rows, setRows] = useState<Guide[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchGuides().then((r) => {
      if (alive) setRows(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => (limit ? (rows ?? []).slice(0, limit) : rows ?? []), [rows, limit]);

  if (rows === null) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-surface-2" />
        ))}
      </div>
    );
  }

  if (shown.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-semibold text-ink-900">Guides are on the way.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          In the meantime the calculators give you the same numbers, instantly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((g) => (
        <Card key={g.id} g={g} />
      ))}
    </div>
  );
}
