# Google Sheets CMS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hardcoded data arrays in App.jsx with JSON files synced from a public Google Sheet, so interns can edit site content without touching code.

**Architecture:** A Node script (`scripts/sync-sheet.js`) fetches published CSV tabs from a Google Sheet, parses them into JSON, and writes seed files to `src/data/`. App.jsx imports these JSON files instead of hardcoded arrays. The JSON files are committed to git so the site always has a working fallback. No runtime API calls — data is baked in at build time.

**Tech Stack:** Node.js (built-in fetch, no dependencies), Vite static imports, existing React 19 app.

---

## Data Mapping

### What moves to the Google Sheet

| App.jsx Constant | Sheet Tab | Lines in App.jsx |
|---|---|---|
| `EVENTS_DATA` | Events | 64–71 |
| `VENUES` | Venues | 73–80 |
| `ECOSYSTEM` | People | 82–95 |
| Hardcoded hero/section copy | Copy | scattered |
| `ImpactBar` stats | Stats | 286–291 |

### Sheet Tab Schemas

**Events tab:**
| Column | Type | Example | Notes |
|---|---|---|---|
| id | number | 1 | |
| date | string | Jun 20, 2024 | |
| title | string | The Launch | |
| venue | string | Lehman College | |
| hood | string | Bedford Park | |
| theme | string | Building the ecosystem | |
| color | string | teal | Maps to `C[color]` in app |
| highlights | string | Panel moderated by Majora Carter, Cohort 1 Fellows introduced | Comma-separated, split into array |
| spotlights | string | Stephany Garcia JobsFirstNYC, Lawrence Fauntleroy Lehman College | Comma-separated |
| photos | string | url1, url2 | Comma-separated URLs |
| albumUrl | string | https://... | Single URL |

**Venues tab:**
| Column | Type | Example |
|---|---|---|
| name | string | Lehman College |
| hood | string | Bedford Park |
| year | number | 1968 |
| fact | string | Part of CUNY... |
| lat | number | 40.8734 |
| lng | number | -73.8940 |
| eventIds | string | 1 | Comma-separated numbers |
| photos | string | url1, url2 | Comma-separated URLs |

**People tab:**
| Column | Type | Example |
|---|---|---|
| name | string | Majora Carter |
| role | string | Urban Revival Strategist & Author |
| org | string | Majora Carter Group |
| type | string | voice | One of: voice, fellow, partner |

**Stats tab:**
| Column | Type | Example |
|---|---|---|
| value | number | 225000 |
| prefix | string | $ |
| suffix | string | + |
| label | string | Grant Capital Deployed |

**Copy tab:**
| Column | Type | Example |
|---|---|---|
| key | string | hero_headline |
| value | string | Where the Bronx comes together. |

### Copy keys needed

| key | Current value | Used in |
|---|---|---|
| `next_event_date` | 2026-04-10T18:00:00 | Hero countdown, NextEventSection |
| `next_event_display` | April 10, 2026 | Hero badge, EventJourney, NextEventSection |
| `next_event_venue` | Lehman College | EventJourney, NextEventSection |
| `next_event_hood` | Bedford Park | EventJourney, NextEventSection |
| `next_event_tagline` | Returning to where it all started | NextEventSection |
| `hero_headline` | Where the Bronx comes together. | Hero |
| `hero_description` | Bronx Brilliance is a quarterly gathering... | Hero |
| `syngine_url` | https://syngine.io | NextEventSection |
| `story_heading` | Every Gathering Tells a Story | EventJourney |
| `story_description` | Six events. Six neighborhoods... | EventJourney |
| `ecosystem_heading` | It Takes a Community | EcosystemSection |
| `ecosystem_description` | Bronx Brilliance isn't about any one org... | EcosystemSection |
| `venues_heading` | Every Venue Has a Story | VenueExplorer |
| `venues_description` | We host each event at a different Bronx landmark... | VenueExplorer |

---

## Task 1: Create seed JSON files from current hardcoded data

**Files:**
- Create: `src/data/events.json`
- Create: `src/data/venues.json`
- Create: `src/data/people.json`
- Create: `src/data/stats.json`
- Create: `src/data/copy.json`

**Step 1: Create `src/data/events.json`**

Extract `EVENTS_DATA` into JSON. The `color` field becomes a string key (e.g. `"teal"`) instead of `C.teal`.

