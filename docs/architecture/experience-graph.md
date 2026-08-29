# MOHAE Experience History — minimum future DB split

Do not model the recommendation flywheel as one mutable favorites table.

1. `opportunities`: canonical place/event/class identity and current operational fields.
2. `recommendation_batches`: the curated cohort published for a region and period.
3. `recommendation_instances`: immutable record that an opportunity entered a user/context candidate set, including rank and reason.
4. `experience_events`: append-only `exposed`, `passed`, `saved`, `map_opened`, `extended`, `attended`, and `reviewed` events. Agent-added trip anchors use a separate map/itinerary history because they are not recommendations.
5. `user_opportunity_state`: derived current UI state such as active save, visibility deadline, attendance, and latest review reference.
6. `experience_outcomes`: optional structured outcome attached after attendance; absence of review is not a negative outcome.

## Lifecycle rule

- Event active visibility ends at `event_end_at`.
- Place active visibility ends at `saved_at + 7 days`, then can be extended in seven-day increments.
- Expiry changes `user_opportunity_state`; it never deletes recommendation instances or experience events.
- The active map queries saved, unexpired state only.

This keeps the UI small while preserving the sequence needed to learn `recommendation → save → attendance` without treating a missing review as dissatisfaction. See [`database-schema.md`](database-schema.md) for profile, map place, and itinerary boundaries.
