"use client";

import { useState } from "react";

type GuideKey = "buyer" | "seller";

const GUIDES: { key: GuideKey; file: string; label: string; blurb: string; emoji: string }[] = [
  {
    key: "buyer",
    file: "/guides/buyer-guide.html",
    label: "First-Time Homebuyer's Guide",
    blurb: "A step-by-step roadmap from getting mortgage-ready to closing day.",
    emoji: "🔑",
  },
  {
    key: "seller",
    file: "/guides/seller-guide.html",
    label: "Home Seller's Guide",
    blurb: "Pricing, prep, and the full timeline for a confident sale.",
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

export function GuideCobrander() {
  const [guide, setGuide] = useState<GuideKey>("buyer");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("REALTOR®");
  const [brokerage, setBrokerage] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [license, setLicense] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ready = name.trim().length >= 2;

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setError("That photo is larger than 6 MB — please pick a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === "string" ? reader.result : null);
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
    if (!ready) return;
    setBusy(true);
    setError("");
    const meta = GUIDES.find((g) => g.key === guide)!;
    try {
      const res = await fetch(meta.file, { cache: "no-store" });
      if (!res.ok) throw new Error(`Couldn't load the guide (${res.status}).`);
      let html = await res.text();
      // Use function replacers so `$` in the built HTML/agent input is treated
      // literally (string replacements interpret $&, $1, etc.).
      const card = agentCardHtml();
      const cover = coverAgentHtml();
      html = html
        .replace("{{AGENT_CARD}}", () => card)
        .replace("{{COVER_AGENT}}", () => cover);

      // Inject a screen-only toolbar with a Save-as-PDF button.
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
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      {/* Guide picker */}
      <div>
        <p className={labelCls}>1 · Pick a guide</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {GUIDES.map((g) => {
            const selected = g.key === guide;
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => setGuide(g.key)}
                className={`flex flex-col items-start gap-1 rounded-2xl border p-5 text-left transition-colors ${
                  selected
                    ? "border-crush-400 bg-crush-50 ring-2 ring-crush-100"
                    : "border-border bg-white hover:bg-surface-2"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {g.emoji}
                </span>
                <span className="mt-1 font-bold text-ink-900">{g.label}</span>
                <span className="text-xs text-muted">{g.blurb}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
          Your details are added to the cover and the &ldquo;Your Real Estate
          Agent&rdquo; card alongside Crush Mortgage. Nothing is uploaded — the
          guide is built right in your browser and opens ready to{" "}
          <strong>Save as PDF</strong>.
        </p>
      </div>

      {/* Agent info */}
      <div>
        <p className={labelCls}>2 · Add your info</p>
        <div className="mt-3 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Full name *</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Agent" />
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="REALTOR®" />
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
              <label className={labelCls}>Brokerage</label>
              <input className={inputCls} value={brokerage} onChange={(e) => setBrokerage(e.target.value)} placeholder="XYZ Realty" />
            </div>
            <div>
              <label className={labelCls}>DRE / License #</label>
              <input className={inputCls} value={license} onChange={(e) => setLicense(e.target.value)} placeholder="01234567" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Headshot (optional)</label>
            <div className="mt-1 flex items-center gap-4">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Agent headshot preview" className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-xl bg-surface-2 text-2xl text-muted">🙂</div>
              )}
              <div className="flex flex-col gap-2">
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
            <p className="rounded-xl border border-crush-200 bg-crush-50 p-3 text-sm text-crush-700">{error}</p>
          )}

          <button
            type="button"
            onClick={createGuide}
            disabled={!ready || busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Building…" : "Create my co-branded guide"}
          </button>
          {!ready && (
            <p className="-mt-2 text-center text-xs text-muted">Add your name to enable.</p>
          )}
        </div>
      </div>
    </div>
  );
}
