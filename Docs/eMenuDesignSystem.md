# eMenu — Design System Specification

**Version:** 1.0
**Status:** Foundation Release
**Last updated:** 2026-06-21
**Owner:** Product Design
**Source of truth for:** Customer App (Next.js) · Admin Dashboard (Next.js + TS)

> This document is the single reference for designers building the eMenu component library in Figma and for engineers implementing it in React. Every token below is named for direct translation into Figma Variables/Styles and a CSS custom-property / Tailwind theme layer.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color Palette](#2-color-palette)
3. [Typography Scale](#3-typography-scale)
4. [Spacing System](#4-spacing-system)
5. [Border Radius System](#5-border-radius-system)
6. [Elevation / Shadow System](#6-elevation--shadow-system)
7. [Grid System](#7-grid-system)
8. [Responsive Breakpoints](#8-responsive-breakpoints)
9. [Iconography Guidelines](#9-iconography-guidelines)
10. [Component Library](#10-component-library)
11. [Appendix — Token Naming & Figma Setup](#11-appendix--token-naming--figma-setup)

---

## 1. Design Principles

eMenu serves two very different audiences from one design language: a **diner holding a phone at a table** (fast, anxiety-free, one-handed) and an **operator behind a dashboard** (dense, decisive, all-day use). These six principles resolve tension between the two.

| #   | Principle                                 | What it means                                                                                                  | How we apply it                                                                                                                 |
| --- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Mobile-first, thumb-first**             | The diner journey is designed at 360px before anything else.                                                   | Minimum touch target 44×44px; primary actions sit in the bottom thumb zone; sticky order bars.                                  |
| 2   | **One decision per screen**               | Reduce waiter dependency means the UI must self-explain. Each screen has one obvious next action.              | A single high-emphasis Primary button per view; "One-click ordering" honored — add-to-order never requires a form.              |
| 3   | **Appetite-forward, restraint elsewhere** | Food photography and warm accents drive desire on the menu; the dashboard stays neutral so data reads clearly. | Color and imagery are spent on the menu surface; admin surfaces are near-monochrome with accent reserved for action and status. |
| 4   | **Status is always legible**              | Real-time order tracking is the product's core promise.                                                        | Order state uses a fixed, color-coded, icon-paired vocabulary that never changes meaning across roles.                          |
| 5   | **Trust through clarity**                 | This is a paid B2B tool handling money, tax, and accounting.                                                   | Honest empty/loading/error states, never fake data; destructive actions confirmed; numbers right-aligned and tabular.           |
| 6   | **Accessible by default**                 | Restaurants are bright, noisy, fast environments; staff use it all shift.                                      | WCAG 2.2 AA minimum, AAA for body text where feasible; never color-only signaling; full keyboard support on dashboard.          |

**Design tone:** Modern · Clean · Minimalist · Restaurant-warm · Professional.

---

## 2. Color Palette

The system is built from a **warm orange primary** (appetite, the requirement's "warm accent"), a **deep charcoal neutral ramp** for text/surfaces on a white base, and a **functional/status set** that maps directly to order lifecycle states.

All pairings listed as "on white" or "on accent" meet **WCAG AA (4.5:1)** for text unless explicitly marked Large-only (3:1).

### 2.1 Brand / Primary — "Saffron"

Warm orange. Used for primary actions, active states, brand moments.

| Token               | Hex       | Usage                            | Contrast notes                         |
| ------------------- | --------- | -------------------------------- | -------------------------------------- |
| `color.primary.50`  | `#FFF7ED` | Tint backgrounds, hover wash     | —                                      |
| `color.primary.100` | `#FFEDD5` | Selected row tint, chips         | —                                      |
| `color.primary.200` | `#FED7AA` | Borders on tint, disabled accent | —                                      |
| `color.primary.300` | `#FDBA74` | Decorative, gradients            | —                                      |
| `color.primary.400` | `#FB923C` | Hover for icons on light         | —                                      |
| `color.primary.500` | `#F97316` | **Base brand** — icons, accents  | 3.3:1 on white → large text/icons only |
| `color.primary.600` | `#EA580C` | **Primary button fill / links**  | 4.6:1 on white ✅ AA                   |
| `color.primary.700` | `#C2410C` | Button hover/pressed             | 6.3:1 ✅                               |
| `color.primary.800` | `#9A3412` | High-contrast accent text        | 8.9:1 ✅                               |
| `color.primary.900` | `#7C2D12` | Darkest, rare                    | —                                      |

> **Rule:** Use `primary.600` (not `500`) for any orange that carries text or must pass AA against white. `500` is the "brand swatch" but fails AA for small text.

### 2.2 Secondary — "Ember" (Red)

The requirement names "orange/red." Red is reserved as a **support accent** and shares duties with the Error ramp to keep the palette tight. Used for promotions, "spicy/hot" tags, and the cashier/payment surface.

| Token                 | Hex       | Usage                        |
| --------------------- | --------- | ---------------------------- |
| `color.secondary.50`  | `#FEF2F2` | Promo banner tint            |
| `color.secondary.100` | `#FEE2E2` | Sale chip                    |
| `color.secondary.500` | `#EF4444` | Promo accent / spicy tag     |
| `color.secondary.600` | `#DC2626` | Promo button, discount price |
| `color.secondary.700` | `#B91C1C` | Pressed                      |

### 2.3 Neutrals — "Slate" ramp (text, surfaces, borders)

White-background-first per requirements.

| Token               | Hex       | Usage                              | Contrast on white                |
| ------------------- | --------- | ---------------------------------- | -------------------------------- |
| `color.neutral.0`   | `#FFFFFF` | App background, card surface       | —                                |
| `color.neutral.50`  | `#F9FAFB` | App canvas (dashboard), zebra rows | —                                |
| `color.neutral.100` | `#F3F4F6` | Subtle fill, skeleton base         | —                                |
| `color.neutral.200` | `#E5E7EB` | Borders, dividers                  | —                                |
| `color.neutral.300` | `#D1D5DB` | Input borders, disabled border     | —                                |
| `color.neutral.400` | `#9CA3AF` | Placeholder, disabled text         | 2.8:1 (decorative/disabled only) |
| `color.neutral.500` | `#6B7280` | Muted/secondary text               | 4.6:1 ✅ AA                      |
| `color.neutral.600` | `#4B5563` | Body secondary, icons              | 7.0:1 ✅                         |
| `color.neutral.700` | `#374151` | Body text                          | 10.3:1 ✅ AAA                    |
| `color.neutral.800` | `#1F2937` | Headings                           | 14.7:1 ✅ AAA                    |
| `color.neutral.900` | `#111827` | **Primary text** (the "dark text") | 17.4:1 ✅ AAA                    |

### 2.4 Functional / Status colors

These map 1:1 to the order lifecycle and system feedback. Each has a `fill` (badge/button), `text` (on white), and `bg` (tint).

| Semantic                            | Role in eMenu                                  | `bg` (tint) | `border`  | `text`/`fill` (AA on white) |
| ----------------------------------- | ---------------------------------------------- | ----------- | --------- | --------------------------- |
| **Success / Ready / Completed**     | Order ready, payment done, item available      | `#ECFDF5`   | `#A7F3D0` | `#047857` (Green 700)       |
| **Warning / Preparing**             | In kitchen, low stock, estimated time slipping | `#FFFBEB`   | `#FDE68A` | `#B45309` (Amber 700)       |
| **Error / Cancelled / Unavailable** | Cancelled order, failed payment, sold out      | `#FEF2F2`   | `#FECACA` | `#B91C1C` (Red 700)         |
| **Info / Placed / Accepted**        | New order received, informational toasts       | `#EFF6FF`   | `#BFDBFE` | `#1D4ED8` (Blue 700)        |
| **Neutral / Pending / Draft**       | Awaiting action, draft menu                    | `#F3F4F6`   | `#E5E7EB` | `#374151` (Slate 700)       |

### 2.5 Order Status palette (canonical)

Locked vocabulary — these colors must never be reused for unrelated meaning.

| Status             | Token              | Dot/Fill  | Tint bg   | Text      |
| ------------------ | ------------------ | --------- | --------- | --------- |
| Placed             | `status.placed`    | `#1D4ED8` | `#EFF6FF` | `#1D4ED8` |
| Accepted           | `status.accepted`  | `#7C3AED` | `#F5F3FF` | `#6D28D9` |
| Preparing          | `status.preparing` | `#B45309` | `#FFFBEB` | `#B45309` |
| Ready              | `status.ready`     | `#047857` | `#ECFDF5` | `#047857` |
| Served / Completed | `status.completed` | `#059669` | `#ECFDF5` | `#047857` |
| Cancelled          | `status.cancelled` | `#B91C1C` | `#FEF2F2` | `#B91C1C` |

### 2.6 Dark mode (Admin Dashboard — Phase 2)

Tokens are defined semantically so dark mode is a value swap, not a redesign. Reserved scaffolding:

| Semantic token   | Light value | Dark value |
| ---------------- | ----------- | ---------- |
| `surface.canvas` | `#F9FAFB`   | `#0B0F19`  |
| `surface.card`   | `#FFFFFF`   | `#151A28`  |
| `surface.raised` | `#FFFFFF`   | `#1E2536`  |
| `text.primary`   | `#111827`   | `#F3F4F6`  |
| `text.secondary` | `#6B7280`   | `#9CA3AF`  |
| `border.default` | `#E5E7EB`   | `#2A3142`  |
| `primary.action` | `#EA580C`   | `#FB923C`  |

> Customer app remains light-only at launch (food reads best on white).

---

## 3. Typography Scale

**Primary typeface:** `Inter` (UI, all surfaces) — excellent at small sizes, tabular numerals for accounting.
**Numeric/Tabular:** `Inter` with `font-feature-settings: "tnum"` for tables, money, order numbers.
**Fallback stack:** `Inter, "SF Pro", -apple-system, "Segoe UI", Roboto, system-ui, sans-serif`.

Type scale uses a **1.25 (major third)** ratio on a 16px base, snapped to the 4px grid.

| Token              | Size / Line height | Weight     | Letter-spacing     | Usage                                             |
| ------------------ | ------------------ | ---------- | ------------------ | ------------------------------------------------- |
| `text.display`     | 40 / 48            | 700        | -0.02em            | Marketing, big revenue figures on Owner dashboard |
| `text.h1`          | 32 / 40            | 700        | -0.02em            | Page title                                        |
| `text.h2`          | 28 / 36            | 700        | -0.01em            | Section header                                    |
| `text.h3`          | 24 / 32            | 600        | -0.01em            | Card group title, menu category                   |
| `text.h4`          | 20 / 28            | 600        | 0                  | Card title, modal title                           |
| `text.h5`          | 18 / 26            | 600        | 0                  | Menu item name, list header                       |
| `text.body-lg`     | 16 / 24            | 400        | 0                  | Default body (customer app default)               |
| `text.body`        | 14 / 20            | 400        | 0                  | Default body (dashboard default), table cells     |
| `text.body-strong` | 14 / 20            | 600        | 0                  | Emphasis, labels                                  |
| `text.caption`     | 12 / 16            | 400        | 0                  | Helper text, metadata, timestamps                 |
| `text.overline`    | 11 / 16            | 600        | 0.06em (UPPERCASE) | Eyebrow labels, table column heads                |
| `text.price`       | 18 / 24            | 700 (tnum) | 0                  | Prices on menu                                    |
| `text.mono`        | 14 / 20            | 500 (tnum) | 0                  | Order #, QR codes, IDs, money in tables           |

**Rules**

- Body minimum **16px on the customer app** (no zoom-blocking, comfortable for diners). Dashboard may use 14px for density.
- Line length max **75ch** for descriptions.
- Never go below **12px** for any readable text.
- Money & quantities always use tabular numerals.

---

## 4. Spacing System

**Base unit: 4px.** All spacing, sizing, and layout snap to this grid. Token name = pixel value for zero ambiguity.

| Token      | px  | rem  | Typical use                               |
| ---------- | --- | ---- | ----------------------------------------- |
| `space.0`  | 0   | 0    | Reset                                     |
| `space.1`  | 4   | 0.25 | Icon-to-label gap, tight insets           |
| `space.2`  | 8   | 0.5  | Chip padding, compact gaps                |
| `space.3`  | 12  | 0.75 | Input inner padding, small gaps           |
| `space.4`  | 16  | 1    | **Default gutter**, card padding (mobile) |
| `space.5`  | 20  | 1.25 | —                                         |
| `space.6`  | 24  | 1.5  | Card padding (desktop), section gap       |
| `space.8`  | 32  | 2    | Block separation                          |
| `space.10` | 40  | 2.5  | Major section gap                         |
| `space.12` | 48  | 3    | Page section padding                      |
| `space.16` | 64  | 4    | Hero / large dividers                     |
| `space.20` | 80  | 5    | Page top/bottom on desktop                |

**Touch & sizing primitives**

- Minimum interactive target: **44×44px** (`space.11` equivalent, defined as `size.touch.min = 44`).
- Comfortable button height: **48px** (customer), **40px** (dashboard).
- Icon button: **40×40px** with 20px icon.

**Layout rhythm:** vertical spacing between distinct content blocks defaults to `space.6` (24px); within a group `space.4` (16px); inside a component `space.2`/`space.3`.

---

## 5. Border Radius System

Soft, modern, friendly — but restrained.

| Token         | px   | Usage                                                 |
| ------------- | ---- | ----------------------------------------------------- |
| `radius.none` | 0    | Full-bleed images, table cells                        |
| `radius.sm`   | 6    | Chips, tags, badges, inputs (dashboard)               |
| `radius.md`   | 10   | **Default** — buttons, inputs (customer), small cards |
| `radius.lg`   | 14   | Cards, menu item cards                                |
| `radius.xl`   | 20   | Modals, drawers, bottom sheets                        |
| `radius.2xl`  | 28   | Feature/hero panels                                   |
| `radius.full` | 9999 | Avatars, pills, FAB, status dots, toggle              |

**Rules:** nested elements step down one level (a `radius.md` button inside a `radius.lg` card). Images inside cards inherit the card's outer radius on shared corners only.

---

## 6. Elevation / Shadow System

Minimalist: shadows convey **interaction layering**, not decoration. Built on a single neutral (`#111827`) at low opacity for a natural, non-muddy look on white.

| Token         | Value                                                              | Usage                                     |
| ------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `elevation.0` | `none`                                                             | Flat on canvas; borders do the separating |
| `elevation.1` | `0 1px 2px rgba(17,24,39,0.06), 0 1px 3px rgba(17,24,39,0.10)`     | Cards, resting buttons                    |
| `elevation.2` | `0 2px 4px rgba(17,24,39,0.06), 0 4px 8px rgba(17,24,39,0.08)`     | Hovered cards, dropdowns                  |
| `elevation.3` | `0 4px 8px rgba(17,24,39,0.08), 0 12px 20px rgba(17,24,39,0.10)`   | Popovers, sticky order bar                |
| `elevation.4` | `0 8px 16px rgba(17,24,39,0.10), 0 24px 40px rgba(17,24,39,0.14)`  | Modals, drawers                           |
| `elevation.5` | `0 16px 32px rgba(17,24,39,0.14), 0 40px 64px rgba(17,24,39,0.18)` | Toasts over modal, command palette        |

**Focus ring (separate from elevation):**
`focus.ring = 0 0 0 2px #FFFFFF, 0 0 0 4px #EA580C` — a 2px white offset + 2px primary ring. Always visible on keyboard focus; never removed without replacement.

**Rules:** prefer **borders over shadows on the dashboard** (dense UIs); reserve heavier elevation for true overlays. Dark mode uses lighter borders instead of shadows.

---

## 7. Grid System

### Dashboard (desktop)

- **12-column** fluid grid.
- Max content width: **1280px** (with `1440px` "wide" variant for analytics).
- Gutter: **24px** (`space.6`). Outer margin: **32px** (`space.8`).
- App shell: fixed **256px** left nav + fluid content; collapses to **72px** icon-rail at `lg` and to a drawer at `md`.

### Customer App (mobile)

- **4-column** grid at mobile, **8-column** at tablet.
- Gutter: **16px** (`space.4`). Outer margin: **16px**.
- Menu item grid: 1 column (mobile portrait) → 2 columns (≥480px) → 2–3 columns (tablet). List view is the default for accessibility; card-grid is a toggle.
- Content max width on large screens: **480px** centered (phone-shaped) so the customer experience stays mobile-native even on desktop browsers.

### Z-index scale

| Layer        | z                                     |
| ------------ | ------------------------------------- |
| `z.base`     | 0                                     |
| `z.sticky`   | 100 (sticky order bar, table headers) |
| `z.drawer`   | 200                                   |
| `z.dropdown` | 300                                   |
| `z.modal`    | 400                                   |
| `z.toast`    | 500                                   |
| `z.tooltip`  | 600                                   |

---

## 8. Responsive Breakpoints

Mobile-first: base styles target the smallest screen; breakpoints add complexity upward.

| Token     | Min width | Target            | Notes                                                                                   |
| --------- | --------- | ----------------- | --------------------------------------------------------------------------------------- |
| `bp.base` | 0–479px   | Phones (portrait) | **Design baseline** for customer app. Single column, bottom-sheet patterns, sticky CTA. |
| `bp.sm`   | 480px     | Large phones      | 2-col menu cards become possible.                                                       |
| `bp.md`   | 768px     | Tablets           | Dashboard nav becomes drawer→rail; 2-col forms; data tables gain columns.               |
| `bp.lg`   | 1024px    | Small laptops     | Dashboard full shell (256px nav + content).                                             |
| `bp.xl`   | 1280px    | Desktops          | Max content width reached; multi-column dashboards.                                     |
| `bp.2xl`  | 1536px    | Large monitors    | Wide analytics layouts, side-by-side panels.                                            |

**Behavior rules**

- Touch targets stay 44px+ at every breakpoint (staff use tablets in the field).
- The customer app never exceeds a 480px content column regardless of viewport.
- Tables collapse to stacked cards below `md`.

---

## 9. Iconography Guidelines

- **Library:** [Lucide](https://lucide.dev) (open-source, consistent 24px grid, line style) as the base set. Single source to avoid mixed metaphors.
- **Style:** Outline / stroke. **Stroke width 1.75px** at 24px. No filled icons except status dots and active-state nav.
- **Sizes:** `icon.sm` 16px · `icon.md` 20px (default, inline with 14–16px text) · `icon.lg` 24px (buttons, nav) · `icon.xl` 32px (empty states, feature).
- **Alignment:** optically centered; icon + label gap = `space.2` (8px).
- **Color:** inherit text color (`currentColor`) by default; status icons take their status color; never use icon-only for critical actions without an accessible label.
- **Touch:** any tappable icon sits in a ≥44px hit area even if the glyph is 20px.

**Canonical icon mapping (consistency contract):**

| Concept              | Icon                       |
| -------------------- | -------------------------- |
| Menu / categories    | `utensils-crossed`         |
| Order                | `receipt` / `shopping-bag` |
| QR / table           | `qr-code`, `armchair`      |
| Kitchen              | `chef-hat`                 |
| Preparing            | `flame`                    |
| Ready                | `bell-ring`                |
| Completed            | `check-circle`             |
| Cancelled            | `x-circle`                 |
| Revenue / accounting | `wallet`, `trending-up`    |
| Analytics            | `bar-chart-3`              |
| Staff / users        | `users`                    |
| Settings             | `settings`                 |
| Search               | `search`                   |
| Add                  | `plus`                     |
| Notifications        | `bell`                     |

**Accessibility:** decorative icons get `aria-hidden="true"`; meaningful icons get `aria-label`. Status is never icon-only **or** color-only — always icon + text + color together.

---

## 10. Component Library

Each component below is specified for direct Figma component build with variant properties. **Accessibility requirements assume WCAG 2.2 AA.**

Global interaction-state model (applies to all interactive components unless overridden):
`Default → Hover → Focus-visible → Active/Pressed → Selected → Disabled → Loading → Error`.

---

### 10.1 Buttons

**Purpose:** Trigger actions. The single most important control — drives "one-click ordering" and every confirm/save flow.

**Variants**

- _Hierarchy:_ `Primary` (orange `primary.600` fill, white text) · `Secondary` (neutral.0 fill, `neutral.300` border, `neutral.900` text) · `Tertiary/Ghost` (transparent, text only) · `Destructive` (`error` fill) · `Link` (inline, underlined on hover).
- _Size:_ `sm` 32px · `md` 40px (dashboard default) · `lg` 48px (customer default) · `xl` 56px (primary mobile CTA, full-width).
- _Shape:_ default `radius.md`; `pill` (`radius.full`) for filters/chips; `icon-only` (square, 40/48px, requires `aria-label`).
- _Width:_ hug / fixed / full-width (mobile primary CTA is full-width in the sticky bar).
- _Affix:_ leading icon / trailing icon / both / none.

**States**

| State         | Spec                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| Default       | `primary.600` fill, `elevation.0`, white text                                   |
| Hover         | `primary.700` fill                                                              |
| Focus-visible | `focus.ring`                                                                    |
| Pressed       | `primary.800`, scale 0.98                                                       |
| Disabled      | `neutral.200` fill, `neutral.400` text, no shadow, `cursor: not-allowed`        |
| Loading       | Spinner replaces leading icon; label dims to 70%; width locked; non-interactive |

**Accessibility**

- Min size 44×44px touch (lg/xl satisfy; sm gets padded hit area on touch).
- Real `<button>`; `type` set explicitly; Enter/Space activate.
- Loading sets `aria-busy="true"`; disabled uses `disabled` (or `aria-disabled` if it must stay focusable).
- Icon-only requires `aria-label`. Label contrast ≥ 4.5:1 (white on `primary.600` = 4.6:1 ✅).
- Never rely on color alone to distinguish destructive — pair with label ("Delete") and/or icon.

---

### 10.2 Inputs (Text Field)

**Purpose:** Single-line/multi-line data entry — login, menu item details, prices, search, profile.

**Variants**

- _Type:_ text · email · password (with reveal toggle) · number (price/qty, stepper optional) · textarea · currency (prefix `$`) · phone.
- _Adornments:_ leading icon · trailing icon/button · prefix/suffix text (e.g., `$`, `min`) · clear button.
- _Density:_ `md` 40px (dashboard) · `lg` 48px (customer).
- _Label position:_ top-aligned label (default) — never placeholder-as-label.

**States**

| State     | Border                                                    | Notes                                          |
| --------- | --------------------------------------------------------- | ---------------------------------------------- |
| Default   | `neutral.300`                                             | Label `neutral.700`, placeholder `neutral.400` |
| Hover     | `neutral.400`                                             | —                                              |
| Focus     | `primary.600` + `focus.ring`                              | —                                              |
| Filled    | `neutral.300`                                             | Value `neutral.900`                            |
| Disabled  | `neutral.200`, bg `neutral.50`                            | `neutral.400` text                             |
| Read-only | no border, bg transparent                                 | —                                              |
| Error     | `error` border, `error` helper text + `alert-circle` icon | —                                              |
| Success   | `success` border + `check` icon                           | For validated fields (e.g., unique slug)       |

**Anatomy:** Label · (optional) required `*` · Input · Helper/error text (16px reserved height to prevent layout shift) · char counter (optional).

**Accessibility**

- Programmatic `<label for>` association (no placeholder-only labels).
- Error text linked via `aria-describedby`; `aria-invalid="true"` on error.
- Required announced via `aria-required`, not just `*`.
- Focus ring always visible; 44px min height on touch.
- Number/currency inputs use `inputmode` for correct mobile keyboards.

---

### 10.3 Search

**Purpose:** Find menu items (customer), and filter orders/menu/staff/reports (dashboard).

**Variants**

- _Style:_ inline field · expandable (icon → field) · command-palette (dashboard global search, ⌘K).
- _Behavior:_ instant/live results (debounced 250ms) · submit-on-enter.
- _Results:_ dropdown suggestions · full results page · recent searches.
- Always: leading `search` icon, trailing clear (`x`) when populated, optional voice/scan affordance on customer app.

**States**
Default · Focused (ring + expanded suggestions) · Typing (inline spinner) · Results · No results (inline empty state) · Disabled.

**Accessibility**

- `role="searchbox"` / `<input type="search">`; labeled "Search menu" etc.
- Combobox pattern: `aria-expanded`, `aria-controls`, `aria-activedescendant` for keyboard arrow navigation through results.
- Results count announced via `aria-live="polite"`.
- Clear button has `aria-label="Clear search"`; Esc clears/closes.

---

### 10.4 Cards (base)

**Purpose:** Generic content container; the structural primitive for menu items, dashboard widgets, and lists.

**Variants**

- _Elevation:_ flat (border only) · raised (`elevation.1`) · interactive (hover → `elevation.2`, pointer).
- _Padding:_ compact (`space.4`) · default (`space.6`).
- _Composition slots:_ media (top/left) · header · body · footer/actions.
- _State accent:_ optional left border or top accent in a status color.

**States:** Default · Hover (if interactive) · Focus-visible (if it's a link/button) · Selected (primary tint bg + `primary.600` border) · Disabled.

**Accessibility**

- If the whole card is clickable, it's a single `<a>`/`<button>` with an accessible name; avoid nested interactive elements that trap focus (or use the "card with action zone" pattern).
- `radius.lg`, border `neutral.200`; never communicate state by border color alone.

---

### 10.5 Menu Item Card

**Purpose:** The hero component of the customer app — present a dish so it's appetizing and orderable in one tap. Also used in the owner's menu manager (with edit affordances).

**Anatomy:** Food image (4:3, `radius.lg` top) · dietary/spicy tags · item name (`text.h5`) · short description (2-line clamp, `neutral.600`) · prep-time chip (`clock` + "15 min") · price (`text.price`) · Add button / quantity stepper · availability overlay.

**Variants**

- _Layout:_ vertical card (grid) · horizontal row (list — default for a11y & speed).
- _Context:_ customer (Add control) · admin/manager (edit/delete, drag handle, available toggle).
- _Media:_ image · image-less (color block + name fallback).
- _Tags:_ Veg / Non-veg / Vegan / Spicy / Bestseller / New / Discounted (`secondary` price strikethrough).

**States**

| State                  | Spec                                                                 |
| ---------------------- | -------------------------------------------------------------------- |
| Available              | Full color, Add enabled                                              |
| Unavailable / Sold out | Image desaturated 60%, "Sold out" badge (`error` tint), Add disabled |
| In cart                | Stepper shows quantity, card shows `primary.100` ring                |
| Adding                 | Add button → spinner → check micro-animation                         |
| Loading                | Skeleton (image block + 2 text bars + price bar)                     |

**Accessibility**

- Card name is the accessible label; price and prep time read as part of it.
- "Add" is a real button labeled "Add {item name} to order" (not just "+").
- Quantity stepper buttons labeled "Increase/Decrease quantity"; current qty announced via `aria-live`.
- Tags conveyed with text/icon, not color alone (e.g., a green dot **and** "Veg" label — important for veg/non-veg distinction in many markets).
- Sold-out state announced, not just visually dimmed (`aria-disabled`, "Sold out" text).

---

### 10.6 Category Navigation

**Purpose:** Let diners jump between menu sections (Starters, Mains, Drinks…) and let staff filter by category. Honors "minimal navigation."

**Variants**

- _Style:_ horizontal scrolling chip bar (mobile, sticky under header) · vertical anchored list (tablet/desktop side rail) · dropdown (overflow).
- _Sync:_ scroll-spy (active category updates as the user scrolls) · tap-to-scroll.
- _Count badges:_ optional item count per category.

**States:** Default · Hover · Active/Selected (`primary.600` text + 2px underline/pill `primary.100` bg) · Focus-visible · Disabled (empty category hidden or dimmed).

**Accessibility**

- Implemented as a `tablist`/`tab` or in-page navigation `<nav aria-label="Menu categories">` with anchor links.
- Active state uses underline/weight **and** color (not color only).
- Horizontal chip bar is keyboard-scrollable (arrow keys) and not a focus trap; sticky position must not cover focused content (scroll-margin).
- Touch targets 44px; chips have adequate spacing to avoid mis-taps.

---

### 10.7 Order Status Badge

**Purpose:** Communicate an order's lifecycle state at a glance — the visual backbone of real-time tracking, shown to customer, kitchen, waiter, cashier.

**Variants** (canonical, from §2.5)
`Placed` · `Accepted` · `Preparing` · `Ready` · `Served/Completed` · `Cancelled`.

- _Style:_ solid pill · soft (tint bg + colored text — **default**) · dot + label (compact, for table cells).
- _Size:_ sm (table) · md (cards).
- _With timer:_ optional countdown ("Ready in ~8 min") for Preparing.

**States:** Static display component; "states" = the six statuses. Animated transition (color crossfade + optional pulse on change) when status updates in real time.

**Accessibility**

- Always **icon + text + color** (never color-only — the core a11y rule for this product).
- Status changes announced via `aria-live="polite"` on the customer tracking view.
- Text contrast ≥ 4.5:1 (status `text` tokens chosen at 700 level to pass on tints).
- Don't encode status in a bare dot without an adjacent text label somewhere accessible.

---

### 10.8 Table QR Card

**Purpose:** A printable/exportable card representing a physical table's QR code — generated by the owner, placed on tables for diners to scan. Also the on-screen management tile.

**Anatomy:** QR code (high error-correction, quiet zone preserved) · table label ("Table 12") · branch/restaurant name · short URL/instruction ("Scan to view menu & order") · brand mark · status (active/inactive).

**Variants**

- _Mode:_ screen tile (in table-management grid) · print layout (A6/business-card, CMYK-safe, bleed marks).
- _Style:_ QR-only · QR + branding · table-tent (fold).
- _Bulk:_ single · sheet (multiple per page for printing).

**States:** Active (scannable, live) · Inactive/Disabled (greyed, "Reactivate") · Regenerating (new QR being minted — old invalidated warning) · Print preview.

**Accessibility**

- QR contrast: pure black on white, min module size, generous quiet zone — the most important "contrast" requirement here is **scannability**.
- Screen tile: QR `<img>` has alt "QR code for Table 12"; actions (Download, Print, Regenerate, Deactivate) are labeled buttons.
- Regenerate is a destructive-ish action → confirmation modal ("Old QR codes will stop working").
- Print layout includes a human-readable URL as fallback for un-scannable conditions.

---

### 10.9 Modal (Dialog)

**Purpose:** Focused interruption for confirmations, forms, and detail views requiring a decision before continuing (e.g., confirm order, edit menu item, delete confirmation).

**Variants**

- _Size:_ sm (320–400, confirm) · md (560, forms) · lg (720, detail) · full-screen (mobile).
- _Type:_ confirmation (icon + message + 2 actions) · form · informational · destructive (error-accented).
- _On mobile:_ promotes to full-screen or bottom sheet.

**Anatomy:** Scrim (`rgba(17,24,39,0.5)`) · panel (`radius.xl`, `elevation.4`) · header (title + close `x`) · scrollable body · sticky footer actions (Secondary left/cancel, Primary right).

**States:** Entering (scrim fade + panel scale 0.96→1, 200ms) · Open · Exiting · Loading (footer primary shows spinner, body may show overlay).

**Accessibility**

- `role="dialog"` `aria-modal="true"`, labeled by title (`aria-labelledby`) and described by body (`aria-describedby`).
- **Focus trap** while open; focus moves to first focusable (or close); returns to trigger on close.
- **Esc** closes (except destructive/blocking flows where it may be disabled with reason); scrim click closes for non-destructive only.
- Background scroll locked; content behind marked `aria-hidden`/`inert`.
- Min 44px close target; never close-by-scrim for forms with unsaved data without confirm.

---

### 10.10 Drawer (Sheet)

**Purpose:** Slide-in panel for secondary flows that keep context: order cart (customer), filters, order detail (staff), mobile nav, notifications.

**Variants**

- _Edge:_ right (detail/cart) · left (nav) · bottom (mobile sheet — primary for customer cart) · top (rare).
- _Size:_ sm (320) · md (400) · lg (520) · auto-height (bottom sheet).
- _Behavior:_ modal (with scrim) · non-modal (push content, dashboard filters).
- _Bottom sheet:_ drag handle, snap points (peek/half/full).

**Anatomy:** Optional scrim · panel (`radius.xl` on entering edges) · header (title + close) · body (scroll) · sticky footer (e.g., "Place Order — $42.50").

**States:** Entering (slide + scrim fade, 240ms ease-out) · Open · Dragging (bottom sheet) · Exiting · Loading.

**Accessibility**

- Same focus-trap/return + Esc rules as Modal when modal.
- `role="dialog"` with label; bottom sheet drag has keyboard equivalent (Esc to close, focusable close button).
- Sticky CTA stays reachable; safe-area insets respected on mobile (notch/home bar).
- Non-modal drawer doesn't trap focus but is still keyboard-reachable in DOM order.

---

### 10.11 Toast Notification

**Purpose:** Transient, non-blocking feedback — "Order placed," "Item saved," "Payment received," "Connection lost." Critical for real-time order events on staff screens.

**Variants**

- _Semantic:_ success · info · warning · error.
- _Content:_ message-only · title + message · with action ("Undo," "View order") · with progress (auto-dismiss bar).
- _Persistence:_ auto-dismiss (4s default, 6s with action) · persistent (errors requiring acknowledgment).
- _Real-time:_ "New order #1042" toast on kitchen screen with sound/vibration option.

**Anatomy:** Leading status icon · text · optional action button · close `x` · auto-dismiss progress line. Stacked top-right (desktop) / top-center (mobile), max 3 visible, `z.toast`.

**States:** Entering (slide+fade) · Visible · Paused (on hover/focus — timer pauses) · Exiting · Stacked/collapsed (overflow → "+2 more").

**Accessibility**

- `role="status"` (`aria-live="polite"`) for success/info; `role="alert"` (`assertive`) for errors.
- Auto-dismiss **pauses on hover/focus** and respects `prefers-reduced-motion` (no slide, just fade).
- Action and close are keyboard-reachable; toast must not steal focus.
- Color + icon + text (not color-only); minimum 4s, and meaningful toasts also persist in a notification center so they aren't missed.
- Never the _only_ place critical info appears (orders also live in the order list).

---

### 10.12 Data Table

**Purpose:** Dense, scannable display of records — orders, menu items, transactions, staff, audit logs, reports. Backbone of the dashboard.

**Variants**

- _Density:_ comfortable (52px rows) · compact (40px rows).
- _Features (composable):_ sortable headers · column filters · global search · row selection (checkbox) · row actions (kebab menu) · expandable rows · sticky header · sticky first column · pinned summary row (totals for accounting).
- _Cell types:_ text · numeric (right-aligned, tabular) · currency · status badge · avatar+name · date/time · actions · progress.
- _Responsive:_ below `md` collapses to stacked cards (label:value pairs).

**States**

- _Table:_ loading (skeleton rows) · empty (empty-state component) · error (retry) · loaded.
- _Row:_ default · hover (`neutral.50`) · selected (`primary.50`) · expanded · disabled · new-arrival highlight (brief `primary.100` flash for real-time inserts).
- _Header cell:_ sortable default / ascending / descending / active-filter.

**Accessibility**

- Semantic `<table>` with `<th scope>`, `<caption>`/`aria-label`.
- Sort state via `aria-sort`; sort controls are buttons.
- Selection: header checkbox = "select all (page)"; selected count announced via `aria-live`.
- Keyboard: tab to interactive cells; arrow-key grid nav optional but recommended for power users.
- Right-align numbers; never convey status by color cell-fill alone (use the badge).
- Zebra/hover are enhancements; borders carry structure for low-vision users.

---

### 10.13 Dashboard Cards (Stat / KPI / Widget)

**Purpose:** Summarize key metrics on role dashboards — Revenue, Orders, Popular Items, Expenses, Profit, Active Tables, Pending Payments, Support Tickets.

**Variants**

- _Type:_ stat/KPI (big number + label + delta) · trend (KPI + sparkline/mini-chart) · list widget (top-N items) · progress (goal vs actual) · breakdown (mini donut/bar).
- _Accent:_ neutral · status-tinted left accent (e.g., expenses error-tinted, revenue success-tinted).
- _Size:_ 1/2/3/4-column spans within the 12-col grid.

**Anatomy:** Eyebrow label (`text.overline`) · primary value (`text.display`/`h1`, tabular) · delta chip (▲ +12% success / ▼ −4% error) vs prior period · context line ("vs last week") · optional icon · optional chart · optional "View report" link footer.

**States:** Loading (skeleton: label bar + big number block) · loaded · empty ("No data yet") · error · interactive (hover → `elevation.2`, click → detail).

**Accessibility**

- Delta meaning conveyed by icon (▲/▼) + sign + label, not red/green alone.
- Big number has an accessible label tying value to metric ("Today's revenue: $1,240, up 12% vs yesterday").
- Sparkline charts are decorative-enhancement; the number is the truth and must be in text.
- Sufficient contrast for the large value (`neutral.900`).

---

### 10.14 Tabs

**Purpose:** Switch between peer views within a context — order states (All/Active/Ready/Completed), report periods (Daily/Monthly), settings sections.

**Variants**

- _Style:_ underline (default) · pill/segmented (filter-like, e.g., order status filter) · enclosed.
- _Alignment:_ start · full-width (equal, mobile) · scrollable (overflow).
- _Affix:_ with count badge (e.g., "Active 12"), with icon.

**States:** Default · Hover · Active/Selected (`primary.600` text + 2px underline, or filled pill) · Focus-visible · Disabled · with-badge.

**Accessibility**

- ARIA `tablist`/`tab`/`tabpanel`; `aria-selected`; roving tabindex (arrow keys move between tabs, Tab moves into panel).
- Active conveyed by weight + underline + color (not color alone).
- Scrollable tabs keep the active tab in view and remain keyboard-operable.
- Each panel labeled by its tab (`aria-labelledby`).

---

### 10.15 Dropdown (Menu / Select)

**Purpose:** Two roles — (a) **action menu** (row kebab: Edit/Duplicate/Delete) and (b) **select** (choose category, branch, status, currency).

**Variants**

- _Trigger:_ button · icon (kebab) · select field (with chevron) · avatar (account menu).
- _Content:_ single-select · multi-select (checkboxes) · action list · grouped (section headers + dividers) · with search (long lists, e.g., menu items) · with icons/descriptions.
- _Item states:_ default · hover · selected (check) · disabled · destructive (error text).

**States:** Closed · Open (`elevation.2`, `radius.md`) · Focused item · Loading options · Empty ("No results") · Error.

**Accessibility**

- Action menu = `menu`/`menuitem` pattern; Select = `listbox`/`combobox` pattern (don't mix).
- `aria-expanded`, `aria-haspopup`; arrow keys navigate, Enter selects, Esc closes, Home/End jump, type-ahead.
- Focus returns to trigger on close; selected option announced.
- Min 44px item height on touch; positioned to stay within viewport (flip/shift); never clipped by overflow.
- Destructive items get confirmation if irreversible.

---

### 10.16 Avatar

**Purpose:** Represent a user, staff member, or restaurant — account menu, staff lists, order assignment, audit logs.

**Variants**

- _Content:_ image · initials (auto from name) · icon (fallback) · restaurant logo.
- _Size:_ xs 24 · sm 32 · md 40 (default) · lg 48 · xl 64.
- _Shape:_ circle (`radius.full`, default) · rounded-square (restaurants/brands).
- _Status dot:_ online/active · away · offline · busy (bottom-right, white-ringed).
- _Group:_ stacked avatar group with "+N" overflow (e.g., staff on a shift).

**States:** Loaded · loading (skeleton circle) · image-error → initials fallback · interactive (focus ring when it's a menu trigger).

**Accessibility**

- Image `alt` = person/restaurant name; initials avatars have `aria-label` with full name; decorative-only avatars `aria-hidden`.
- Status dot meaning available as text/`aria-label` (not color-only).
- Initials background colors auto-assigned from a contrast-safe palette (text ≥ 4.5:1).
- If interactive, it's a real button with a 44px hit area.

---

### 10.17 Pagination

**Purpose:** Navigate large record sets — orders, transactions, menu items, audit logs.

**Variants**

- _Style:_ numbered pages (with first/last/prev/next, truncated `1 … 4 5 6 … 20`) · prev/next only · load-more button · infinite scroll (customer menu).
- _With:_ page-size selector (10/25/50/100) · result range text ("Showing 1–25 of 312").

**States:** Default · current page (filled `primary.600`/active) · hover · focus-visible · disabled (prev on page 1, next on last) · loading (next page fetching).

**Accessibility**

- Wrapped in `<nav aria-label="Pagination">`; current page `aria-current="page"`.
- Prev/Next labeled ("Previous page"); disabled buttons use `aria-disabled` and are not focusable traps.
- Page change announces new range via `aria-live`.
- Infinite scroll provides an accessible "Load more" fallback and doesn't trap keyboard users.
- 44px targets; current page distinguished by more than color (weight/fill).

---

### 10.18 Empty State

**Purpose:** Guide users when there's no data — first-run (no menu items, no orders yet), filtered-to-zero, or cleared lists. Supports onboarding ("Background content & work required").

**Variants**

- _Context:_ first-use/onboarding (illustration + CTA "Add your first menu item") · no-results (search/filter → "Clear filters") · cleared/done ("No pending orders 🎉") · error-empty (load failed → "Retry") · permission ("You don't have access").
- _Size:_ inline (in a card/table) · full-page.

**Anatomy:** Illustration or icon (`icon.xl`, muted) · title (`text.h4`) · supportive description (`neutral.600`, ≤2 lines) · primary CTA · optional secondary link.

**States:** Static; the variant _is_ the state. Loading precedes it (don't flash empty during fetch — show skeleton first).

**Accessibility**

- Title is a real heading in the page outline.
- CTA is a labeled button/link; not illustration-only.
- Illustration `aria-hidden`; meaning lives in the text.
- Distinguish "empty because new" from "empty because filtered" from "empty because error" — different copy + action.

---

### 10.19 Loading State

**Purpose:** Communicate progress and prevent uncertainty during fetches, submissions, and real-time waits — critical given the "internet connectivity / stable network" constraints.

**Variants**

- _Skeleton:_ content-shaped placeholders (`neutral.100` base, shimmer `neutral.200`) — **preferred** for initial loads (menu, tables, dashboards).
- _Spinner:_ `sm`/`md`/`lg`, used in buttons and small inline waits.
- _Progress bar:_ determinate (uploads — food images, bulk import) · indeterminate (top-of-page route loading).
- _Overlay:_ dimmed panel + spinner for blocking actions (saving).
- _Inline/optimistic:_ show the action as done immediately, reconcile on response (add-to-order).
- _Connection state:_ "Reconnecting…" banner for dropped WebSocket (real-time orders).

**States:** Pending → Success (content/skeleton swap, brief fade) · Error (replace with retry/error state) · Timeout ("Taking longer than usual… Retry").

**Accessibility**

- Loading regions `aria-busy="true"`; spinners labeled (`role="status"`, "Loading orders").
- Respect `prefers-reduced-motion`: shimmer/spin reduce to a static or gentle pulse.
- Determinate progress exposes `aria-valuenow/min/max`.
- Skeletons mirror final layout to prevent shift (CLS); don't block keyboard focus on still-loading controls.
- Always resolve to success **or** an explicit error — never a silent infinite spinner.

---

## 11. Appendix — Token Naming & Figma Setup

**Naming convention:** `category.role.scale` (e.g., `color.primary.600`, `space.4`, `radius.lg`, `text.h2`, `elevation.2`). This maps cleanly to Figma Variables (mode-aware for light/dark) and to CSS custom properties / Tailwind theme keys.

**Figma structure recommendation**

1. **Variables collections:** `Color/Primitives` → `Color/Semantic` (aliases: `surface.card`, `text.primary`, `status.*`) with **Light** and **Dark** modes. `Number` collection for `space.*`, `radius.*`, `size.*`. `String` for type families.
2. **Text styles** from §3 (`Display`, `H1–H5`, `Body LG/MD`, `Caption`, `Overline`, `Price`, `Mono`).
3. **Effect styles** from §6 (`Elevation 1–5`, `Focus Ring`).
4. **Grid styles:** Customer 4-col/16, Tablet 8-col, Dashboard 12-col/24, plus the breakpoint frames from §8.
5. **Components:** build each §10 component as a Figma component set with variant properties matching the headings (Hierarchy, Size, State, etc.), wired to semantic variables so a mode swap themes the whole library.
6. **Two pages / two themes:** `Customer App` (light, mobile frames, food-forward) and `Admin Dashboard` (desktop frames, dense, dark-mode-ready).

**Token → code mapping (engineering handoff)**

- Tailwind theme keys derive directly: `colors.primary[600]`, `spacing[4]`, `borderRadius.lg`, `boxShadow.elevation-2`.
- Ship tokens as a single `tokens.json` (W3C Design Tokens format) → consumed by both Figma (Tokens Studio) and the codebase to keep parity.

**Accessibility acceptance checklist (per component, definition-of-done)**

- [ ] AA contrast for all text & meaningful UI (3:1 large / 4.5:1 normal).
- [ ] Visible focus state (`focus.ring`) on every interactive element.
- [ ] Full keyboard operability; logical focus order; no traps (except intentional modal trap).
- [ ] State conveyed by more than color (icon/text/shape).
- [ ] Touch targets ≥ 44×44px.
- [ ] Correct ARIA roles/labels; live regions for async/real-time updates.
- [ ] `prefers-reduced-motion` honored.
- [ ] Honest empty/loading/error states — never silent or fake.

---

_End of specification — eMenu Design System v1.0._
