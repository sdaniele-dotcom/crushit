import Link from "next/link";
import Image from "next/image";
import wordmark from "../../public/brand/whats-a-payment-wordmark.png";

/**
 * The What's a Payment wordmark.
 *
 * ONE ASSET, INVERTED IN CSS. The artwork is black on transparent; on the dark
 * header it gets `brightness-0 invert`, which is the same trick
 * SocialInfographics already uses for the Crush logo. A second white PNG would
 * be a second file to keep in step with the first, and they drift.
 *
 * Imported statically so Next emits a base-path-aware URL when the site is
 * exported to a subpath.
 */
export function Logo({ onDark = true }: { onDark?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center" aria-label="What's a Payment — home">
      <Image
        src={wordmark}
        alt="What's a Payment"
        priority
        className={`h-7 w-auto sm:h-8 ${onDark ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
