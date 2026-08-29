# Discovery deck and detail component spec

## Overview

- Target: `apps/life-lab/index.html`, `styles.css`, `app.js`
- Screenshots: `tinder-card-flow.png`, `tinder-detail-screens.png`
- Interaction model: mixed tap, horizontal drag, vertical reveal

## DOM Structure

`deck > stacked cards > photo/progress + overlay/info`; floating actions; expanded `detail > hero + body`.

## Computed Styles

N/A: source is static. Use exact image-derived targets from `DESIGN_TOKENS.md`.

## States and Behaviors

- photo index changes from edge taps
- left pass / right save after 72px horizontal threshold
- upward gesture after 48px opens detail
- tapping lower info opens detail
- detail is vertically scrollable and back preserves deck state
- filter sheet supports all/events/food-cafe without search

## Per-State Content

Five mixed Seoul/Gyeonggi opportunities: pottery, jazz, climbing, cafe, exhibition.

## Assets

All local photos listed in `ASSETS.md`.

## Text Content

Korean opportunity names, date/location/price chips, concise recommendation reason, and booking/directions CTA.

## Responsive Behavior

Card remains 354px wide in the centered desktop frame and uses available width minus 36px on narrow screens.

## Original Implementation Inventory

The source proves progress bars, a dominant photo, lower gradient, floating actions, and expanded profile layout. It does not ship DOM/CSS/JS.

## Parity Decision

Approved reimplementation because the source is a static design board. First-party Tinder edge-tap and complete-profile behavior is transplanted conceptually.
