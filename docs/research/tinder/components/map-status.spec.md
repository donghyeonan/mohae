# Saved map and status component spec

## Overview

- Target: `apps/life-lab/index.html`, `styles.css`, `app.js`
- Interaction model: click/touch, horizontal saved-card rail, list/grid toggle

## DOM Structure

Map: `map-view > map-canvas/pins + saved-sheet/cards`.
Status: `status-view > toolbar/toggle + metric-content/cards`.

## Computed Styles

N/A: these are product adaptations using the Tinder visual grammar rather than source screens.

## States and Behaviors

- map includes saved opportunities only
- event expires at event end; place expires seven days after save
- place can extend seven days
- attendance is one tap; optional review appears afterward
- status list/grid switch changes layout only

## Per-State Content

Map saved cards show title, category, expiry, attendance, and extension when applicable. Status shows sleep, activity, focus, free time, energy, and recent experiences without an aggregate score.

## Assets

Saved-card thumbnails reuse local opportunity photos. Map uses CSS lines and labels; no map provider.

## Text Content

Korean. Reassurance copy states what expires and that extension is available; it does not claim unseen privacy or data behavior.

## Responsive Behavior

Full mobile view at 390px; fixed phone plane on tablet/desktop.

## Original Implementation Inventory

N/A: map and status are explicit Life Lab adaptations.

## Parity Decision

Approved reimplementation using the source’s white canvas, rounded controls, accent gradient, compact chips, and icon weight.
