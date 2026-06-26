# GroundScope Admin — UI/UX Upgrade Plan

> **Goal:** Take the dashboard from "functional but dull" to a polished, professional
> command-center for airport ground operations — while staying 100% faithful to
> `../ground_scope/docs/design_system.md` (the mobile app's design language).
>
> This document is the single source of truth for the visual overhaul. Implement in order.

---

## 0. Diagnosis — Why It Looks Dull Today

| Problem | Current State | Design System Says |
|---|---|---|
| **Emoji icons** | 📊 ⚙️ ✈️ 📋 🔔 everywhere | Real iconography (mobile uses Material icons → web uses **lucide-react**) |
| **Flat cards** | `rounded-lg`, `shadow-sm`, no depth | `rr(16)` radius, soft shadow `black@0.04 blur10 y2`, **left accent bar** `4px` |
| **Generic badges** | `rounded-full` pills, one flat tone | Chips: `rr(8)`, bg `color@0.15`, border `color@0.3`, `12 SemiBold` |
| **Plain stat cards** | number + emoji, no hierarchy | Icon container `42×42 rr(12) bg color@0.12`, label/value hierarchy |
| **No brand presence** | text-only logo | `primaryGradient` (primary100→200→300) brand mark |
| **No active nav indicator** | background tint only | Animated rail indicator (`layoutId`) + accent |
| **No elevation system** | single `shadow-sm` | Layered: card / raised / overlay shadows |

---

## 1. Foundation — Tokens & Helpers

### 1.1 `cn()` utility — `lib/utils/cn.ts`
Standard `clsx + tailwind-merge` helper so variants compose without class conflicts.

### 1.2 New CSS tokens — `globals.css`
Add to the existing token block (do **not** remove existing tokens):

```css
--gradient-brand: linear-gradient(135deg, var(--primary-100), var(--primary-200), var(--primary-300));
--shadow-card:    0 2px 10px rgba(0,0,0,0.04);
--shadow-raised:  0 4px 16px rgba(0,0,0,0.08);
--shadow-overlay: 0 12px 32px rgba(0,0,0,0.16);
--radius-card: 16px;   /* rr(16) */
--radius-chip: 8px;    /* rr(8)  */
--radius-control: 12px;/* rr(12) */
```
Dark mode raises shadow alpha (`0.04 → 0.30`) so elevation reads on dark surfaces.

### 1.3 Tailwind mapping — `tailwind.config.ts`
- `boxShadow`: `card`, `raised`, `overlay`
- `borderRadius`: `card` (16px), `chip` (8px), `control` (12px)
- `backgroundImage`: `gradient-brand`
- Keep `darkMode: "class"`.

---

## 2. Iconography — Kill the Emoji

Replace **every** emoji with a `lucide-react` icon. Central mapping in
`lib/utils/nav-icons.tsx` (nav) and inline for one-offs.

| Context | Emoji → lucide |
|---|---|
| Overview | 📊 → `LayoutDashboard` |
| Operations | ⚙️ → `Workflow` |
| Flights | ✈️ → `Plane` |
| Reports | 📋 → `ClipboardList` |
| Analytics | 📈 → `TrendingUp` |
| Service Types | 🏷️ → `Tags` |
| Stands | 🅿️ → `CircleParking` |
| Units | 🚗 → `Truck` |
| Users | 👥 → `Users` |
| Notifications | 🔔 → `Bell` |
| Theme | 🌙/☀️ → `Moon`/`Sun` |
| Stat: flights today | ✈️ → `Plane` |
| Stat: active tasks | ⚙️ → `Activity` |
| Stat: pending | 📋 → `Clock` |
| Stat: open reports | ⚠️ → `AlertTriangle` |

Icon sizing: nav `18`, topbar `20`, stat container `22`, inline `16`.

---

## 3. Component Upgrades

### 3.1 `Card` (`components/ui/card.tsx`)
- Radius → `rounded-card` (16px), shadow → `shadow-card`, border `border@0.6`.
- **New `accent` prop**: `none | primary | success | warning | error | info | secondary`.
  Renders a `4px` inline-start colored bar (mirrors in RTL via `border-s`/absolute `start-0`).
- Hover: lift to `shadow-raised` (200ms), respects `prefers-reduced-motion`.

### 3.2 `Badge` → status/severity **Chip** (`components/ui/badge.tsx`)
- Radius `rounded-chip` (8px) — not full pills.
- `filled` variant (status): bg `color@0.15`.
- `outlined` variant (severity): bg `color@0.10` + border `color@0.30`.
- Optional leading `dot` for status. Text `12 SemiBold`.
- Tone driven by `lib/utils/status-colors.ts` (already the source of truth).

### 3.3 `StatCard` (`components/ui/stat-card.tsx`)
- Icon container `48×48 rounded-control bg tone@0.12`, lucide icon in tone color.
- Value `font-extrabold text-3xl`, label `12 medium text-hint` uppercase tracking.
- Optional `trend` (▲/▼ %) + accent bar matching tone. Keep count-up animation.
- Subtle gradient wash on hover.

### 3.4 `Sidebar` (`components/layout/sidebar.tsx`)
- Gradient brand mark (rounded square w/ `gradient-brand` + monogram) + wordmark.
- lucide nav icons; active item gets accent text + an animated `layoutId` rail on the inline-start edge.
- Section labels: `12 SemiBold uppercase text-hint`. Logical props for RTL.

### 3.5 `Topbar` (`components/layout/topbar.tsx`)
- lucide `Bell` notification button (chip style, `secondary200` unread dot).
- `Sun/Moon` theme toggle, `Languages` locale toggle (show target lang label).
- User avatar (initials, gradient ring) + role caption. Divider via `border` token.

### 3.6 `PageHeader` (`components/ui/page-header.tsx`)
- Optional `icon` in a tinted container, title `font-extrabold`, eyebrow/breadcrumb slot.

---

## 4. Screen Polish

### 4.1 Dashboard (`app/[locale]/(dashboard)/page.tsx`)
- Stat row with per-tone accents (flights=primary, active=info, pending=warning, reports=error).
- Recent Flights: row with airline avatar, route with `Plane` connector, status chip.
- Open Reports: severity accent bar + outlined severity chip + relative time.
- Section headers with icon + "view all" link.

### 4.2 Login (`app/[locale]/(auth)/login/page.tsx`)
- Split/centered card on a `gradient-brand` ambient background, brand mark, lucide field icons, refined focus states.

---

## 5. Animation Budget (per design system §8 / plan §8)
- Entrance: fade+rise `≤350ms`, stagger `60–100ms`.
- Hover/press: `150–200ms`. Nav rail: spring `layoutId`.
- All wrapped to respect `prefers-reduced-motion`.

---

## 6. Non-Negotiables (unchanged)
- No hardcoded colors — tokens only. No hardcoded strings — `next-intl` (en + ar).
- Logical CSS only (`ms/me/ps/pe/start/end`) for RTL. Status tone only via `status-colors.ts`.
- All verified in light + dark, en + ar.

---

## 7. Execution Order
1. Foundation: `cn()`, tokens, tailwind mapping.
2. Icons: nav-icons map, remove all emoji.
3. Primitives: Card → Badge/Chip → StatCard → PageHeader.
4. Layout: Sidebar → Topbar.
5. Screens: Dashboard → Login.
6. Verify: light/dark × en/ar pass.
