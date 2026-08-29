# MOHAE interactive prototype

The active mobile-first prototype for swipe discovery, a shared map, and a small account/profile surface.

## Run

```sh
node server.mjs
```

Open `http://localhost:4177`.

## Feature boundary

### Explore

- left/right card decisions and photo navigation
- opportunity detail and type filters
- saved opportunities on a map
- Agent-added accommodation, airport, attraction, restaurant, and other stops
- nearby recommendation mode anchored to any map place
- attendance and optional review as recommendation signals

### Profile

- signed-out account shell
- language, base region, and privacy placeholders
- no direct dependency on Explore's internal state
- no personal health, productivity, or money measurements

Feature code is separated under [`src/explore.js`](src/explore.js) and [`src/profile.js`](src/profile.js). [`src/app.js`](src/app.js) owns only shared state, navigation, and event routing.

## WebMCP

[`src/webmcp.js`](src/webmcp.js) registers imperative tools on the top-level document and reuses the same Explore functions as the visible UI. Mutating tools update the visible screen before returning.

WebMCP remains experimental. The prototype feature-detects `document.modelContext.registerTool` and remains usable without it.

## Limits

- static opportunities, synthetic map, and `localStorage` only
- login controls are placeholders; no auth or backend
- no geocoder, real map provider, route optimization, booking, or payment
- nearby recommendations only search the current static MOHAE catalog
- third-party references and photos require attribution and licensing review before production

See [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) and [`../../docs/product/concept.md`](../../docs/product/concept.md).
