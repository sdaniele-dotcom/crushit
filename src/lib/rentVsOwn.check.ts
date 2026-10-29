/**
 * rentVsOwn.check.ts — run with: npx tsx src/lib/rentVsOwn.check.ts
 *
 * There is no test runner in this repo, so this is a script that exits
 * non-zero. It exists for one reason: `cumRentPaid` is now printed in red on a
 * sheet handed to a client, and a wrong number there is worse than no number.
 */

import { rentVsOwn, RENT_VS_OWN_DEFAULTS, type RentVsOwnInputs } from './rentVsOwn';

let failures = 0;
function chk(name: string, cond: boolean, detail = '') {
  if (cond) console.log(`  ok   ${name}`);
  else {
    failures += 1;
    console.log(`  FAIL ${name} ${detail}`);
  }
}
const near = (a: number, b: number, tol = 0.51) => Math.abs(a - b) <= tol;

// ── The default that changed ────────────────────────────────────────────────
chk(
  'rent increase defaults to 3%, not 5%',
  RENT_VS_OWN_DEFAULTS.rentIncreasePct === 3,
  `-> ${RENT_VS_OWN_DEFAULTS.rentIncreasePct}`,
);

// ── cumRentPaid ─────────────────────────────────────────────────────────────
const flat: RentVsOwnInputs = { ...RENT_VS_OWN_DEFAULTS, rentIncreasePct: 0, currentRent: 1000, horizonYears: 3 };
{
  const r = rentVsOwn(flat);
  // No rent growth: year N is simply 1000 × 12 × N. If this is wrong, nothing
  // else about the column can be trusted.
  chk('year 1 is one year of rent', near(r.rows[0].cumRentPaid, 12_000), `-> ${r.rows[0].cumRentPaid}`);
  chk('year 2 ACCUMULATES rather than resetting', near(r.rows[1].cumRentPaid, 24_000), `-> ${r.rows[1].cumRentPaid}`);
  chk('year 3 keeps accumulating', near(r.rows[2].cumRentPaid, 36_000), `-> ${r.rows[2].cumRentPaid}`);
}

{
  // 10% growth, so an error in the compounding direction is obvious: year 1 is
  // the BASE rent (no growth applied yet), year 2 is 10% more.
  const r = rentVsOwn({ ...flat, rentIncreasePct: 10 });
  chk('year 1 applies no growth yet', near(r.rows[0].cumRentPaid, 12_000), `-> ${r.rows[0].cumRentPaid}`);
  chk(
    'year 2 adds the grown rent, not the original',
    near(r.rows[1].cumRentPaid, 12_000 + 13_200),
    `-> ${r.rows[1].cumRentPaid}`,
  );
  chk(
    'it compounds rather than adding a flat 10% each year',
    near(r.rows[2].cumRentPaid, 12_000 + 13_200 + 14_520),
    `-> ${r.rows[2].cumRentPaid}`,
  );
}

{
  // The last row must equal the headline figure, because both appear on the
  // same printed page and a client WILL add up the column.
  const r = rentVsOwn(RENT_VS_OWN_DEFAULTS);
  const last = r.rows[r.rows.length - 1];
  chk(
    'the final row matches the summary total shown above it',
    near(last.cumRentPaid, r.summary.totalRentPaid),
    `-> row ${last.cumRentPaid} vs summary ${r.summary.totalRentPaid}`,
  );
  chk('it never decreases', r.rows.every((row, i) => i === 0 || row.cumRentPaid >= r.rows[i - 1].cumRentPaid));
  chk('it is never negative', r.rows.every((row) => row.cumRentPaid >= 0));
  chk(
    'it is NOT the same number as the owning advantage it replaced',
    !near(last.cumRentPaid, last.ownAdvantage, 1),
    'the red column would be mislabelled if these matched',
  );
}

{
  // A lower rent-increase default must not change rent already paid in year 1,
  // only what follows. Guards against the default change being applied in the
  // wrong place.
  const a = rentVsOwn({ ...RENT_VS_OWN_DEFAULTS, rentIncreasePct: 3 });
  const b = rentVsOwn({ ...RENT_VS_OWN_DEFAULTS, rentIncreasePct: 5 });
  chk('year 1 rent is unaffected by the growth rate', near(a.rows[0].cumRentPaid, b.rows[0].cumRentPaid));
  chk(
    '3% really does total less rent than 5% over the horizon',
    a.summary.totalRentPaid < b.summary.totalRentPaid,
    `-> ${a.summary.totalRentPaid} vs ${b.summary.totalRentPaid}`,
  );
  chk(
    'and owning therefore looks LESS far ahead at 3%, not more',
    a.summary.ownAdvantage < b.summary.ownAdvantage,
    'a lower rent assumption must not flatter the comparison',
  );
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
