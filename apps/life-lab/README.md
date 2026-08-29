# Life Lab interactive prototype

The active mobile-first prototype for operator-supplied experience recommendations, saved-only maps, attendance feedback, and personal signals.

## Run

```sh
node server.mjs
```

Open `http://localhost:4177`.

## Included

- icon-only Explore and personal-status tabs
- left/right card decisions and photo edge navigation
- expanded opportunity detail with button and right-swipe return
- no-search recommendation feed with type filters
- saved-only map
- event-end versus seven-day place visibility
- one-tap attendance and optional review
- list/grid personal status
- live time-value counter with editable hourly wage
- local append-only experience event log

## Architecture

- [`../../docs/architecture/experience-graph.md`](../../docs/architecture/experience-graph.md)
- [`../../docs/architecture/database-schema.md`](../../docs/architecture/database-schema.md)
- [`../../docs/product/concept.md`](../../docs/product/concept.md)

## Prototype limits

- static opportunities, synthetic map, and `localStorage` only
- no auth, backend, GPS verification, booking, payment, or map provider
- the Dribbble artwork is a static reference; interaction behavior is derived from Tinder first-party documentation
- third-party references and photos require attribution and licensing review before a public production release

See [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) and [`../../docs/research/tinder/`](../../docs/research/tinder/).
