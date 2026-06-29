# eMenu — Low-Fidelity Wireframes

**Version:** 1.0
**Status:** Foundation Release
**Last updated:** 2026-06-21
**Owner:** Product Design
**Companion docs:** [Requirements](./eMenuRequirementsDocument.md) · [Design System](./eMenuDesignSystem.md) · [User Flows](./eMenuUserFlows.md)

> Low-fidelity ASCII wireframes for the launch screen set. Each screen specifies **layout, sections, components used, data displayed**, and both **mobile and desktop** versions. Component annotations reference the Design System component library by number (e.g., `[§10.1 Button/Primary]`) and tokens (e.g., `space.6`, `text.h3`) so engineering and design read from one source.

---

## How to read these wireframes

**ASCII box legend**

```
┌─┐ └─┘   container / card / panel (radius.lg unless noted)
│   │     edges
▓▓▓▓▓     image / media placeholder
░░░░░     skeleton / muted / disabled region
[ Label ] button            ( Label ) chip / pill / tag
[______]  input field       (•) (○)   radio        [x] [ ] checkbox
≡         nav / drag handle  ⌕         search        ⌄ chevron / dropdown
●         status dot         ⓘ ⚠ ✓ ✕   status icons   ★ rating / bestseller
→ ⤷       navigation / overlay         «n»  annotation reference
```

**Annotation format:** `«A» [§10.5 Menu Item Card · list variant]` — the circled letter maps a region in the wireframe to a component + variant + relevant tokens.

**Two platforms per screen**

- **Mobile** — Customer App baseline 360–480px (single column, sticky thumb-zone CTA). Staff roles render on tablet using the mobile-plus layout.
- **Desktop** — Admin Dashboard 1280px (256px left nav + fluid content). Customer App on desktop stays a centered ≤480px phone column (Design System §7).

**Order-status vocabulary** (locked, §2.5): `Placed · Accepted · Preparing · Ready · Served/Completed · Cancelled`. Always rendered as **icon + text + color** (`[§10.7 Order Status Badge]`).

---

## Table of Contents

**Customer App**

