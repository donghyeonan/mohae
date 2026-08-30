# MOHAE Search Company Pilot 001

- Run: `mohae-pilot-20260830-001`
- Observation window: 2026-08-30 14:32-15:20 KST
- Class: non-production learning pilot
- Product exposure: 0
- Regression score: invalid by design; no restricted dispatcher/evaluator isolation

## Executive result

The department split produced materially different supply, and the raw-first union worked: 12 workers returned 72 raw leads, all 72 were preserved, and integration loss was zero. Three exact duplicate pairs reduced the canonical count to 69. Blank-slate workers contributed 16 subjects not found by memory-assisted workers.

The current split is useful but not production-ready. The main failure was not discovery volume. It was the boundary and enforcement layer: nine Local leads were actually dated Events subjects or mixed place-plus-occurrence records; seven worker outputs needed one schema correction; and a pre-recommendation `PERSONAL_FIT` support passed both JSON Schema and Trust.

## Counts

| Measure | Result |
|---|---:|
| Discovery departments | 3 |
| Workers | 12, three assisted plus one blank-slate per department |
| Raw leads | 72 |
| Canonical subjects after exact merge | 69 |
| Integration loss | 0 |
| Duplicate/relationship records | 5 |
| Blank-slate raw leads | 18 |
| Blank-slate unique subjects | 16 |
| Ownership flags | 9 |
| Clearly closed / last-day raw leads | 2 / 1 |
| Worker outputs needing schema correction | 7 of 12 |
| Deep-verified subjects | 9 |
| Evidence claims / published chip supports | 43 / 16 |
| Trust decisions | approve 5, revise 2, hold 2 |
| Recommendations emitted / product exposures | 0 / 0 |

Novelty is not quality. The 16 blank-slate-only subjects prove coverage expansion, not recommendation value. One blank-slate Local result, PARKSEOBO MUSEUM, survived deep verification and Trust.

## Deep-verified result

### Local Places & Offers

