# GroundScope Admin — "Command Center" Visual Redesign Plan

> Goal: transform the dashboard into a world-class flight-operations interface — dark,
> data-dense, FIDS-inspired — while **preserving every data fetch, query, and feature**.
> This is a **visual/token + component-skin** refactor only. No query, route, or business
> logic changes.

---

## 0. Guardrails (non-negotiable — carried from CLAUDE.md)

- **Only the UI layer changes.** No edits to `lib/queries/*`, route handlers, page data flow,
  Supabase logic, or feature behavior. Observable behavior is preserved.
- **All color/spacing/radius/shadow comes from tokens** — `globals.css` + `tailwind.config.ts`.
  No hardcoded hex anywhere in components.
- **Both themes stay** (dark is the hero; light is refined to match). RTL preserved via logical
  properties. i18n keys for any new label, added to **both** `en.json` and `ar.json`.
- **No fabricated data.** We do not invent altitude/speed/fuel gauges or live GPS tracks the
  backend doesn't have (see §3). Every number on screen traces to a real column or query.

---

## 1. Design references gathered

| Reference | What we borrow |
|---|---|
| **Flightradar24 / FlightAware** | Dark command-center base, monospace flight codes, dense data rows, status color language |
| **Airport FIDS boards** | Departure/Arrival board layout: airline · flight · route · scheduled · est/actual · status pill |
| **15below IROPS / airline ops centers** | "Single view of the operation" — KPI strip on top, live panels below |
| **Linear / Vercel / Apple** | Restraint: one accent, generous spacing, subtle motion, hairline borders, elevation by surface not by heavy shadow |

