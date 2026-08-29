# Overview

- Target: `prototypes/glint/index.html`, `styles.css`, `app.js`.
- Screenshot: `.superloopy/evidence/website-clone/glint-menu/source-contact-sheet.png`.
- Source: supplied local MOV; no URL.
- Root: `.menu-plane`.
- Interaction: hover, focus, click-pin, Escape.

# DOM Structure

`main.menu-plane > header.menu-header + section.domain-menu > article.domain × 5 + footer.menu-footer`. Each article contains a centered heading and a hover detail block.

# Computed Styles

- Plane: width `min(90vw, 1728px)`, aspect ratio `16 / 9`, background `#fcf8ed`, overflow hidden.
- Menu: five equal columns; each field width 20%, full height.
- Label: source-scale 42px, weight 400, orange `#ed763d`.
- Header/footer are absolute overlays.
- Background fades from opacity 0 to 1 in 400ms.

# States and Behaviors

- Rest: five orange labels on cream.
- Hover/focus/pinned: one background visible; active label turns cream; a compact translucent detail block appears below the label.
- Click toggles pin for touch. Enter/Space match click. Escape clears pin.
- Other fields remain unchanged.

# Per-State Content

- Sleep: target 8h, last night 7h18m, analysis of bedtime consistency and late-meal hypothesis.
- Diet: 2,100 kcal target, 1,460 kcal recorded, 240 kcal pending estimate.
- Exercise: A routine at 18:30, 3/4 adherence, no pain flag.
- Time Management: 4h planned, 3h40m actual, next block 14:00.
- Exploration: active 3-session experiment, 2/3 complete, mixed early signal.

# Assets

Three cropped source frames under `prototypes/glint/assets/`; the last two fields reuse alternate source crops because the video does not show their original hover imagery.

# Text Content

Five labels come from `docs/product/concept.md`: Sleep, Diet, Exercise, Time Management, Exploration. Hover copy preserves distinctions between target, observed record, Agent proposal, evidence, and experiment.

# Responsive Behavior

- Desktop source: five equal columns.
- Tablet/mobile inferred: five equal rows, same reveal and pin behavior.
- No source breakpoint exists; implementation breakpoint is 700px.

# Original Implementation Inventory

Only a rendered MOV is supplied. There is no extractable DOM, CSS, JS driver, font file, or live implementation. The visible model is equal fields plus opacity transition and image clipping.

# Parity Decision

Approved reimplementation is implicit in the user's request against a rendered local video: verbatim port is impossible without source DOM/CSS/JS. Layout, timing, palette, typography hierarchy, and visible interaction are reconstructed from frames.
