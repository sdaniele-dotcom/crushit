"use client";

import { useEffect, useRef, useState } from "react";
import logo from "../../public/crush-mortgage-logo.png";
import { site } from "@/lib/site";

const W = 1080;
const H = 1350;

const inputCls =
  "mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-ink-900 outline-none focus:border-crush-400 focus:ring-2 focus:ring-crush-500/20";

type Fields = {
  name: string;
  title: string;
  brokerage: string;
  phone: string;
  email: string;
  license: string;
};

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "YOU"
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, cursorY);
}

function circleImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  d: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + d / 2, y + d / 2, d / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  const ar = img.width / img.height;
  let sw: number, sh: number, sx: number, sy: number;
  if (ar > 1) {
    sh = img.height;
    sw = sh;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, d, d);
  ctx.restore();
  ctx.strokeStyle = "#e11b22";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(x + d / 2, y + d / 2, d / 2 - 3, 0, Math.PI * 2);
  ctx.stroke();
}

export function CoBrandTool({ pdfHref }: { pdfHref: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [f, setF] = useState<Fields>({
    name: "",
    title: "Real Estate Agent",
    brokerage: "",
    phone: "",
    email: "",
    license: "",
  });

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  useEffect(() => {
    loadImage(logo.src).then(setLogoImg).catch(() => {});
  }, []);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadImage(reader.result as string).then(setPhotoImg);
    reader.readAsDataURL(file);
  }

  // Redraw whenever inputs or images change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Top band + logo
    ctx.fillStyle = "#16181d";
    ctx.fillRect(0, 0, W, 200);
    if (logoImg) {
      const lh = 66;
      const lw = logoImg.width * (lh / logoImg.height);
      ctx.drawImage(logoImg, 80, (200 - lh) / 2, lw, lh);
    }
    ctx.fillStyle = "#9aa0a6";
    ctx.font = "600 20px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("EQUAL HOUSING LENDER", W - 80, 108);
    ctx.textAlign = "left";

    // Eyebrow + title
    ctx.fillStyle = "#e11b22";
    ctx.font = "700 26px Arial, sans-serif";
    ctx.fillText("FREE FIRST-TIME HOMEBUYER GUIDE", 80, 300);

    ctx.fillStyle = "#16181d";
    ctx.font = "800 78px Arial, sans-serif";
    ctx.fillText("Your path to", 78, 392);
    ctx.fillText("homeownership.", 78, 476);

    ctx.fillStyle = "#62666e";
    ctx.font = "400 30px Arial, sans-serif";
    wrapText(
      ctx,
      "A step-by-step guide from pre-approval to keys — plus the loan programs that make it possible.",
      80,
      540,
      W - 160,
      40
    );

    ctx.fillStyle = "#e11b22";
    ctx.fillRect(80, 650, 90, 6);

    // Presented by (agent)
    ctx.fillStyle = "#e11b22";
    ctx.font = "700 24px Arial, sans-serif";
    ctx.fillText("PRESENTED BY", 80, 726);

    const px = 80;
    const py = 758;
    const pd = 200;
    if (photoImg) {
      circleImage(ctx, photoImg, px, py, pd);
    } else {
      ctx.fillStyle = "#eeeff1";
      ctx.beginPath();
      ctx.arc(px + pd / 2, py + pd / 2, pd / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#b0b4ba";
      ctx.font = "700 62px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(initials(f.name), px + pd / 2, py + pd / 2 + 22);
      ctx.textAlign = "left";
    }

    const tx = px + pd + 44;
    ctx.fillStyle = "#16181d";
    ctx.font = "800 48px Arial, sans-serif";
    ctx.fillText(f.name || "Your Name", tx, py + 52);
    ctx.fillStyle = "#62666e";
    ctx.font = "500 28px Arial, sans-serif";
    ctx.fillText(
      [f.title, f.brokerage].filter(Boolean).join(" · ") || "Real Estate Agent",
      tx,
      py + 96
    );
    ctx.fillStyle = "#16181d";
    ctx.font = "600 30px Arial, sans-serif";
    let yy = py + 146;
    if (f.phone) {
      ctx.fillText(f.phone, tx, yy);
      yy += 44;
    }
    if (f.email) {
      ctx.fillText(f.email, tx, yy);
      yy += 44;
    }
    if (f.license) {
      ctx.fillStyle = "#62666e";
      ctx.font = "500 24px Arial, sans-serif";
      ctx.fillText(f.license, tx, yy);
    }

    // Bottom band (lender)
    ctx.fillStyle = "#16181d";
    ctx.fillRect(0, H - 200, W, 200);
    ctx.fillStyle = "#e11b22";
    ctx.font = "700 22px Arial, sans-serif";
    ctx.fillText("FINANCING BY", 80, H - 142);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 42px Arial, sans-serif";
    ctx.fillText(site.company, 80, H - 92);
    ctx.fillStyle = "#c9ccd1";
    ctx.font = "500 26px Arial, sans-serif";
    ctx.fillText(
      `${site.loanOfficer} · NMLS #${site.nmls} · ${site.phone}`,
      80,
      H - 52
    );
  }, [f, logoImg, photoImg]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `homebuyer-guide-flyer-${(f.name || "agent")
        .toLowerCase()
        .replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      {/* Form */}
      <div>
        <h2 className="text-2xl font-bold text-ink-900">Add your details</h2>
        <p className="mt-2 text-muted">
          Fill in your info and upload a headshot — the flyer updates live.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-ink-800">Full name</span>
            <input className={inputCls} value={f.name} onChange={set("name")} placeholder="Jane Agent" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">Title</span>
            <input className={inputCls} value={f.title} onChange={set("title")} placeholder="Realtor®" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">Brokerage</span>
            <input className={inputCls} value={f.brokerage} onChange={set("brokerage")} placeholder="Realty Group" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">Phone</span>
            <input className={inputCls} value={f.phone} onChange={set("phone")} placeholder="(555) 000-0000" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">Email</span>
            <input className={inputCls} value={f.email} onChange={set("email")} placeholder="jane@brokerage.com" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-ink-800">License # (DRE/BRE — optional)</span>
            <input className={inputCls} value={f.license} onChange={set("license")} placeholder="DRE #00000000" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-ink-800">Headshot</span>
            <input
              type="file"
              accept="image/*"
              onChange={onPhoto}
              className="mt-1.5 block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-ink-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ink-800"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={download}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 3v10m0 0l4-4m-4 4l-4-4M4 17h12" />
            </svg>
            Download my flyer (PNG)
          </button>
          <a
            href={pdfHref}
            download
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-surface"
          >
            Download full guide (PDF)
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">
          Everything runs in your browser — your photo and details are never
          uploaded anywhere. Share the flyer with your buyers alongside the full
          guide PDF.
        </p>
      </div>

      {/* Live preview */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Live preview
        </p>
        <div className="overflow-hidden rounded-2xl border border-border shadow-xl shadow-ink-900/10">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
