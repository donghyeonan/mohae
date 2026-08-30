# MOHAE

MOHAE is a mobile-first product for choosing what to do in Korea without starting from search. People swipe through curated experiences, save possibilities to a shared map, and can ask an Agent to add trip anchors or open recommendations around them.

## Source of truth

1. [`docs/product/concept.md`](docs/product/concept.md) — current product boundary and WebMCP collaboration
2. [`apps/mohae/`](apps/mohae/) — active interactive prototype
3. [`ops/search/`](ops/search/) — Search departments, runtime contracts, logical backend schema, and pilot records
4. [`docs/architecture/`](docs/architecture/) — Explore history and future data boundaries
5. [`docs/research/`](docs/research/) — reconstructed interaction research
6. [`docs/archive/`](docs/archive/) — superseded Life Lab and PI product models

## Repository structure

```text
apps/
  mohae/                    Active static web prototype
prototypes/                 Historical visual and schema explorations
ops/
  search/                    Search departments, schemas, prompts, pilots, DBML
docs/
  product/                  Current MOHAE concept
  architecture/             Explore, map, and profile data boundaries
  research/                 Tinder and Glint reconstruction notes
  references/               Tracked source notes; binary references stay local
  archive/                  Superseded measurement and Life Lab concepts
```

## Run the prototype

```sh
cd apps/mohae
node server.mjs
```

Open `http://localhost:4177`.

The prototype stores swipe history, saves, profile settings, and Agent-added map stops in that browser's `localStorage`.

## WebMCP

The top-level page registers imperative WebMCP tools when `document.modelContext.registerTool` is available:

- `get_map_context`
- `add_map_stop`
- `focus_map_place`
- `recommend_near_place`
- `explore_near_place`

Unsupported browsers keep the complete human interface and skip registration. See [`docs/product/concept.md`](docs/product/concept.md) for tool boundaries and the collaboration trace.

## Deploy with Vercel

Select framework preset **Other** and set the Root Directory to:

```text
apps/mohae
```

No build command is required.

## Asset boundary

Large reference images and local visual-QA captures stay outside source history where already ignored. Third-party screenshots, icons, and photos retain their original rights and attribution requirements. See [`apps/mohae/ATTRIBUTIONS.md`](apps/mohae/ATTRIBUTIONS.md) and [`docs/references/README.md`](docs/references/README.md).