1. [Menu Screen](#c1-menu-screen)
2. [Item Details](#c2-item-details)
3. [Cart](#c3-cart)
4. [Order Tracking](#c4-order-tracking)

**Admin Dashboard** 5. [Login](#a1-login) 6. [Dashboard](#a2-dashboard) 7. [Menu Management](#a3-menu-management) 8. [Order Management](#a4-order-management) 9. [Sales Reports](#a5-sales-reports) 10. [Settings](#a6-settings)

---

---

# Customer App

Light-only, food-forward, one-handed. Body text 16px min. Primary CTA lives in the sticky bottom bar (thumb zone).

---

## C1. Menu Screen

The landing screen after a QR scan — the most-visited surface in the product.

**Layout:** single scrolling column; sticky restaurant header + category chip bar at top; sticky **Order Bar** at bottom. Content max 480px centered on desktop.

**Sections:** (1) Restaurant header w/ table context · (2) Search · (3) Sticky category chip bar (scroll-spy) · (4) Repeating category sections of item cards · (5) Sticky order bar.

**Components used:** `[§10.3 Search]`, `[§10.6 Category Navigation · chip bar]`, `[§10.5 Menu Item Card · list]`, `[§10.1 Button]`, `[§10.10 Drawer · bottom sheet]` (cart), `[§10.19 Loading · skeleton]`, `[§10.18 Empty State]`.

**Data displayed:** restaurant name, branch, table #; per item — image, name, 2-line description, dietary/spicy tags, prep-time, price, availability, in-cart qty; live cart count + subtotal.

### Mobile (360–480px)

```
┌────────────────────────────────┐
│ 🍴 Saffron Kitchen        ⌄    │ «A» Header: restaurant name + branch switch
│ Table 12 · Dine-in             │     [text.h5 + text.caption]
├────────────────────────────────┤
│ ⌕ Search menu            (✕)  │ «B» [§10.3 Search · inline, debounced 250ms]
├────────────────────────────────┤
│ (Starters)(Mains)(Drinks)(...) │ «C» [§10.6 Category chips · sticky, scroll-spy]
├────────────────────────────────┤      active = primary.600 text + pill
│  STARTERS                      │     [text.overline] section anchor
│ ┌────────────────────────────┐ │
│ │▓▓▓▓│ Spring Rolls      ★   │ │ «D» [§10.5 Menu Item Card · list]
│ │▓▓▓▓│ Crispy veg, sweet... │ │     image 4:3 · name [text.h5]
│ │    │ ●Veg ⏱12m     $6.50  │ │     tags(icon+text) · ⏱prep · price[text.price]
│ │    │              [ Add ] │ │     [§10.1 Button/Primary · sm]
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │▓▓▓▓│ Chicken Wings        │ │
│ │▓▓▓▓│ Spicy, 6 pcs         │ │ «E» In-cart item shows stepper, not Add:
│ │    │ ●Non-veg ⏱15m $9.00 │ │        [ − ] 2 [ + ]  + primary.100 ring
│ │    │          [ − ]1[ + ] │ │     [§10.5 · state: In cart]
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │░░░░│ ░░░░░░░░░░            │ │ «F» Skeleton while loading
│ │░░░░│ ░░░░░  ░░░░░          │ │     [§10.19 Loading · skeleton]
│ └────────────────────────────┘ │
│  MAINS                         │
│   ... (scroll) ...             │
│                                │
├────────────────────────────────┤
│  🛍  3 items      [ View order]│ «G» STICKY Order Bar [z.sticky]
│              $24.50  →         │     [§10.1 Button/Primary · lg full-width]
└────────────────────────────────┘     opens cart bottom sheet «C3»
```

`«SoldOut»` state per card: image desaturated 60%, `(Sold out)` badge in error tint, Add disabled (`[§10.5 · Unavailable]`).

### Desktop (≤480px centered column)

```
        ╔══════════════════════════════════════╗
        ║   ┌──────────────────────────────┐    ║  Phone-shaped column centered
        ║   │ 🍴 Saffron Kitchen      ⌄   │    ║  on neutral.50 canvas
        ║   │ Table 12 · Dine-in           │    ║
        ║   ├──────────────────────────────┤    ║  Identical structure to mobile;
        ║   │ ⌕ Search menu          (✕)  │    ║  never exceeds 480px (§7).
        ║   ├──────────────────────────────┤    ║  Cart MAY render as right-side
        ║   │ (Starters)(Mains)(Drinks)... │    ║  drawer instead of bottom sheet
        ║   ├──────────────────────────────┤    ║  at ≥md, but column stays fixed.
        ║   │ STARTERS                     │    ║
        ║   │ ┌──────────────────────────┐ │    ║
        ║   │ │▓▓▓│ Spring Rolls  $6.50 │ │    ║
        ║   │ │▓▓▓│ ●Veg ⏱12m   [Add] │ │    ║
        ║   │ └──────────────────────────┘ │    ║
        ║   │  ... (scroll) ...            │    ║
        ║   ├──────────────────────────────┤    ║
        ║   │ 🛍 3 items   [ View order ] │    ║  Sticky bar pinned to column
        ║   │            $24.50  →        │    ║
        ║   └──────────────────────────────┘    ║
        ╚══════════════════════════════════════╝
```

---

## C2. Item Details

Opens as a **bottom sheet** (mobile) / centered modal or in-column sheet (desktop) when a card is tapped. The "one decision per screen" moment: configure and add.

**Layout:** sheet with drag handle; large hero image; scrollable body; sticky add-to-order footer.

**Sections:** (1) Hero media · (2) Title/price/tags/prep · (3) Description · (4) Options/modifiers (size, add-ons) · (5) Special instructions · (6) Quantity · (7) Sticky add footer.

**Components used:** `[§10.10 Drawer · bottom sheet]`, `[§10.15 Dropdown/Select]` or radio for options, `[§10.2 Input · textarea]`, quantity stepper, `[§10.1 Button/Primary · xl]`, `[§10.7 Badge]` (sold-out).

**Data displayed:** image, name, full description, price (+ option deltas), prep time, dietary tags, modifier groups w/ prices, computed line total.

### Mobile (bottom sheet)

```
┌────────────────────────────────┐
│              ▭ (drag handle)   │ «A» [§10.10 bottom sheet · radius.xl, elevation.4]
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ✕ │ «B» Hero image 4:3 + close (44px target)
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
├────────────────────────────────┤
│ Chicken Wings          $9.00   │ «C» name[text.h4] · price[text.price]
│ ●Non-veg  (Spicy)  ⏱ 15 min   │     tags[icon+text] · prep chip
│                                │
│ Crispy fried wings tossed in   │ «D» Description [text.body-lg, ≤75ch]
│ house buffalo sauce. Served    │
│ with blue-cheese dip.          │
├────────────────────────────────┤
│ SIZE *                         │ «E» Modifier group [§10.15 / radio]
│ (•) 6 pcs            +$0.00    │     required* · price delta right-aligned
│ (○) 12 pcs          +$7.00    │     [text.body-strong label]
│                                │
│ ADD-ONS                        │ «F» Multi-select [x] checkboxes
│ [x] Extra dip       +$1.00    │
│ [ ] Extra spicy     +$0.00    │
├────────────────────────────────┤
│ Special instructions           │ «G» [§10.2 Input · textarea]
│ [__________________________]   │     "No onions, allergy to…"
├────────────────────────────────┤
│ Quantity        [ − ] 2 [ + ] │ «H» Stepper (aria-live qty)
├────────────────────────────────┤
│ [   Add 2 to order · $20.00  ] │ «I» Sticky [§10.1 Button/Primary · xl full]
└────────────────────────────────┘     label shows qty + live line total
```

`«SoldOut»`: footer replaced by disabled `[ Sold out ]` + "Notify when available" link.

### Desktop (centered modal, ≤560px)

```
   ┌──────────────────────────────────────────┐
   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ✕ │  [§10.9 Modal · md, elevation.4]
   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     │  scrim rgba(17,24,39,.5)
   ├──────────────────────────────────────────┤  Same sections as mobile, wider.
   │ Chicken Wings                     $9.00  │  Focus trapped; Esc closes.
   │ ●Non-veg  (Spicy)  ⏱ 15 min             │  Modifiers may use 2-col layout.
   │ Crispy fried wings tossed in house...    │
   │ ── SIZE * ─────────────────────────────  │
   │ (•) 6 pcs  +$0.00   (○) 12 pcs  +$7.00  │
   │ ── ADD-ONS ────────────────────────────  │
   │ [x] Extra dip +$1.00  [ ] Extra spicy   │
   │ Special instructions [________________]  │
   ├──────────────────────────────────────────┤
   │ Qty [−] 2 [+]      [ Add 2 · $20.00 ]   │  Footer: Secondary-left / Primary-right
   └──────────────────────────────────────────┘
```

---

## C3. Cart

The bottom sheet / drawer where the order is reviewed and placed. Contains the single most important CTA in the customer journey.

**Layout:** sheet; scrollable line-item list; fixed summary + place-order footer.

**Sections:** (1) Header (table context) · (2) Line items (edit/remove) · (3) Order notes · (4) Totals (subtotal, tax) · (5) Sticky Place Order.

**Components used:** `[§10.10 Drawer · bottom sheet]`, line row w/ stepper, `[§10.2 Input · textarea]`, `[§10.1 Button/Primary · xl]`, `[§10.18 Empty State]` (empty cart), `[§10.11 Toast]` (errors/undo).

**Data displayed:** each line — name, options, qty, unit & line price; subtotal; tax (from owner config); total; table #; ETA hint.

### Mobile (bottom sheet)

```
┌────────────────────────────────┐
│ ▭                              │
│ Your order · Table 12      ✕  │ «A» Header [text.h4]
├────────────────────────────────┤
│ 2× Chicken Wings       $20.00 │ «B» Line item row
│    6 pcs, extra dip            │     name[text.body-strong] · options[caption]
│    [ − ] 2 [ + ]      (Remove) │     stepper + remove (ghost/destructive link)
│ ────────────────────────────── │     line total right-aligned (tnum)
│ 1× Spring Rolls         $6.50 │
│    [ − ] 1 [ + ]      (Remove) │
│ ────────────────────────────── │
│ + Add more items               │ «C» Link back to menu [§10.1 Link]
├────────────────────────────────┤
│ Order notes                    │ «D» [§10.2 Input · textarea]
│ [__________________________]   │     allergies / instructions
├────────────────────────────────┤
│ Subtotal               $26.50 │ «E» Totals block (right-aligned tnum)
│ Tax (13%)               $3.45 │     tax label from owner config
│ Total                  $29.95 │     [text.body-strong / h5]
│ ⏱ Est. ready ~18 min          │     ETA hint [caption]
├────────────────────────────────┤
│ [    Place Order · $29.95    ] │ «F» Sticky [§10.1 Button/Primary · xl full]
└────────────────────────────────┘     loading→spinner; idempotent submit
```

`«Empty»` state: `[§10.18 Empty State]` — "Your order is empty" + `[ Browse menu ]`.
`«Error»` state: inline error above CTA, cart preserved, **Try again** (toast `role=alert`).

### Desktop (right drawer or in-column sheet, ≤480px)

```
                          ┌──────────────────────────┐
                          │ Your order · Table 12  ✕ │  [§10.10 Drawer · right, md]
                          ├──────────────────────────┤  OR in-column bottom sheet,
                          │ 2× Chicken Wings  $20.00│  matching the 480px column.
                          │   6 pcs, extra dip       │
                          │   [−] 2 [+]    (Remove) │  Same sections, vertical.
                          │ ──────────────────────── │
                          │ 1× Spring Rolls   $6.50 │
                          │   [−] 1 [+]    (Remove) │
                          │ + Add more items         │
                          │ Notes [________________] │
                          ├──────────────────────────┤
                          │ Subtotal          $26.50│
                          │ Tax (13%)          $3.45│
                          │ Total             $29.95│
                          ├──────────────────────────┤
                          │ [  Place Order·$29.95 ] │  sticky footer
                          └──────────────────────────┘
```

---

## C4. Order Tracking

The primary return screen after placing — real-time status. The product's core promise ("real-time order tracking").

**Layout:** single column; prominent current-status block; vertical status timeline; itemized summary; secondary actions.

**Sections:** (1) Order header (# + status badge) · (2) Live status hero (ETA) · (3) Status timeline · (4) Order summary · (5) Action buttons.

**Components used:** `[§10.7 Order Status Badge · with timer]`, status timeline (custom, status tokens), `[§10.4 Card]`, `[§10.1 Button · Secondary]`, `[§10.19 Loading · connection banner]`, `[§10.11 Toast]`.

**Data displayed:** order #, current status, ETA/"Ready in ~Nmin", timeline with timestamps per state, line items + total, table #, connection state.

### Mobile

```
┌────────────────────────────────┐
│ ← Order #1042          🔔      │ «A» Header: order # [text.mono] + back
├────────────────────────────────┤
│  ⚠ Reconnecting…               │ «B» Connection banner (only on WS drop)
├────────────────────────────────┤      [§10.19 · connection state]
│      🔥  PREPARING              │ «C» Status hero [§10.7 Badge · lg + timer]
│      Ready in ~8 min           │     icon+text+color (status.preparing)
│      ████████░░░░░  est.        │     progress vs prep estimate
├────────────────────────────────┤
│  ✓ Placed          12:01 PM   │ «D» Status timeline (vertical)
│  │                             │     done = success ●; current = pulsing;
│  ✓ Accepted        12:02 PM   │     future = neutral ○
│  │                             │     aria-live announces transitions
│  ● Preparing       12:04 PM   │
│  │                             │
│  ○ Ready             —         │
│  │                             │
│  ○ Served            —         │
├────────────────────────────────┤
│ ORDER SUMMARY                  │ «E» [§10.4 Card] itemized (read-only)
│ 2× Chicken Wings       $20.00 │
│ 1× Spring Rolls         $6.50 │
│ Total                  $29.95 │
├────────────────────────────────┤
│ [ Add more items ]             │ «F» [§10.1 Button/Secondary]
│ [ Request bill ]  [Call waiter]│     secondary actions
└────────────────────────────────┘
```

`«Cancelled»`: hero shows `✕ Cancelled` (error), reason line, `[ Contact staff ]`.
`«Ready»`: hero `🔔 Ready` (success) + "Your food is on its way".

### Desktop (≤480px centered column)

```
        ┌──────────────────────────────────────┐
        │ ← Order #1042                   🔔   │  Centered phone column.
        ├──────────────────────────────────────┤  Identical to mobile.
        │        🔥 PREPARING · ~8 min         │  Status hero stays the focal
        │        ████████░░░░░                  │  block. Timeline + summary
        ├──────────────────────────────────────┤  stack vertically.
        │ ✓ Placed 12:01 · ✓ Accepted 12:02   │
        │ ● Preparing 12:04 · ○ Ready · ○ Served│
        ├──────────────────────────────────────┤
        │ 2× Wings $20.00 · 1× Rolls $6.50     │
        │ Total $29.95                          │
        ├──────────────────────────────────────┤
        │ [Add more]  [Request bill] [Call]    │
        └──────────────────────────────────────┘
```

---

---

# Admin Dashboard

Near-monochrome, dense, all-day. 14px body default; borders over shadows. App shell = 256px left nav + content, collapsing to a 72px rail (`lg`) then a drawer (`md`). Everything below is role-gated by the Permissions Matrix (Requirements §6).

---

## A1. Login

Entry to the dashboard for every staff role. Email+password or Google OAuth.

**Layout:** centered single card on canvas (mobile + desktop); optional split with brand panel on wide screens.

**Sections:** (1) Brand/logo · (2) Form (email, password) · (3) OAuth · (4) Helper links.

**Components used:** `[§10.2 Input · email/password w/ reveal]`, `[§10.1 Button/Primary · lg]`, `[§10.1 Button/Secondary]` (Google), `[§10.16 Avatar]` (brand mark), `[§10.11 Toast]` (errors), `[§10.19 Loading]` (button spinner).

**Data displayed:** brand, form fields, validation/error messages, "forgot password", terms link.

### Desktop (split, ≥lg)

```
┌───────────────────────────────┬────────────────────────────────────┐
│                               │                                    │
│   🍴 eMenu                    │        Sign in to eMenu            │ «A» Form card [§10.4 Card]
│                               │                                    │     centered, max 400px
│   "Run your restaurant        │   Email                            │ «B» [§10.2 Input · email]
│    from one dashboard."       │   [______________________]        │     top-label, 40px
│                               │                                    │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │   Password               (show)   │ «C» [§10.2 Input · password
│   ▓▓ brand illustration ▓▓    │   [______________________]        │     + reveal toggle]
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │              (Forgot password?)   │ «D» [§10.1 Link]
│                               │                                    │
│   (primary.50 wash panel,     │   [        Sign in        ]       │ «E» [§10.1 Button/Primary·lg
│    food photography)          │                                    │     full; loading→spinner]
│                               │   ──────── or ────────             │
│                               │   [  G  Continue with Google  ]   │ «F» [§10.1 Button/Secondary]
│                               │                                    │     OAuth
│                               │   ⚠ Invalid email or password.    │ «G» Error [§10.11 / inline
│                               │                                    │     role=alert]
└───────────────────────────────┴────────────────────────────────────┘
```

### Mobile

```
┌────────────────────────────────┐
│                                │
│         🍴 eMenu               │ «A» Brand mark centered
│      Sign in to eMenu          │     [text.h2]
│                                │
│  Email                         │ «B» [§10.2 Input · lg 48px]
│  [__________________________]  │
│                                │
│  Password             (show)   │ «C» password + reveal
│  [__________________________]  │
│           (Forgot password?)   │
│                                │
│  [         Sign in         ]   │ «D» [§10.1 Button/Primary · lg full]
│                                │
│  ───────── or ─────────        │
│  [  G  Continue with Google ]  │ «E» OAuth
│                                │
│  ⚠ Invalid email or password.  │ «F» inline error
└────────────────────────────────┘
```

`«Loading»`: Sign-in button shows spinner, `aria-busy`, fields locked.
`«Error»` paths: bad credentials (inline), OAuth failure (toast), locked account (persistent banner).

---

## A2. Dashboard

Role home. Shown here as the **Owner** view (revenue, orders, popular, expenses, profit — Requirements §8). Other roles render a subset of the same widget grid.

**Layout:** app shell (left nav + content); KPI card row; charts + lists below in 12-col grid.

**Sections:** (1) Left nav · (2) Top bar (search, branch switch, notifications, avatar) · (3) KPI stat row · (4) Revenue trend chart · (5) Live active orders · (6) Popular items / expenses widgets.

**Components used:** `[§10.13 Dashboard Cards · stat/trend/list]`, `[§10.12 Data Table]` (active orders), `[§10.3 Search · ⌘K]`, `[§10.15 Dropdown]` (branch switch), `[§10.16 Avatar]`, `[§10.7 Badge]`, `[§10.14 Tabs]`.

**Data displayed:** today's revenue + delta, order count, active tables, pending payments; revenue sparkline/trend; active orders (table, status, total, time); top-N items; expense total/profit.

### Desktop (1280px)

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ 🍴 eMenu │ ⌕ Search (⌘K)        Main St ⌄   🔔³   (◑ Owner) ⌄          │ «A» Top bar: global search,
│          ├──────────────────────────────────────────────────────────────┤     branch switch, notifs[§10.7],
│ ▣ Dash   │  Dashboard                              Today · Jun 21  ⌄     │     avatar menu[§10.16]
│ ▤ Orders │ ┌──────────┐┌──────────┐┌──────────┐┌──────────┐             │ «B» Left nav [256px], active
│ 🍴 Menu  │ │ REVENUE  ││ ORDERS   ││ ACTIVE   ││ PENDING  │             │     item = primary tint + bar
│ ⌗ Tables │ │ $1,240   ││ 86       ││ TABLES   ││ PAY      │             │
│ 🏢 Branch│ │ ▲ +12%   ││ ▲ +8%    ││ 14 / 20  ││ $310 (4) │             │ «C» KPI row [§10.13 stat
│ 💰 Acct  │ │ vs yest. ││ vs yest. ││          ││ ▼        │             │     +delta chip ▲/▼ + sign,
│ 📊 Analy │ └──────────┘└──────────┘└──────────┘└──────────┘             │     not color-only · tnum]
│ 👥 Staff │ ┌────────────────────────────────┐┌──────────────────────┐  │
│ ⚙ Setting│ │ REVENUE — last 7 days          ││ POPULAR ITEMS        │  │ «D» Trend card [§10.13 trend
│          │ │     ╱╲    ╱╲╱                   ││ 1. Chicken Wings  142│  │     · sparkline + value-as-text]
│ ───────  │ │ ╱╲╱  ╲╱╲╱                       ││ 2. Margherita     118│  │ «E» List widget [§10.13 list]
│ (◑ logo) │ │ Mon Tue Wed Thu Fri Sat Sun     ││ 3. Cold Brew       97│  │
│          │ └────────────────────────────────┘└──────────────────────┘  │
│          │ ┌──────────────────────────────────────────────────────────┐│
│          │ │ ACTIVE ORDERS                          [All][Active][Ready]││ «F» [§10.14 Tabs] +
│          │ │ Order   Table  Items  Status        Total   Time          ││     [§10.12 Data Table]
│          │ │ #1042   T12    3      🔥Preparing    $29.95  2m            ││     status badge col[§10.7]
│          │ │ #1041   T07    5      🔔Ready         $52.00  8m   ●new    ││     new-arrival flash row
│          │ │ #1040   T03    2      ●Accepted       $18.50  1m            ││     numbers right-aligned tnum
│          │ └──────────────────────────────────────────────────────────┘│
└──────────┴──────────────────────────────────────────────────────────────┘
```

### Mobile (nav → drawer)

```
┌────────────────────────────────┐
│ ≡  Dashboard         🔔³  ◑   │ «A» Top bar: hamburger→nav drawer,
├────────────────────────────────┤     notifications, avatar
│ ┌────────────┐┌────────────┐   │ «B» KPI cards stack 1–2 col
│ │ REVENUE    ││ ORDERS     │   │     [§10.13 stat]
│ │ $1,240 ▲12%││ 86 ▲8%     │   │
│ └────────────┘└────────────┘   │
│ ┌────────────┐┌────────────┐   │
│ │ TABLES     ││ PENDING PAY │   │
│ │ 14/20      ││ $310 (4)   │   │
│ └────────────┘└────────────┘   │
│ ┌────────────────────────────┐ │
│ │ REVENUE 7d   ╱╲╱╲╱          │ │ «C» Trend card full-width
│ └────────────────────────────┘ │
│ ACTIVE ORDERS                  │ «D» Table COLLAPSES to cards
│ ┌────────────────────────────┐ │     (below md) [§10.12 responsive]
│ │ #1042 · T12      🔥Preparing│ │     label:value stacked
│ │ 3 items · $29.95 · 2m      │ │
│ ├────────────────────────────┤ │
│ │ #1041 · T07      🔔Ready    │ │
│ │ 5 items · $52.00 · 8m  ●new│ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

---

## A3. Menu Management

Owner/Manager surface to manage categories and items (`*` Manage Menu permission). Bulk import/export.

**Layout:** app shell; left category rail + item table/grid; editor opens in modal.

**Sections:** (1) Toolbar (search, add, bulk import/export, view toggle) · (2) Category list (reorderable) · (3) Items table/grid · (4) Item editor modal.

**Components used:** `[§10.12 Data Table]` or `[§10.5 Card · admin variant]` grid, `[§10.9 Modal · form]` (editor), `[§10.2 Inputs]`, `[§10.15 Dropdown]` (category/kebab), drag handle `[§10.6]`, availability toggle `[radius.full]`, `[§10.19 Progress]` (image upload, bulk import), `[§10.18 Empty State]`.

**Data displayed:** per item — image, name, category, price, prep time, tags, availability toggle; category names + item counts; bulk import results.

### Desktop

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ (nav)    │ Menu Management        ⌕ Search items   [Import][Export][+ Add]│ «A» Toolbar:
│          ├───────────────┬──────────────────────────────────────────────┤     search, bulk [§10.1],
│ 🍴 Menu  │ CATEGORIES    │ Items in "Starters"             ▦ grid │ ☰ list│     view toggle [§10.14]
│  active  │ ≡ Starters (8)│ ┌──────────────────────────────────────────┐  │
│          │ ≡ Mains   (14)│ │ ▓▓ Spring Rolls    Starters  $6.50  ⏱12  │  │ «B» Category rail:
│          │ ≡ Drinks  (9) │ │    ●Veg ★          [●ON ] (⋮)            │  │     drag-reorder ≡,
│          │ ≡ Desserts(5) │ ├──────────────────────────────────────────┤  │     count badge, +Add cat
│          │ [+ Add cat.]  │ │ ▓▓ Chicken Wings   Starters  $9.00  ⏱15  │  │
│          │               │ │    ●Non-veg (Spicy)[●ON ] (⋮)            │  │ «C» Items [§10.12 Table]:
│          │               │ ├──────────────────────────────────────────┤  │     thumb, name, cat, price,
│          │               │ │ ▓▓ Garlic Bread    Starters  $4.00  ⏱8   │  │     prep, tags, availability
│          │               │ │    ●Veg            [ OFF●] (⋮)  ░Sold out │  │     TOGGLE [radius.full],
│          │               │ └──────────────────────────────────────────┘  │     kebab (⋮) Edit/Dup/Delete
│          │               │ Showing 1–8 of 8                              │     [§10.15 Dropdown]
└──────────┴───────────────┴──────────────────────────────────────────────┘
                              ⤷ opens Item Editor modal on Add/Edit:
   ┌───────────────────── Edit item ─────────────────── ✕ ┐
   │ Image      [ ▓▓▓▓ ]  [ Upload ]  ████░ 60%            │ «D» [§10.9 Modal·form, md]
   │ Name *     [ Chicken Wings____________ ]              │     [§10.2 Inputs, validation]
   │ Category * [ Starters ⌄ ]   Price * [ $ 9.00 ]       │     currency prefix, prep number
   │ Prep time  [ 15 ] min       Tags [●Non-veg][Spicy +] │     [§10.19 upload progress]
   │ Desc       [ Crispy fried wings…________________ ]    │
   │ Available  [●ON ]                                     │
   │                              [ Cancel ]  [  Save  ]  │ «E» Footer: Secondary/Primary
   └──────────────────────────────────────────────────────┘
```

### Mobile

```
┌────────────────────────────────┐
│ ≡  Menu              [+ Add]   │ «A» Toolbar condensed
├────────────────────────────────┤
│ (Starters)(Mains)(Drinks)(...) │ «B» Categories → horizontal chips
├────────────────────────────────┤     [§10.6]
│ ⌕ Search items                 │
│ ┌────────────────────────────┐ │
│ │ ▓▓ Spring Rolls     $6.50 │ │ «C» Item rows (table→cards)
│ │ Starters ●Veg ⏱12  [●ON]⋮│ │     availability toggle + kebab
│ ├────────────────────────────┤ │
│ │ ▓▓ Chicken Wings    $9.00 │ │
│ │ Starters ●Nonveg   [●ON]⋮ │ │
│ ├────────────────────────────┤ │
│ │ ▓▓ Garlic Bread     $4.00 │ │
│ │ ░Sold out          [OFF]⋮ │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
   ⤷ Editor opens FULL-SCREEN (§10.9 mobile promotes to full-screen)
```

---

## A4. Order Management

Live order monitoring + action (Owner/Manager/Waiter/Kitchen views differ by permission). This is the Owner/Manager monitoring view; Kitchen KDS and Waiter floor are their own role flows (see User Flows §3, §4).

**Layout:** app shell; status tabs; orders table; detail drawer.

**Sections:** (1) Status filter tabs · (2) Search/filter bar · (3) Orders table (real-time) · (4) Order detail drawer (timeline, items, actions).

**Components used:** `[§10.14 Tabs · w/ counts]`, `[§10.12 Data Table · real-time]`, `[§10.10 Drawer · right detail]`, `[§10.7 Order Status Badge]`, `[§10.15 Dropdown]` (row actions), `[§10.11 Toast]` (new-order, sound), `[§10.17 Pagination]`.

**Data displayed:** order #, table, items count, status, total, elapsed time, assigned staff; detail — full items, timeline, customer notes, status controls.

### Desktop

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ (nav)    │ Orders   [All 86][Active 14][Ready 3][Completed][Cancelled]   │ «A» [§10.14 Tabs + counts]
│ ▤ Orders │ ⌕ Filter  Branch ⌄  Date ⌄  Status ⌄          🔔 sound: ON   │ «B» Filter bar [§10.3/§10.15]
│  active  ├──────────────────────────────────────────────────────────────┤     real-time alert toggle
│          │ Order  Table Items Status       Total   Placed   Staff    ⋮  │ «C» [§10.12 Data Table]
│          │ #1042  T12   3     🔥Preparing   $29.95  12:04   Kitchen   ⋮  │     sortable cols, status
│          │ #1041  T07   5     🔔Ready        $52.00  11:58   —         ⋮  │     badge[§10.7], kebab[§10.15]
│          │ #1040  T03   2     ●Accepted      $18.50  12:06   Kitchen   ⋮  │     ●new flash on insert
│          │ #1039  T15   4     ●Placed        $41.20  12:07   —      ●new │     numbers tnum right-align
│          │ #1038  T02   1     ✓Served        $9.00   11:45   Anita     ⋮  │
│          │ ──────────────────────────────────────────────────────────── │
│          │ Showing 1–25 of 86          ‹ 1 2 3 … 4 ›   [25 ⌄]            │ «D» [§10.17 Pagination]
└──────────┴──────────────────────────────────────────────────────────────┘
   ⤷ Row click opens detail drawer (right):
   ┌────────────── Order #1042 · Table 12 ──────────── ✕ ┐
   │ 🔥 Preparing · placed 12:04 · ~8 min               │ «E» [§10.10 Drawer·right,lg]
   │ ── Timeline ──                                      │     status hero[§10.7]
   │ ✓ Placed 12:01 · ✓ Accepted 12:02 · ● Preparing    │ «F» Timeline (status tokens)
   │ ── Items ──                                         │
   │ 2× Chicken Wings (6pc, extra dip)         $20.00   │ «G» Itemized + notes
   │ 1× Spring Rolls                            $6.50   │
   │ Notes: "allergy to peanuts"                        │
   │ Total                                     $29.95   │
   │ ── Actions ──                                       │
   │ [ Reassign ⌄ ]  [ Mark status ⌄ ]  [ Cancel ]     │ «H» Actions; Cancel=destructive
   └────────────────────────────────────────────────────┘     + confirm modal[§10.9]
```

### Mobile

```
┌────────────────────────────────┐
│ ≡  Orders            🔔 ON     │
├────────────────────────────────┤
│ (All 86)(Active 14)(Ready 3).. │ «A» Tabs → scrollable chips
├────────────────────────────────┤
│ ⌕ Filter                       │
│ ┌────────────────────────────┐ │ «B» Table → cards (§10.12 resp.)
│ │ #1042 · T12     🔥Preparing │ │     status badge prominent
│ │ 3 items · $29.95 · 12:04   │ │
│ │ Kitchen              (⋮)   │ │
│ ├────────────────────────────┤ │
│ │ #1041 · T07     🔔Ready     │ │
│ │ 5 items · $52.00     ●new  │ │
│ └────────────────────────────┘ │
│         ‹ 1 2 3 › [25⌄]        │
└────────────────────────────────┘
   ⤷ Tap card → detail drawer full-screen/bottom sheet
```

---

## A5. Sales Reports

Accounting surface (`*` View Reports / Manage Expenses). Daily/monthly sales, profit, tax, export.

**Layout:** app shell; period controls; KPI summary; revenue chart; breakdown table; export.

**Sections:** (1) Period & granularity controls · (2) Summary KPIs · (3) Revenue/expense chart · (4) Breakdown table (by day/item/category) · (5) Export.

**Components used:** `[§10.14 Tabs · Daily/Monthly]`, `[§10.13 Dashboard Cards]`, chart (decorative; numbers-as-text), `[§10.12 Data Table · w/ pinned summary row]`, `[§10.1 Button]` (Export), `[§10.15 Dropdown]` (date range), `[§10.18 Empty State]`, `[§10.19 Loading]`.

**Data displayed:** gross sales, tax collected, expenses, net profit (+deltas); revenue over time; per-day/-item breakdown with totals row; tax summary.

### Desktop

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ (nav)    │ Sales Reports   [Daily][Monthly][Custom]  Jun 1–21 ⌄ [Export⌄]│ «A» Period tabs[§10.14] +
│ 💰 Acct  ├──────────────────────────────────────────────────────────────┤     date range[§10.15] + Export
│  active  │ ┌──────────┐┌──────────┐┌──────────┐┌──────────┐             │
│          │ │ GROSS    ││ TAX      ││ EXPENSES ││ NET      │             │ «B» KPI summary [§10.13]
│          │ │ $24,180  ││ $3,143   ││ $9,200   ││ PROFIT   │             │     gross/tax/expense/profit
│          │ │ ▲ +9%    ││          ││ ▼ −3%    ││ $11,837  │             │     delta chips ▲/▼ tnum;
│          │ └──────────┘└──────────┘└──────────┘└─▲+14%────┘             │     expense card error-tinted
│          │ ┌──────────────────────────────────────────────────────────┐│     accent (§10.13)
│          │ │ REVENUE vs EXPENSES — Jun                                 ││ «C» Chart (enhancement only;
│          │ │  ▁▂▃▅▆▇█▆▅▃▂  revenue   ▁▁▂▂▁▂▁ expenses                  ││     truth lives in tables)
│          │ └──────────────────────────────────────────────────────────┘│
│          │ BREAKDOWN BY DAY                                              │ «D» [§10.12 Data Table
│          │ Date     Orders  Gross    Tax     Expenses  Net              │     · numeric right-align tnum,
│          │ Jun 21   86      $1,240   $161    $420      $820             │     pinned SUMMARY row]
│          │ Jun 20   79      $1,150   $150    $380      $770             │
│          │ Jun 19   91      $1,310   $170    $510      $800             │
│          │ ──────────────────────────────────────────────────────────  │
│          │ TOTAL    1,420   $24,180  $3,143  $9,200    $11,837          │ «E» Pinned totals row
└──────────┴──────────────────────────────────────────────────────────────┘
```

`«Empty»`: "No sales in this period" `[§10.18]`. `«Error»`: retry, **never fabricated numbers** (Principle 5). `«Loading»`: skeleton KPIs + table rows.

### Mobile

```
┌────────────────────────────────┐
│ ≡  Reports        [Export⌄]    │
├────────────────────────────────┤
│ (Daily)(Monthly)(Custom)       │ «A» Period tabs
│ Jun 1–21 ⌄                      │
├────────────────────────────────┤
│ ┌────────────┐┌────────────┐   │ «B» KPI cards stack
│ │ GROSS      ││ NET PROFIT │   │
│ │ $24,180▲9% ││ $11,837▲14%│   │
│ └────────────┘└────────────┘   │
│ ┌────────────┐┌────────────┐   │
│ │ TAX $3,143 ││ EXP $9,200 │   │
│ └────────────┘└────────────┘   │
│ ┌────────────────────────────┐ │
│ │ REVENUE ▁▂▃▅▆▇█             │ │ «C» Chart full-width
│ └────────────────────────────┘ │
│ BREAKDOWN                      │ «D» Table → cards
│ ┌────────────────────────────┐ │
│ │ Jun 21 · 86 orders         │ │
│ │ Gross $1,240 · Net $820    │ │
│ ├────────────────────────────┤ │
│ │ Jun 20 · 79 orders         │ │
│ │ Gross $1,150 · Net $770    │ │
│ └────────────────────────────┘ │
│ TOTAL: 1,420 · $24,180        │ «E» Sticky total summary
└────────────────────────────────┘
```

---

## A6. Settings

Restaurant/business configuration. Sections gated by role; **Subscription & billing** is Owner-only (Permissions Matrix). Hosts tax, currency, discounts, profile, staff entry.

**Layout:** app shell; settings section nav (left sub-rail or tabs) + form panel.

**Sections:** (1) Settings section nav · (2) Form panel (varies by section) · (3) Save bar. Sections: Restaurant Profile · Tax · Currency · Discounts · Staff* · Subscription & Billing*.

**Components used:** `[§10.14 Tabs]` or section list, `[§10.2 Inputs · all types]`, `[§10.15 Dropdown/Select]` (currency, tax mode), toggles `[radius.full]`, `[§10.1 Button]`, `[§10.9 Modal]` (destructive confirms), `[§10.16 Avatar]` (logo upload), `[§10.11 Toast]` (saved).

**Data displayed:** restaurant name/logo/address/hours; tax rate & mode; currency & format; discount rules; (staff list); plan, billing, invoices.

### Desktop

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ (nav)    │ Settings                                                       │
│ ⚙ Setting├───────────────────┬──────────────────────────────────────────┤
│  active  │ ◉ Restaurant      │ Restaurant Profile                        │ «A» Section sub-nav (left):
│          │ ○ Tax             │ ┌──────────────────────────────────────┐ │     list; current = primary
│          │ ○ Currency        │ │ Logo  (◑)  [ Upload ]                 │ │     tint. Locked items show
│          │ ○ Discounts       │ │ Name  [ Saffron Kitchen____________ ] │ │     🔒 if role lacks access
│          │ ○ Staff *         │ │ Address [ 12 Main St______________ ] │ │
│          │ ○ Subscription 🔒 │ │ Phone [ +1 555…___ ] Email [ …____ ] │ │ «B» Form panel [§10.2 Inputs]
│          │   (Owner only)    │ │ Hours  Mon–Fri [09:00]–[22:00]  ⌄    │ │     top-label, validation,
│          │                   │ │ Currency [ USD $ ⌄ ]  Tax [ 13 % ]   │ │     [§10.15 Select] currency
│          │                   │ └──────────────────────────────────────┘ │     tax mode (incl/excl) ⌄
│          │                   │ ── Danger zone ──                         │ «C» Destructive: confirm
│          │                   │ [ Deactivate restaurant ]                 │     modal[§10.9]
│          │                   ├──────────────────────────────────────────┤
│          │                   │           (unsaved changes)  [Cancel][Save]│ «D» Sticky save bar;
└──────────┴───────────────────┴──────────────────────────────────────────┘     toast on save[§10.11]
```

`«Subscription»` panel (Owner): current plan card (Starter/Pro/Enterprise), usage vs limits, payment method, invoice table `[§10.12]`, `[ Upgrade ]`. Non-owners see permission empty state `[§10.18]`.

### Mobile

```
┌────────────────────────────────┐
│ ≡  Settings                    │
├────────────────────────────────┤
│ Restaurant Profile        ⌄    │ «A» Sections → accordion / drill-in
│ Tax                       ⌄    │     (full-screen panel per section)
│ Currency                  ⌄    │
│ Discounts                 ⌄    │
│ Staff *                   ⌄    │
│ Subscription 🔒 (Owner)   ⌄    │
└────────────────────────────────┘
   ⤷ Tap section → full-screen form:
┌────────────────────────────────┐
│ ← Restaurant Profile           │
│ Logo (◑) [ Upload ]            │ «B» Inputs lg 48px, single column
│ Name  [____________________]   │
│ Address [__________________]   │
│ Hours  [09:00]–[22:00] ⌄       │
│ Currency [USD $ ⌄] Tax [13 %]  │
├────────────────────────────────┤
│ [        Save changes        ] │ «C» Sticky save (full-width)
└────────────────────────────────┘
```

---

## Wireframe → component coverage matrix

Quick check that every Design System component (§10) appears in the screen set and where to find it.

| Component (§10)          | Appears in                                                 |
| ------------------------ | ---------------------------------------------------------- |
| 10.1 Buttons             | All screens                                                |
| 10.2 Inputs              | Login, Item Details, Menu Mgmt, Settings, Cart notes       |
| 10.3 Search              | Menu, Dashboard (⌘K), Menu Mgmt, Orders                    |
| 10.4 Cards (base)        | Order Tracking summary, Login card                         |
| 10.5 Menu Item Card      | Menu, Item Details, Menu Mgmt                              |
| 10.6 Category Navigation | Menu, Menu Mgmt                                            |
| 10.7 Order Status Badge  | Tracking, Dashboard, Orders                                |
| 10.8 Table QR Card       | (Tables & QR — see User Flows §2; not in this set)         |
| 10.9 Modal               | Item Details (desktop), Menu editor, destructive confirms  |
| 10.10 Drawer / Sheet     | Cart, Item Details (mobile), Order detail, mobile nav      |
| 10.11 Toast              | Cart errors, new-order alerts, save confirmations          |
| 10.12 Data Table         | Dashboard, Orders, Menu Mgmt, Reports, Settings invoices   |
| 10.13 Dashboard Cards    | Dashboard, Reports                                         |
| 10.14 Tabs               | Dashboard, Orders, Reports, Settings                       |
| 10.15 Dropdown           | Branch switch, row kebabs, selects (category/currency/tax) |
| 10.16 Avatar             | Login brand, top bar, Settings logo                        |
| 10.17 Pagination         | Orders, Reports, Menu Mgmt                                 |
| 10.18 Empty State        | Cart, Reports, Menu Mgmt, permission-denied                |
| 10.19 Loading State      | All (skeletons, button spinners, connection banner)        |

---

_End of wireframes — eMenu v1.0._
