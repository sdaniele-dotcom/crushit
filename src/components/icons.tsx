/**
 * The suite's line icons, and the star.
 *
 * WHY THESE EXIST. The product used emoji as its icon set — 🎨 for a flyer,
 * 🏡 for an open-house kit, 📘 for a guide, ⭐ for earned points. Emoji render
 * differently on every platform, cannot take a text colour, sit off the
 * baseline, and read as a placeholder nobody replaced. Fifty stars across the
 * suite is a brand mark rendered by whatever font the visitor's OS supplies.
 *
 * The star is the signature: Crush Stars are the product's own currency, so
 * the one detail only this product has should be drawn, not borrowed from the
 * emoji table. It takes `currentColor`, so it is red in a count, muted in a
 * row and white on a dark field, which the emoji could never do.
 *
 * One size and one stroke: 18px at 1.6, matching the rulebook's 16-18 at ~1.5.
 */
type IconProps = { className?: string; size?: number };

function base(size: number, className: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

/** The signature mark. Solid, because a count needs weight at small sizes. */
export function Star({ className = "", size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2.6l2.74 6.03 6.56.72-4.89 4.42 1.33 6.46L12 16.95 6.26 20.23l1.33-6.46L2.7 9.35l6.56-.72L12 2.6z" />
    </svg>
  );
}

/**
 * Flyer. A sheet with a photo block at the top and text under it.
 *
 * The earlier version was a rectangle with three rules, which at 20px was
 * indistinguishable from the calculator sitting next to it on the dashboard.
 * The filled block is what tells a flyer from a form at a glance.
 */
export function FlyerIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="4.5" y="3" width="15" height="18" rx="2" />
      <rect x="7.5" y="6" width="9" height="5.5" rx="1" fill="currentColor" stroke="none" />
      <path d="M7.5 14.5h9M7.5 17.5h5.5" />
    </svg>
  );
}

/** Open house. A roof over a door. */
export function HouseIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3.5 11L12 4l8.5 7" />
      <path d="M5.5 10.2V20h13v-9.8" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

/** Buyer guide. An open book. */
export function GuideIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 6.5S10 4.5 4.5 4.5v13C10 17.5 12 19.5 12 19.5s2-2 7.5-2v-13C14 4.5 12 6.5 12 6.5z" />
      <path d="M12 6.5v13" />
    </svg>
  );
}

/** Calculator. Keys, not an abacus. */
export function CalculatorIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8.5 7.5h7M8.5 12h2M13.5 12h2M8.5 16h2M13.5 16h2" />
    </svg>
  );
}

/** Social content. A phone. */
export function SocialIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 5.5h2" />
      <circle cx="12" cy="18" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Video. A play triangle in a frame. */
export function VideoIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" />
    </svg>
  );
}

/** Loan programs. A bank front. */
export function BankIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3.5 9.5L12 4.5l8.5 5" />
      <path d="M5.5 9.5v8M9.5 9.5v8M14.5 9.5v8M18.5 9.5v8" />
      <path d="M3.5 19.5h17" />
    </svg>
  );
}

/** A generated document. */
export function DocIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" />
      <path d="M13.5 3v5.5H19" />
    </svg>
  );
}

/** A tier reached. */
export function TrophyIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z" />
      <path d="M7.5 5.5H5a2 2 0 0 0 2.5 3M16.5 5.5H19a2 2 0 0 1-2.5 3" />
      <path d="M12 13.5V17M9 20h6" />
    </svg>
  );
}
