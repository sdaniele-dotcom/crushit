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
    primary:
      "bg-crush-500 text-white hover:bg-crush-600 shadow-lg shadow-crush-500/20",
    secondary:
      "bg-white text-ink-900 hover:bg-surface-2 border border-border",
    ghost: "text-ink-900 hover:text-crush-600",
  };
  const isExternal = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
  const cls = `${base} ${variants[variant]} ${className}`;
  if (isExternal) {
    return (
      <a href={href} className={cls}>
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

/** Small pill label. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-crush-100 bg-crush-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-crush-700">
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
      <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
      <div
        className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-crush-500/20 blur-3xl"
        aria-hidden
      />
      <Container className="relative py-16 sm:py-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
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