```json
[
  {
    "id": 1,
    "date": "Jun 20, 2024",
    "title": "The Launch",
    "venue": "Lehman College",
    "hood": "Bedford Park",
    "theme": "Building the ecosystem",
    "color": "teal",
    "highlights": ["Panel moderated by Majora Carter", "Cohort 1 Fellows introduced", "Lehman College partnership announced"],
    "spotlights": ["Stephany Garcia, JobsFirstNYC", "Lawrence Fauntleroy, Lehman College", "John Campos, Career Connected Learning"],
    "photos": ["https://lh3.googleusercontent.com/pw/...w400", "..."],
    "albumUrl": "https://photos.google.com/share/..."
  }
]
```

Repeat for all 6 events. Copy exact data from App.jsx lines 64–71.

**Step 2: Create `src/data/venues.json`**

```json
[
  {
    "name": "Lehman College",
    "hood": "Bedford Park",
    "year": 1968,
    "fact": "Part of CUNY. Home to the Lehman Center...",
    "coords": [40.8734, -73.8940],
    "events": [1],
    "photos": []
  }
]
```

Copy exact data from App.jsx lines 73–80.

**Step 3: Create `src/data/people.json`**

```json
[
  { "name": "Majora Carter", "role": "Urban Revival Strategist & Author", "org": "Majora Carter Group", "type": "voice" }
]
```

Copy exact data from App.jsx lines 82–95.

**Step 4: Create `src/data/stats.json`**

```json
[
  { "value": 225000, "prefix": "$", "suffix": "+", "label": "Grant Capital Deployed" },
  { "value": 15, "prefix": "", "suffix": "+", "label": "Entrepreneurs Supported" },
  { "value": 6, "prefix": "", "suffix": "", "label": "Iconic Bronx Venues" },
  { "value": 800, "prefix": "", "suffix": "+", "label": "Community Connections" },
  { "value": 30, "prefix": "", "suffix": "+", "label": "Ecosystem Partners" }
]
```

**Step 5: Create `src/data/copy.json`**

```json
{
  "next_event_date": "2026-04-10T18:00:00",
  "next_event_display": "April 10, 2026",
  "next_event_venue": "Lehman College",
  "next_event_hood": "Bedford Park",
  "next_event_tagline": "Returning to where it all started",
  "hero_headline": "Where the Bronx comes together.",
  "hero_description": "Bronx Brilliance is a quarterly gathering that connects entrepreneurs, educators, students, and community builders. Each event takes place at a different iconic Bronx venue, with a different theme and a room full of people who care about this borough.",
  "syngine_url": "https://syngine.io",
  "story_heading": "Every Gathering Tells a Story",
  "story_description": "Six events. Six neighborhoods. Hundreds of people showing up for each other and for the Bronx. Click any event to see who was in the room and what happened.",
  "ecosystem_heading": "It Takes a Community",
  "ecosystem_description": "Bronx Brilliance isn't about any one organization. It's about the entrepreneurs, educators, civic leaders, students, and neighbors who show up and build together. Here are some of the people who've shaped these gatherings.",
  "venues_heading": "Every Venue Has a Story",
  "venues_description": "We host each event at a different Bronx landmark. Before you arrive, our AI-powered guide helps you discover the venue's history, the neighborhood's character, and what to explore nearby."
}
```

**Step 6: Verify JSON files are valid**

Run: `node -e "for (const f of ['events','venues','people','stats','copy']) { JSON.parse(require('fs').readFileSync('src/data/' + f + '.json')); console.log(f + ': OK'); }"`
Expected: All 5 files print OK.

**Step 7: Commit**

```bash
git add src/data/
git commit -m "feat: add seed JSON data files for CMS migration"
```

---

## Task 2: Refactor App.jsx to import from JSON files

**Files:**
- Modify: `src/App.jsx` (lines 1–95 data section, plus scattered hardcoded copy)

**Step 1: Add imports at top of App.jsx**

After the existing import line (line 2), add:

```js
import eventsData from "./data/events.json";
import venuesData from "./data/venues.json";
import peopleData from "./data/people.json";
import statsData from "./data/stats.json";
import copyData from "./data/copy.json";
```

**Step 2: Replace EVENTS_DATA with a mapped version**

