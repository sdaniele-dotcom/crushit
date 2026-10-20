/**
 * rosterParse.ts — turn a brokerage roster export into invitable agents.
 *
 * WHY THIS IS A MODULE AND NOT TEN LINES IN THE PAGE. The input is whatever
 * came out of the MLS or the office manager's spreadsheet, and the output is
 * 150 emails that cannot be unsent. Every forgiving rule below exists because a
 * real export breaks the strict version of it:
 *
 *   • The header is rarely row 1 — exports put a title and a "Source:" note
 *     above it, so the header is found by looking for one rather than assumed.
 *   • Column names differ per export: "Agent Email" / "LA Email" / "Email".
 *   • Names come as ONE column ("Agent Name"), so they have to be split, and
 *     "Cristhian Terranova Lojas" and "Edmundo Ramirez Jr." both have to land
 *     the way a person would read them.
 *   • A phone cell can hold two numbers ("562-235-5660 / 424-213-9181").
 *   • A DRE can be "01240727" or "DRE #01240727".
 *   • The same agent appears once per listing, so a roster of 40 rows can be
 *     23 people.
 *
 * NOTHING IS GUESSED SILENTLY. A row this cannot read comes back in `skipped`
 * with its line number and the reason, so the operator sees what will not be
 * invited before anything is sent — rather than discovering it as a gap.
 */

export interface RosterRow {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  dre_license: string;
  brokerage: string;
  /** 1-based line in the pasted text, for pointing at a problem row. */
  line: number;
}

export interface RosterSkip {
  line: number;
  reason: string;
  raw: string;
}

export interface RosterParse {
  rows: RosterRow[];
  skipped: RosterSkip[];
  /** 1-based line the header was found on, or 0 when none was. */
  headerLine: number;
  /** Which source column each field was read from, to show the operator. */
  mapping: Partial<Record<keyof Omit<RosterRow, 'line'> | 'name', string>>;
}

/** Header spellings seen across CRMLS and office exports, most specific first. */
const ALIASES: Record<string, string[]> = {
  email: ['agent email', 'la email', 'listing agent email', 'email address', 'email', 'e-mail'],
  name: ['agent name', 'listing agent', 'agent', 'full name', 'name'],
  first_name: ['first name', 'first', 'firstname'],
  last_name: ['last name', 'last', 'lastname', 'surname'],
  phone: ['agent phone', 'la phone', 'phone number', 'cell', 'mobile', 'phone'],
  dre_license: ['agent dre #', 'agent dre', 'dre #', 'dre', 'license #', 'license', 'dre license'],
  brokerage: ['brokerage', 'agent brokerage', 'office', 'company'],
};

const LOOKS_LIKE_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * One CSV line into cells, honouring quotes.
 *
 * A doubled quote inside a quoted cell is a literal quote — that is the CSV
 * rule, and brokerage names carry quotes often enough ("Bob's \"A-Team\"
 * Realty") that a naive split on commas mangles the row and shifts every
 * column after it, which is how an email ends up in the phone field.
 */
export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',' || c === '\t') {
      out.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  out.push(cur.trim());
  return out;
}

/**
 * Split a single name cell into first and last the way a person reads it.
 *
 * First token is the first name; everything else is the surname. That keeps
 * compound surnames whole ("Terranova Lojas", "Rico-Aguilar") and keeps a
 * suffix attached ("Ramirez Jr."), which matters because the first name is
 * what the email greets them by and the rest is only stored.
 *
 * "Zavala, Cruz" — the other common export shape — is detected by the comma.
 */
