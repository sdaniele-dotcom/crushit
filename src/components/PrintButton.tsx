"use client";

export function PrintButton({
  html,
  label = "Print",
  className = "",
}: {
  html: string;
  label?: string;
  className?: string;
}) {
  function print() {
    const w = window.open("", "_blank", "width=850,height=1100");
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
    // Wait for any images (logo, photos) to finish loading before printing so
    // they appear in the PDF — with a safety timeout so we never hang.
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
      // Safety net in case a load/error event never fires.
      setTimeout(go, 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={print}
      className={
        className ||
        "inline-flex items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600"
      }
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 9V3h8v6M6 15h8v3H6zM4 9h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1" />
      </svg>
      {label}
    </button>
  );
}
