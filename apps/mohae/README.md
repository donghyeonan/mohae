# MOHAE interactive prototype

The active mobile-first prototype for swipe discovery, a shared map, and a small account/profile surface.

## Run

```sh
node server.mjs
```

Open `http://localhost:4177`. Local runtime requires `VITE_NAVER_MAP_CLIENT_ID`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.

## Data

The 539-entry source index and admission statuses load from the public-read `mohae_source_entries` Supabase table. RLS permits anonymous reads only; ingestion uses `ops/search/scripts/push-source-index-to-supabase.mjs` with a server-side service-role key.

MICHELIN records preserve the original English fields and add official Korean values under `localizations.en-KR` and `localizations.ko-KR`. The Korean UI selects Korean values with English fallback through `src/i18n.js`; search indexes both languages. No i18n framework is required until the product also translates UI messages, formatting, and routes.

## Feature boundary

### Explore

- left/right card decisions and photo navigation
- opportunity detail and type filters
- saved opportunities retained as Explore state, including visibility, attendance, and optional-review fields
- source-index place map with search, type filters, previews, and current-location recentering
- attendance and review controls are not exposed in the current map UI
- WebMCP catalog search and ordered Agent exploration scenes
- invite-link shared trip rooms where each traveler independently saves or passes cards and saves places from the map
- raw natural-language traveler notes accumulated through WebMCP before a host Agent proposes an ordered route scene
- separately persisted, provenance-tagged external Agent signals that never enter the admitted catalog automatically

### Profile

- signed-out account shell
- language, base region, and privacy placeholders
- no direct dependency on Explore's internal state
- no personal health, productivity, or money measurements

Feature code is separated under [`src/explore.js`](src/explore.js), [`src/map.js`](src/map.js), and [`src/profile.js`](src/profile.js). [`src/app.js`](src/app.js) owns only shared state, navigation, and event routing.

## WebMCP

The top-level page registers four imperative tools when `document.modelContext.registerTool` is available:

- `search_mohae_places`: read-only structured search over the existing map catalog
- `present_exploration`: replace Explore and Map with one ordered scene of catalog references, external candidates, and optional trip anchors; `mode: "route"` numbers the supplied order without claiming route optimization
- `add_group_trip_note`: append the joined traveler's natural-language wording to the active shared room
- `get_group_trip_context`: read all travelers' current-scene save/pass evidence, map selections, raw notes, and readiness

External candidates accept sanitized text and HTTPS provenance only. They persist separately in browser `localStorage` as `externalSignals`, remain `admissionStatus: "external"`, and are not written to the admitted catalog. Shared rooms use expiring capability links, protected Supabase RPCs, per-device member tokens, and append-only choice/note events; the underlying tables have no anonymous table access.

## Limits

- login controls are placeholders; shared trip rooms use expiring invite capabilities rather than user accounts
- shared room updates use polling/on-demand reads rather than chat or presence infrastructure
- route mode visualizes an Agent-supplied order and straight guide line; no travel-time optimization, booking, remote queueing, or payment
- the source index is public-read reference data, not an admission-ready recommendation catalog
- third-party references and photos require attribution and licensing review before production

See [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) and [`../../docs/product/concept.md`](../../docs/product/concept.md).
