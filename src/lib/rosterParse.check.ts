/**
 * rosterParse.check.ts — assertions for the roster parser.
 *
 * Run:  npx tsx src/lib/rosterParse.check.ts
 *
 * Not a vitest suite, because this repo has no test runner and adding one for
 * a single module was not worth the dependency. It is a plain script that
 * exits non-zero on failure, so CI can run it as-is if that changes.
 *
 * The fixtures are REAL export shapes, pasted from the files this feature was
 * built against — the HomeSmart roster (title and a "Source:" line above the
 * header, "Agent Email", one "Agent Name" column) and the Long Beach MLS pull
 * ("LA Email", "LA Phone", "LA DRE #", "Listing Agent"). Both were parsing
 * wrong at some point during the build; the checks below are what caught it.
 */

import { parseRoster, splitName, cleanDre, firstPhone, splitCsvLine, waves } from "./rosterParse";
let fails = 0;
const ok = (n: string, c: boolean, d?: unknown) => {
  if (c) console.log(`  ok   ${n}`);
  else { console.log(`  FAIL ${n}`, d ?? ""); fails++; }
};

// --- The HomeSmart export shape: title + Source note above the header. ---
const homesmart = [
  `Cerritos & Artesia Open Houses — Sat 10/10 & Sun 10/11/2026`,
  `Source: CRMLS Matrix pulled 10/9/2026`,
  `Property Address,City,Zip,Status,Type,Price,Beds,Baths,Sq Ft,Units,HOA,Agent Name,DRE #,Agent Phone,Agent Email,Brokerage,MLS #`,
  `3811 Wagon Wheel Dr,Lake Isabella,93240,Active,SFR,379000,4,2.5,1646,1,$0,Andre Martinez,01435934,562-688-8887,andrebuyssells4u@yahoo.com,HomeSmart Realty Group,PW26215197`,
  `13729 Doty,Hawthorne,90250,Active,Townhome,665000,3,3,1577,1,$360/mo,Bryiana Davis,01997245,562-235-5660 / 424-213-9181,Soldbybryi@gmail.com,HomeSmart Realty Group,SB26119396`,
  `960 Stichman,La Puente,91746,Active,SFR,775000,3,2,1470,1,$0,Cristhian Terranova Lojas,02114139,818-269-0504,cterranova16@gmail.com,HomeSmart Realty Group,DW26155004`,
  `12121 Garfield,South Gate,90280,Active,Commercial,600000,,,1750,,,Cristhian Terranova Lojas,02114139,818-269-0504,cterranova16@gmail.com,HomeSmart Realty Group,DW26153063`,
  `2828 Hill,Huntington Park,90255,AUC,SFR,685000,4,1,1230,1,$0,Edmundo Ramirez Jr.,01861907,562-772-9657,eramirezjr1@gmail.com,HomeSmart Realty Group,DW26166872`,
  `301 S Spring St,Blythe,92225,Active,Land,37000,,,,,$0,Uriel Meza,02247556,928-315-0325,,HomeSmart Realty Group,PW26145612`,
].join("\n");

const h = parseRoster(homesmart);
ok("finds a header below a title and a Source line", h.headerLine === 3, h.headerLine);
ok("maps the right email column", h.mapping.email === "Agent Email", h.mapping.email);
ok("maps DRE # not some other 'dre'", h.mapping.dre_license === "DRE #", h.mapping.dre_license);
ok("4 agents from 6 listing rows", h.rows.length === 4, h.rows.map(r => r.email));
ok("collapses the repeated agent", h.skipped.some(s => /Same agent as line 6/.test(s.reason)), h.skipped);
ok("reports the row with no email", h.skipped.some(s => s.reason === "No email on this row."), h.skipped);

const bry = h.rows.find(r => r.email.startsWith("soldbybryi"))!;
ok("email lowercased", bry.email === "soldbybryi@gmail.com", bry.email);
ok("takes only the first of two phones", bry.phone === "562-235-5660", bry.phone);
const cris = h.rows.find(r => r.first_name === "Cristhian")!;
ok("compound surname stays whole", cris.last_name === "Terranova Lojas", cris.last_name);
const ed = h.rows.find(r => r.first_name === "Edmundo")!;
ok("suffix stays with the surname", ed.last_name === "Ramirez Jr.", ed.last_name);
ok("brokerage carried", ed.brokerage === "HomeSmart Realty Group", ed.brokerage);
ok("DRE digits only", ed.dre_license === "01861907", ed.dre_license);

// --- The Long Beach export shape: different column names entirely. ---
const lb = [
  `MLS #,Property Address,City,Zip Code,List Price,HOA ($/mo),Beds,Baths,Sq Ft,Property Type,Structure Type,Listing Agent,LA Phone,LA Email,LA DRE #`,
  `PW26224646,8103 N Marina Pacifica Dr N,Long Beach,90803,695000,691,1,1,787,CONDO/A,Multi Family,Lisa Ancich,562-572-9301,lisa.ancich@compass.com,01261750`,
].join("\n");
const l = parseRoster(lb);
ok("handles LA Email / LA Phone / LA DRE # naming", l.rows.length === 1 && l.rows[0].email === "lisa.ancich@compass.com", l);
ok("LA DRE # read correctly", l.rows[0]?.dre_license === "01261750", l.rows[0]?.dre_license);
ok("'Listing Agent' used as the name column", l.rows[0]?.first_name === "Lisa" && l.rows[0]?.last_name === "Ancich", l.rows[0]);

// --- Explicit first/last columns must beat the single-name path. ---
const split = `First Name,Last Name,Email\nCruz,Zavala,cruz4homes@gmail.com`;
const s = parseRoster(split);
ok("uses First/Last columns when present", s.rows[0]?.first_name === "Cruz" && s.rows[0]?.last_name === "Zavala", s.rows[0]);

// --- Quoting: a comma inside a quoted brokerage must not shift columns. ---
const quoted = `Agent Name,Agent Email,Brokerage\nMessou Attai,attaimes@aol.com,"Attai, Realtors ""A-Team"""`;
const q = parseRoster(quoted);
ok("quoted comma does not shift columns", q.rows[0]?.email === "attaimes@aol.com", q.rows[0]);
ok("doubled quote becomes a literal quote", q.rows[0]?.brokerage === 'Attai, Realtors "A-Team"', q.rows[0]?.brokerage);

// --- Units & helpers ---
ok("splitCsvLine handles a tab-separated paste", splitCsvLine("a\tb\tc").length === 3);
ok("'Zavala, Cruz' reads as first Cruz", splitName("Zavala, Cruz").first_name === "Cruz");
ok("single-word name has no surname", splitName("Cher").last_name === "");
ok("cleanDre strips 'DRE #'", cleanDre("DRE #01240727") === "01240727");
ok("cleanDre on junk yields empty", cleanDre("n/a") === "");
ok("firstPhone on a single number is unchanged", firstPhone("562-682-7005") === "562-682-7005");
ok("waves of 25 split 150 into 6", waves(Array.from({length:150}, (_,i)=>i), 25).length === 6);
ok("waves keeps every item", waves(Array.from({length:150}, (_,i)=>i), 25).flat().length === 150);

// --- A file with no usable header must say so, not return nothing silently. ---
const junk = parseRoster("just some text\nand more text");
ok("missing header is reported, not silent", junk.rows.length === 0 && /No header row found/.test(junk.skipped[0]?.reason ?? ""), junk);

console.log(fails ? `\n${fails} FAILED` : "\nall roster parser checks passed");
process.exit(fails ? 1 : 0);
