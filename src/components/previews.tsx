import { Star } from "@/components/icons";

/**
 * Miniatures of what the suite actually makes.
 *
 * These four sit where a 7xl emoji on a gradient used to sit, and where — for
 * one bad afternoon — a small outline icon floated in an empty grey box,
 * which read as a placeholder nobody had finished.
 *
 * A marketing page for a tool that PRODUCES things should show the things.
 * Each of these is the real output in miniature, built in code rather than
 * screenshotted, so it cannot drift out of date and stays sharp at any size.
 * The data is plausible and specific — a real Long Beach street, a price that
 * could be on the MLS today, payments that actually divide — because round
 * numbers and "Lorem" are what make a mock look like a mock.
 */

const sheet =
  "absolute inset-0 m-auto flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_18px_40px_rgba(16,18,27,0.14)] ring-1 ring-black/5";

/** The listing flyer: photo, address, price, two priced scenarios, your panel. */
export function FlyerPreview() {
  return (
    <div className={`${sheet} h-[86%] w-auto`} style={{ aspectRatio: "17 / 22" }} aria-hidden>
      <div className="flex items-center justify-between border-b border-ink-900/10 px-3 py-2">
        <span className="text-[7px] font-bold tracking-wide text-crush-600">
          CRUSH MORTGAGE
        </span>
        <span className="text-[6px] font-semibold text-ink-900/45">LISTED BY</span>
      </div>

      {/* The listing photo, suggested rather than faked with a stock image. */}
      <div className="relative h-[34%] bg-gradient-to-b from-slate-200 to-slate-300">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute bottom-1.5 left-2.5">
          <p className="text-[8px] font-bold leading-tight text-white">
            3718 Charlemagne Ave
          </p>
          <p className="text-[6px] text-white/80">Long Beach, CA 90808</p>
        </div>
        <span className="absolute right-2 top-2 rounded bg-white/95 px-1.5 py-0.5 text-[7px] font-extrabold text-ink-900">
          $899,000
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 px-2 pt-2">
        {/* Four, because that is what the real flyer prints. */}
        {[
          ["Conventional", "20% down", "$4,984"],
          ["Conventional", "5% down", "$5,515"],
          ["FHA", "3.5% down", "$5,902"],
          ["Bank Statement", "10% down", "$6,118"],
        ].map(([a, b, c], i) => (
          <div key={i} className="rounded-md bg-surface px-2 py-1.5 ring-1 ring-black/5">
            <p className="text-[6.5px] font-bold text-ink-900">{a}</p>
            <p className="text-[5.5px] text-ink-900/50">{b}</p>
            <p className="mt-1 text-[11px] font-extrabold leading-none text-crush-600">
              {c}
            </p>
            <p className="text-[5.5px] text-ink-900/45">per month</p>
          </div>
        ))}
      </div>

      <div className="flex-1 px-2 pt-1.5">
        <p className="text-[5.5px] text-ink-900/45">
          Rate 6.875% / APR 7.042% · 30-year fixed · as of today
        </p>
        <div className="mt-1 space-y-[2px]">
          <span className="block h-[2px] w-full rounded bg-ink-900/8" />
          <span className="block h-[2px] w-[92%] rounded bg-ink-900/8" />
          <span className="block h-[2px] w-[78%] rounded bg-ink-900/8" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-t border-ink-900/10 px-2.5 py-1.5">
        <span className="h-4 w-4 rounded-full bg-crush-500/20 ring-1 ring-crush-500/30" />
        <div className="min-w-0">
          <p className="truncate text-[6.5px] font-bold text-ink-900">Your name here</p>
          <p className="truncate text-[5.5px] text-ink-900/50">Your brokerage · DRE #</p>
        </div>
        <span className="ml-auto h-5 w-5 rounded-sm bg-ink-900/85" />
      </div>
    </div>
  );
}

