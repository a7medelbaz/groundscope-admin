# GroundScope Admin — Responsive Upgrade Plan

> **Implementation model: Haiku.** Every task below is atomic, gives exact file paths and exact
> Tailwind class strings, and ends with a **Done When** check. Do the phases **in order**. Do not
> skip ahead — Phase 1 is the root fix everything else builds on. After each phase, run
> `/clean-code-guard` on the files you touched and fix any violation before moving on.

---

## 0. Diagnosis (read once, do not skip)

The app is "very unresponsive" for **one root reason**: the dashboard shell has no mobile mode.

| File | Problem | Impact on phone (375px) |
|---|---|---|
| `src/app/[locale]/(dashboard)/layout.tsx` | `flex h-screen` with sidebar rendered inline; `p-8` fixed | 256px sidebar eats 68% of screen; content crushed into ~120px |
| `src/components/layout/sidebar.tsx` | `w-64 h-screen` fixed, no drawer/overlay/close | Always on screen, cannot be hidden |
| `src/components/layout/topbar.tsx` | No hamburger button; `px-6` fixed | No way to open/close nav on mobile |
| Tables (`data-table.tsx` + all `*-columns.tsx`) | Wide tables, only `overflow-x-auto` | Columns unreadable, no mobile layout |
| `slide-over-sheet.tsx` | Animates `right: -400`; ok but not verified full-bleed on mobile | Sheet may not sit flush on small screens |

**What is already fine (do NOT rewrite):** `PageHeader` (already `flex-col sm:flex-row`), the Overview
page grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`), and the Kanban grid (`grid-cols-1 md:grid-cols-3`).
Leave working responsive code alone — touch only what the tasks below name.

### Breakpoint strategy (Tailwind defaults — already configured, do not change)

- `< 640` (base) — phone. Mobile-first: write base classes for phone, add `sm:`/`md:`/`lg:` to scale **up**.
- `sm: 640` — large phone / small tablet
- `md: 768` — tablet
- `lg: 1024` — **desktop. The sidebar becomes permanent at `lg` and up. Below `lg` it is a drawer.**
- `xl: 1280` — wide desktop

### Golden rules for every task

1. **Mobile-first.** Base class = phone. Then `sm: md: lg:` add desktop scaling. Never the reverse.
2. **No hardcoded `left`/`right`.** Use logical props (`ms- me- ps- pe- start- end-`) — RTL must keep working.
3. **Touch targets ≥ 44×44px** for anything tappable on mobile (`min-h-[44px]` or `p-3` minimum).
4. **No horizontal page scroll, ever.** If something overflows, it gets its own `overflow-x-auto` container.
5. Add every new user-facing string to **both** `messages/en.json` and `messages/ar.json`.

---

## Phase 1 — Responsive App Shell (THE root fix) 🎯

This phase alone fixes ~80% of the perceived problem. Mobile gets a slide-in drawer + hamburger;
desktop keeps the permanent sidebar.

### Task 1.1 — Extract shared sidebar content (DRY)

The desktop sidebar and the mobile drawer must show identical nav. Extract the inner content once so
it is not duplicated (clean-code-guard imperative #11).

**File:** `src/components/layout/sidebar-content.tsx` (NEW, `"use client"`)

Move the **brand block + nav + logout** JSX out of `sidebar.tsx` into a new `SidebarContent` component.
It takes one prop: `onNavigate?: () => void` (called when a nav link is clicked, so the mobile drawer
can close itself). Keep all existing classes identical. Add `onClick={onNavigate}` to each `<Link>`.

```tsx
"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogoutButton } from "@/app/[locale]/(dashboard)/logout-button";
import { navIcons } from "@/lib/utils/nav-icons";
import { cn } from "@/lib/utils/cn";

