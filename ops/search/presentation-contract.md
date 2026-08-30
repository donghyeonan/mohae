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

Optional common fields:

- organizer, operator, or brand;
- people, dynamically labeled as performers, speakers, artists, chefs, hosts, mentors, or judges;
- deadline, capacity, age or eligibility conditions;
- up to three explanatory chips.

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
  "chips": [],
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
- concise reason to go: signature menu, format, atmosphere, recognition, or current novelty;
- branch and location;
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

A permanent place and its dated exhibition or program may produce separate linked cards.

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

Chips are compact explanations, not verdicts or a full scoring system. Use zero to three.

- `MERIT`: durable recognition, demonstrated quality, or a clearly strong structured experience.
- `HEAT`: current attention, demand, adoption, or acceleration.
- `SCARCITY`: a real deadline, capacity, finite inventory, or closing window. Scarcity is not quality.
- `PAYOFF`: a concrete benefit, access, savings, prize, learning outcome, or experience outcome with the main condition visible.
- `SOCIAL_CURRENCY`: participation creates meaningful social connection, identity, conversation, or shared cultural value.
- `PERSONAL_FIT`: computed only when a real user decision context exists.

One current official or credible operational source can support a rough chip when its reason and caveat are preserved. Stronger claims such as verified savings, sellout, quality, causality, safety, or Korean adoption require stronger evidence. Never add a chip merely to fill the card.

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