/** The open-house kit: a branded sign-in sheet with a QR check-in. */
export function OpenHousePreview() {
  return (
    <div className={`${sheet} h-[86%] w-auto`} style={{ aspectRatio: "17 / 22" }} aria-hidden>
      <div className="border-b border-ink-900/10 px-3 py-2">
        <p className="text-[9px] font-extrabold leading-tight text-ink-900">
          Open House Sign-In
        </p>
        <p className="text-[6px] text-ink-900/50">Sunday 1–4pm · 3718 Charlemagne Ave</p>
      </div>

      <div className="flex-1 px-3 py-2">
        <div className="mb-1 grid grid-cols-[1.4fr_1fr_0.7fr] gap-1 text-[5.5px] font-bold text-ink-900/45">
          <span>NAME</span>
          <span>EMAIL</span>
          <span>AGENT?</span>
        </div>
        {[
          ["Maria Delgado", "m.delgado@…", "No"],
          ["Tom Whitfield", "twhit@…", "Yes"],
          ["Priya Raman", "praman@…", "No"],
          ["", "", ""],
          ["", "", ""],
        ].map(([n, e, a], i) => (
          <div
            key={i}
            className="grid grid-cols-[1.4fr_1fr_0.7fr] gap-1 border-b border-ink-900/8 py-[3px] text-[6px] text-ink-900/70"
          >
            <span className="truncate">{n || " "}</span>
            <span className="truncate text-ink-900/45">{e}</span>
            <span>{a}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-ink-900/10 px-3 py-2">
        {/* A QR suggested as a pixel grid — a real one here would scan to nothing. */}
        <div className="grid h-7 w-7 shrink-0 grid-cols-4 grid-rows-4 gap-[1px] rounded-sm bg-white p-[2px] ring-1 ring-ink-900/15">
          {[1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1].map((on, i) => (
            <span key={i} className={on ? "bg-ink-900" : "bg-transparent"} />
          ))}
        </div>
        <p className="text-[6px] leading-snug text-ink-900/60">
          Scan to sign in
          <br />
          <span className="font-bold text-crush-600">Goes straight to your CRM</span>
        </p>
      </div>
    </div>
  );
}

/** The client guide: a co-branded cover. */
export function GuidePreview() {
  return (
    <div className={`${sheet} h-[86%] w-auto`} style={{ aspectRatio: "17 / 22" }} aria-hidden>
      <div className="flex h-[58%] flex-col justify-end bg-ink-900 px-3 py-3">
        <p className="text-[6px] font-bold tracking-wide text-crush-400">
          THE COMPLETE
        </p>
        <p className="mt-0.5 text-[15px] font-extrabold leading-[1.05] text-white">
          First-Time
          <br />
          Buyer Guide
        </p>
        <p className="mt-1.5 text-[6px] text-white/55">
          What to expect, start to keys
        </p>
      </div>

      <div className="flex-1 px-3 py-2">
        {["What you actually need to put down", "How a pre-approval works", "The costs nobody mentions"].map(
          (t, i) => (
            <div key={t} className="flex gap-1.5 border-b border-ink-900/8 py-[5px]">
              <span className="text-[6px] font-bold text-crush-600">{i + 1}</span>
              <span className="text-[6px] text-ink-900/70">{t}</span>
            </div>
          ),
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-ink-900/10 px-2.5 py-1.5">
        <span className="h-4 w-4 rounded-full bg-crush-500/20 ring-1 ring-crush-500/30" />
        <p className="text-[6px] font-bold text-ink-900">Prepared for you by your agent</p>
      </div>
    </div>
  );
}

/** Crush Stars: the tier bar and where you sit. */
export function RewardsPreview() {
  return (
    <div className={`${sheet} h-fit max-h-full w-[76%]`} aria-hidden>
      <div className="px-4 py-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[6.5px] font-bold text-ink-900/45">CRUSH POINTS</p>
            <p className="flex items-center gap-1 text-[22px] font-extrabold leading-none text-crush-600">
              <Star size={15} />
              <span className="tabular-nums">128</span>
            </p>
          </div>
          <span className="rounded-full bg-crush-50 px-2 py-0.5 text-[7px] font-bold text-crush-700">
            CRUSH PRO
          </span>
        </div>

        <div className="mt-2.5">
          <div className="flex justify-between text-[6px] font-semibold text-ink-900/45">
            <span>Pro</span>
            <span>Elite · 250</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full w-[52%] rounded-full bg-crush-500" />
          </div>
        </div>

        <div className="mt-3 space-y-[3px]">
          {[
            ["1", "Amraj K.", "412"],
            ["2", "You", "128"],
            ["3", "Josh A.", "96"],
          ].map(([r, n, s]) => (
            <div
              key={r}
              className={`flex items-center gap-2 rounded px-1.5 py-1 text-[6.5px] ${
                n === "You" ? "bg-crush-50 font-bold text-crush-700" : "text-ink-900/65"
              }`}
            >
              <span className="w-2 text-ink-900/35">{r}</span>
              <span className="flex-1 truncate">{n}</span>
              <span className="tabular-nums">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