const navigationGroups = [
  { label: "main", items: [
    { key: "nav.overview", href: "/" },
    { key: "nav.operations", href: "/operations" },
    { key: "nav.flights", href: "/flights" },
    { key: "nav.reports", href: "/reports" },
    { key: "nav.analytics", href: "/analytics" },
  ]},
  { label: "masterData", items: [
    { key: "nav.serviceTypes", href: "/service-types" },
    { key: "nav.stands", href: "/stands" },
    { key: "nav.units", href: "/units" },
    { key: "nav.users", href: "/users" },
  ]},
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations();
  const pathname = usePathname();

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === "/en" || pathname === "/ar" : pathname.includes(href);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-control bg-gradient-brand flex items-center justify-center shadow-card">
          <span className="text-white font-extrabold text-lg">G</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-text-primary leading-tight truncate">{t("app.name")}</h2>
          <p className="text-[11px] text-text-hint leading-tight truncate">{t("app.tagline")}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
        {navigationGroups.map((group, index) => (
          <div key={group.label}>
            {index > 0 && (
              <p className="text-[11px] font-semibold text-text-hint uppercase tracking-wide px-3 mb-2">
                {t("nav.masterData")}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = navIcons[item.key];
                const active = isActiveLink(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-3 rounded-control transition-colors min-h-[44px]",
                        active
                          ? "text-primary-200 font-semibold bg-primary-200/10"
                          : "text-text-secondary hover:bg-surface-variant hover:text-text-primary"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-rail"
                          className="absolute inset-y-1.5 start-0 w-1 rounded-full bg-primary-200"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      {Icon && <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />}
                      <span className="text-sm">{t(item.key)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-divider">
        <LogoutButton />
      </div>
    </div>
  );
}
```

> Note: nav link padding went `py-2.5` → `py-3` + `min-h-[44px]` for touch targets (Golden rule #3).

**Done When:** file compiles, exports `SidebarContent`.

### Task 1.2 — Rewrite the desktop sidebar to use the shared content + hide on mobile

**File:** `src/components/layout/sidebar.tsx` (REPLACE entire file)

```tsx
import { SidebarContent } from "@/components/layout/sidebar-content";

/** Permanent sidebar — desktop only (lg+). Mobile uses MobileDrawer. */
export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 bg-surface border-e border-border h-screen flex-shrink-0">
      <SidebarContent />
    </aside>
  );
}
```

**Done When:** on a desktop width the sidebar looks identical to before; resize below 1024px and the
sidebar disappears.

### Task 1.3 — Create the mobile drawer

**File:** `src/components/layout/mobile-drawer.tsx` (NEW, `"use client"`)

Slides in from the inline-start edge (RTL-correct via `start-0`), with a dimmed backdrop and body-scroll lock.

```tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarContent } from "@/components/layout/sidebar-content";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed top-0 bottom-0 start-0 w-72 max-w-[80vw] bg-surface border-e border-border z-50"
          >
            <SidebarContent onNavigate={onClose} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
```

> RTL note: `x: "-100%"` plus `start-0` slides from the left in LTR and from the right in RTL because
> `start-0` is logical. The transform direction is acceptable for both; do not change to `left`/`right`.

**Done When:** component compiles. (Wired up in Task 1.5.)

### Task 1.4 — Add the hamburger button to the Topbar

**File:** `src/components/layout/topbar.tsx`

1. Add a prop to the component signature:
   ```tsx
   export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
   ```
2. Add `Menu` to the lucide import:
   ```tsx
   import { Bell, Sun, Moon, Languages, Menu } from "lucide-react";
   ```
3. Change the responsive padding on the header:
   `className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6"`
4. Wrap the title in a left cluster with the hamburger **before** the `<h1>`:
   ```tsx
   <div className="flex items-center gap-2 min-w-0">
     <button
       onClick={onMenuClick}
       className="lg:hidden p-2 -ms-2 rounded-control text-text-secondary hover:bg-surface-variant transition-colors"
       aria-label="Open menu"
     >
       <Menu className="w-5 h-5" strokeWidth={2} />
     </button>
     <h1 className="text-base sm:text-lg font-extrabold text-text-primary truncate">{t(titleKey)}</h1>
   </div>
   ```
   (Replace the existing bare `<h1>…</h1>` with this wrapper.)

**Done When:** hamburger shows below 1024px only; title truncates instead of overflowing.

### Task 1.5 — New client shell that owns drawer state + responsive padding

`layout.tsx` is a server component and cannot hold `useState`. Create a client shell.

**File:** `src/components/layout/dashboard-shell.tsx` (NEW, `"use client"`)

```tsx
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { Topbar } from "@/components/layout/topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
```

> `min-w-0` on the content column is critical — without it, wide tables force the whole flex row to
> overflow instead of scrolling inside their own container.

### Task 1.6 — Point the dashboard layout at the new shell

**File:** `src/app/[locale]/(dashboard)/layout.tsx` (REPLACE entire file)

```tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
```

**Phase 1 Done When (verify ALL):**
- [ ] Desktop ≥1024px: permanent sidebar, no hamburger — looks like before.
- [ ] Phone 375px: no sidebar, hamburger visible, content uses full width with `p-4`.
- [ ] Tap hamburger → drawer slides in with backdrop; tap backdrop or any nav link → closes.
- [ ] Body does not scroll behind the open drawer.
- [ ] Works in `/ar` (RTL): drawer comes from the correct side, border on correct edge.
- [ ] No horizontal scrollbar on any page at 375px.
- [ ] Run `/clean-code-guard` on all 6 files; each component ≤20 lines where reasonable, no dupes.

---

## Phase 2 — Responsive Tables

Every list page renders `DataTable`. Wide tables must scroll inside their own box and never push the page.

### Task 2.1 — Harden the DataTable scroll container

**File:** `src/components/ui/data-table.tsx`

1. The wrapper already has `overflow-x-auto`. Add `w-full` and a `min-w` on the inner `<table>` so columns
   keep a readable width instead of crushing:
   - Wrapper: `className="w-full overflow-x-auto border border-divider rounded-control"`
   - Table: `className="w-full min-w-[640px]"`
2. Reduce cell padding on small screens. In both the `<th>` and `<td>` classNames, replace `px-6 py-4`
   with `px-4 py-3 sm:px-6 sm:py-4`.

**Done When:** a table with many columns scrolls horizontally **inside its border box**; the page itself
never scrolls sideways.

### Task 2.2 — Make every list page wrap its table for scroll safety

Most list pages already drop `DataTable` straight in. Because Task 2.1 made the component self-contained,
no per-page change is needed **unless** a page puts the table in a flex row. Grep first:

```
Grep pattern: "<DataTable" glob: "src/app/**/*.tsx"
```

For each result, confirm the `DataTable` is a direct child of a block container (a `<div>` or `Card`),
**not** inside a `flex` without `min-w-0`. If you find one inside a flex row, add `min-w-0` to that row.

**Done When:** all list pages (reports, flights, units, users, service-types, stands) scroll tables
cleanly at 375px with no page overflow.

---

## Phase 3 — Slide-overs & Forms on Mobile

### Task 3.1 — Make the slide-over sheet full-bleed on phones

**File:** `src/components/ui/slide-over-sheet.tsx`

The sheet uses `w-full max-w-lg` (good) but animates the `right`/`left` CSS property by `-400px`. On a
360px phone `w-full` = 360, so `-400` already clears it — fine. Only change: ensure the inner content
padding scales down. In the content div replace `px-6 py-4` with `px-4 py-4 sm:px-6`. In the header div
replace `px-6 py-4` with `px-4 py-4 sm:px-6`.

**Done When:** sheet content is not cramped on a 375px screen; close button still reachable.

### Task 3.2 — Touch-friendly form inputs

**Files:** every file in `src/components/forms/*.tsx`

For each `<input>`, `<textarea>`, `<select>`, and submit `<button>`, ensure a minimum tap height. Most
already use `py-2.5`/`py-3`. Where you see `py-2` or smaller on an interactive control, bump it so the
control is ≥44px tall (`py-2.5` + text-sm clears it; otherwise add `min-h-[44px]`). Do **not** restyle
anything else — match existing class order and tokens (clean-code-guard #6).

**Done When:** every input/button in create/edit sheets is comfortably tappable on a phone.

---

## Phase 4 — Grid & Spacing Audit (per page)

Goal: every multi-column layout collapses to a single column on phones. Audit each page; most already
use responsive grids — only fix the ones that hardcode columns.

### Task 4.1 — Grep for non-responsive grids

```
Grep pattern: "grid-cols-[2-9]" glob: "src/**/*.tsx" output_mode: content
```

For **every** match, confirm it is prefixed by a base `grid-cols-1` and a breakpoint, e.g.
`grid grid-cols-1 md:grid-cols-3`. If a match is a bare `grid-cols-3` (no `grid-cols-1` base, no
breakpoint), rewrite it as `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N` choosing N = the original number.

### Task 4.2 — Detail pages (two-column bodies)

**Files:** `src/components/sections/report-detail-body.tsx`,
`src/app/[locale]/(dashboard)/flights/[id]/page.tsx`,
`src/app/[locale]/(dashboard)/units/[id]/page.tsx`

Find any two-column layout (`grid-cols-2`, or a `flex` with two fixed children). Ensure it is
`grid-cols-1 lg:grid-cols-2` (or `flex-col lg:flex-row`) so the columns stack on phone/tablet.

**Done When:** no page shows two side-by-side columns below 1024px; everything stacks readably.

---

## Phase 5 — Operations / Kanban horizontal mode (optional polish)

The Kanban already stacks (`grid-cols-1 md:grid-cols-3`), which is acceptable. **Optional** upgrade for a
nicer tablet feel: turn it into a horizontal scroll of fixed-width columns on small screens.

**File:** `src/components/sections/kanban-board.tsx`

Change the outer grid:
```
from: className="grid grid-cols-1 md:grid-cols-3 gap-6"
to:   className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-2 -mx-4 px-4 md:mx-0 md:px-0"
```
And give each column a width on mobile only: add `w-72 flex-shrink-0 md:w-auto` to the column
`motion.div` className (the one with `bg-surface-variant rounded-card p-4 …`).

**Done When:** on a phone the three columns scroll horizontally as cards; on desktop they're a 3-up grid.
Skip this task entirely if time-constrained — the stacked version is already responsive.

---

## Phase 6 — Final QA Matrix

Test **every** route at three widths in **both** locales and **both** themes.

Widths: **375px** (phone), **768px** (tablet), **1280px** (desktop).
Routes: `/` `/operations` `/flights` `/flights/[id]` `/reports` `/reports/[id]` `/analytics`
`/service-types` `/stands` `/units` `/units/[id]` `/users`.

For each cell of the matrix confirm:
- [ ] No horizontal page scroll.
- [ ] Sidebar = drawer below 1024px, permanent at/above.
- [ ] All text readable, nothing clipped, no overlap.
- [ ] Tables scroll inside their box.
- [ ] Tap targets ≥44px.
- [ ] RTL mirrored correctly (drawer side, borders, arrows).
- [ ] Dark theme has no invisible text.

Use Chrome DevTools device toolbar (`Ctrl+Shift+M`) to switch widths quickly.

---

## Execution Order Summary (for Haiku)

1. **Phase 1** (Tasks 1.1 → 1.6) — app shell. This is mandatory and first. Verify before continuing.
2. **Phase 2** — tables.
3. **Phase 3** — sheets & forms.
4. **Phase 4** — grid/spacing audit.
5. **Phase 5** — Kanban (optional).
6. **Phase 6** — QA matrix.

After **each** phase: run `/clean-code-guard` on changed files, fix violations, then verify the phase's
**Done When** list. Do not batch phases together. One phase, verify, commit-worthy, next.

## Guardrails (do not violate)

- ❌ Never add a hardcoded `left`/`right` — logical props only.
- ❌ Never change the Tailwind breakpoint values or the design tokens.
- ❌ Never duplicate the nav markup — both sidebar and drawer use `SidebarContent`.
- ❌ Never introduce a hardcoded color — use the existing CSS-variable Tailwind classes.
- ✅ Mobile-first: base class = phone, scale up with `sm: md: lg:`.
- ✅ Add new strings to both `en.json` and `ar.json` (Phase 1–5 add none, but if you add a tooltip/label, do this).
- ✅ Re-verify in light + dark + en + ar after every phase.
```
