# GroundScope Admin — Functional Audit & Fix Log

> Deep audit of functional (non-UI) bugs. Each issue: symptom → root cause → fix → status.
> This file is the **single source of truth** for the audit and is **safe to resume from**:
> the "Status" column tells you exactly what is done and what remains.

**Audit date:** 2026-06-29
**Branch:** `refactor/ui-ux`
**Scope:** authentication, reports workflow, CRUD writes (stands etc.), data integrity.

---

## ▶ How to resume this work (if a session was interrupted)

1. Read the **Progress tracker** below — it lists every issue and whether its fix is applied.
2. For any issue marked `TODO` or `IN PROGRESS`, the "Fix" section has the exact change.
3. After applying a fix, run `npm run build` to confirm no type/compile errors, then flip the
   status to `DONE` here.
4. Nothing is pushed to git automatically — all fixes live on branch `refactor/ui-ux`.

### Progress tracker

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | No authentication gate (anyone reaches dashboard / "always logged in") | 🔴 Critical | DONE |
| 2 | Report acknowledge/resolve writes the wrong user identity | 🟠 High | DONE |
| 3 | Stand delete (and other writes) fail silently under RLS | 🟠 High | DONE (code) / DB verify needed |
| 4 | Report dialog "Cancel" label uses wrong i18n namespace | 🟡 Low | DONE |
| 5 | RLS write policies likely block admin writes | 🟠 High | DB ACTION REQUIRED (documented) |
| 6 | Same silent-write pattern across other entities | 🟡 Medium | DOCUMENTED (optional hardening) |

---

## Issue #1 — No authentication gate 🔴 Critical

### Symptom
- Sending the deployed link to anyone shows the dashboard — it behaves as if "already logged in".
- The login page is never enforced; you can open `/en/flights` etc. directly without signing in.
- You are never asked to log in again, and logging out doesn't really stop access.

### Root cause
`src/middleware.ts` **refreshed** the Supabase session on every request but never **gated**
on it. It contained no redirect logic:
- An unauthenticated visitor on a dashboard route was **not** redirected to `/login`.
- An authenticated visitor on `/login` was **not** redirected into the app.

So the `(dashboard)` route group was effectively public. Combined with the session-refresh
(which keeps a valid cookie alive ~indefinitely), your own browser "never logs out", and a
fresh visitor simply lands on the dashboard chrome.