export function splitName(raw: string): { first_name: string; last_name: string } {
  const s = (raw ?? '').replace(/\s+/g, ' ').trim();
  if (!s) return { first_name: '', last_name: '' };
  if (s.includes(',')) {
    const [last, first] = s.split(',', 2);
    return { first_name: (first ?? '').trim(), last_name: (last ?? '').trim() };
  }
  const parts = s.split(' ');
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

/** Digits only, matching how a DRE is stored everywhere else. */
export function cleanDre(raw: string): string {
  return (raw ?? '').replace(/[^0-9]/g, '');
}

/**
 * The first phone number in a cell that may hold several.
 *
 * "562-235-5660 / 424-213-9181" is a real cell from the HomeSmart roster. Both
 * numbers reaching the profile would print two phones on a flyer; the first is
 * the one the export lists as primary.
 */
export function firstPhone(raw: string): string {
  const s = (raw ?? '').trim();
  if (!s) return '';
  const head = s.split(/[/;]|\bor\b/i)[0].trim();
  return head.replace(/\s+/g, ' ');
}

/*
  SPECIFIC FIELDS ARE RESOLVED BEFORE THE GENERIC ONE, and `name` is last.

  Found by testing. The generic alias "name" matches "First Name" on a contains
  check, so on a `First Name,Last Name,Email` header it claimed column 0 as the
  single full-name column. first_name then had nothing left to bind to, the row
  took the explicit-columns path anyway because last_name HAD bound, and every
  agent came out with a surname and no first name — which is the one field the
  email greets them by. Resolving first_name and last_name first leaves `name`
  only unclaimed columns to match, so it can no longer win one.
*/
const FIELD_ORDER = ['email', 'first_name', 'last_name', 'phone', 'dre_license', 'brokerage', 'name'];

function headerIndex(cells: string[]): Record<string, number> {
  const lower = cells.map((c) => c.trim().toLowerCase().replace(/\s+/g, ' '));
  const found: Record<string, number> = {};
  const taken = new Set<number>();
  for (const field of FIELD_ORDER) {
    for (const want of ALIASES[field]) {
      // Exact before contains, and never a column another field already holds:
      // "Agent DRE #" must not be taken by the bare alias "dre", and a claimed
      // column must be stepped over rather than ending the search.
      let i = lower.findIndex((c, n) => c === want && !taken.has(n));
      if (i === -1) i = lower.findIndex((c, n) => c.includes(want) && !taken.has(n));
      if (i !== -1) {
        found[field] = i;
        taken.add(i);
        break;
      }
    }
  }
  return found;
}

export function parseRoster(text: string): RosterParse {
  const lines = (text ?? '').replace(/\r\n?/g, '\n').split('\n');
  const skipped: RosterSkip[] = [];

  // Find the header: the first line whose cells name an email column. Export
  // preambles ("Source: CRMLS Matrix pulled...") sit above it.
  let headerLine = 0;
  let idx: Record<string, number> = {};
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const got = headerIndex(splitCsvLine(lines[i]));
    if (got.email !== undefined && (got.name !== undefined || got.first_name !== undefined)) {
      headerLine = i + 1;
      idx = got;
      break;
    }
  }
  if (!headerLine) {
    return {
      rows: [],
      skipped: [{
        line: 0,
        reason: 'No header row found. It needs a column for the agent email and one for the name.',
        raw: '',
      }],
      headerLine: 0,
      mapping: {},
    };
  }

  const header = splitCsvLine(lines[headerLine - 1]);
  const mapping: RosterParse['mapping'] = {};
  for (const [field, i] of Object.entries(idx)) {
    mapping[field as keyof RosterParse['mapping']] = header[i];
  }

  const at = (cells: string[], field: string): string => {
    const i = idx[field];
    return i === undefined ? '' : (cells[i] ?? '').trim();
  };

  const rows: RosterRow[] = [];
  const seen = new Map<string, number>();

  for (let i = headerLine; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    const line = i + 1;
    const cells = splitCsvLine(raw);
    const email = at(cells, 'email').toLowerCase();

    if (!email) {
      skipped.push({ line, reason: 'No email on this row.', raw: raw.slice(0, 120) });
      continue;
    }
    if (!LOOKS_LIKE_EMAIL.test(email)) {
      skipped.push({ line, reason: `"${email}" is not a usable email.`, raw: raw.slice(0, 120) });
      continue;
    }
    const dupeOf = seen.get(email);
    if (dupeOf) {
      // Not an error worth stopping for — a roster lists an agent per listing —
      // but the operator should see the count collapse and know why.
      skipped.push({ line, reason: `Same agent as line ${dupeOf}.`, raw: email });
      continue;
    }
    seen.set(email, line);

    /*
      Explicit First/Last columns win when they carry anything. The fallback to
      splitting a single name column is not just for headers that lack them — an
      export can have a First Name column that is blank on some rows while the
      full name sits in another, and a blank greeting is worse than a split one.
    */
    let names = { first_name: at(cells, 'first_name'), last_name: at(cells, 'last_name') };
    if (!names.first_name && !names.last_name) names = splitName(at(cells, 'name'));

    rows.push({
      email,
      first_name: names.first_name,
      last_name: names.last_name,
      phone: firstPhone(at(cells, 'phone')),
      dre_license: cleanDre(at(cells, 'dre_license')),
      brokerage: at(cells, 'brokerage'),
      line,
    });
  }

  return { rows, skipped, headerLine, mapping };
}

/** Split into waves small enough to read the results of before continuing. */
export function waves<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
