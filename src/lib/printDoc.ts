"use client";

/**
 * printDoc.ts — open a built HTML document in a window and print it.
 *
 * The subtlety is the wait. A co-branded handout's whole point is the agent's
 * headshot and brokerage logo, and those are remote images: calling print()
 * as soon as the document is written produces a PDF with the branding missing,
 * intermittently, depending on the network. So it waits for the images that
 * haven't loaded yet — and gives up after a moment, because an image that will
 * never load must not mean a button that never prints.
 */
export function printHtmlDocument(html: string, opts: { timeoutMs?: number } = {}): void {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return; // popup blocked — nothing to clean up
  w.document.write(html);
  w.document.close();
  w.focus();

  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    w.print();
  };

  const pending = Array.from(w.document.images).filter((img) => !img.complete);
  if (pending.length === 0) {
    setTimeout(go, 150);
    return;
  }
  let left = pending.length;
  const tick = () => {
    left -= 1;
    if (left <= 0) setTimeout(go, 60);
  };
  pending.forEach((img) => {
    img.addEventListener("load", tick);
    img.addEventListener("error", tick);
  });
  setTimeout(go, opts.timeoutMs ?? 2500);
}
