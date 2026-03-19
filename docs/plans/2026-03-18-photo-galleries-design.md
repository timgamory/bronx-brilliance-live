# Photo Galleries Design

## Summary

Replace placeholder photo gallery boxes in the event timeline and venue detail panel with real inline thumbnail grids sourced from Google Photos URLs.

## Approach

Hardcoded Google Photos URLs (`lh3.googleusercontent.com`) added directly to `EVENTS_DATA` and `VENUES` arrays in `App.jsx`. No API integration, no new dependencies.

## Data Changes

### EVENTS_DATA

Add two fields to each event object:

- `photos: string[]` — 4-6 direct Google Photos URLs per event, using `=w400` suffix for thumbnail sizing
- `albumUrl: string` — link to the full shared Google Photos album

Events without photos get `photos: []` and the existing placeholder remains.

### VENUES

Add one field:

- `photos: string[]` — 1-2 venue photos

## UI Changes

### Event Timeline (expanded card)

Replace the dashed "Photo Gallery" placeholder with:

- 3-column CSS grid of thumbnail images
- Rounded corners (`border-radius: 8px`), `object-fit: cover`, `loading="lazy"`
- Subtle hover: `transform: scale(1.03)` with transition
- Below grid: "View full album →" link to `albumUrl`
- Falls back to existing placeholder when `photos` is empty

### Venue Detail Panel

Replace the dashed "Venue Photos" placeholder with:

- 1-2 photos in a row
- Same styling as event thumbnails
- Falls back to existing placeholder when `photos` is empty

## No New Dependencies

Pure `<img>` tags, CSS grid, inline styles consistent with existing patterns.
