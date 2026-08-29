---
name: Luminous Performance
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#e29100'
  on-tertiary-container: '#523200'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-counter:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-counter-mobile:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-padding: 20px
  grid-gutter: 16px
---

## Brand & Style

The design system is engineered for high-performance individuals who view their life as an optimizable asset. The brand personality is precise, motivating, and transparent. The UI utilizes a **Glassmorphic-Minimalist** hybrid style to evoke a sense of clarity and modern sophistication. 

The aesthetic focuses on "data-transparency"—using translucent layers and blurred backgrounds to create depth without clutter. The emotional response should be one of "controlled momentum": the user feels the weight of their progress through tactile card structures and vibrant, light-emitting interactive elements.

## Colors

The color strategy centers on **Emerald Green (#10B981)** to signify growth, vitality, and compounding value. A secondary **Electric Blue (#3B82F6)** is used for technical tasks and time-tracking elements. 

The background is a crisp **Off-White (#F8FAFC)**, providing the necessary contrast for glassmorphic cards. Surface colors utilize high-transparency whites (RGBA 255, 255, 255, 0.7) with a backdrop blur of 12px-20px to create the glass effect. Accents are kept to cool grays to ensure the primary "growth" color remains the focal point of the user's attention.

## Typography

This design system employs a three-tier typographic hierarchy to balance high-energy data with functional readability. 

- **Sora** is the primary display face, used for the main "Life Value" counters and section headers. Its geometric structure feels tech-forward and confident.
- **Hanken Grotesk** serves as the workhorse for all body copy and list items, offering exceptional legibility and a contemporary sharp finish.
- **JetBrains Mono** is reserved for metadata, timestamps, and secondary data points to lean into the "performance tracking" and "quantified self" aspect of the app.

Large numbers should always use `display-counter` with a slight negative letter-spacing to appear as a single, impactful unit of value.

## Layout & Spacing

The layout follows a **Fluid-Responsive Grid** model based on an 8px rhythmic scale. 

- **Mobile:** Single column with 20px side margins. Cards span the full width of the safe area.
- **Tablet:** 8-column grid. "Life Pillars" transition to a 2x2 or 4x1 grid layout.
- **Desktop:** 12-column grid. A fixed sidebar for navigation, with a centered max-width container of 1200px for content.

Vertical spacing between different sections (e.g., between the Counter Header and the Pillars) uses the `lg` (40px) token to allow the glassmorphic effects enough room to "breathe" without overlapping visual noise.

## Elevation & Depth

Depth is achieved through **Tonal Stacked Glass**. Instead of traditional heavy shadows, the design system uses:

1.  **Level 0 (Background):** Solid #F8FAFC.
2.  **Level 1 (Sub-Cards):** White at 40% opacity, 8px blur, 1px white border at 20% opacity. No shadow.
3.  **Level 2 (Main Interactive Cards):** White at 70% opacity, 16px blur, 1px white border at 50% opacity. A very soft, diffused shadow: `0 10px 30px rgba(0,0,0,0.04)`.
4.  **Level 3 (Active/Modal):** White at 90% opacity, 32px blur. Shadow: `0 20px 40px rgba(0,0,0,0.08)`.

Elements appear to float over the background, with the "Life Value" counter having the highest perceived elevation through the use of a subtle background gradient glow (Emerald to Blue) behind the card.

## Shapes

The design system utilizes an aggressive **2xl rounding strategy** for primary containers to soften the technical feel of the data. 

- **Primary Cards:** Use `rounded-xl` (1.5rem / 24px) to create a friendly, organic feel.
- **Buttons & Inputs:** Use `rounded-lg` (1rem / 16px) for a consistent tactile response.
- **Pills/Chips:** Use full-round (999px) for status indicators and category tags.

All 1px borders on glass elements should have a slight inner-glow effect to simulate the edge of a glass pane.

## Components

### Real-Time Counter Header
The flagship component. A large glassmorphic card containing the `display-counter` text. Background features a slow-moving, subtle mesh gradient (Emerald to Blue at 10% opacity) to signify "live" energy.

### Life Pillar Grid
Square-format cards with a 1:1 aspect ratio. Contains a minimalist outline icon in the top left, the Pillar name in `label-caps`, and the current value in `headline-lg`. A subtle progress bar at the bottom of the card shows the daily goal status.

### Daily Tasks List
List items feature a "Ghost" style. No background fill until hovered or active. On interaction, the item gains a Level 1 glass surface. Checkboxes are custom-designed circles that fill with the Emerald-to-Blue gradient when checked.

### Time Planning Section
A vertical timeline using `jetbrainsMono` for time markers. "Time Blocks" are semi-transparent colored rectangles with rounded corners, where the color indicates the category (Blue for work, Green for rest).

### Buttons
- **Primary:** Solid Emerald Green to Blue linear gradient (135deg). White text. High-refractive inner highlight on the top edge.
- **Secondary:** Transparent background with a 1px white border and 10% white fill (Glass effect).