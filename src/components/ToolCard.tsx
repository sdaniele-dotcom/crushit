import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The card pattern from the agreed design: a white row on a light grey page,
 * with a grey tile holding a red glyph, the name, one line of explanation,
 * and a red arrow at the trailing edge.
 *
 * ONE SHAPE FOR EVERY TOOL. The dashboard previously gave its first action a
 * solid red tile and the rest grey ones, which made the grid read as "this
 * one matters and these five do not" — not true, they are six different jobs.
 * Here the red is in the glyph and the arrow on every card, so colour marks
 * "this is a thing you can do" rather than ranking them.
 *
 * The arrow is a drawn chevron, not a "→" character, so it takes the text
 * colour, sits on the baseline and matches across platforms.
 */
export function ToolCard({
  href,
  title,
  desc,
  icon,
  external = false,
}: {
  href: string;
  title: string;
  desc?: string;
  icon: ReactNode;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-crush-500 transition-colors group-hover:bg-crush-50">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-snug text-ink-900">{title}</span>
        {desc && <span className="mt-0.5 block text-sm text-muted">{desc}</span>}
      </span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-crush-500 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      >
        <path d="M5 12h13M12.5 6l6 6-6 6" />
      </svg>
    </>
  );

  const cls =
    "group flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-4 transition-colors hover:border-crush-200";

  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

/** The heading that labels a group of tool cards. */
export function ToolGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-extrabold tracking-tight text-ink-900">{label}</h2>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}
