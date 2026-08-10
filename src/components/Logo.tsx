import Link from "next/link";
import { site } from "@/lib/site";

/**
 * Crush Mortgage "CM" monogram — a clean SVG interpretation of the brand
 * mark (charcoal ring + red shield/M). `light` flips the ring/M to white
 * for dark backgrounds; the red accent stays constant.
 *
 * To use the official logo file instead, drop it in /public and swap the
 * <CrushMark /> below for an <img>.
 */
export function CrushMark({
  className = "h-9 w-9",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const ring = light ? "#ffffff" : "#16181d";
  const red = "#e11b22";
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden role="img">
      {/* Two-tone ring: charcoal upper-left half, red lower-right half */}
      <path
        d="M 49.7 14.3 A 25 25 0 0 0 14.3 49.7"
        fill="none"
        stroke={ring}
        strokeWidth="4.6"
      />
      <path
        d="M 49.7 14.3 A 25 25 0 0 1 14.3 49.7"
        fill="none"
        stroke={red}
        strokeWidth="4.6"
      />
      {/* Red shield/point behind the M */}
      <path d="M 28 25.5 L 36 25.5 L 32 38 Z" fill={red} />
      {/* Bold M */}
      <path
        d="M 23 39 L 23 25 L 32 32 L 41 25 L 41 39"
        fill="none"
        stroke={ring}
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <CrushMark className="h-10 w-10 shrink-0" light={light} />
      <span className="flex flex-col leading-none">
        <span
          className={`text-lg font-extrabold tracking-tight ${
            light ? "text-white" : "text-ink-900"
          }`}
        >
          CRUSH <span className="text-crush-500">IT</span>
        </span>
        <span
          className={`mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
            light ? "text-white/50" : "text-muted"
          }`}
        >
          Realtors Suite
        </span>
      </span>
    </Link>
  );
}
