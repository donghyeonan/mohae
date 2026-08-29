# Page topology — Tinder redesign → MOHAE

Source: https://dribbble.com/shots/21761565-Tinder-App-UI-Redesign

The Dribbble source is a static concept board, not an executable app. The four local PNGs are the visual source of truth.

## Source screens

1. Discovery shell: centered wordmark, filter control, one dominant portrait card, floating circular actions, bottom icon navigation.
2. Discovery card: segmented photo progress at the top; edge-to-edge photo; dark lower gradient; title and two compact metadata chips.
3. Expanded profile: back control and wordmark remain; photo becomes a shorter rounded hero; title, category, metadata, description, and tags continue vertically below.
4. Swipe result: two rotated cards and a confirmation message.

## MOHAE prototype screens

1. `Explore`: mixed Seoul/Gyeonggi opportunity deck.
2. `Opportunity detail`: the same card expands into a vertically scrollable detail view.
3. `Shared map`: saved opportunities and user/Agent-added plan stops appear as pins and compact cards.
4. `Profile`: signed-out account, recommendation signals, locale, region, and privacy state.
5. `Attendance/review`: attendance is one tap; review is optional progressive disclosure.

## Fixed layers

- 390×844 mobile viewport.
- Top bar above the deck.
- Circular deck actions overlap the lower card edge.
- Icon-only bottom navigation is fixed above the safe area.
- Filter and map views use full-screen layers above the deck and below transient toast messages.

## Z-order

1. app background
2. inactive deck card
3. active card
4. card overlays and actions
5. fixed top/bottom chrome
6. sheets and full-screen secondary views
7. toast
