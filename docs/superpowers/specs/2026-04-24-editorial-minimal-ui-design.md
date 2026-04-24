# Editorial Minimal UI Design

## Objective

Shift the full product UI to a minimal editorial system:

- palette led by black, white, and grey
- minimal semantic color only for fuel states
- less visual noise, fewer heavy cards, less decorative styling
- stronger typography and clearer reading order

This is a visual and UX restructuring sprint. It does not change product logic.

## Scope

Apply the new system to the full app:

- landing page
- map page
- station detail page
- reporting form
- dashboard
- alerts
- profile
- admin

## Visual Direction

### Palette

- page background: white or near-white
- surfaces: white
- text primary: black
- text secondary: dark grey
- borders/dividers: light grey
- primary action: black background with white text
- secondary action: white background with dark border/text

### Semantic Status Color

Keep minimal semantic color only in fuel state badges and very small accents:

- available: muted green
- unavailable: muted red
- conflict: restrained amber or dark neutral accent
- unknown / awaiting more signals: neutral grey

No broad tinted panels, no warm beige system, no decorative gradients.

### Composition

- reduce shadow intensity heavily or remove where not needed
- rely on spacing, type scale, and thin borders instead of layered cards
- preserve mobile-first behavior
- prefer compact blocks and direct labels

## UX Rules

### Global

- every screen should show the primary action or primary information in the first viewport
- supporting explanation should be shorter and pushed down
- repeated explanatory text should be removed

### Landing

- one dominant headline
- one supporting paragraph
- two actions max in the hero
- support blocks simplified and visually lighter

### Map

- top explanatory block becomes compact
- map moves higher and gets more vertical space
- filters look like a toolbar, not decorative chips
- station list should read as a clean scan list, not stacked promo cards

### Station Detail

- top summary stays compact
- signalling block appears immediately and reads as the main action
- fuel status cards become lighter and cleaner
- history becomes clearly secondary

### Secondary Screens

- dashboard, alerts, profile, and admin must inherit the same system
- avoid special styling per screen unless functional

## Implementation Plan

### Layer 1: Tokens and shared styling

Update:

- `app/globals.css`

Tasks:

- replace current warm palette tokens
- simplify button hierarchy
- reduce shadows, border radius excess, and decorative backgrounds
- normalize spacing and typography scale

### Layer 2: Core launch screens

Update:

- `app/page.tsx`
- `app/map/page.tsx`
- `app/stations/[id]/page.tsx`
- supporting station/map components

Tasks:

- simplify hierarchy
- move map and actions higher
- reduce helper copy
- align cards and lists to the new minimal system

### Layer 3: Remaining app screens

Update:

- dashboard
- alerts
- profile
- admin

Tasks:

- apply the same monochrome system
- remove leftover warm/accent-heavy styling
- align buttons, headings, and spacing with the new system

## Non-Goals

- no business logic changes
- no auth flow changes
- no map clustering work
- no data model changes

## Risks

### Risk 1: Over-minimalisation

If the UI becomes too sparse, utility screens may lose clarity.

Mitigation:

- keep strong labels
- keep semantic state badges
- keep primary action visually obvious

### Risk 2: Partial migration

If only some screens adopt the new system, the app will feel inconsistent.

Mitigation:

- apply the palette and component treatment across the full app in the same sprint

## Validation

Before publish:

- run `npm run build`

Manual checks:

1. landing is visually minimal and readable
2. map is less noisy and shows more useful area
3. station detail is quicker to scan
4. reporting form remains obvious
5. dashboard/profile/admin/alerts visually match the same system
