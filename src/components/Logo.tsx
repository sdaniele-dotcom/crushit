import Link from "next/link";
import Image from "next/image";
import logo from "../../public/crush-mortgage-logo.png";

/**
 * Official Crush Mortgage logo (white/dark-background version) + a small
 * "Realtors Suite" tag. Used on dark surfaces (header + footer).
 *
 * The logo is imported statically so Next.js emits it with the correct
 * (base-path-aware) URL when the site is exported to a subpath like /crushit.
 */
export function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <Image
        src={logo}
        alt="Crush Mortgage"
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
