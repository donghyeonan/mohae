# Dependency graph

## App shell

- DOM: `.phone`, `.topbar`, `[data-view]`, `.bottom-nav`
- CSS: viewport frame, safe areas, fixed chrome, responsive centering
- JS: view router and state renderer
- Assets: inline Lucide-derived icons

## Discovery deck

- DOM: `.deck`, `.opportunity-card`, `.photo-progress`, `.deck-actions`
- CSS: card stack, image crop, lower gradient, dismissal transforms
- JS: pointer gesture classifier, photo index, filter, pass/save transition
- Assets: opportunity photos

## Detail

- DOM: `.detail-view`, `.detail-hero`, `.detail-body`, `.detail-actions`
- CSS: shorter hero and vertical document flow
- JS: photo edge navigation, save, attendance, back

## Saved map

- DOM: `.map-canvas`, `.map-pin`, `.saved-sheet`, `.saved-card`
- CSS: synthetic map lines, pins, horizontal saved cards
- JS: visibility policy, seven-day extension, attendance, optional review
- External map library: none; this is an interaction prototype, not geographic accuracy.

## Status

- DOM: `.status-toolbar`, `.status-content`, `.metric-card`
- CSS: list/grid modes
- JS: mode toggle persisted in prototype state

## Persistence

- `localStorage` stores prototype UI state and append-only experience events.
- No backend, auth, analytics, search, payment, or real booking integration.
