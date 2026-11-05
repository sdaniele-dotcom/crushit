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
        /*
          TALLER THAN A ONE-LINE LOGO NEEDS TO BE. This wordmark is a stacked
          two-line lockup ("what's a" over "payment"), so each line only gets
          half the height — at the h-8 a single-line logo would use, it renders
          too small to read. h-11 gives each line the weight of a normal 20px
          logo.
        */
        className={`h-10 w-auto sm:h-11 ${onDark ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
