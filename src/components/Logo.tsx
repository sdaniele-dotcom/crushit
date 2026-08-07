import Link from "next/link";
import { site } from "@/lib/site";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      {/* Mark */}
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-crush-500 text-white shadow-md shadow-crush-500/30">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {/* upward "crush it" bolt / house-roof hybrid */}
          <path d="M3 12l9-8 9 8" />
          <path d="M13 3l-4 9h5l-4 9" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`text-lg font-extrabold tracking-tight ${
            light ? "text-white" : "text-ink-900"
          }`}
        >
          {site.brand}
        </span>
        <span
          className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
            light ? "text-slate-400" : "text-muted"
          }`}
        >
          Realtors Suite
        </span>
      </span>
    </Link>
  );
}
