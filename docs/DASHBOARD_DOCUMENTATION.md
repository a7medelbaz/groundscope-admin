# GroundScope Admin Dashboard — Technical Documentation

> **Graduation Project** — Faculty of Computers & Information  
> System: Airport Ground Services Management  
> Component: Web Admin Dashboard  
> Version: 0.1.0

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Setup](#4-environment-setup)
5. [Architecture](#5-architecture)
   - 5.1 [App Router & Route Layout](#51-app-router--route-layout)
   - 5.2 [Supabase Client Strategy](#52-supabase-client-strategy)
   - 5.3 [Middleware](#53-middleware)
   - 5.4 [Authentication Flow](#54-authentication-flow)
6. [Data Layer](#6-data-layer)
   - 6.1 [Database Tables & Enums](#61-database-tables--enums)
   - 6.2 [Query Modules](#62-query-modules)
   - 6.3 [Server Actions vs Client Queries](#63-server-actions-vs-client-queries)
7. [UI Architecture](#7-ui-architecture)
   - 7.1 [Layout Shell](#71-layout-shell)
   - 7.2 [Design System & Tokens](#72-design-system--tokens)
   - 7.3 [Primitive Components](#73-primitive-components)
   - 7.4 [Status Color Utilities](#74-status-color-utilities)
8. [Screens & Features](#8-screens--features)
   - 8.1 [Overview Dashboard](#81-overview-dashboard)
   - 8.2 [Operations Monitor](#82-operations-monitor)
   - 8.3 [Flights](#83-flights)
   - 8.4 [Reports](#84-reports)
   - 8.5 [Analytics](#85-analytics)
   - 8.6 [Service Types](#86-service-types)
   - 8.7 [Stands](#87-stands)
   - 8.8 [Units](#88-units)
   - 8.9 [Users](#89-users)
9. [API Routes](#9-api-routes)
   - 9.1 [POST /api/create-user](#91-post-apicreate-user)
   - 9.2 [POST /api/import-flights](#92-post-apiimport-flights)
10. [Internationalisation & RTL](#10-internationalisation--rtl)
11. [Theming](#11-theming)
12. [Responsiveness](#12-responsiveness)
13. [Credential Generation](#13-credential-generation)
14. [Realtime Subscriptions](#14-realtime-subscriptions)
15. [Deployment](#15-deployment)
16. [Non-Negotiable Conventions](#16-non-negotiable-conventions)

---

## 1. System Overview

GroundScope is an airport ground-services management platform built for Cairo International Airport (IATA: CAI). It consists of two components that share the same Supabase backend:

| Component | Technology | Audience |
|---|---|---|
| Mobile app (`ground_scope/`) | Flutter | Supervisors & Unit Managers |
| **Admin dashboard** (`groundscope-admin/`) | **Next.js 14** | Airport operations admin |

The admin dashboard lets the single airport administrator:
- Monitor live operations via a real-time Kanban board
- Import flight schedules from the AviationStack API
- Manage service types, airport stands, ground units, and personnel
- Review and resolve incident reports filed from the mobile app
- Analyse delay patterns and unit performance over custom date ranges
- Create supervisor and unit-manager accounts with auto-generated credentials

The dashboard reads from and writes to the **same Supabase project** used by the mobile app. Row Level Security (RLS) is enforced server-side; only authenticated admin sessions can read protected data.

---

## 2. Technology Stack

| Layer | Package | Version |
|---|---|---|
| Framework | `next` | 14.2.35 |
| Language | TypeScript | ^5 |
| Styling | `tailwindcss` | ^3.4.1 |
| Component primitives | `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select` | ^2.x |
| Animation | `framer-motion` | ^12.42.0 |
| Database client | `@supabase/supabase-js` | ^2.108.2 |
| SSR Supabase helpers | `@supabase/ssr` | ^0.12.0 |
| Tables | `@tanstack/react-table` | ^8.21.3 |
| Charts | `recharts` | ^3.9.0 |
| Forms | `react-hook-form` | ^7.80.0 |
| Schema validation | `zod` | ^4.4.3 |
| i18n | `next-intl` | ^4.13.0 |
| Theming | `next-themes` | ^0.4.6 |
| Icons | `lucide-react` | ^1.21.0 |
| Date formatting | `date-fns` | ^3.6.0 |
| Class merging | `clsx` + `tailwind-merge` | ^2 / ^3 |

All source is in `src/`. TypeScript strict mode is enabled.

---

## 3. Project Structure

```
groundscope-admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root HTML shell
│   │   ├── page.tsx                       # Redirects / → /en
│   │   ├── globals.css                    # CSS design-token definitions (light + dark)
│   │   ├── [locale]/
│   │   │   ├── layout.tsx                 # Locale-aware root layout
│   │   │   ├── (auth)/
│   │   │   │   └── login/page.tsx         # Login page
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx             # Delegates to DashboardShell
│   │   │       ├── page.tsx               # Overview dashboard
│   │   │       ├── operations/page.tsx    # Kanban board
│   │   │       ├── flights/
│   │   │       │   ├── page.tsx           # Flights list
│   │   │       │   └── [id]/page.tsx      # Flight detail + service requests
│   │   │       ├── reports/
│   │   │       │   ├── page.tsx           # Reports list
│   │   │       │   └── [id]/page.tsx      # Report detail + workflow
│   │   │       ├── analytics/page.tsx     # Analytics (delay / turnaround / unit perf)
│   │   │       ├── service-types/page.tsx
│   │   │       ├── stands/page.tsx
│   │   │       ├── units/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/page.tsx      # Unit detail + members
│   │   │       └── users/page.tsx
│   │   └── api/
│   │       ├── create-user/route.ts       # POST — Supabase admin user creation
│   │       └── import-flights/route.ts    # POST — AviationStack flight import
│   ├── components/
│   │   ├── layout/
│   │   │   ├── dashboard-shell.tsx        # Client wrapper (drawer state)
│   │   │   ├── sidebar.tsx                # Desktop sidebar (hidden lg:flex)
│   │   │   ├── sidebar-content.tsx        # Shared nav tree (used by sidebar + drawer)
│   │   │   ├── mobile-drawer.tsx          # Slide-in drawer (lg:hidden)
│   │   │   └── topbar.tsx                 # Top bar + hamburger button
│   │   ├── ui/                            # Primitive components (see §7.3)
│   │   ├── forms/                         # React Hook Form + Zod forms
│   │   ├── tables/                        # TanStack Table column definitions
│   │   ├── sections/                      # Page-scoped composite components
│   │   ├── charts/                        # Recharts wrappers
│   │   └── dialogs/                       # ConfirmDialog, CredentialsDialog
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                  # Browser client (createBrowserClient)
│   │   │   └── server.ts                  # Server client (createServerClient)
│   │   ├── queries/                       # All Supabase reads/writes (one file per entity)
│   │   ├── types/database.ts              # Typed interfaces for every table + all enums
│   │   ├── utils/
│   │   │   ├── status-colors.ts           # Status/priority/severity → Tailwind classes
│   │   │   ├── credentials.ts             # Credential generation utilities
│   │   │   ├── cn.ts                      # clsx + tailwind-merge helper
│   │   │   └── nav-icons.tsx              # Icon map keyed by nav i18n key
│   │   ├── actions/auth.ts                # Server actions for sign-in / sign-out
│   │   └── hooks/useSession.ts            # Client-side session hook
│   ├── messages/
│   │   ├── en.json                        # English strings
│   │   └── ar.json                        # Arabic strings
│   ├── i18n.ts                            # next-intl request config
│   └── middleware.ts                      # Locale routing + Supabase session refresh
├── docs/                                  # Project documentation
├── .env.local                             # Environment variables (not committed)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 4. Environment Setup

Create `.env.local` in the project root. All variables below are required in production.

```env
# Supabase — from the shared Flutter .env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Required for POST /api/create-user (never expose to the browser)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Required for POST /api/import-flights (never expose to the browser)
AVIATIONSTACK_API_KEY=<api-key>
```

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` and `AVIATIONSTACK_API_KEY` must **not** carry the `NEXT_PUBLIC_` prefix. Next.js only bundles variables prefixed with `NEXT_PUBLIC_` into the browser build; server-only keys stay on the server exclusively.

### Local development

```bash
npm install
npm run dev        # starts at http://localhost:3000
```

### Build & type-check

```bash
npm run build      # tsc + next build
npm run lint       # next lint
```

---

## 5. Architecture

### 5.1 App Router & Route Layout

The dashboard uses the Next.js 14 **App Router** with two route groups under `src/app/[locale]/`:

| Group | Prefix | Purpose |
|---|---|---|
| `(auth)` | `/[locale]/login` | Unauthenticated pages |
| `(dashboard)` | `/[locale]/*` | All authenticated admin pages |

All routes are locale-prefixed (`localePrefix: "always"`), so `/` redirects to `/en` and `/ar/flights` is the Arabic version of the flights screen. Supported locales: `en`, `ar`.

**Route table:**

| URL pattern | Component | Description |
|---|---|---|
| `/[locale]/login` | `(auth)/login/page.tsx` | Email / password sign-in |
| `/[locale]/` | `(dashboard)/page.tsx` | Overview dashboard |
| `/[locale]/operations` | `(dashboard)/operations/page.tsx` | Live Kanban board |
| `/[locale]/flights` | `(dashboard)/flights/page.tsx` | Flights list with import |
| `/[locale]/flights/[id]` | `(dashboard)/flights/[id]/page.tsx` | Flight detail + service requests |
| `/[locale]/reports` | `(dashboard)/reports/page.tsx` | Incident reports list |
| `/[locale]/reports/[id]` | `(dashboard)/reports/[id]/page.tsx` | Report detail + acknowledge/resolve |
| `/[locale]/analytics` | `(dashboard)/analytics/page.tsx` | Analytics tabs |
| `/[locale]/service-types` | `(dashboard)/service-types/page.tsx` | Service types CRUD |
| `/[locale]/stands` | `(dashboard)/stands/page.tsx` | Airport stands CRUD |
| `/[locale]/units` | `(dashboard)/units/page.tsx` | Ground units list |
| `/[locale]/units/[id]` | `(dashboard)/units/[id]/page.tsx` | Unit detail + members |
| `/[locale]/users` | `(dashboard)/users/page.tsx` | Supervisors & managers |

### 5.2 Supabase Client Strategy

Two clients exist. Use the correct one or data will not be available:

**Server client** — `lib/supabase/server.ts`

```ts
// Usage: Server Components, Route Handlers, Server Actions
const supabase = await createServerSupabaseClient();
```

- Uses `createServerClient` from `@supabase/ssr`
- Reads/writes session via `next/headers` cookies
- Must be `await`ed because `cookies()` is async in Next.js 14

**Browser client** — `lib/supabase/client.ts`

```ts
// Usage: Client Components that need Realtime or interactive reads
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

- Uses `createBrowserClient` from `@supabase/ssr`
- Safe to call multiple times; returns a new instance each call

### 5.3 Middleware

`src/middleware.ts` runs on every request that is not `api`, `_next/static`, `_next/image`, `favicon.ico`, or `public`.

It does two things in sequence:

1. **Locale routing** — delegates to `next-intl/middleware` with locales `["en", "ar"]`, default `"en"`, always-prefix strategy
2. **Session refresh** — calls `supabase.auth.getUser()` and writes any rotated tokens back to the response cookies

The session refresh step is critical. Without it, Supabase JWTs expire silently after ~1 hour and all server-side reads that are subject to RLS return empty result sets rather than errors.

### 5.4 Authentication Flow

1. Admin submits email + password on `/[locale]/login`
2. `signInWithPassword()` in `lib/queries/auth.ts` calls `supabase.auth.signInWithPassword()`
3. On success, it fetches the `users` row matched by `auth_id` and checks `role === "admin"`
4. If the role check fails, `supabase.auth.signOut()` is called immediately and an error is returned
5. On success, the session cookie is written and the browser navigates to the overview dashboard

Only users with `role = "admin"` (enum value `UserRole.ADMIN`) can access the dashboard. Supervisors and unit managers are rejected at step 4.

Auth query functions (all in `lib/queries/auth.ts`):

| Function | Returns | Description |
|---|---|---|
| `getCurrentSession()` | `Session \| null` | Returns the current Supabase session |
| `getCurrentUser()` | `User \| null` | Fetches the `users` row for the active session |
| `signInWithPassword(email, password)` | `{ user, error }` | Sign in + role check |
| `signOut()` | `void` | Signs out the current session |

---

## 6. Data Layer

### 6.1 Database Tables & Enums

**Enums** (defined in `lib/types/database.ts`):

| Enum | Values |
|---|---|
| `UserRole` | `admin`, `supervisor`, `unit_manager` |
| `UnitStatus` | `available`, `busy`, `offline` |
| `FlightStatus` | `scheduled`, `active`, `arrived`, `departed`, `cancelled` |
| `TaskStatus` | `pending`, `in_progress`, `paused`, `completed`, `cancelled` |
| `TaskPriority` | `low`, `medium`, `high`, `critical` |
| `ReportStatus` | `open`, `acknowledged`, `resolved` |
| `ReportSeverity` | `low`, `medium`, `high`, `critical` |
| `NotificationType` | `task_assigned`, `alert`, `delay`, `report`, `flight_landed` |
| `EventSource` | `camera`, `manual` |
| `UnitMemberPosition` | `driver`, `technician`, `helper`, `safety_officer` |

**Database tables** (16 total, typed via the `Database` interface in `lib/types/database.ts`):

| Table | Key columns | Notes |
|---|---|---|
| `service_types` | `id`, `name`, `default_duration_minutes`, `is_active` | Soft-deleted via `is_active` |
| `units` | `id`, `name`, `service_type_id`, `status`, `compatible_aircraft[]` | Status: `UnitStatus` enum |
| `unit_members` | `id`, `unit_id`, `full_name`, `position`, `is_active` | Photo stored in Supabase Storage |
| `stands` | `id`, `code`, `terminal`, `compatible_aircraft[]`, `has_camera` | Airport parking stands |
| `cameras` | `id`, `stand_id`, `identifier`, `stream_url` | Physical cameras at stands |
| `users` | `id`, `auth_id`, `full_name`, `email`, `role`, `fcm_token` | Linked to Supabase Auth |
| `flights` | `id`, `flight_number`, `airline`, `status`, `api_source` | Imported from AviationStack |
| `flight_service_requests` | `id`, `flight_id`, `service_type_id`, `status` | Requests created per flight |
| `tasks` | `id`, `flight_id`, `unit_id`, `status`, `priority`, `scheduled_start` | Ground service tasks |
| `task_checklists` | `id`, `task_id`, `item`, `is_checked`, `order_index` | Per-task checklist items |
| `task_pauses` | `id`, `task_id`, `paused_at`, `resumed_at`, `reason` | Pause history per task |
| `stand_events` | `id`, `stand_id`, `flight_id`, `event_type`, `source` | Camera or manual events |
| `reports` | `id`, `task_id`, `severity`, `status`, `acknowledged_at` | Incident reports |
| `notifications` | `id`, `user_id`, `type`, `is_read`, `sent_via_fcm` | Push notification records |
| `delay_analysis` | `id`, `flight_id`, `start_delay_minutes`, `end_delay_minutes` | Computed analytics |
| `flight_turnaround_summary` | `id`, `flight_id`, `total_turnaround_minutes`, `had_delays` | Per-flight turnaround |

All deletes are **soft deletes** (`is_active = false`). No hard-delete queries exist in the codebase.

### 6.2 Query Modules

Every Supabase read and write lives in `lib/queries/`. Components never import `createClient` directly for data fetching.

| File | Exported functions |
|---|---|
| `auth.ts` | `getCurrentSession`, `getCurrentUser`, `signInWithPassword`, `signOut` |
| `overview.ts` | `getFlightsTodayCount`, `getActiveTasksCount`, `getPendingServiceRequestsCount`, `getOpenReportsCount`, `getRecentFlights`, `getOpenReports` |
| `flights.ts` | Flight list, flight detail, stand assignment |
| `service-requests.ts` | Flight service request queries |
| `operations.ts` | Task list with joins, `updateTaskStatus` |
| `reports.ts` | Report list, report detail with joins (`ReportWithJoins`) |
| `reports-client.ts` | Client-side report status mutations |
| `analytics.ts` | `getDelayAnalysis`, `getFlightTurnaroundSummary`, `getUnitPerformance` |
| `service-types.ts` | `getServiceTypes`, create, update, soft-delete |
| `stands.ts` | Stand list, create, update |
| `units.ts` | Unit list, unit detail |
| `unit-members.ts` | Member list per unit, create, update, soft-delete |
| `users.ts` | User list, update |

### 6.3 Server Actions vs Client Queries

| Pattern | When to use | File marker |
|---|---|---|
| `"use server"` (server action) | Fetching data in Server Components; initial page load data | Top of file |
| Browser client + `useEffect` | Realtime subscriptions; interactive mutations after page load | Client component with `createClient()` |

The overview dashboard (`page.tsx`) combines both: initial counts are fetched via server action helpers, then Supabase Realtime channels (`tasks-realtime`, `reports-realtime`) keep stat cards updated without page refresh.

---

## 7. UI Architecture

### 7.1 Layout Shell

The dashboard shell is composed of four files:

```
DashboardShell (client — owns drawerOpen state)
├── Sidebar          hidden on < lg; permanent flex column at lg+
├── MobileDrawer     AnimatePresence slide-in; lg:hidden; body-scroll locked when open
└── content column   flex-1, min-w-0 (prevents wide tables forcing overflow)
    ├── Topbar        h-16; hamburger button (lg:hidden); page title; theme/locale toggles
    └── <main>        p-4 sm:p-6 lg:p-8
```

**Breakpoint for sidebar:** `lg` (1024 px). Below this width the sidebar is hidden and the hamburger button in `Topbar` opens `MobileDrawer`.

**Navigation groups** (defined in `sidebar-content.tsx`):

| Group label | Items |
|---|---|
| Main | Overview, Operations, Flights, Reports, Analytics |
| Master Data | Service Types, Stands, Units, Users |

The active nav item is indicated by a spring-animated rail (`layoutId="sidebar-active-rail"`) via Framer Motion, and highlighted with `text-primary-200 bg-primary-200/10`.

### 7.2 Design System & Tokens

All color tokens are CSS custom properties defined in `src/app/globals.css` and mapped to Tailwind utility classes via `tailwind.config.ts`. Never use hardcoded hex values in components.

**Brand palette:**

| Token | Light value | Role |
|---|---|---|
| `--primary-200` | `#2fa4d7` | Primary actions, active nav, links |
| `--primary-300` | `#247da4` | Hover state for primary |
| `--secondary-200` | `#d12052` | Destructive / high-priority indicators |
| `--success` | `#22c55e` | Completed, available, low severity |
| `--warning` | `#f59e0b` | Pending, medium severity, busy units |
| `--error` | `#ef4444` | Cancelled, critical severity, open issues |
| `--info` | `#3b82f6` | Scheduled flights, acknowledged reports |

**Surface tokens** (swap between light and dark automatically):

| Token | Light | Dark |
|---|---|---|
| `--background` | `#f9fafb` | `#121212` |
| `--surface` | `#ffffff` | `#262730` |
| `--surface-variant` | `#dfe1e7` | `#272835` |
| `--text-primary` | `#000000` | `#ffffff` |
| `--text-secondary` | `#36394a` | `#a4acb9` |

**Border radius tokens:**

| Token | Value | Usage |
|---|---|---|
| `--radius-card` | `16px` | Card containers |
| `--radius-control` | `12px` | Inputs, buttons, nav items |
| `--radius-chip` | `8px` | Badges, tags |

### 7.3 Primitive Components

All shared primitives live in `src/components/ui/`.

| Component | File | Description |
|---|---|---|
| `Badge` | `badge.tsx` | Inline status chip; accepts `tone`, `toneBg`, `toneBorder`, `dot` props |
| `Button` | `button.tsx` | Themed button with size and variant props |
| `Card` / `CardBody` / `CardHeader` | `card.tsx` | Surface container with optional `accent` stripe |
| `ConfirmDialog` | `confirm-dialog.tsx` | Modal confirmation; required before any destructive action |
| `DataTable` | `data-table.tsx` | TanStack Table v8 wrapper; horizontally scrollable at `< 640px` |
| `DropdownMenu` | `dropdown-menu.tsx` | Radix UI dropdown wrapper |
| `EmptyState` | `empty-state.tsx` | Illustrated empty list placeholder |
| `ErrorState` | `error-state.tsx` | Error boundary display |
| `FilterPills` | `filter-pills.tsx` | Multi-select pill group for filter UIs |
| `Input` | `input.tsx` | Themed text input |
| `Label` | `label.tsx` | Form label |
| `LoadingState` | `loading-state.tsx` | Spinner / skeleton for async content |
| `PageHeader` | `page-header.tsx` | Screen title + optional description + icon |
| `Select` | `select.tsx` | Radix UI select wrapper |
| `SlideOverSheet` | `slide-over-sheet.tsx` | Right-side sheet for create/edit forms |
| `StatCard` | `stat-card.tsx` | KPI card with icon, tone, animated value |
| `TagInput` | `tag-input.tsx` | Free-form tag entry for `text[]` columns |

### 7.4 Status Color Utilities

`lib/utils/status-colors.ts` is the single source of truth for all status-to-color mappings. Every component that renders a status badge must call one of these functions instead of writing colour logic inline.

| Function | Parameter type | Returns |
|---|---|---|
| `getTaskStatusColor(status)` | `TaskStatus` | `{ bg, text, border }` Tailwind classes |
| `getTaskPriorityColor(priority)` | `TaskPriority` | `{ bg, text, border }` Tailwind classes |
| `getReportStatusColor(status)` | `ReportStatus` | `{ bg, text, border }` Tailwind classes |
| `getReportSeverityColor(severity)` | `ReportSeverity` | `{ bg, text, border }` Tailwind classes |
| `getUnitStatusColor(status)` | `UnitStatus` | `{ bg, text, border }` Tailwind classes |
| `getFlightStatusColor(status)` | `FlightStatus` | `{ bg, text, border }` Tailwind classes |
| `getTaskStatusLabel(status)` | `TaskStatus` | i18n key string for use with `useTranslations` |
| `getTaskPriorityLabel(priority)` | `TaskPriority` | i18n key string for use with `useTranslations` |

Each function returns a complete `{ bg, text, border }` object that maps directly to the `Badge` component's `toneBg`, `tone`, and `toneBorder` props.

---

## 8. Screens & Features

### 8.1 Overview Dashboard

**Route:** `/[locale]/`  
**File:** `src/app/[locale]/(dashboard)/page.tsx`

Four stat cards updated in real time:

| Card | Query | Realtime channel |
|---|---|---|
| Flights Today | `getFlightsTodayCount()` — counts `flights` with `scheduled_arrival` in today's UTC window | `tasks-realtime` |
| Active Tasks | `getActiveTasksCount()` — counts `tasks` with `status = "in_progress"` | `tasks-realtime` |
| Pending Requests | `getPendingServiceRequestsCount()` — counts `tasks` with `status = "pending"` and `unit_id IS NULL` | `tasks-realtime` |
| Open Reports | `getOpenReportsCount()` — counts `reports` with `status = "open"` | `reports-realtime` |

Below the stat cards:
- **Recent Flights** (last 10 ordered by `scheduled_arrival DESC`) with status badge and airline code
- **Open Reports** (last 5 ordered by `created_at DESC`) with severity accent bar and badge

Both lists refresh automatically via Supabase Realtime `postgres_changes` subscriptions.

### 8.2 Operations Monitor

**Route:** `/[locale]/operations`  
**File:** `src/app/[locale]/(dashboard)/operations/page.tsx`  
**Key component:** `components/sections/kanban-board.tsx`

Three-column Kanban board showing tasks in `pending`, `in_progress`, and `completed` states. On mobile (< `md: 768px`) columns are horizontally scrollable with fixed `w-72` cards; at `md+` the board becomes a `grid-cols-3` layout.

Each task card shows the task ID prefix, service type, and priority badge. An inline `<select>` lets the admin move a task between states without opening the detail sheet; `updateTaskStatus()` from `lib/queries/operations.ts` is called on change.

Clicking a card opens `TaskDetailSheet` with the full task, checklist items, and pause history.

### 8.3 Flights

**Route (list):** `/[locale]/flights`  
**Route (detail):** `/[locale]/flights/[id]`

The list shows all flights in a `DataTable` with columns for flight number, airline, origin/destination, aircraft type, scheduled arrival, status badge, and stand assignment. An **Import Flights** button triggers `POST /api/import-flights` (see §9.2).

The detail page shows:
- Flight metadata grid (flight number, airline, aircraft type, origin/destination, stand, pax count)
- Status timeline (scheduled → active → arrived / departed)
- Service requests table for that flight

### 8.4 Reports

**Route (list):** `/[locale]/reports`  
**Route (detail):** `/[locale]/reports/[id]`

The list is a `DataTable` with filter pills for status (`open`, `acknowledged`, `resolved`) and client-side CSV export from the filtered rows.

The detail page (`ReportDetailView`) renders:
- `ReportDetailHero` — flight association, reporter, date/time, status badge, severity badge
- `ReportDetailBody` — description card, photo (if `image_url` present), metadata card, timeline
- `ReportStatusBanner` — action buttons to acknowledge or resolve the report, with `ConfirmDialog` guard

Status transitions allowed from the admin dashboard:
- `open` → `acknowledged` (sets `acknowledged_by`, `acknowledged_at`)
- `acknowledged` → `resolved` (sets `resolved_by`, `resolved_at`)
- `acknowledged` or `resolved` → `open` (clears acknowledgment and resolution fields)

### 8.5 Analytics

**Route:** `/[locale]/analytics`  
**File:** `src/app/[locale]/(dashboard)/analytics/page.tsx`

Three tabs:

| Tab | Data source | Chart type |
|---|---|---|
| Delay Analysis | `getDelayAnalysis(startDate?, endDate?)` → `delay_analysis` table | `DelayAnalysisChart` (Recharts BarChart) |
| Turnaround Summary | `getFlightTurnaroundSummary()` → `flight_turnaround_summary` table | `TurnaroundSummaryTable` |
| Unit Performance | `getUnitPerformance()` → aggregate over `tasks` | `UnitPerformanceTable` |

The Delay Analysis tab and Turnaround Summary tab each have an `AnalyticsFilters` card that exposes a date-range picker (`filterType="dateRange"`). Unit Performance uses a service-type filter pill group (`filterType="serviceType"`).

### 8.6 Service Types

**Route:** `/[locale]/service-types`

CRUD for ground service categories (fuelling, catering, cleaning, etc.). Create and edit forms open in a `SlideOverSheet`. Validation is enforced by Zod via React Hook Form. Soft-delete sets `is_active = false`.

`ServiceType` fields managed from the dashboard:

| Field | Type | Constraint |
|---|---|---|
| `name` | `string` | Required |
| `description` | `string` | Optional |
| `default_duration_minutes` | `number` | Required |
| `icon` | `string` | Optional |

### 8.7 Stands

**Route:** `/[locale]/stands`

CRUD for airport parking stands. Key fields:

| Field | Type | Notes |
|---|---|---|
| `code` | `string` | Stand identifier (e.g., `A12`) |
| `terminal` | `string` | Terminal name |
| `compatible_aircraft` | `string[]` | Free-form IATA aircraft codes via `TagInput` |
| `has_camera` | `boolean` | Whether a camera is installed |

### 8.8 Units

**Route (list):** `/[locale]/units`  
**Route (detail):** `/[locale]/units/[id]`

The list page shows all ground units with their service type and current status badge. The detail page adds a `UnitMembersSection` with a table of personnel (`unit_members`). Members can be added with a photo upload to Supabase Storage.

`Unit` fields managed from the dashboard:

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | Required |
| `service_type_id` | `string` | FK → `service_types` |
| `status` | `UnitStatus` | `available` \| `busy` \| `offline` |
| `compatible_aircraft` | `string[]` | Via `TagInput` |
| `shift_start_time` | `string` | HH:MM format |
| `shift_end_time` | `string` | HH:MM format |

### 8.9 Users

**Route:** `/[locale]/users`

Lists supervisors (`role = "supervisor"`) and unit managers (`role = "unit_manager"`). Creating a new user:

1. Admin fills out `UserForm` (full name, role, service type or unit assignment)
2. The form calls `POST /api/create-user` with auto-generated email and password (see §13)
3. On success, `CredentialsDialog` displays the generated credentials once — they are not stored or re-displayed after closing

---

## 9. API Routes

Both routes are **server-side only**. Environment keys used here never reach the browser bundle.

### 9.1 POST /api/create-user

**File:** `src/app/api/create-user/route.ts`  
**Auth:** Uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)

**Request body:**

```json
{
  "email": "supervisor.fuelling@groundscope.com",
  "password": "GroundScope12345!",
  "full_name": "Ahmed Hassan",
  "role": "supervisor",
  "service_type_id": "<uuid>",
  "unit_id": null
}
```

**Success response** (`201`):

```json
{ "success": true, "auth_id": "<supabase-auth-uuid>" }
```

**What it does:**
1. Calls `adminClient.auth.admin.createUser()` with `email_confirm: true` (no email verification needed)
2. Inserts a row into `users` with `auth_id`, `email`, `full_name`, `role`, `service_type_id`/`unit_id`, `is_active: true`

**Error responses:** `400` (Supabase auth/db error with message), `500` (missing env vars or unhandled exception)

### 9.2 POST /api/import-flights

**File:** `src/app/api/import-flights/route.ts`  
**Auth:** Uses `AVIATIONSTACK_API_KEY` (server-only env var)

Fetches arrivals and departures for IATA code `CAI` from the AviationStack `/v1/flights` endpoint (limit 100 per type), maps the response to the `flights` table schema, and upserts on `external_id` (the flight's IATA number).

Flights with no `flight_iataNumber` are filtered out before upsert.

AviationStack status → `FlightStatus` mapping:

| AviationStack `status` | Dashboard `FlightStatus` |
|---|---|
| `scheduled` | `scheduled` |
| `active` | `active` |
| `landed` | `arrived` |
| `departed` | `departed` |
| `cancelled` | `cancelled` |
| (anything else) | `scheduled` |

**Success response** (`200`):

```json
{ "success": true, "imported": 47 }
```

**Error responses:** `400` (AviationStack request failed or Supabase upsert error), `500` (missing env vars or unhandled exception)

---

## 10. Internationalisation & RTL

`next-intl` v4 handles all i18n. Configuration is in `src/i18n.ts`.

| Setting | Value |
|---|---|
| Supported locales | `["en", "ar"]` |
| Default locale | `"en"` |
| Locale prefix | `"always"` (every URL carries the locale segment) |
| Timezone | `UTC` |
| Message files | `src/messages/en.json`, `src/messages/ar.json` |

**Rules enforced across the codebase:**

1. Every user-facing string is a `next-intl` key — no hardcoded English text in components
2. New keys must be added to **both** `en.json` and `ar.json` in the same commit
3. The `<html>` element's `dir` attribute is set by `next-intl` to `ltr` for English and `rtl` for Arabic
4. All layout uses CSS logical properties: `ms-` / `me-` / `ps-` / `pe-` / `start-` / `end-` — never `left` / `right`

The sidebar active rail uses `start-0` so it appears on the left in LTR and the right in RTL without any conditional class.

---

## 11. Theming

`next-themes` manages light/dark mode with the `.dark` **class strategy** on the `<html>` element.

CSS custom properties in `globals.css` define all surface and semantic tokens. The `html.dark` selector overrides only the theme-sensitive tokens (surfaces, text, borders, shadow alphas). Brand colours (`--primary-*`, `--secondary-200`, semantic `--success`/`--warning`/`--error`/`--info`) are invariant across themes.

The Topbar contains a theme toggle that switches between light, dark, and system preference via `next-themes`'s `useTheme` hook. The selected preference is persisted in `localStorage` by `next-themes` across sessions.

---

## 12. Responsiveness

The dashboard is fully responsive across three target widths:

| Width | Layout |
|---|---|
| 375 px (phone) | Mobile drawer, stacked grids (`grid-cols-1`), horizontally-scrollable tables and Kanban |
| 768 px (tablet) | Two-column grids, Kanban switches to `grid-cols-3` |
| 1280 px (desktop) | Permanent sidebar (`lg:flex`), full three-column layouts |

**Key implementation decisions:**

- `DashboardShell` content column carries `min-w-0` to prevent wide tables from pushing the layout beyond the viewport
- `DataTable` is wrapped in `overflow-x-auto` with `min-w-[640px]` on the inner `<table>` so narrow viewports scroll rather than crush columns
- `SlideOverSheet` header and content use `px-4 sm:px-6` for smaller padding on phones
- Kanban columns use `flex overflow-x-auto` on mobile and `grid grid-cols-3` at `md+`, with `w-72 flex-shrink-0` on each column card for the mobile scroll track
- All bare `grid-cols-N` (N ≥ 2) patterns are prefixed with `grid-cols-1` for the mobile base
- Touch targets on all interactive elements are `min-h-[44px]` per WCAG 2.5.5

---

## 13. Credential Generation

When creating a supervisor or unit manager, the dashboard auto-generates login credentials using `lib/utils/credentials.ts`. The generated credentials are shown once in `CredentialsDialog` and are **not stored** in the database.

**Email patterns** (verified from source):

```ts
generateSupervisorEmail("Fuelling & Hydrant")
// → "supervisor.fuelling_&_hydrant@groundscope.com"

generateManagerEmail("Fuel Truck A1")
// → "manager.fuel_truck_a1@groundscope.com"
```

Spaces in the identifier are replaced with underscores; the full string is lowercased.

**Password pattern:**

```
GroundScope{4 random zero-padded digits}{1 random char from !@#$%}
```

Example: `GroundScope0347!`

The `generateCredentials(role, identifier)` function combines both into a `GeneratedCredentials` object `{ email, password }`.

---

## 14. Realtime Subscriptions

Supabase Realtime `postgres_changes` subscriptions are used in two screens:

| Screen | Channel name | Table watched | Effect on state |
|---|---|---|---|
| Overview dashboard | `tasks-realtime` | `tasks` | Re-fetches `getActiveTasksCount` and `getPendingServiceRequestsCount` |
| Overview dashboard | `reports-realtime` | `reports` | Re-fetches `getOpenReportsCount` and `getOpenReports` |

**Pattern used** (browser client only):

```ts
const subscription = supabase
  .channel("channel-name")
  .on("postgres_changes", { event: "*", schema: "public", table: "table_name" }, async () => {
    // Re-fetch from server action helpers — Realtime payloads do not carry joined data
  })
  .subscribe();

// Cleanup in useEffect return:
return () => { subscription.unsubscribe(); };
```

Realtime does not return joined/related rows in the change payload. The pattern used here re-calls the server-action query helpers on every change event, which keeps the component data consistent with joins intact.

---

## 15. Deployment

The dashboard is deployed to **Vercel**. Required environment variables in the Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AVIATIONSTACK_API_KEY
```

**Access control:** To share the deployed URL publicly without requiring Vercel authentication, go to the Vercel project → Settings → Deployment Protection → disable Vercel Authentication.

**Session persistence:** The middleware (`src/middleware.ts`) refreshes the Supabase auth session on every request by calling `supabase.auth.getUser()`. This writes rotated tokens back to cookies automatically, preventing the ~1-hour JWT expiry that would otherwise cause RLS to return empty rows without an error.

**Build command:** `next build`  
**Output:** static + server (Next.js default — Vercel detects automatically)

---

## 16. Non-Negotiable Conventions

These rules are enforced across the entire codebase. Violating them can break security, RTL layout, internationalisation, or theming silently.

| Rule | Reason |
|---|---|
| No Supabase calls inside components — all reads/writes go through `lib/queries/*` | Keeps query logic testable and prevents credential exposure |
| No hardcoded hex colors — use Tailwind token classes only | Token system is how dark mode works |
| No hardcoded user-facing strings — use `next-intl` keys, add to both JSON files | Arabic locale would display raw key strings |
| No hardcoded `left`/`right` — use logical CSS (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) | RTL support breaks without logical properties |
| No status/priority/severity color logic inline — call `lib/utils/status-colors.ts` | Single source of truth; prevents colour drift |
| No destructive action without a `ConfirmDialog` | Prevents accidental data loss |
| Soft delete only — `is_active = false`; never hard-delete rows | Mobile app holds FK references; hard delete would break them |
| Server client for page data fetching, browser client for Realtime | Wrong client causes session-cookie mismatch or missing data under RLS |
| All forms validated with Zod; show inline field errors | Prevents invalid data reaching Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` and `AVIATIONSTACK_API_KEY` must never use `NEXT_PUBLIC_` prefix | These keys bypass RLS and would be exposed in the browser bundle |
| Animations: max 350 ms duration; honour `prefers-reduced-motion` | Accessibility; fast enough not to impede productivity |

---

*Document last verified against source: 2026-06-29. All function signatures, table names, enum values, route paths, and environment variable names were checked against the live codebase before writing.*
