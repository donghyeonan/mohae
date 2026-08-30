# MOHAE Explore Presentation Contract

This is a product-facing shape, not another discovery ontology. It tells Search what the Tinder-style Explore deck needs to show. Missing category-irrelevant fields stay absent; workers must not invent values to satisfy a template.

## 1. Common card

Every card published to the Explore deck needs:

1. **One representative visual**
   - Event: exact-year poster or official event image.
   - Place, food, cafe, wellness: accurate venue, space, product, or signature-item photo.
   - Global trend or startup: official product, format, operator, or market visual.
   - Keep source, observation time, rights status, and a fallback. Logos, generic banners, old editions, and unrelated venue images do not qualify.
   - Restaurant, cafe, and bar hero order is fixed: exact-branch official site or merchant-provided image → exact-branch exterior or space image from a current provider → rights-cleared external editorial image.
   - Visitor-review, blog, clip, `pai`, `aiView`, or other user-originated media never becomes the hero. If no eligible visual exists, hold the card instead of substituting a random review image.
2. **Title and kind**
3. **One-line value**: what the user can experience, gain, eat, see, learn, or notice.
4. **Timing**: schedule, opening hours, offer period, or current market stage, whichever fits the kind.
5. **How to act**: walk in, reserve, buy, apply, submit, track, or read more.
6. **Cost or commitment**: free, price or price range, conditional cost, or explicitly unknown. Missing price never means free.
7. **Place or market**: venue and area for local objects; geography and diffusion stage for global signals.
8. **Primary action link and freshness**: map, booking, application, merchant, organizer, or primary source plus `observed_at`.

A generic `why recommended` block is not required. A permanent place with current occurrences may let those programs carry the value directly.

Optional common fields:

- organizer, operator, or brand;
- people, dynamically labeled as performers, speakers, artists, chefs, hosts, mentors, or judges;
- deadline, capacity, age or eligibility conditions;
- one publication-level collection context when the card belongs to a reviewed MOHAE collection;
- up to three non-interactive typed signal chips when a qualifying external signal exists.

The card surface may show only the visual, title, one-line value, timing, cost, place or market, and chips. The rest belongs in the lower detail sheet.

Reference payload, intentionally not a rigid schema:

```json
{
  "subject_id": "...",
  "kind": "event | place | dining | wellness | offer | global_signal",
  "hero": {"url": "https://...", "source": "official", "rights_status": "unknown"},
  "title": "...",
  "value_text": "...",
  "timing_text": "...",
  "action_text": "walk in | reserve | apply | buy | track",
  "cost_text": "free | price | range | unknown",
  "place_or_market_text": "...",
  "organizer_text": null,
  "people_text": null,
  "collection_context": {"id": "mohae-...", "label": "MOHAE ...", "kind": "curated_collection", "target_type": "internal_map"},
  "signal_chips": [{"label": "...", "kind": "culinary_selection | competition_award | media_appearance | international_editorial | craft_affiliation | participant | attendee_payoff", "tone": "blue_ribbon | michelin | competition | media | editorial | participant | payoff", "interactive": false, "source_role": "guide | competition_organizer | media | editorial | platform", "source_url": "https://...", "observed_at": "...", "scope": "exact_branch | exact_occurrence"}],
  "primary_action": {"label": "...", "url": "https://..."},
  "sources": [{"role": "official | map | platform", "url": "https://...", "observed_at": "..."}]
}
```

Category extensions remain optional detail data rather than additions to one universal required row.

## 2. Category profiles

### Event, pop-up, performance, application program

Show when available:

- poster;
- exact occurrence schedule and application or booking deadline;
- participation method and live state;
- free or paid price and ticket tier;
- what participation gives: experience, access, goods, credits, learning, networking, prize, or nothing beyond the experience itself;
- venue, organizer, and relevant performers or speakers;
- capacity, eligibility, approval, first-come, lottery, or winner conditions.

### Restaurant and cafe

Show when available:

- representative venue or signature-item photo;
- current open state and useful hours;
- walk-in, queue, or reservation method;
- price band and one to three representative items;
- branch and location;
- objective external chips only when available: exact-branch and exact-edition Michelin or Blue Ribbon selection, competition award, attributable broadcast/YouTube appearance, or equivalent recognition;
- chef or brand only when it materially explains the experience.

