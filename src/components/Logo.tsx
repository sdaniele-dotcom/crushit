import Link from "next/link";
import Image from "next/image";
import logoOnDark from "../../public/crush-mortgage-logo.png";
import logoOnLight from "../../public/crush-mortgage-logo-primary.png";

/**
 * The Crush Mortgage logo, in the version that suits the surface behind it.
 *
 * Two files, because the mark is wordmark-plus-icon rather than a silhouette:
 * `crush-mortgage-logo.png` is the white lettering for dark bars, and
 * `-primary.png` is the black-and-red lettering for light ones. Tinting one
 * with CSS is not an option — it would flatten the red in the icon.
 *
 * `on` names the BACKGROUND, not the artwork, because that is what a caller
 * knows at the call site.
 *
 * Imported statically so Next emits a base-path-aware URL when the site is
 * exported to a subpath.
 */
export function Logo({ on = "dark" }: { on?: "dark" | "light" }) {
  const light = on === "light";
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <Image
        src={light ? logoOnLight : logoOnDark}
        alt="Crush Mortgage"
        priority
        className="h-9 w-auto"
      />
      <span
        className={`hidden border-l pl-3 text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] sm:block ${
          light ? "border-ink-900/15 text-ink-900/45" : "border-white/20 text-white/60"
        }`}
      >
        Agent
        <br />
        Suite
      </span>
    </Link>
  );
}
