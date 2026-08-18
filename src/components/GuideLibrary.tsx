"use client";

import { useState } from "react";

type GuideKey = "buyer" | "seller";

const GUIDES: {
  key: GuideKey;
  file: string;
  label: string;
  blurb: string;
  emoji: string;
}[] = [
  {
    key: "buyer",
    file: "/guides/buyer-guide.html",
    label: "First-Time Homebuyer's Guide",
    blurb:
      "A step-by-step roadmap — getting mortgage-ready, budgets, down payments, the 7-step purchase process, and closing day.",
    emoji: "🔑",
  },
  {
    key: "seller",
    file: "/guides/seller-guide.html",
    label: "Home Seller's Guide",
    blurb:
      "Timing, equity, pricing, prep and staging, offers, and the full path to a confident, profitable sale.",
    emoji: "🏡",
  },
];

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GuideLibrary() {
  const [openKey, setOpenKey] = useState<GuideKey | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("REALTOR®");
  const [brokerage, setBrokerage] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [license, setLicense] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const active = GUIDES.find((g) => g.key === openKey) || null;
  const ready = name.trim().length >= 2;

  function reset() {
    setError("");
    setBusy(false);
  }
  function open(k: GuideKey) {
    reset();
    setOpenKey(k);
  }
  function close() {
    setOpenKey(null);
    reset();
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setError("That photo is larger than 6 MB — please pick a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setPhoto(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  function agentCardHtml(): string {
    const initials =
      name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "★";
    const media = photo
      ? `<img src="${photo}" style="width:100%; height:1.6in; object-fit:cover; object-position:center; border-radius:8px; margin-bottom:9pt;">`
      : `<div style="width:100%; height:1.6in; border-radius:8px; margin-bottom:9pt; background:#F5F5F6; display:flex; align-items:center; justify-content:center; font-family:'Poppins'; font-weight:800; font-size:34pt; color:#c9c9cf;">${esc(initials)}</div>`;
    const lines = [
      phone.trim() && `<div class="ln"><b>Phone</b>${esc(phone.trim())}</div>`,
      email.trim() && `<div class="ln"><b>Email</b>${esc(email.trim())}</div>`,
      brokerage.trim() && `<div class="ln"><b>Brokerage</b>${esc(brokerage.trim())}</div>`,
      license.trim() && `<div class="ln"><b>DRE</b>#${esc(license.trim())}</div>`,
    ]
      .filter(Boolean)
      .join("");
    return `<div class="card">
      <div class="role">Your Real Estate Agent</div>
      ${media}
      <div class="nm">${esc(name.trim())}</div>
      <div class="ttl">${esc(title.trim() || "Your Real Estate Agent")}</div>
      ${lines}
    </div>`;
  }

  function coverAgentHtml(): string {
    const who = [name.trim(), brokerage.trim()].filter(Boolean).join(", ");
    return who ? ` &nbsp;&middot;&nbsp; with ${esc(who)}` : "";
  }

  async function createGuide() {
    if (!ready || !active) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(active.file, { cache: "no-store" });
      if (!res.ok) throw new Error(`Couldn't load the guide (${res.status}).`);
      let html = await res.text();
      const card = agentCardHtml();
      const cover = coverAgentHtml();
      html = html
        .replace("{{AGENT_CARD}}", () => card)
        .replace("{{COVER_AGENT}}", () => cover);

      const toolbar = `<div class="__cobar" style="position:fixed;top:0;left:0;right:0;z-index:999999;background:#111;color:#fff;padding:10px 16px;display:flex;gap:12px;justify-content:space-between;align-items:center;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;box-shadow:0 2px 12px rgba(0,0,0,.3);">
        <span>Your co-branded guide is ready — review it, then save it as a PDF.</span>
        <button onclick="window.print()" style="cursor:pointer;border:0;border-radius:999px;background:#e62c2c;color:#fff;font-weight:700;font-size:14px;padding:8px 18px;">Save as PDF / Print</button>
      </div>
      <style>@media print{.__cobar{display:none !important}}</style>`;
      html = html.replace(/<body([^>]*)>/i, `<body$1>${toolbar}`);

      const w = window.open("", "_blank");
      if (!w) {
        setError("Please allow pop-ups for this site to open the guide.");
        return;
      }
      w.document.write(html);
      w.document.close();
      w.focus();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-ink-900 outline-none placeholder:text-muted focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
  const labelCls = "text-xs font-semibold uppercase tracking-wide text-muted";

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        {GUIDES.map((g) => (
          <div
            key={g.key}
            className="flex flex-col rounded-3xl border border-border bg-white p-7"
          >
            <span className="text-4xl" aria-hidden>
              {g.emoji}
            </span>
            <h3 className="mt-3 text-xl font-bold text-ink-900">{g.label}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">{g.blurb}</p>
            <button
              type="button"
              onClick={() => open(g.key)}
              className="mt-5 inline-flex items-center justify-center gap-2 self-start rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10 3v10m0 0l4-4m-4 4l-4-4M4 17h12" />
              </svg>
              Download (co-branded)
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={labelCls}>Co-brand &amp; download</p>
                <h3 className="mt-1 text-xl font-bold text-ink-900">
                  {active.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            <p className="mt-2 text-sm text-muted">
              Add your info and we&apos;ll co-brand the guide with you and Crush
              Mortgage — then it opens ready to save as a PDF. No property info
              needed.
            </p>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Your name *</label>
                  <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Agent" autoFocus />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@brokerage.com" />
                </div>
                <div>
                  <label className={labelCls}>Title</label>
                  <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="REALTOR®" />
                </div>
                <div>
                  <label className={labelCls}>Brokerage</label>
                  <input className={inputCls} value={brokerage} onChange={(e) => setBrokerage(e.target.value)} placeholder="XYZ Realty" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>DRE / License # (optional)</label>
                  <input className={inputCls} value={license} onChange={(e) => setLicense(e.target.value)} placeholder="01234567" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Headshot (optional)</label>
                <div className="mt-1 flex items-center gap-4">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="Headshot preview" className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-surface-2 text-xl text-muted">🙂</div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <input type="file" accept="image/*" onChange={onPhoto} className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-crush-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-crush-600" />
                    {photo && (
                      <button type="button" onClick={() => setPhoto(null)} className="self-start text-xs font-semibold text-muted underline">
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-crush-200 bg-crush-50 p-3 text-sm text-crush-700">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={createGuide}
                disabled={!ready || busy}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Building…" : "Create & download my guide"}
              </button>
              {!ready && (
                <p className="-mt-2 text-center text-xs text-muted">
                  Enter your name to continue.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
