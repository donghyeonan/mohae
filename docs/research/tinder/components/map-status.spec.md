# Saved map and historical status component spec

## Overview

- Current target: `apps/mohae/index.html`, `styles.css`, `src/explore.js`, `src/profile.js`
- Interaction model: click/touch and a horizontal map-place rail
- Status measurement UI was removed when MOHAE split from Life Lab.

## DOM Structure

Map: `map-view > map-canvas/saved-or-plan-pins + saved-sheet/cards`.
Profile: `profile-view > account + settings`.

## Computed Styles

N/A: these are product adaptations using the Tinder visual grammar rather than source screens.

## States and Behaviors

- map includes saved opportunities and user/Agent-added plan stops
- event expires at event end; place expires seven days after save
- place can extend seven days
- attendance is one tap; optional review appears afterward
- Profile contains account and preference state, not personal measurements

## Per-State Content

Map cards show title, type, timing, order, expiry, attendance, and extension where applicable. Profile shows account state, locale, region, and privacy state.

## Assets

Saved-card thumbnails reuse local opportunity photos. Map uses CSS lines and labels; no map provider.

## Text Content

Korean. Reassurance copy states what expires and that extension is available; it does not claim unseen privacy or data behavior.

## Responsive Behavior

Full mobile view at 390px; fixed phone plane on tablet/desktop.

## Original Implementation Inventory

N/A: map and the superseded status screen were explicit product adaptations.

## Parity Decision

Approved reimplementation using the source’s white canvas, rounded controls, accent gradient, compact chips, and icon weight.
