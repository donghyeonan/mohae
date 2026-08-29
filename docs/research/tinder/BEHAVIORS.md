# Behaviors

## Evidence boundary

The Dribbble redesign is static and proves visual states, not transitions. Tinder first-party documentation confirms the interaction model used here:

- Tapping a photo edge moves to the previous/next photo.
- Tapping the bottom of a card transitions to the complete profile.
- Tinder maps right swipe to Like and left swipe to Pass.

Sources:
- https://www.tinderpressroom.com/tap-into-a-new-look-on-tinder
- https://tinder.com/faq/

MOHAE adapts those actions to real-world opportunities.

## Explore deck

- Tap left/right photo region: previous/next gallery photo; progress segment updates.
- Horizontal drag or swipe left: dismiss current opportunity and log `passed`.
- Horizontal drag or swipe right: save current opportunity, add it to the saved map, and log `saved`.
- X and heart buttons perform the same actions for keyboard/mouse users.
- Tap the card’s lower information region or swipe upward: open the complete opportunity detail.
- Filter button: open type choices (`전체`, `이벤트`, `맛집·카페`); changing type rebuilds the visible deck.
- There is no text search and no infinite discovery map.

## Detail

- Hero retains photo progress and edge tapping.
- Vertical scroll reveals schedule, description, recommendation reason, and CTA.
- Back returns to the same deck item without consuming it.
- Save CTA writes the same state as right swipe.

## Shared map

- Contains saved opportunities and user/Agent-added plan stops.
- Event visibility expires at `event_end_at`.
- Place visibility expires seven days after save.
- A place can be extended seven days before expiry.
- Expiry removes active UI visibility but does not delete recommendation or experience events.
- A plan stop can represent accommodation, airport, attraction, restaurant, or another anchor.
- A place can become the center of a distance-filtered Explore deck.
- `다녀왔어요` records attendance with one tap.
- Review controls appear only after the user explicitly asks to add a review.

## Profile

- Bottom profile icon opens account and preference state.
- The screen shows login, locale, base region, and privacy state.
- Personal measurement dashboards are outside MOHAE.

## Responsive sweep

- 390px: edge-to-edge phone app with safe-area padding.
- 768px and 1440px: centered 390×844 phone plane on a pale background.
- Reduced motion: card dismissal and view transitions collapse to near-instant state changes.