| Subject | Trust | What survived verification | What blocked or expires |
|---|---|---|---|
| [PARKSEOBO MUSEUM](https://parkseobomuseum.org/home) | approve | Official address; Tue-Sun 11:00-18:00; KRW 5,000; on-site ticketing; inaugural exhibition through 2027-01-03 | External calendar still says 2026-12-31; same-day crowd limits unknown |
| [Starfield Market Wolgye](https://eapp.emart.com/branch/view.do?id=1059&mallGbn=E) | approve | Opened 2026-08-27; live branch hours 10:00-23:00; dated selected-product promotion and Nespresso pop-up | Some announced tenants open only in Oct/Nov; the sirloin offer expires 2026-08-30 and the general offer 2026-09-02 |
| [Galaxy Robot Park](https://insights.galaxyuniverse.ai/en/robot-park/) | hold in the original pilot | Official opening on 2026-08-21; permanent Physical AI park; owner reports 20,000 pre-opening visitors and sold-out sessions | The inspected official page lacked hours, exact address, admission price and booking method; after the pilot the user found current detail in Naver Map, so this hold reveals a source-coverage gap rather than proof that public execution data is absent |

Post-pilot correction: at 2026-08-30 15:48 KST, the open Naver Map place page exposed the street address, closing time, adult/youth/child prices, reservation action, a current performance product, phone, parking and accessibility. The original hold was therefore a source-coverage failure, not an absence of public execution data. Current map and platform pages may verify the operational facts they directly expose; official-source incompleteness alone no longer holds a card when a current allowed platform resolves the field without conflict.

### Events & Experiences

| Subject | Trust | What survived verification | What blocked or requires revision |
|---|---|---|---|
| [Frieze Seoul 2026](https://www.frieze.com/fairs/frieze-seoul/visitor-information) plus Neighbourhood Nights | revise | Exact fair dates and ticket classes; discounted inventory sold out while full-price inventory remains; four district-night dates verified | Fair and city programme must be separate executable subjects; venue-level RSVP/private-event rules are incomplete |
| [7979 Seoul Urban Running Crew](https://sports.seoul.go.kr/main/SP04100000_user/program_view.do) | hold | Free Thursday programme; coaching and 12 routes; 30 first-come online places per zone | Next booking was not yet open; the official surface simultaneously showed future dates and a service-ended label |
| [STORY A Seongsu](https://m.booking.naver.com/booking/12/bizes/1696844/items/7856242) | revise | Closed old item was resolved to an active replacement; dates/times, KRW 15,000 ticket and conditional lower tiers verified | KRW 30,000 reference-price basis, opening-special duration and coupon exclusions are not established |

### Global & Market Intelligence

All three were approved only as global signals, not Korean recommendations.

| Subject | Trust scope | Verified signal | Missing boundary |
|---|---|---|---|
| [Tinder Events expansion](https://www.tinderpressroom.com/2026-07-23-Tinder-Expands-Events-Globally,-Bringing-More-Ways-for-Singles-to-Spark-Connections-IRL) | global signal approve | Ten cities confirmed live as of the dated announcement; expansion targets were kept separate | Engagement and sellout figures are company-reported; no Events unit economics or Korean adoption |
| [Fypro](https://www.fypro.ai/) | global signal approve | Public launch, pricing surface and Product Hunt attention | 2,000-creator claim is self-reported; no retention, revenue, GMV, funding or Korean adoption evidence |
| [Frido experiential stores](https://myfrido.com/pages/experience-store) | global signal approve; invalid chip support removed | Fifteen-store rollout reported and official service surface for trials, scans and consultation | No independent store adoption or unit economics; no Korean evidence; assembler incorrectly assigned `PERSONAL_FIT` before a user context existed |

## What each department added

### Local

It found current openings, merchant offers, branch operation and permanent formats. Assisted workers were strong at official openings and benefits. The blank-slate worker added museums, exhibitions and a renewed hotel restaurant that the assisted watchlists missed.

The failure was ownership. All six `lp-edge` leads were finite pop-ups or events, and three Local blank-slate cultural leads represented dated exhibitions rather than only persistent venues. A single discovery lead may need to create both a permanent place subject and a dated occurrence subject.

### Events

It produced the strongest execution facts: dates, ticket classes, registration opening times, beneficiary conditions and live booking contradictions. The handoff of STORY A from Local proved that a closed booking item must not be treated as a closed experience when the same business exposes a replacement product.

The failure was composite subjects. Frieze fair access and Neighbourhood Nights venue access cannot share one execution state.

### Global

Assisted workers separated product launch, company-reported adoption, expansion targets and economic durability better than the broad blank-slate path. The blank-slate worker added six unique signals, but they were more generic funding and product news and were not selected for deep verification.

The failure was stage leakage. `PERSONAL_FIT` was inferred from a product's personalization feature rather than a real user's decision context, and neither schema nor Trust blocked it.

## Controls applied after this pilot

1. Worker envelopes are validated at the dispatcher boundary with exactly one field-specific retry.
2. `PERSONAL_FIT` was removed from generic evidence chip support and is reserved for a recommendation decision context.
3. A final post-Trust policy validator now checks stage boundaries, snapshot coverage, union integrity and zero external output.
4. Union generation and read-only verification are separate commands.

## Remaining before pilot 002

1. Keep the department split.
2. Add a post-union invariant: if value ends on a date, create an occurrence; if the venue persists, create a separate place. Preserve their relationship.
3. Distinguish `not_yet_open`, `unavailable`, `sold_out`, `closed`, and `superseded_booking_path` as different execution states.
4. Do not build the app feed yet. Pilot 002 should test these remaining corrections on one narrower live window before implementing the production dispatcher.

## Evidence bundle

- `run-brief.json`: frozen scope and worker strategies
- `workers/*.json`: 12 validated worker outputs
- `schema-correction-log.json`: seven one-retry corrections; original invalid payloads remain in Aside task transcripts, not as replayable bundle files
- `raw-union.jsonl`: complete 72-row union derived from worker files
- `union-reconciliation.json`: zero-loss count reconciliation; `validate-run.mjs` now verifies read-only and `build-union.mjs` owns generation
- `normalization.json`: duplicate, ownership and temporal relations
- `evidence/*.json`: 43 atomic evidence claims and 16 published chip-support records; the pre-policy Global output is archived separately
- `source-snapshot-manifest.json` and `source-snapshots/`: 27 referenced snapshot entries; 24 captured with SHA-256, three Frieze pages returned HTTP 403
- `trust/*.json`: nine independent verdicts
- `final-integration-audit.json`: runtime attestation, policy invariant result, snapshot coverage and zero-exposure effect
- `pilot-metrics.json`: aggregate metrics and policy violation
- `search-run-evaluation.json`: stage-specific successes and failures
