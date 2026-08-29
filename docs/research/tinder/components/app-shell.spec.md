# App shell component spec

## Overview

- Target: `apps/life-lab/index.html`, `styles.css`, `app.js`
- Screenshot: `docs/references/explore/tinder-card-flow.png`
- Source URL: https://dribbble.com/shots/21761565-Tinder-App-UI-Redesign
- Interaction model: click/touch with fixed chrome

## DOM Structure

`phone > topbar + view-host + bottom-nav + toast-host`.

## Computed Styles

N/A: source is a static rendered board. Image-derived values are in `DESIGN_TOKENS.md`.

## States and Behaviors

- active Explore icon: gradient accent
- active profile icon: gradient accent
- no visible tab text
- 390px fills viewport; larger widths center a 390×844 phone plane

## Per-State Content

Explore and profile/status only. Map and detail are child views, not bottom tabs.

## Assets

Inline Lucide-derived `Compass` and `UserRound` SVG.

## Text Content

No tab labels. `aria-label` remains `탐색` and `내 상태`.

## Responsive Behavior

390, 768, and 1440 as documented in `BEHAVIORS.md`.

## Original Implementation Inventory

Static source: fixed top header, bottom icon bar, white canvas. No source JS is available.

## Parity Decision

Approved reimplementation: the source is imagery only; preserve the visible structure and derive interactions from first-party Tinder documentation.
