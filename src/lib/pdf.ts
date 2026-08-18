/**
 * Shared "Save as PDF" helper for the calculators. Opens a print-ready,
 * Crush Mortgage–branded summary (with the official primary logo) in a new
 * window and triggers the print / "Save as PDF" dialog. The logo is inlined as
 * a base64 data URI so it always renders inside the print window.
 */
import { site } from "@/lib/site";
import { crushLogoPrimaryDataUri } from "@/lib/brandLogo";

export type PdfRow = { label: string; value: string; strong?: boolean };
export type PdfSection = { heading: string; rows: PdfRow[] };

const DEFAULT_DISCLAIMER =
  "This is an estimate for educational purposes only and is not a commitment to lend, a rate quote, or an offer of credit. Actual payment, rate, and APR depend on a full application, credit approval, and current market rates. Taxes and insurance are estimates. Ready for a real, personalized quote? Contact " +
  site.company +
  " at " +
  site.phone +
  ". Equal Housing Opportunity.";

export function openBrandedPdf(opts: {
  title: string;
  heroLabel?: string;
  heroValue?: string;
  heroSub?: string;
  sections: PdfSection[];
  disclaimer?: string;
}) {
  const rowsHtml = (rows: PdfRow[]) =>
    rows
      .map(
        (r) =>
          `<tr${r.strong ? ' style="font-weight:700;border-top:2px solid #111"' : ""}><td>${r.label}</td><td style="text-align:right">${r.value}</td></tr>`,
      )
      .join("");
  const sectionsHtml = opts.sections
    .map((s) => `<h2>${s.heading}</h2><table>${rowsHtml(s.rows)}</table>`)
    .join("");
  const hero = opts.heroValue
    ? `<p class="big">${opts.heroLabel ?? ""}</p><p class="amt">${opts.heroValue}</p>${
        opts.heroSub ? `<p class="herosub">${opts.heroSub}</p>` : ""
      }`
    : "";

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
    <title>${opts.title}</title>
    <style>
      *{box-sizing:border-box}
      body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:44px}
      .top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #e62c2c;padding-bottom:16px}
      h1{font-size:24px;margin:0 0 4px}
      .sub{color:#555;font-size:13px;margin:0}
      .brand{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
      .brand img{height:52px;width:auto;display:block}
      .brand .contact{color:#333;font-size:12px;line-height:1.5;text-align:right}
      .brand .contact strong{color:#e62c2c;font-size:13px}
      .big{margin:26px 0 6px;font-size:15px;color:#555}
      .amt{font-size:42px;font-weight:800;color:#e62c2c;margin:0}
      .herosub{margin:6px 0 0;font-size:13px;color:#555}
      h2{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#e62c2c;margin:26px 0 8px}
      table{width:100%;border-collapse:collapse}
      td{padding:8px 4px;font-size:14px;border-bottom:1px solid #eee}
      .foot{margin-top:26px;font-size:10.5px;color:#777;line-height:1.5;border-top:1px solid #eee;padding-top:12px}
      @media print{body{padding:28px}}
    </style></head><body>
    <div class="top">
      <div><h1>${opts.title}</h1><p class="sub">Prepared by ${site.company} · ${new Date().toLocaleDateString("en-US")}</p></div>
      <div class="brand">
        <img src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage"/>
        <div class="contact"><strong>${site.phone}</strong><br/>NMLS #${site.companyNmls} · ${site.website.replace(/^https?:\/\//, "")}</div>
      </div>
    </div>
    ${hero}
    ${sectionsHtml}
    <p class="foot">${opts.disclaimer ?? DEFAULT_DISCLAIMER}</p>
    </body></html>`;

  printHtml(html);
}

/** Open a print window and trigger print once images (the logo) have loaded. */
export function printHtml(html: string) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    w.print();
  };
  const imgs = Array.from(w.document.images);
  const pending = imgs.filter((img) => !img.complete);
  if (pending.length === 0) {
    setTimeout(go, 150);
  } else {
    let left = pending.length;
    const tick = () => {
      left -= 1;
      if (left <= 0) setTimeout(go, 50);
    };
    pending.forEach((img) => {
      img.addEventListener("load", tick);
      img.addEventListener("error", tick);
    });
    setTimeout(go, 2000);
  }
}

/**
 * Branded PDF for custom layouts (multi-column tables, per-section HTML). Wraps
 * `bodyHtml` in the Crush Mortgage header/footer chrome and prints it. Provides
 * helper classes: table/.r (right)/.c (center)/.strong, h2 headings, and a
 * .hero block.
 */
export function openBrandedHtmlPdf(opts: {
  title: string;
  subtitle?: string;
  bodyHtml: string;
  disclaimer?: string;
}) {
  const html = `<!doctype html><html><head><meta charset="utf-8"/>
    <title>${opts.title}</title>
    <style>
      *{box-sizing:border-box}
      body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;margin:0;padding:40px}
      .top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #e62c2c;padding-bottom:14px}
      h1{font-size:23px;margin:0 0 4px}.subttl{color:#555;font-size:13px;margin:0}
      .brand{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
      .brand img{height:50px;width:auto;display:block}
      .brand .contact{color:#333;font-size:12px;line-height:1.5;text-align:right}
      .brand .contact strong{color:#e62c2c;font-size:13px}
      h2{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#e62c2c;margin:20px 0 6px}
      table{width:100%;border-collapse:collapse;margin-top:2px}
      th,td{border:1px solid #d8d8d8;padding:6px 8px;font-size:11.5px;text-align:left}
      td.r,th.r{text-align:right}td.c,th.c{text-align:center}.strong{font-weight:700}
      th{background:#111;color:#fff;text-transform:uppercase;font-size:10px}
      tr:nth-child(even) td{background:#fafafa}
      .hero{margin:18px 0;padding:14px 16px;border-radius:12px;background:#fff5f5;border:1px solid #f6caca}
      .hero .big{font-size:28px;font-weight:800;color:#e62c2c;margin:2px 0 0}
      .grid4{display:flex;flex-wrap:wrap;gap:14px}.grid4 .cell{flex:1;min-width:120px}
      .grid4 .k{font-size:10px;text-transform:uppercase;color:#888;letter-spacing:.04em}
      .grid4 .v{font-size:18px;font-weight:800;color:#e62c2c}
      .foot{margin-top:20px;font-size:10.5px;color:#777;border-top:1px solid #eee;padding-top:12px;line-height:1.5}
      @media print{body{padding:24px}h2{page-break-after:avoid}tr{page-break-inside:avoid}}
    </style></head><body>
    <div class="top">
      <div><h1>${opts.title}</h1>${opts.subtitle ? `<p class="subttl">${opts.subtitle}</p>` : ""}</div>
      <div class="brand">
        <img src="${crushLogoPrimaryDataUri}" alt="Crush Mortgage"/>
        <div class="contact"><strong>${site.phone}</strong><br/>NMLS #${site.companyNmls} · ${site.website.replace(/^https?:\/\//, "")}</div>
      </div>
    </div>
    ${opts.bodyHtml}
    <p class="foot">${opts.disclaimer ?? DEFAULT_DISCLAIMER}</p>
    </body></html>`;
  printHtml(html);
}
