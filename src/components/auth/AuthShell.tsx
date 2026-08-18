import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui";

/** Centered card layout shared by the auth pages. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm font-semibold text-crush-600">
          ← Back to site
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </Container>
  );
}

export const authInput =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-ink-900 outline-none placeholder:text-muted focus:border-crush-400 focus:ring-2 focus:ring-crush-100";
export const authLabel = "text-xs font-semibold uppercase tracking-wide text-muted";
export const authButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-crush-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-crush-500/20 transition-colors hover:bg-crush-600 disabled:cursor-not-allowed disabled:opacity-60";
export const authNotice =
  "rounded-xl border border-crush-200 bg-crush-50 p-3 text-sm text-crush-700";
export const authOk =
  "rounded-xl border border-mint-500/30 bg-mint-500/10 p-3 text-sm text-ink-800";
