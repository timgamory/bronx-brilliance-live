#!/usr/bin/env node

// Fetches published Google Sheet tabs as CSV and writes JSON to src/data/
// Usage: SHEET_ID=<your-sheet-id> node scripts/sync-sheet.js
// Get SHEET_ID from the Google Sheet URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const SHEET_ID = process.env.SHEET_ID;
if (!SHEET_ID) {
  console.error("Error: SHEET_ID environment variable is required.");
  console.error("Example: SHEET_ID=1abc123xyz node scripts/sync-sheet.js");
  console.error("\nFind your Sheet ID in the Google Sheets URL:");
  console.error("  https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit");
  process.exit(1);
}

// Tab GID mapping — update these after creating your sheet.
// Find GIDs by clicking each tab and reading the URL: ...gid=NUMBER
const TABS = {
  events: "0",
  venues: "1",
  people: "2",
  stats:  "3",
  copy:   "4",
};

async function fetchCSV(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching gid=${gid}`);
  return res.text();
}

function parseCSV(text) {
  const cells = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cells.push(cell); cell = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      cells.push(cell); cell = "§";
    } else {
      cell += ch;
    }
  }
  if (cell) cells.push(cell);

  const rows = [];
  let row = [];
  for (const c of cells) {
    if (c === "§") { if (row.length) rows.push(row); row = []; }
    else row.push(c.trim());
  }
  if (row.length) rows.push(row);

  const headers = rows[0];
  return rows.slice(1)
    .filter(r => r.some(c => c !== ""))
    .map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}

function list(str) {
  return str ? str.split(/\s*,\s*/).filter(Boolean) : [];
}

function transformEvents(rows) {
  return rows.map(r => ({
    id: Number(r.id),
    date: r.date,
    title: r.title,
    venue: r.venue,
    hood: r.hood,
    theme: r.theme,
    color: r.color || "teal",
    highlights: list(r.highlights),
    spotlights: list(r.spotlights),
    photos: list(r.photos),
    albumUrl: r.albumUrl || "",
  }));
}

function transformVenues(rows) {
  return rows.map(r => ({
    name: r.name,
    hood: r.hood,
    year: Number(r.year),
    fact: r.fact,
    coords: [Number(r.lat), Number(r.lng)],
    events: list(r.eventIds).map(Number),
    photos: list(r.photos),
  }));
}

function transformPeople(rows) {
  return rows.map(r => ({
    name: r.name,
    role: r.role,
    org: r.org || "",
    type: r.type || "fellow",
  }));
}

function transformStats(rows) {
  return rows.map(r => ({
    value: Number(r.value),
    prefix: r.prefix || "",
    suffix: r.suffix || "",
    label: r.label,
  }));
}

function transformCopy(rows) {
  return Object.fromEntries(rows.filter(r => r.key).map(r => [r.key, r.value]));
}

const TRANSFORMS = { events: transformEvents, venues: transformVenues, people: transformPeople, stats: transformStats, copy: transformCopy };

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  for (const [name, gid] of Object.entries(TABS)) {
    process.stdout.write(`Syncing ${name}...`);
    const csv = await fetchCSV(gid);
    const rows = parseCSV(csv);
    const data = TRANSFORMS[name](rows);
    writeFileSync(join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2) + "\n");
    const count = Array.isArray(data) ? `${data.length} rows` : `${Object.keys(data).length} keys`;
    console.log(` ✓ (${count})`);
  }
  console.log("\nDone. Run npm run build to publish changes.");
}

main().catch(err => { console.error(err.message); process.exit(1); });
