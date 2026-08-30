# MOHAE card samples

## 2026-08-30 new 10-card sample

- Structured app data: [`2026-08-30-card-10.json`](2026-08-30-card-10.json)
- Flat evaluation sheet: [`2026-08-30-card-10.csv`](2026-08-30-card-10.csv)
- Product renderer: `apps/mohae/src/sample-data.js`
- Validator: [`validate-card-sample.mjs`](validate-card-sample.mjs)

```sh
node ops/search/samples/validate-card-sample.mjs path/to/cards.json
```

The previous 20-place sample is not reused. These ten records were observed again on 2026-08-30 and cover:

- ordinary restaurant;
- roastery cafe;
- reservation-led hotel bar;
- museum with multiple current exhibitions;
- museum with a reservable child facility;
- venue with an upcoming program and conflicting place hours;
- permanent free park;
- museum with construction-limited access;
- seasonal free observation space;
- public walking route with unpublished daily hours and cost.

## Minimum row

Every bulk-enrichment row must return these values. `unknown` is a value; an empty field is not silently treated as free, open, or walk-in.

| Field | Meaning |
|---|---|
| `subject_id` | canonical subject identity, separate from provider ID |
| `naver_place_id` | provider record used for current map identity |
| `kind` | place or dated/current-program card |
| `category` | product-facing category label |
| `title` | exact venue or occurrence title |
| `collection_id` | publication-level MOHAE curated collection identity |
| `collection_label` | interactive collection chip label that opens the internal map/list |
| `value_text` | one objective sentence describing the experience |
| `signal_chips` | optional typed external signals; empty when no qualifying signal exists |
| `signal_chip_count` | number of sourced signal chips |
| `timing_text` | relevant current hours, period, deadline, or explicit unknown |
| `action_text` | walk in, reserve, buy, apply, track, or explicit unknown |
| `cost_text` | free, current price/range, conditional cost, or explicit unknown |
| `place_text` | local area or market |
| `representative_image_url` | one exact current entity/program visual |
| `image_source` | official, merchant, map, platform, or licensed editorial source |
| `rights_status` | explicit license or `unknown` |
| `primary_action_label` | label for the next useful click |
| `primary_action_url` | current map, booking, organizer, merchant, or program URL |
| `observed_at` | source observation time |
| `map_url` | current map identity URL |
| `official_url` | official source when available |
| `status_label` | current user-facing state |
| `caveat_text` | conflict or missing condition that changes execution |
| `missing_fields` | unresolved fields, pipe-separated in CSV |

## Card boundary

A sparse candidate remains a `subject`; it does not become an Explore card. A card requires the executable minimum fields above, but it does not require a generic recommendation explanation or a chip. It may explicitly state unknown timing, cost, action, or rights when the wording is safe and the next click still has value.

A hard-stop conflict in identity, safety, legal availability, false free pricing, or a closed-only action prevents publication. A missing optional program, person, capacity, menu detail, parking rule, or exact daily hour does not automatically remove a permanent place when the limitation is visible.

Representative media is limited to three items. Each visual retains source URL, source role, observation context, origin, hero eligibility, and rights status.

For restaurants, cafes, and bars, select the hero in this order:

1. exact-branch official site or merchant-provided image;
2. exact-branch exterior or space image from a current provider;
3. rights-cleared external editorial image.

Visitor-review, blog, clip, `pai`, `aiView`, and other user-originated media are not hero-eligible. If no eligible image exists, hold the card. The local prototype currently displays unknown-rights merchant media for evaluation; that does not establish production reuse rights.

If a qualified remote image fails to load, the renderer uses `apps/mohae/assets/card-image-fallback.png`. This neutral error state is not a representative visual and never makes an otherwise ineligible card publishable.

Review-derived summaries are excluded from this sample because selecting and compressing opinions introduces an editorial layer. Dining chips are reserved for attributable external signals such as exact-branch Michelin or Blue Ribbon selection, competition awards, or broadcast/YouTube appearances. The top collection chip is separate from external signal chips. It is interactive and belongs to the reviewed card publication, not the canonical place or raw candidate registry. Each external signal chip is explicitly non-interactive and requires an external source role (`guide`, `competition_organizer`, `media`, `editorial`, or `platform`); venue self-report alone is not sufficient. The visual `tone` preserves a recognizable source color such as Blue Ribbon blue or Michelin red. Event chips are reserved for event-specific people and attendee payoff. Generic hours, price, free admission, floor, and menu-count facts remain ordinary card or detail fields, not chips.

Menu photos are optional. When present, they retain title, source URL, source role, and rights status; merchant-provided menu images are shown as originals, not as evidence of popularity.
