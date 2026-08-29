# Design tokens

The source is a rendered concept board, so DOM computed styles do not exist. Values below are image-derived implementation targets and must be checked by screenshot comparison.

## Color

- canvas: `#fffafb`
- surface: `#ffffff`
- ink: `#26262b`
- muted: `#8f939d`
- hairline: `#ececf0`
- Tinder-derived accent start: `#fd2c5f`
- Tinder-derived accent end: `#ff655a`
- active icon uses the accent gradient; inactive icons use `#9298a3`

## Type

- Source resembles Poppins/geometric sans.
- Prototype uses `Inter`, matching the PetitSeoul Base tab, with system fallbacks.
- Large card title: 30–34px, 650–700.
- Detail title: 28px, 650.
- Body: 14–16px, 400–500.
- Chips: 11–12px, 500–600.

## Geometry at 390×844

- app horizontal inset: 18px
- top bar: 64px
- primary card: about 354×570px
- primary card radius: 34px
- expanded hero radius: 30px
- action button diameter: 54–64px
- bottom nav: 72px plus safe area
- control radius: 14–18px
- metadata chips: pill radius 999px

## Effects

- photo lower gradient: transparent → rgba(8,4,8,.88)
- action shadow: `0 12px 28px rgba(35,20,28,.15)`
- active card shadow: `0 22px 55px rgba(35,20,28,.16)`
- dismissal rotation: about ±12deg
- transition: 260–360ms cubic-bezier(.2,.8,.2,1)

## Icons

Icon grammar comes from PetitSeoul Base tab’s Lucide use:
`/Users/an/project/petitseoul/UI:UX/design/Base tab/src/app/components/PhoneLayout.tsx`.

- Explore tab: Lucide `Compass`
- Status/profile tab: Lucide `UserRound`
- Display controls: Lucide `List`, `Grid2X2`
- Stroke: 1.7 inactive, 2.2 active
- Bottom tabs contain no visible labels; accessible names remain.
