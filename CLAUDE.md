# GroundScope Admin Web Dashboard — Claude Instructions

## Read This First

The full build plan is in the sibling project:
`../ground_scope/docs/admin_dashboard_plan.md`

**Before writing any code, read that file.** It contains every decision, every phase,
every component spec, and every Done When checklist. Do not make architectural decisions
that contradict it.

Supporting reference docs (read when relevant to the current phase):
- `../ground_scope/docs/DATABASE.md` — full Supabase schema with column types and constraints
- `../ground_scope/docs/design_system.md` — color palette, typography, component specs from mobile
- `../ground_scope/docs/GroundScope_System_Reference.md` — system flow, roles, business logic

## Project Identity

Next.js 14 (App Router) + TypeScript admin dashboard for the GroundScope airport
ground-services system. Connects to the same Supabase backend as the Flutter mobile app.
**Never modify anything inside `../ground_scope/`.**

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router, TypeScript strict mode |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Database | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |
| Charts | Recharts |
| Tables | TanStack Table v8 |
| Forms | React Hook Form + Zod |
| i18n | next-intl (en + ar, RTL) |
| Theme | next-themes (light + dark, `.dark` class strategy) |

## Folder Conventions

```
lib/queries/      — all Supabase reads/writes, one file per entity (never query in components)
lib/types/        — database.ts with typed row interfaces for every table
lib/utils/        — status-colors.ts, formatters, credentials.ts
components/ui/    — shared primitives (Button, Card, Badge, DataTable, SlideOverSheet…)
messages/         — en.json and ar.json (every user-facing string lives here)
```

## Non-Negotiable Rules

- ❌ No Supabase calls inside components — use `lib/queries/*`
- ❌ No hardcoded colors — use Tailwind classes mapped to CSS variable tokens
- ❌ No hardcoded user-facing strings — use `next-intl` keys; add to **both** `en.json` and `ar.json`
- ❌ No hardcoded `left`/`right` — use logical CSS (`ms-`, `me-`, `ps-`, `pe-`, `start`, `end`) for RTL
- ❌ No status/priority/severity color logic inline — use `lib/utils/status-colors.ts`
- ❌ No destructive action without a `ConfirmDialog`
- ✅ Soft delete only — `is_active = false`; never hard-delete rows
- ✅ Server client (`lib/supabase/server.ts`) for page data fetching
- ✅ Browser client (`lib/supabase/client.ts`) for Realtime and interactions
- ✅ All forms validated with Zod; show inline field errors
- ✅ Every screen verified in: light + dark theme, and en + ar (RTL)
- ✅ Animations follow plan Section 8 — max 350ms, respect `prefers-reduced-motion`

## Build Protocol

- Build **one phase at a time** in the order defined in the plan.
- After each phase, confirm every item in the **Done When** checklist before advancing.
- Summarise what was built at the end of each phase.

## Key External Facts

- Supabase project URL and anon key: in `.env.local` (copy from `../ground_scope/.env`)
- AviationStack API endpoint: `https://api.aviationstack.com/v1/timetable` — call **server-side only** (route handler), key must NOT have `NEXT_PUBLIC_` prefix
- FCM notifications: call the existing `send-notification` Supabase Edge Function — same one the Flutter app calls. Full spec in plan Section 12.
- Credential generation logic: `supervisor.{slug}@groundscope.com` / `manager.{slug}@groundscope.com`, password = `GroundScope{4digits}{special}`. Port from `../ground_scope/lib/core/utils/credentials_generator.dart`.