Do not force organizer, speaker, reward, or occurrence fields onto ordinary dining.

### Culture, attraction, wellness, permanent place

Show when available:

- representative space or current-program image;
- opening hours and closure days;
- admission and reservation method;
- the main experience, facility, or current program;
- location and operator;
- accessibility, age, equipment, or preparation conditions when material.

A permanent place and its dated exhibition or program may produce separate linked cards. Do not add generic hours, free admission, floor, menu count, or editorial prose as recommendation chips; current program cards already carry their own value.

Event chips should identify concrete event-specific points such as performer, speaker, artist, participant, attendee benefit, included goods, access, prize, or activity. They are not a generic `why recommended` explanation.

### Offer, product, retail collaboration

Show when available:

- exact product or campaign image;
- concrete benefit and current price;
- recipient and acquisition conditions;
- start, end, stock, quota, or extension history;
- where and how to redeem or buy;
- merchant, brand, and collaboration partners.

A claimed reference price without a comparable recent price is displayed as promotion copy, not verified savings.

### Global trend, startup, business model

Show when available:

- official product, operator, or format image;
- what changed and why it is notable now;
- geography and stage: seed, accelerating, translated, mainstream, or saturated;
- observed adoption, expansion, investment, jobs, revenue, or retention evidence with self-reported metrics labeled;
- business model or behavior change;
- Korea relevance as a separate hypothesis, never as implied causality;
- operator and primary source.

Do not force event schedule, venue, participation cost, or benefit-recipient fields onto a non-actionable market signal. Its action may simply be `track` or `learn more`.

## 3. Chip guidance

The top primary collection chip and supporting signal chips have different jobs.

- A collection chip is interactive publication context. It belongs to the card publication, not the canonical place, and opens the matching MOHAE internal map or list. Candidate-list membership alone cannot create it; only a reviewed publication subset can.
- A trend collection chip is allowed only when the recommendation actually originated from that trend signal. Do not relabel a static registry candidate as `HEAT` or trend-discovered.
- Signal chips are non-interactive external evidence, not navigation, generic explanations, or score labels. Use zero to three; zero is normal. Use the recognizable source color when it exists, such as Blue Ribbon blue or Michelin red, and a stable semantic tone for media, editorial, participant, and payoff chips.

- Restaurant and cafe: exact-branch and exact-edition Michelin or Blue Ribbon selection, culinary competition award, attributable broadcast/YouTube appearance, international editorial recognition, or exact craft affiliation.
- Event: named performer, speaker, artist, participant, or a concrete attendee payoff such as included goods, access, prize, learning, or activity.
- Permanent place: do not add a generic chip when its current programs already express the value.

`MERIT`, `HEAT`, `SCARCITY`, `PAYOFF`, `SOCIAL_CURRENCY`, and `PERSONAL_FIT` may remain internal evidence or recommendation dimensions, but they are not rendered as consumer chip labels. `PERSONAL_FIT` remains decision-context-only. Never add a visible chip merely to fill the card.

## 4. Source and publication boundary

- Official and organizer sources remain preferred.
- Current operational facts may also come from a live booking, ticketing, merchant, map, or platform page such as Naver Map when the source role and observation time are recorded.
- A missing official field alone is not a hold when a current allowed platform resolves it without conflict.
- If sources conflict, show the narrower safe wording or hold only the affected action.
- Ordinary card fields need a source URL and observation time. Atomic evidence claims and snapshots are reserved for chip reasons, conflicts, mutable availability, discounts, scarcity, safety, and other material claims.
- Deep recheck happens on save, detail open, booking or execution intent, not for every raw candidate.

## 5. Hard stops

Do not publish to the Tinder deck when:

- the representative image belongs to the wrong entity, edition, branch, or program;
- identity cannot be resolved;
- the card claims an actionable path but every known path is closed;
- price is presented as free when it is merely unknown;
- a safety, legality, manipulated-discount, or material identity conflict is unresolved;
- no current source or observation time exists.

Missing optional people, organizer, exact capacity, or detailed hours is not by itself a hard stop when the category does not need it or a primary action link can resolve it.
