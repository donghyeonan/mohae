# Attributions

## Design reference

- “Tinder App UI Redesign” by Oguntade Joshua (Hbconceptz): https://dribbble.com/shots/21761565-Tinder-App-UI-Redesign
- Tinder interaction behavior: https://www.tinderpressroom.com/tap-into-a-new-look-on-tinder
- Tinder swipe semantics: https://tinder.com/faq/

Tinder and its marks belong to Tinder LLC. This internal prototype does not reproduce the Tinder trademark or represent affiliation.

## Icons

Lucide icon geometry, ISC license: https://lucide.dev/
The icon choice follows the PetitSeoul Base tab reference at `/Users/an/project/petitseoul/UI:UX/design/Base tab/src/app/components/PhoneLayout.tsx`.

MICHELIN credential chips preserve the official marks observed on the MICHELIN Guide site:

- Star: `https://guide.michelin.com/assets/images/icons/michelin-star_8519.svg`
- Bib Gourmand / Bibendum: `https://guide.michelin.com/assets/images/icons/MICHELINguide-symboleBibendum_COLOR_RGB.svg`

The local copies remain MICHELIN trademarks and are reference-only in this internal prototype.

## Map

The prototype loads the NAVER Maps JavaScript API for its map background. Map markers are original MOHAE UI rendered with CSS and text glyphs; no NAVER marker artwork is shipped. NAVER and its map data belong to NAVER Corp.

## Photos

The active catalog and the internal full source-index snapshot reference descriptions and representative images supplied by its two source collections:

- NAVER Hidden Archive / NAVER Place: `https://mkt.naver.com/hiddenarchive?tab=discover`
- MICHELIN Guide Seoul & Busan 2026: `https://guide.michelin.com/kr/ko/selection/south-korea/restaurants`

Each active card records its exact source URL and observation date in `photoMeta`; the full snapshot preserves equivalent source URLs and observation times in `ops/search/runs/2026-09-02-full-source-index/`. On September 2, 2026, 87 NAVER Shorts/CLIP page URLs that could not render as images were replaced with browser-verified media from the exact NAVER Place pages; 86 use merchant/place representative media and one uses a current user-review fallback.

On September 3, 2026, nine event cards received local, card-sized derivatives of representative assets published by their official organizers or venues: BIGBANG/Bstage, Hoam Museum of Art, Frieze/bside, Design Miami, COEX/Frieze, Kiaf/Galleries Association of Korea, Hanwha, T1/Bstage, and BELIFT LAB/HYBE/Weverse. Exact lineage is recorded in each source entry's `imageLineage` and Explore `photoMeta`, and in `ops/search/runs/2026-09-03-instagram-events/enrichment-research.md`. The user explicitly directed their use in this prototype; no general reuse license was inferred.

These third-party descriptions and images are reference-only in this internal prototype; obtain production permission or replace them before public release.