Sources:
- [Flight Dashboard inspiration — Dribbble](https://dribbble.com/tags/flight-dashboard)
- [FIDS — How to Build a Live Departure Board (airlabs)](https://airlabs.co/flight-information-display-system)
- [airframesio/flightboard (FIDS web + TUI)](https://github.com/airframesio/flightboard)
- [15below IROPS Dashboard](https://15below.com/products/irops-dashboard)
- [Flight Information Display System — Wikipedia](https://en.wikipedia.org/wiki/Flight_information_display_system)

---

## 2. Proposed design tokens (the thing to approve)

Bridges your requested navy/electric-blue palette with the existing GroundScope brand —
they're already close (`info` is literally `#3B82F6`; brand `primary-200 #2fa4d7` ≈ cyan).

### Dark mode (the hero)

| Token | Current | **Proposed** | Role |
|---|---|---|---|
| `--background` | `#121212` | `#0A0F1E` | App base (deep navy) |
| `--background-secondary` | `#262730` | `#0E1424` | Recessed wells |
| `--surface` | `#262730` | `#131B2E` | Panels / cards |
| `--surface-variant` | `#272835` | `#1B2540` | Raised rows, hover |
| `--border` | `#36394a` | `#243049` | Hairline borders |
| `--divider` | `#272835` | `#1A2238` | Internal dividers |
| `--text-primary` | `#ffffff` | `#F1F5F9` | Headlines / values |
| `--text-secondary` | `#a4acb9` | `#94A3B8` | Labels |
| `--text-hint` | `#666d80` | `#5B6B85` | Muted meta |

### Accents & status (shared light + dark)

| Token | **Proposed** | Used for |
|---|---|---|
| `--primary-200` | `#22A7D9` (brand cyan, slightly brighter) | Primary actions, active nav |
| `--info` | `#3B82F6` (electric blue) | Scheduled, data series, links |
| `--accent-cyan` *(new)* | `#06B6D4` | Live-data pulses, secondary highlight |
| `--success` | `#22C55E` | On-time, arrived, available |
| `--warning` | `#F59E0B` | Delayed, boarding, pending |
| `--error` | `#EF4444` | Cancelled, critical |
| `--secondary-200` | `#D12052` (kept) | High-priority crimson accent |

Light mode keeps the same accents over cool-neutral surfaces (`#F8FAFC` base, `#FFFFFF`
panels) so brand identity is consistent across themes.

### Typography

- **Geist Mono** (already bundled at `src/app/fonts/GeistMonoVF.woff`) → flight codes, times,
  IDs, metrics — tabular, aviation feel.
- **Geist Sans** (already bundled) → all UI text.
- New token utilities: `font-mono` mapped to Geist Mono for `.flight-code` style usage.

### New elevation/motion tokens

- `--glow-primary: 0 0 0 1px rgba(34,167,217,.25), 0 0 24px rgba(34,167,217,.12)` — focus/live ring
- `--pulse` keyframe for live indicators (respects `prefers-reduced-motion`)

---

## 3. Honest data-reality note (read this)

Your `flights` rows come from the **AviationStack timetable** import. They contain:
`flight_number, airline, origin, destination, aircraft_type, scheduled/actual arrival &
departure, status, stand_id, pax_count`.

They **do not** contain live position, altitude, speed, or fuel. So:

| Requested element | Verdict | What we do instead |
|---|---|---|
| Departure/Arrival FIDS board | ✅ Fully supported | Build it — it's the centerpiece |
| Flight status cards w/ live pulse | ✅ Supported | Pulse = realtime subscription activity, not fake telemetry |
| On-time rate / delay metrics | ✅ Real | Compute from scheduled vs actual + `delay_analysis` table |
| Route **arc** map (origin→dest) | ⚠️ Static only | Great-circle arc between IATA airports — no live aircraft dot |
| Altitude / speed / **fuel** gauges | ❌ No backing data | **Omit** — replace with real ops KPIs (turnaround, active units, open reports) |

This keeps the dashboard stunning *and* truthful — important for a graduation defense.

---

## 4. Component audit & redesign order (most visible first)

| # | Surface | File(s) | Change |
|---|---|---|---|
| 1 | **Tokens** | `globals.css`, `tailwind.config.ts` | New palette, mono font, glow/pulse tokens |
| 2 | **App shell** | `dashboard-shell`, `sidebar`, `sidebar-content`, `topbar`, `mobile-drawer` | Command-center chrome: darker rail, top status strip, live clock |
| 3 | **StatCard** | `ui/stat-card.tsx` | Metric tile: mono value, sparkline-ready, glow accent, trend caption |
| 4 | **Card / Badge** | `ui/card.tsx`, `ui/badge.tsx` | Hairline panels, FIDS status pill variants |
| 5 | **Overview** | `(dashboard)/page.tsx` | KPI strip + Recent Flights as FIDS rows + Open Reports |
| 6 | **FIDS board** *(new component)* | `components/sections/flight-board.tsx` | Reusable departure/arrival board used by Flights + Overview |
| 7 | **Flights list/detail** | `flights/page.tsx`, `flights/[id]/page.tsx`, `tables/flights-columns.tsx` | Board styling, route arc on detail |
| 8 | **Operations Kanban** | `sections/kanban-board.tsx` | Card polish, live status accents |
| 9 | **Reports** | report-* sections + `tables/reports-columns.tsx` | Severity-driven hero, timeline polish |
| 10 | **Analytics** | `analytics/*`, `charts/*` | Theme-aware Recharts (token axis/grid), dense tables |
| 11 | **Data tables / forms / sheets** | `ui/data-table`, `forms/*`, `ui/slide-over-sheet` | Consistent skin, mono for codes |
| 12 | **QA pass** | all | dark+light × en+ar × 1440/768, `prefers-reduced-motion`, clean-code-guard |

Each step: token-driven classes only, behavior unchanged, then visually verified.

---

## 5. Consistency enforcement

- Single source of truth: every value resolves to a CSS variable via Tailwind. A grep for
  hex literals in `src/components` must return zero after each phase.
- Status colors stay centralized in `lib/utils/status-colors.ts` (already the rule).
- One new primitive only where reused (the FIDS `FlightBoard`); no per-page bespoke styling.

---

## 6. How to run it locally (no push to main)

Framework detected: **Next.js 14 (App Router)**. You're already on branch `refactor/ui-ux`
(not `main`) — perfect; all work stays there until you choose to merge.

```bash
# from the project root:
#   c:\1_Flutter_Projects\GroundScope_Graduation_project\groundscope-admin

npm install            # first time only (deps already in package.json)
npm run dev            # starts the dev server
```

Then open: **http://localhost:3000** → it auto-redirects to **http://localhost:3000/en**
(Arabic: **/ar**). Toggle theme/locale from the top bar.

Notes:
- Run **one** dev server only. If port 3000 is busy, Next will offer 3001 — kill the stale one
  instead of running both (two servers fighting over `.next` cache causes blank/session-less
  renders that look like "no data").
- You need `.env.local` present (Supabase URL + anon key) or lists render empty under RLS.
- Changes hot-reload instantly; nothing is pushed until you run `git push` yourself.

---

## 7. Approval gates

1. **Palette** (§2) — approve / adjust before any token file is written.
2. **Light mode** — keep both (recommended) or go dark-only.
3. **Telemetry honesty** (§3) — confirm we omit fake gauges and use real ops KPIs + static
   route arc.

Once approved, execution proceeds phase-by-phase in the §4 order, with clean-code-guard after
each phase.
