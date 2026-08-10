import Link from "next/link";
import Image from "next/image";

/**
 * Official Crush Mortgage logo (white/dark-background version) + a small
 * "Realtors Suite" tag. Used on dark surfaces (header + footer).
 *
 * The logo file lives at /public/crush-mortgage-logo.png.
 */
export function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <Image
        src="/crush-mortgage-logo.png"
        alt="Crush Mortgage"
        width={1000}
        height={324}
        priority
        className="h-9 w-auto"
      />
      <span className="hidden border-l border-white/20 pl-3 text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-white/60 sm:block">
        Realtors
        <br />
        Suite
      </span>
    </Link>
  );
}
