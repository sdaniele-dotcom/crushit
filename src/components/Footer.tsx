import Link from "next/link";
import { Logo } from "./Logo";
import { navItems, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-ink-900 text-slate-300">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-slate-400">
            {site.shortDescription}
          </p>
          <p className="mt-4 text-sm text-slate-400">
            <span className="font-semibold text-white">Crush Mortgage Team</span>
            <br />
            Company NMLS #{site.companyNmls}
            <br />
            <a href={`tel:${site.phone}`} className="hover:text-crush-400">
              {site.phone}
            </a>{" "}
            ·{" "}
            <a href={`mailto:${site.email}`} className="hover:text-crush-400">
              {site.email}
            </a>
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            The Suite
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-400 transition-colors hover:text-crush-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Connect
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={site.website}
                className="text-slate-400 transition-colors hover:text-crush-400"
              >
                {site.website.replace(/^https?:\/\//, "")}
              </a>
            </li>
            {(
              [
                ["Instagram", site.social.instagram],
                ["Facebook", site.social.facebook],
                ["LinkedIn", site.social.linkedin],
              ] as const
            )
              .filter(([, url]) => url && !url.startsWith("["))
              .map(([label, url]) => (
                <li key={label}>
                  <a
                    href={url}
                    className="text-slate-400 transition-colors hover:text-crush-400"
                  >
                    {label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
          <p className="text-xs leading-relaxed text-slate-500">
            © {2026} {site.company}. {site.brand} Realtors Suite. Company NMLS
            #{site.companyNmls}. This material is for real-estate professional
            and educational use only and is not an advertisement to extend
            consumer credit as defined by Section 1026.2 of Regulation Z. All
            calculators provide estimates only — actual figures depend on a full
            application, credit approval, and current market rates. Equal Housing
            Opportunity.
          </p>
        </div>
      </div>
    </footer>
  );
}
