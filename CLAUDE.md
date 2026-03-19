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
  App.jsx      # Everything: data, hooks, components, layout (single-file app)
  index.css    # Global styles, resets, Leaflet overrides
  main.jsx     # React root mount
public/
  favicon.svg
  icons.svg    # SVG sprite for inline icons
```

## Commands

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Architecture Notes

- **Single-file app**: All components, data, and hooks live in `App.jsx`. This is intentional for prototype speed — extract to separate files only when the file becomes unwieldy.
- **Color palette** is defined as `const C = { navy, teal, gold, warm, cream, dark, accent, sage }` at the top of `App.jsx`. Use these constants for all colors.
- **Sections** are anchored by `id` attributes for smooth-scroll nav: `home`, `story`, `ecosystem`, `places`, `next`.
- **Data arrays** (`EVENTS_DATA`, `VENUES`, `ECOSYSTEM`) are defined inline in `App.jsx`.
- **Map tiles** come from OpenStreetMap via Leaflet. Venue markers use `CircleMarker` with `Tooltip`.

## Conventions

- Keep it simple: no unnecessary abstractions, no premature component extraction.
- Inline styles are fine for one-off styling; move to `index.css` only for reusable patterns.
- No external UI libraries — hand-crafted design is intentional.
- Animations use `IntersectionObserver` via the `useInView` hook.
