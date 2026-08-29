# Trace

Trace is the working repository for **Life Lab**: a mobile-first product for exploring real-world experiences and observing personal signals over time.

## Source of truth

1. [`docs/product/concept.md`](docs/product/concept.md) — current product thesis and open decisions
2. [`apps/life-lab/`](apps/life-lab/) — active interactive prototype
3. [`docs/architecture/`](docs/architecture/) — Experience Graph and database boundaries
4. [`docs/research/`](docs/research/) — reconstructed interaction and design research
5. [`docs/archive/`](docs/archive/) — superseded product contracts; not implementation authority

## Repository structure

```text
apps/
  life-lab/                 Active static web prototype
prototypes/
  database-schema/          Visual schema explainer
  glint/                    Superseded Glint interaction prototype
docs/
  product/                  Current product concept
  architecture/             Data and Experience Graph design
  research/                 Tinder and Glint reconstruction notes
  references/               Tracked source notes; binary references stay local
  archive/                  Historical PI product contract
.superloopy/                Local historical implementation and visual-QA evidence
```

## Run the active prototype

```sh
cd apps/life-lab
node server.mjs
```

Open `http://localhost:4177`.

The time-value counter runs entirely in the browser. Its hourly wage setting and prototype state are stored in that browser's `localStorage`.

## Deploy with Vercel

Import `donghyeonan/trace`, select framework preset **Other**, and set the Root Directory to:

```text
apps/life-lab
```

No build command is required.

## Local evidence and asset boundary

Large reference images and `.superloopy` QA captures stay local and are excluded from Git history. Their text inventories and source links remain tracked under [`docs/references/`](docs/references/).

Repository source code is covered by the root license. Third-party screenshots, design references, icons, and photos retain their original rights and attribution requirements. See [`apps/life-lab/ATTRIBUTIONS.md`](apps/life-lab/ATTRIBUTIONS.md) and [`docs/references/README.md`](docs/references/README.md).
