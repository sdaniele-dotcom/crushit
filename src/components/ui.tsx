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
export function Eyebrow({ children }: { children: ReactNode }) {
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
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      {/*
        The grid overlay and the blurred red blob are gone. Both were
        decoration that said nothing about the product, and PageHero is used
        on every interior page, so they were the background of the whole
        suite. A plain dark field reads as deliberate; a glowing orb behind a
        heading reads as a template.
      */}
      <Container className="relative py-16 sm:py-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{subtitle}</p>
        )}
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
