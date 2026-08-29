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

## Shared map

- DOM: `.map-canvas`, `.map-pin`, `.plan-pin`, `.saved-sheet`, `.saved-card`, `.planned-stop-card`
- CSS: synthetic map lines, two pin types, horizontal map-place cards
- JS: visibility policy, plan stops, nearby catalog distance, attendance, optional review
- External map library: none; this is an interaction prototype, not geographic accuracy.

## Profile

- DOM: `.profile-screen`, `.account-card`, `.profile-list`
- CSS: account and settings surface
- JS: account and profile-setting placeholders

## WebMCP

- `src/webmcp.js` registers top-level imperative tools when the browser supports `document.modelContext.registerTool`.
- Tools reuse Explore map functions; no separate agent-only state path exists.

## Persistence

- `localStorage` stores prototype UI state, Agent-added map stops, and append-only experience events.
- No backend, auth, analytics, search, payment, or real booking integration.
