# BronxBrilliance.live

Website for the Bronx Brilliance quarterly gathering series, organized by Community Enterprise Accelerator (CEA).

## Stack

- **Vite 8** + **React 19** (single-page app, no router)
- **Leaflet / react-leaflet** for the interactive venue map
- **Vanilla CSS** in `src/index.css` (no Tailwind, no CSS-in-JS)
- Inline styles used heavily in `App.jsx` via a color constants object `C`
- No TypeScript — plain JSX

## Project Structure

```
src/
  App.jsx         # Everything: hooks, components, layout (single-file app)
  index.css       # Global styles, resets, Leaflet overrides
  main.jsx        # React root mount
  data/
    events.json   # Event timeline data
    venues.json   # Venue details and map coordinates
    people.json   # Ecosystem people directory
    stats.json    # Impact bar statistics
    copy.json     # Section headings, hero text, next event details
scripts/
  sync-sheet.js   # Fetches Google Sheet CSVs → writes src/data/*.json
public/
  favicon.svg
  icons.svg       # SVG sprite for inline icons
```

## Commands

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint
npm run sync     # Pull content from Google Sheet → src/data/*.json
```

## Content Management (Google Sheets CMS)

Content lives in `src/data/*.json`, synced from a Google Sheet. Interns edit the sheet; `npm run sync` pulls changes.

### Intern workflow
1. Edit the Google Sheet (share the link with interns — bookmark it)
2. Run `SHEET_ID=<id> npm run sync` to pull changes into `src/data/`
3. Run `npm run build` and deploy (or push to GitHub for auto-deploy)

### Adding a new event
Add a row to the **Events** tab. The `color` field must be one of: `teal`, `gold`, `accent`. Photo URLs are comma-separated in a single cell.

### Sync script setup
1. Get the Sheet ID from the Google Sheets URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
2. Update tab GIDs in `scripts/sync-sheet.js` (`TABS` object) — find GIDs by clicking each tab and reading the URL (`...gid=NUMBER`)
3. Set `SHEET_ID` as an env var or add to `.env` (see `.env.example`)

## Architecture Notes

- **Single-file app**: All components and hooks live in `App.jsx`. This is intentional for prototype speed — extract to separate files only when the file becomes unwieldy.
- **Color palette** is defined as `const C = { navy, teal, gold, warm, cream, dark, accent, sage }` at the top of `App.jsx`. Use these constants for all colors.
- **Sections** are anchored by `id` attributes for smooth-scroll nav: `home`, `story`, `ecosystem`, `places`, `next`.
- **Data** is imported from `src/data/*.json`. `EVENTS_DATA` maps the string `color` field back to a hex via `C[e.color]`.
- **Map tiles** come from OpenStreetMap via Leaflet. Venue markers use `CircleMarker` with `Tooltip`.

## Conventions

- Keep it simple: no unnecessary abstractions, no premature component extraction.
- Inline styles are fine for one-off styling; move to `index.css` only for reusable patterns.
- No external UI libraries — hand-crafted design is intentional.
- Animations use `IntersectionObserver` via the `useInView` hook.