Replace the `const EVENTS_DATA = [...]` block (lines 64–71) with:

```js
const EVENTS_DATA = eventsData.map(e => ({
  ...e,
  color: C[e.color] || C.teal,
}));
```

This maps the string color key (`"teal"`) back to the hex value (`C.teal`).

**Step 3: Replace VENUES**

Replace `const VENUES = [...]` (lines 73–80) with:

```js
const VENUES = venuesData;
```

**Step 4: Replace ECOSYSTEM**

Replace `const ECOSYSTEM = [...]` (lines 82–95) with:

```js
const ECOSYSTEM = peopleData;
```

**Step 5: Update Hero component to use copyData**

In the `Hero` function:
- Line 159: `useCountdown("2026-04-10T18:00:00")` → `useCountdown(copyData.next_event_date)`
- Line 191: `"Next gathering: April 10, 2026"` → `` `Next gathering: ${copyData.next_event_display}` ``
- Lines 200–204: headline text → split `copyData.hero_headline` on newline or use as-is
- Lines 213–216: description → `copyData.hero_description`

**Step 6: Update ImpactBar to use statsData**

Replace the hardcoded `stats` array (lines 286–291) with:

```js
const stats = statsData.map(s => ({
  v: s.value, pre: s.prefix, suf: s.suffix, l: s.label,
}));
```

**Step 7: Update EventJourney section headings**

- Line 332–343: Replace heading text with `copyData.story_heading` and `copyData.story_description`
- Line 538: `"April 10, 2026 · Lehman College, Bedford Park"` → `` `${copyData.next_event_display} · ${copyData.next_event_venue}, ${copyData.next_event_hood}` ``

**Step 8: Update EcosystemSection headings**

- Lines 578–588: Replace heading/description with `copyData.ecosystem_heading` and `copyData.ecosystem_description`

**Step 9: Update VenueExplorer headings**

- Lines 685–694: Replace heading/description with `copyData.venues_heading` and `copyData.venues_description`

**Step 10: Update NextEventSection**

- Line 984: tagline → `copyData.next_event_tagline`
- Line 990: date → `copyData.next_event_display`
- Line 994: venue → `` `${copyData.next_event_venue} · ${copyData.next_event_hood}, Bronx` ``
- Line 1001: syngine URL → `copyData.syngine_url`

**Step 11: Verify the dev server still works**

Run: `npm run dev` and check http://localhost:5173
Expected: Site looks identical to before.

**Step 12: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: import data from JSON files instead of hardcoded arrays"
```

---

## Task 3: Create the sync script

**Files:**
- Create: `scripts/sync-sheet.js`
- Modify: `package.json` (add `sync` script)

**Step 1: Create `scripts/sync-sheet.js`**

```js
#!/usr/bin/env node

// Fetches published Google Sheet tabs as CSV and writes JSON to src/data/
// Usage: SHEET_ID=<id> node scripts/sync-sheet.js
// Or set SHEET_ID in .env

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const SHEET_ID = process.env.SHEET_ID;
if (!SHEET_ID) {
  console.error("Error: Set SHEET_ID environment variable to your Google Sheet ID");
  console.error("Example: SHEET_ID=1abc123 node scripts/sync-sheet.js");
  process.exit(1);
}

// Tab name → GID (the numeric tab identifier from the sheet URL)
// Update these after creating your sheet
const TABS = {
  events:  { gid: "0" },
  venues:  { gid: "1" },
  people:  { gid: "2" },
  stats:   { gid: "3" },
  copy:    { gid: "4" },
};