### Fix (applied)
`src/middleware.ts` now, after refreshing the session, reads `supabase.auth.getUser()` and:
- redirects to `/{locale}/login` when there is **no** user and the route is **not** the login page;
- redirects to `/{locale}` when there **is** a user and the route **is** the login page;
- copies the refreshed auth cookies onto the redirect response so token rotation is preserved;
- fails **open** only on a network/config exception (so a Supabase outage can't hard-lock the app).

### How to verify
1. Open an incognito window → visit the site → you should land on `/en/login`.
2. Log in as admin → you reach the dashboard.
3. Click logout → you return to `/login` and can no longer open `/en/flights` directly.

---

## Issue #2 — Report acknowledge/resolve writes the wrong identity 🟠 High

### Symptom
Acknowledging or resolving a report does nothing (status doesn't stick), or the
acknowledger/resolver name never appears.

### Root cause
The flow passed the **Supabase auth user id** into the database write:

```
// report-detail-view.tsx (before)
const { user } = useSession();          // user.id === auth.users.id  (the auth_id)
await acknowledgeReport(report.id, user.id);
```

But `reports.acknowledged_by` / `reports.resolved_by` are foreign keys to the **application**
`public.users` table (`users.id`), **not** `auth.users.id`. This is confirmed by the query join
`acknowledged_user:acknowledged_by(full_name)` — `full_name` only exists on `public.users`.

Passing the `auth_id` therefore violates the foreign key (or matches no row), so:
- with an FK constraint → the UPDATE throws and is swallowed by the `catch` (silent failure);
- without one → the status flips but the acknowledger join is always empty.

There was also a secondary defect: trusting a **client-supplied** user id for a privileged
write is unsafe — the browser could send any id.

### Fix (applied)
Identity is now derived **server-side** from the authenticated session, never from the client:

- `acknowledgeReport(reportId)` and `resolveReport(reportId)` no longer take an id argument.
  They call `getCurrentUser()` (which maps `auth_id` → the `public.users` row) and write
  `acknowledged_by` / `resolved_by = user.id` (the correct application id). If there is no
  authenticated admin, they throw a clear error instead of writing a bad id.
- `report-detail-view.tsx` calls the actions without an id and updates local state from the
  returned, server-persisted row.

### How to verify
Open a report → Acknowledge → status becomes "acknowledged" and persists after refresh →
Resolve → status becomes "resolved". Reopen returns it to "open".

---

## Issue #3 — Stand delete (and other writes) fail silently 🟠 High

### Symptom
Clicking delete on a stand appears to do nothing — the stand stays in the list, no error shown.

### Root cause
`deleteStand` (a soft delete) ran:

```
await supabase.from("stands").update({ is_active: false }).eq("id", id);   // no .select()
```

Under Supabase **Row Level Security**, an UPDATE the policy disallows returns
`{ data: null, error: null }` — i.e. **success with zero rows changed**. With no `.select()`,
the code cannot tell "updated 1 row" from "updated 0 rows", so it reports success while the
row is untouched. The list reloads and the stand is still there.

(The true reason 0 rows are affected is almost always an RLS write policy — see Issue #5.)

### Fix (applied)
`deleteStand` and `updateStand` now `.select()` the affected row and throw a clear error when
no row comes back, converting a silent no-op into a visible failure the UI can surface:

```
const { data, error } = await supabase
  .from("stands").update({ is_active: false }).eq("id", id).select();
if (error) throw error;
if (!data || data.length === 0) {
  throw new Error("Stand was not deleted — no row updated (check RLS update policy).");
}
```

> This makes the failure **honest**. If your RLS policy already allows the admin to update
> `stands`, delete now works end-to-end. If it doesn't, you'll now get a real error instead of
> a silent no-op — fix the policy per Issue #5.

---

## Issue #4 — Report dialog "Cancel" uses wrong i18n namespace 🟡 Low

### Symptom
The Cancel button in the acknowledge/resolve/reopen confirmation dialogs shows a raw key
(e.g. `common.cancel`) instead of the translated word.

### Root cause
`report-detail-dialogs.tsx` scopes translations to the `reports` namespace
(`useTranslations("reports")`) but then calls `t("common.cancel")`, which resolves to
`reports.common.cancel` — a key that does not exist.

### Fix (applied)
A second hook `const tCommon = useTranslations("common")` is used for the shared Cancel label,
so it resolves to the real `common.cancel` string in both `en.json` and `ar.json`.

---

## Issue #5 — RLS write policies likely block admin writes 🟠 High (DB action required)

### Why this is separate
Issues #2 and #3 fix the **code**. But if writes still fail after those fixes, the cause is in
the **database**, not this repo: the Supabase **Row Level Security** policies on the affected
tables don't grant the admin UPDATE/DELETE. This cannot be fixed from the Next.js codebase —
it is configured in the Supabase dashboard (SQL editor), which is independent of the
`../ground_scope/` Flutter project.

### How to confirm
In Supabase → Table editor → each table → "RLS" — check whether an UPDATE policy exists that
the admin session satisfies. Reads working but writes not = read policy exists, write policy
missing/too strict.

### Remediation (run in Supabase SQL editor — verify against your security model first)
Example policy allowing authenticated admins to update `stands` (adapt per table; do **not**
blindly widen access in production):

```sql
-- Allow an authenticated admin (row in public.users with role='admin') to update stands
create policy "admins update stands"
on public.stands for update
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.auth_id = auth.uid() and u.role = 'admin' and u.is_active
  )
);
```

Repeat for every table the dashboard writes to: `stands`, `service_types`, `units`,
`unit_members`, `users`, `tasks`, `reports`, `flights`, `flight_service_requests`.

---

## Issue #6 — Same silent-write pattern across other entities 🟡 Medium (optional hardening)

### Where
These writes use `.update(...).eq(...)` **without** `.select()`, so they share Issue #3's
blind spot (silent RLS no-op):

| File | Function |
|---|---|
| `lib/queries/service-types.ts` | `updateServiceType`, `deleteServiceType` |
| `lib/queries/units.ts` | `updateUnit` |
| `lib/queries/unit-members.ts` | `updateUnitMember`, `deleteUnitMember` |
| `lib/queries/users.ts` | `updateUser`, `deleteUser` |
| `lib/queries/operations.ts` | `updateTaskStatus` (Kanban drag) |
| `lib/queries/flights.ts` | `updateFlight` |
| `lib/queries/service-requests.ts` | `updateServiceRequest` |

### Recommended fix (same shape as Issue #3)
Add `.select()` and throw when zero rows are returned, so every write surfaces RLS failures
instead of pretending to succeed. Low risk (each is a single-row update by id). Apply on
request — left out of this pass to keep the blast radius tight and reviewable.

---

## Files changed in this audit

| File | Issue(s) |
|---|---|
| `src/middleware.ts` | #1 |
| `src/lib/queries/reports.ts` | #2 |
| `src/components/sections/report-detail-view.tsx` | #2 |
| `src/components/sections/report-detail-dialogs.tsx` | #4 |
| `src/lib/queries/stands.ts` | #3 |

> Issue #5 is a Supabase configuration action (no repo change). Issue #6 is documented for an
> optional follow-up pass.
