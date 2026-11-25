import Link from "next/link";
import type { ReactNode } from "react";

/** Page wrapper with consistent max width + padding. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors";
  const variants = {
    // No coloured shadow. A red-tinted shadow put a glow under every primary
    // button on the site, which is the most recognisable AI tell in the whole
    // suite. Depth comes from the fill against the surface instead.
    primary: "bg-crush-500 text-white hover:bg-crush-600",
    secondary:
      "bg-white text-ink-900 hover:bg-surface-2 border border-border",
    ghost: "text-ink-900 hover:text-crush-600",
  };
  const isExternal = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
  const cls = `${base} ${variants[variant]} ${className}`;
  if (isExternal) {
    const newTab = href.startsWith("http");
    return (
      <a
        href={href}
        className={cls}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/**
 * Small category label above a heading.
 *
 * Was uppercase with wide tracking inside a tinted pill, which is the
 * "SHOUTY LABEL" tell and appeared on every page of the suite. Now sentence
 * case at normal tracking, and a quiet hairline instead of a filled chip, so
 * it labels the section without competing with the heading under it.
 */
export function Eyebrow({
  children,
  tone = "light",
}: {
  children: ReactNode;
  /** "dark" for the near-black page heroes, where a bordered chip reads as a stray box. */
  tone?: "light" | "dark";
}) {
  if (tone === "dark") {
    // On the dark hero the label needs no container at all. A hairline box
    // against near-black looked like a button nobody wired up.
    return (
      <span className="text-sm font-semibold text-crush-400">{children}</span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-crush-100 px-2.5 py-1 text-xs font-medium text-crush-700">
      {children}
    </span>
  );
}

/** Reusable page header/hero for interior pages. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  /** Optional right-hand content — a stat, a shortcut, whatever the page has. */
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-ink-900 text-white">
      {/*
        No grid overlay and no blurred red blob: both were decoration that
        said nothing about the product, and PageHero is on every interior
        page, so they were the background of the whole suite.

        What replaced them is not more decoration. The band got SHORTER,
        because its problem after the strip was a tall empty field with text
        in one corner. The tone shift is a few percent inside one neutral —
        ink to a slightly lighter ink — which the eye reads as depth rather
        than as colour, and a hairline closes the band against the page.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#15161c_0%,#101117_100%)]"
      />
      <Container className="relative flex flex-col gap-8 py-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="min-w-0">
          <Eyebrow tone="dark">{eyebrow}</Eyebrow>
          {/* text-balance stops a highlighted phrase stranding one word on
              its own line, which it did on several of these headings. */}
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
              {subtitle}
            </p>
          )}
        </div>
        {aside && <div className="shrink-0 lg:max-w-sm">{aside}</div>}
      </Container>
    </section>
  );
}

/** Generic card surface. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-white p-6 ${className}`}
    >
      {children}
    </div>
  );
}