async function fetchTab(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch gid=${gid}: ${res.status}`);
  return res.text();
}

function parseCSV(text) {
  const lines = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      lines.push(current);
      current = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      lines.push(current);
      current = "NEWLINE";
    } else {
      current += ch;
    }
  }
  if (current !== "") lines.push(current);

  // Reconstruct rows
  const rows = [];
  let row = [];
  for (const cell of lines) {
    if (cell === "NEWLINE") {
      if (row.length > 0) rows.push(row);
      row = [];
    } else {
      row.push(cell.trim());
    }
  }
  if (row.length > 0) rows.push(row);

  const headers = rows[0];
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i] || ""; });
    return obj;
  });
}

function splitList(str) {
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
    highlights: splitList(r.highlights),
    spotlights: splitList(r.spotlights),
    photos: splitList(r.photos),
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
    events: splitList(r.eventIds).map(Number),
    photos: splitList(r.photos),
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
  const obj = {};
  rows.forEach(r => { if (r.key) obj[r.key] = r.value; });
  return obj;
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  const transforms = {
    events: transformEvents,
    venues: transformVenues,
    people: transformPeople,
    stats: transformStats,
    copy: transformCopy,
  };

  for (const [name, { gid }] of Object.entries(TABS)) {
    console.log(`Fetching ${name} (gid=${gid})...`);
    const csv = await fetchTab(gid);
    const rows = parseCSV(csv);
    const data = transforms[name](rows);
    const path = join(DATA_DIR, `${name}.json`);
    writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
    console.log(`  → Wrote ${path} (${Array.isArray(data) ? data.length + " items" : Object.keys(data).length + " keys"})`);
  }

  console.log("\nDone! Run `npm run dev` to see changes.");
}

main().catch(e => { console.error(e); process.exit(1); });
```

**Step 2: Add `sync` script to package.json**

Add to the `"scripts"` section:

```json
"sync": "node scripts/sync-sheet.js"
```

**Step 3: Add SHEET_ID to .env.example**

Create `.env.example`:
```
SHEET_ID=your_google_sheet_id_here
```

And ensure `.env` is in `.gitignore`.

**Step 4: Verify script runs (dry run, will fail without sheet)**

Run: `node scripts/sync-sheet.js`
Expected: Error message about SHEET_ID being required (confirms script loads correctly).

**Step 5: Commit**

```bash
git add scripts/sync-sheet.js package.json .env.example
git commit -m "feat: add Google Sheets sync script"
```

---

## Task 4: Create the Google Sheet and test end-to-end

This is a manual step. Instructions for Tim or interns:

**Step 1: Create a new Google Sheet**

Name it: `BronxBrilliance.live Content`

**Step 2: Create 5 tabs**

Rename the default tab to `Events`, then add tabs: `Venues`, `People`, `Stats`, `Copy`.

**Step 3: Populate headers**

Copy the column names from the schemas above into row 1 of each tab.

**Step 4: Populate data**

Copy the current data from the seed JSON files into the sheet rows.

**Step 5: Publish the sheet**

File → Share → Publish to web → Select "Entire Document" → CSV format → Publish.

**Step 6: Get the Sheet ID**

From the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

**Step 7: Get tab GIDs**

Click each tab, look at the URL: `...gid=0`, `...gid=123456`, etc. Update the `TABS` object in `sync-sheet.js` with the real GIDs.

**Step 8: Test the sync**

```bash
SHEET_ID=your_id_here npm run sync
npm run dev
```

Expected: Site loads with data from the Google Sheet, looks identical.

**Step 9: Test an edit**

Change a person's name in the sheet, run `npm run sync` again, verify it shows up on the site.

---

## Task 5: Update documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md` (if it exists)

**Step 1: Update CLAUDE.md**

Add a new section:

```markdown
## Content Management (Google Sheets CMS)

Content lives in `src/data/*.json` files, synced from a Google Sheet.

### Editing content
1. Edit the Google Sheet (link in .env or bookmarked)
2. Run `npm run sync` to pull changes
3. Run `npm run build` or push to deploy

### Data files
- `src/data/events.json` — Event timeline data
- `src/data/venues.json` — Venue details and map coordinates
- `src/data/people.json` — Ecosystem people directory
- `src/data/stats.json` — Impact bar statistics
- `src/data/copy.json` — Section headings and hero text

### Adding a new event
Add a row to the Events tab with all fields filled. The `color` field should be one of: `teal`, `gold`, `accent`. Photo URLs should be comma-separated.

### Sync script
`scripts/sync-sheet.js` — requires `SHEET_ID` env var. Tab GIDs are configured in the script.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add Google Sheets CMS instructions to CLAUDE.md"
```

---

## Summary

| Task | What it does | Depends on |
|---|---|---|
| Task 1 | Create seed JSON files | Nothing |
| Task 2 | Refactor App.jsx to use JSON imports | Task 1 |
| Task 3 | Create sync script + npm command | Task 1 |
| Task 4 | Create Google Sheet and test | Tasks 1–3 |
| Task 5 | Update documentation | Tasks 1–3 |
