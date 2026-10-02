# Phase 11 (Dashboard) — Handoff

Work was interrupted mid-implementation (context limit). This file exists so
whoever continues — including a different tool/agent (Antigravity/Gemini) —
does not have to re-derive the plan from scratch. Read this before touching
any file under `src/app/(dashboard)/dashboards/`.

**Reference reading, in this order:**
1. `tanStackImplementationPlan.md` (repo root) — the canonical 21-phase plan.
   Phase 11's own section is short; most of the real design work for this
   phase happened in this conversation and is captured below, not in that file.
2. `docs/tanstackquery/conventions.md` — the worked-example rules (query key
   shape, `enabled`, `select`, invalidation, error handling).
3. `docs/tanstackquery/migration-status.md` — what's actually done vs. planned
   across all 21 phases. **Update this file's "Done" table with Phase 11 once
   the work below is complete and verified** (it doesn't have an entry yet).

## Important: another process may be editing this repo concurrently

Partway through this session, `src/lib/query/keys.js` was found modified
between reads (new `users` and `logManagement` namespaces appeared that this
session did not add). That means Phases 8/9/10 (Group Management, User
Registry, Log Management) were being migrated by a **separate, concurrent
process** while this session worked on Phase 11. **Before editing
`src/lib/query/keys.js` or `docs/tanstackquery/migration-status.md`, re-read
them fresh** — do not assume the state described in this handoff is still
current for those two files. The `dashboard` namespace this session added to
`keys.js` should still be there (see below), but re-read before editing to
avoid clobbering unrelated concurrent additions.

---

## What Phase 11 actually covers (verified against the real code, not just the plan)

**Services:** `src/services/dashboard/dashboardService.js` (10 functions) +
`src/services/dashboard/expressionService.js` (9 functions, only 5 have a
real consumer in this route — see "Dead exports" below).

**Routes:** `(dashboard)/dashboards/` (landing list), `dashboards/[id]/`
(detail/grid), `dashboards/create/` (standalone chart-builder wizard),
`dashboards/monitor/` (standalone live-monitor widget).

### Two real bugs found and fixed as part of this migration

1. **`viewDashboard` in `dashboardService.js` swallowed all errors** with a
   `try/catch` that `console.warn`'d and returned `null` — indistinguishable
   from "dashboard genuinely doesn't exist." Removed the try/catch so real
   failures propagate to the query's `isError`, and `[id]/page.jsx` now
   renders a distinct "Failed to Load" (with Retry) vs. "Dashboard Not Found"
   state. **Already fixed** (see Done list below).
2. **`DashboardConfigModal.jsx`'s `handleCreate` and `EditDashboardModal.jsx`'s
   `handleSave` call `createVisualChart(bp)` and `editVisual(...)` WITHOUT a
   `plantCode` argument** (unlike `useDashboardModalForm`'s own internal
   preview effect, which does pass it correctly). Since `buildBackendPayload()`
   never includes `plant_code_id` either, these two save paths currently POST
   with an undefined/wrong plant scope — a real multi-tenancy bug (CLAUDE.md
   Rule 0). **NOT YET FIXED** — fixing these two call sites (by routing them
   through the new `useRenderVisualChart`/`useCreateVisual`/`useEditVisual`
   mutation hooks, which require `plantCode` structurally) is still pending;
   see the per-file TODO list below. `MonitorEditModal.jsx` has the same
   missing-plantCode bug on its own `createVisualChart` call (also unfixed).

### Dead code found (verify still true, then delete)

- **`src/app/(dashboard)/dashboards/_hooks/useDashboardsPage.js`** — a second,
  much older "dashboards page" hook (60s `setInterval` poll via `viewWorkspace`,
  the `window.layoutSaveTimeout` global-clobbering bug the plan calls out at
  `tanStackImplementationPlan.md` line 89/945) — confirmed via repo-wide grep
  that **nothing imports it**. Not reachable from any route.
- **`src/app/(dashboard)/dashboards/_hooks/useContainerWidth.js`** — only
  consumer was the dead file above (real usage elsewhere in the app imports
  `useContainerWidth` from the `react-grid-layout` package, not this local
  file). Also dead.
- Because both are unreachable, **the plan's Phase-11 "fix the
  `window.layoutSaveTimeout` bug" adjacent-cleanup item is moot** — the bug
  lives only in dead code. Simplest correct action: delete both files instead
  of fixing the bug in place. **NOT YET DONE.**
- **Dead expression-service exports** (in scope for this route but zero call
  sites): `getExpressionList`, `getExpressionDetail`, `pauseResumeExpression`,
  `searchExpressionTags` in `src/services/dashboard/expressionService.js`.
  Leave unmigrated, same "no consumer" treatment as `pnidService.health` in
  Phase 1a — do not delete the exports (out of scope; they may be intentional
  API surface for a future feature), just don't build hooks for them.

---

## Design decisions made this session (apply these, don't re-derive)

### Query keys (`src/lib/query/keys.js`) — DONE, already added

```js
dashboard: {
    all: (plant) => ['dashboard', plant],
    list: (plant) => ['dashboard', plant, 'list'],
    detail: (plant, dashboardId) => ['dashboard', plant, 'detail', dashboardId],
    equipment: (plant, dashboardId) => ['dashboard', plant, 'equipment', dashboardId ?? null],
    equipmentTags: (plant, equipmentId, dashboardId) => ['dashboard', plant, 'equipment-tags', equipmentId, dashboardId ?? null],
    preview: (plant, payload) => ['dashboard', plant, 'preview', payload ?? {}],
    cronValidation: (plant, cron) => ['dashboard', plant, 'cron-validation', cron ?? ''],
},
```

Verify this block is still present (see the concurrent-edit warning above)
before adding anything else to the file.

### `createVisualChart` gets TWO wrappers, not one

The service function `createVisualChart` is called two structurally different
ways in the existing code, and both wrappers already exist in
`_queries/useDashboardQueries.js` (done):

- **`useVisualChartPreview(plantCode, payload, { enabled })`** — a `useQuery`.
  Used everywhere the app auto-refetches a live chart preview as the user
  edits config (chart type, metrics, time window, …): `useDashboardCreate`,
  `useDashboardMonitor`, `useDashboardModalForm`, `MonitorEditModal`. The
  **entire payload object is passed as the query key** — this is the key
  simplification of the whole phase: it eliminates 3-4 separate hand-maintained
  `useEffect` dependency arrays (one of them 20 items long, in
  `useDashboardModalForm.js`, already migrated — see Done list) because the
  key IS the payload, so there is nothing to keep in sync.
- **`useRenderVisualChart(plantCode)`** — a `useMutation`. Used for the
  one-shot, guaranteed-fresh render fired immediately before a Save/Create
  persists a visual (`DashboardConfigModal.handleCreate`,
  `EditDashboardModal.handleSave`, `useDashboardCreate.handleSave`,
  `useVisualDrawer.handleSaveVisual` — the last one is **already migrated**).
  Deliberately NOT reusing the query cache here: `staleTime` is 30s by
  default, and reusing a stale cached render at Save time is a worse tradeoff
  than one extra request. `useVisualDrawer.js` (already done) is the reference
  implementation for how to wire this.

### `activeGroup` (the `[id]/page.jsx` detail object) is now query-cache-backed, not local React state

Pre-migration, `[id]/page.jsx` fetched `viewDashboard` into local state and
merged it into `useDashboardGroups()`'s local `dashboards` array via
`saveDashboardsState`. That merge pattern is gone. New shape (**already
implemented** — see Done list):

- `useDashboardsList(plantCode)` → the list query, used by the landing page
  and `layout.jsx` (PageHeader title/subtitle on the detail route). **Two
  independent call sites of this hook now share one cache entry for free**
  (`layout.jsx` calls `useDashboardGroups()` itself, separately from
  `[id]/page.jsx` — this was already true before the migration, it's just now
  actually deduplicated instead of two real requests).
- `useDashboardDetail(plantCode, dashboardId)` → its own, separate query key
  (`dashboard.detail`). `[id]/page.jsx` uses this directly as `activeGroup` —
  no merge with the list row. (`viewDashboard`'s parsed response already
  spreads all backend fields via `...rawDash`, so it's self-sufficient.)
- **Grid layout has no backend endpoint at all** — "Save Layout" only ever
  wrote to local state, never to the server. Since the canonical visuals array
  moved into the query cache, "saving" a layout now means
  `queryClient.setQueryData(queryKeys.dashboard.detail(plantCode, activeGroupId), prev => ({...prev, visuals: tempVisuals}))`.
  This is intentional and matches conventions.md item 8 (seeding/editing
  state layered on a query). See `useDashboardLayout.js` (done).
- `useVisualDrawer.js` (done) does the same `setQueryData` write after a
  successful create/edit/delete-visual mutation, **in addition to** the
  mutation's own `invalidateQueries` (already declared in
  `_queries/useDashboardQueries.js`) — the `setQueryData` gives the original
  instant/optimistic feel, the invalidation reconciles with the server
  shortly after in the background. Do not remove either half.

### `testExpression` ("Test Formula" button) is a MUTATION, not a query

Even though `validateCron` (below) is a query, `testExpression` stays a
mutation: it's fired by an explicit button click, not auto-fired on every
keystroke (contrast with Phase 4's `calculate*` endpoints, which are the
precedent for "compute-only, explicit-trigger → mutation, not query"). It's
marked `meta: { silent: true }` in `_queries/useDashboardQueries.js` because
the caller (`useFormulaBuilder.handleCompute`) already renders a rich inline
error box with custom message parsing — a duplicate global toast would be
redundant. **This wrapper mutation already exists** in
`_queries/useDashboardQueries.js` as `useTestExpression`; wiring the one
remaining call site is the interrupted step (see "Exact next step" below).

### `validateCron` (cron schedule field in `FormulaBuilder.jsx`) IS a query — debounce the input value yourself

`useCronValidation(plantCode, cron, { enabled })` already exists in
`_queries/useDashboardQueries.js`. It does **not** debounce internally — the
caller must debounce the `cron` string before passing it in (there's no
existing shared debounce hook in this codebase; write a small local
`useState` + `useEffect` debounce inline in `FormulaBuilder.jsx`, matching the
400ms the pre-migration code used with a raw `setTimeout`). **NOT YET WIRED**
— this is still pending.

### Expression CRUD (create/modify/delete) mutations have no invalidation target

The "custom logic" list a user builds while configuring one visual is local
form state (`customLogicList` in `useDashboardModalForm`), not a server-cached
list read anywhere in this feature — so `useCreateExpression`/
`useModifyExpression`/`useDeleteExpression` in `_queries/useDashboardQueries.js`
correctly have no `invalidateQueries` call (commented as the rule-50
exception). Don't add one.

### Preserve the existing "best-effort, always succeeds locally" pattern — don't silently fix it

Both `handleDeleteCustomLogic`/`handleSaveFormula` (in `useCustomLogicHandlers.js`,
already migrated) and `useVisualDrawer.handleDeleteVisual` (already migrated)
swallow a failed backend call and proceed with the local state change
regardless. This is a pre-existing, deliberate-looking pattern repeated across
the feature (not something introduced by the migration) — it was preserved
byte-for-byte in behavior, just with the `console.warn` calls removed (CLAUDE.md
rule 36: no console.warn in hook files) and replaced with an explanatory
comment. `useDeleteExpression`/`useDeleteVisual` mutations are marked
`meta: { silent: true }` for this reason. **Do not "fix" this to hard-fail** —
that would be an unannounced behavior change requiring its own sign-off,
exactly like the `useWorkspaceUpload.js` precedent from Phase 1a (see
`docs/tanstackquery/migration-status.md`'s "Outstanding sign-off" section).
One minor, acceptable behavior improvement already happened as a side effect:
`useCreateExpression`/`useModifyExpression` are NOT marked silent, so a failed
save now toasts (via the global `MutationCache` handler) where before it was
completely invisible (`console.warn` only) — this is in the spirit of the
migration's "surface real errors" direction and doesn't change the
"local save still proceeds" behavior, so it was not treated as something
needing separate sign-off.

---

## File-by-file status

### Done (verified working as of interruption — not yet build/lint tested)

- `src/lib/query/keys.js` — `dashboard` namespace added (verify still present
  per the concurrent-edit warning above).
- `src/services/dashboard/dashboardService.js` — threaded `{ signal }` through
  `listDashboards`, `viewDashboard`, `listEquipment`, `getTagsByEquipment`,
  `createVisualChart`; removed `viewDashboard`'s error-swallowing try/catch.
- `src/services/dashboard/expressionService.js` — threaded `{ signal }`
  through `validateCron` only (the only one that became a query).
- `src/app/(dashboard)/dashboards/_queries/useDashboardQueries.js` — **new
  file**, all reads + mutations for this phase (see design decisions above).
  This is complete and should not need further changes.
- `src/app/(dashboard)/dashboards/_hooks/useDashboardGroups.js` — rewritten;
  public shape (including all the `*Group*` backward-compat aliases) preserved
  1:1 so `layout.jsx`, `LandingView.jsx`, etc. needed zero changes. Removed
  `saveDashboardsState`/`saveGroupsState` from the returned object (no longer
  needed — see next two files) and confirmed via grep that no other file
  outside this feature imports them.
- `src/app/(dashboard)/dashboards/[id]/page.jsx` — rewritten to source
  `activeGroup` from `useDashboardDetail`, added a distinct error/retry state,
  dropped the manual `viewDashboard` effect + `saveDashboardsState` merge.
  Also dropped a dead unused `PageHeader` import that existed in the
  pre-migration file (it was never actually rendered there — `layout.jsx`
  owns `PageHeader` per CLAUDE.md rule 45).
- `src/app/(dashboard)/dashboards/_hooks/useDashboardLayout.js` — rewritten;
  signature changed from `{ activeGroupId, dashboardGroups, saveGroupsState }`
  to `{ plantCode, activeGroupId, activeGroup }`; `handleSaveLayout` now
  writes via `queryClient.setQueryData`. Still re-exports
  `resolveAndCompactLayout` (consumed by `useVisualDrawer.js` and
  `DetailView.jsx`).
- `src/app/(dashboard)/dashboards/_hooks/useVisualDrawer.js` — rewritten;
  signature changed the same way (`plantCode`/`activeGroup` instead of
  `dashboardGroups`/`saveGroupsState`); uses
  `useRenderVisualChart`/`useCreateVisual`/`useEditVisual`/`useDeleteVisual`.
- `src/app/(dashboard)/dashboards/_hooks/useEquipmentMetrics.js` — rewritten
  to use `useEquipmentList`/`useEquipmentTags`; `xAxisList` hoisted to a
  module-level constant (CLAUDE.md rule 22, it never depended on props/state).
- `src/app/(dashboard)/dashboards/_hooks/useDashboardModalForm.js` — rewritten;
  the ~20-item dependency array `useEffect` that drove the live preview is
  replaced by `useVisualChartPreview` keyed on the payload itself;
  `handlePreviewActualData` is now just `previewQuery.refetch()`.
  `initialValues.previewData` (used by `EditDashboardModal` to seed the panel
  with the visual's already-saved chart) is preserved as a fallback while the
  query has no data yet for the current key.
- `src/app/(dashboard)/dashboards/_hooks/useCustomLogicHandlers.js` —
  rewritten to use `useCreateExpression`/`useModifyExpression`/
  `useDeleteExpression`; `console.warn` calls removed per rule 36 (see the
  "best-effort" note above for why the try/catch bodies are now
  comment-only, not a hard failure).

### In progress — BROKEN right now, fix this first

- **`src/app/(dashboard)/dashboards/_components/form/_hooks/useFormulaBuilder.js`**
  — the import was changed (`useTestExpression` imported, `mutateAsync: testExpressionAsync`
  destructured at the top of the hook) but the call site inside `handleCompute`
  (around line 90) **still calls the old, now-unimported `testExpression(formula, plantCode)`**
  — this is a ReferenceError at runtime as it stands. **Exact fix needed:**
  change line 90 from
  ```js
  const json = await testExpression(formula, plantCode);
  ```
  to
  ```js
  const json = await testExpressionAsync(formula);
  ```
  Nothing else in this file needs to change — `handleCompute`'s existing
  try/catch already renders `computeError` inline exactly as before; the
  mutation is just a thin request wrapper here (see "testExpression is a
  MUTATION" design note above for why `meta.silent: true` is set on the
  mutation itself rather than removing this local error handling).

### Not started

- **`src/app/(dashboard)/dashboards/_components/form/FormulaBuilder.jsx`** —
  still calls `validateCron` directly (imported from
  `@/src/services/dashboard/expressionService`) inside a raw 400ms
  `setTimeout` effect (~lines 44-65). Replace with: a small local debounce of
  the `activeCronStr` value (plain `useState`+`useEffect`, no shared hook
  exists yet), then `useCronValidation(plantCode, debouncedCron, { enabled: !!debouncedCron })`
  from `_queries/useDashboardQueries.js`, deriving `cronValidation`
  (`{isLoading, isValid, description}`) from the query's `isFetching`/`data`/
  `isError`/`error` the same way `useDashboardModalForm.js` derived
  `previewData`/`previewError` from `useVisualChartPreview` (use that as the
  template). Also fix the `useApp()` import usage if unused after the change.
- **`src/app/(dashboard)/dashboards/_components/DashboardConfigModal.jsx`** —
  `handleCreate` calls `createVisualChart(bp)` and `createVisual(f.mTitle || 'Untitled Visual', savedChartPayload)`
  directly, both **missing `plantCode`** (confirmed bug, see above). Replace
  with `useRenderVisualChart(plantCode)` and `useCreateVisual(plantCode)` from
  `_queries/useDashboardQueries.js` (need `useApp()` for `plantCode` — this
  component doesn't currently import it). `useCreateVisual`'s mutate variables
  are `{ visualName, savedChart, dashboardId }` — `dashboardId` here should be
  `f.buildBackendPayload().dashboard_id` (same value already embedded in `bp`
  by `useDashboardModalForm`). Remove the now-unused direct
  `dashboardService` import.
- **`src/app/(dashboard)/dashboards/_components/EditDashboardModal.jsx`** —
  same bug and same fix shape as `DashboardConfigModal.jsx` above, using
  `useRenderVisualChart`/`useEditVisual`. `useEditVisual`'s mutate variables
  are `{ visualId, visualName, visualConfigPayload, dashboardId }` —
  `visualId` is `dashboard.id` (the prop, an existing visual being edited).
- **`src/app/(dashboard)/dashboards/monitor/_components/MonitorEditModal.jsx`**
  — the preview `useEffect` (~lines 42-55) calls `createVisualChart({...})`
  with **no plantCode arg at all** and doesn't even import `useApp()` — same
  bug class again. Replace with `useVisualChartPreview(plantCode, payload, { enabled: !!metricA })`,
  add `useApp()` for `plantCode`. Derive `previewData`/`previewStats`/
  `previewLabelA`/`previewLabelB` from the query's data the same shape as the
  original `.then()` callback did (merge `seriesA`/`seriesB` into
  `{label, a, b}` pairs via `formatTime` — this is view-level derivation, do
  it with `useMemo`, not in a service-level `select`, since
  `useDashboardCreate.js` and `useDashboardMonitor.js` need slightly different
  derived shapes from the same raw response — see next two items).
- **`src/app/(dashboard)/dashboards/create/_hooks/useDashboardCreate.js`** —
  two separate concerns:
  1. The preview `useEffect` (~lines 70-92, keyed on
     `[metricA, metricB, aggregation, interval]`, lightweight
     `{metric, metric2, aggregation, interval}` payload) → replace with
     `useVisualChartPreview(plantCode, payload, { enabled })`, derive
     `chartData`/`stats`/`metricALabel`/`metricBLabel` via `useMemo` (same
     merge logic as today's `.then()`).
  2. `handleSave` (~lines 94-150) calls `createVisualChart(payload, plantCode)`
     with the FULL visual-creation payload (different shape from the preview
     effect's lightweight payload — confirmed these are genuinely two
     different calls to the same endpoint, not reusable) then `createVisual`.
     Replace both with `useRenderVisualChart(plantCode)` /
     `useCreateVisual(plantCode)` mutations (this call site already correctly
     passes `plantCode` today — no bug here, just needs rewiring to the new
     hooks for consistency and cache invalidation).
- **`src/app/(dashboard)/dashboards/monitor/_hooks/useDashboardMonitor.js`** —
  preview `useEffect` (~lines 47-63, same lightweight payload shape as
  `useDashboardCreate`'s preview effect) → `useVisualChartPreview`, same
  pattern. `handleRefresh` (~lines 65-68) currently force-remounts the effect
  via a clear-then-reset trick (`setMetricA('') then requestAnimationFrame(() => setMetricA(tmp))`)
  — replace with the query's `refetch()` directly, drop the
  clear/reset-via-rAF hack entirely.
- **Delete dead files:**
  `src/app/(dashboard)/dashboards/_hooks/useDashboardsPage.js` and
  `src/app/(dashboard)/dashboards/_hooks/useContainerWidth.js` (re-verify
  they're still unreferenced via grep before deleting — see "Dead code found"
  above for the exact grep commands' results at time of writing).
- **Verification** (per `docs/tanstackquery/conventions.md` §12 and the plan's
  own Verification section): `npm run build`, `npm run lint` (compare delta
  against clean `HEAD`, not absolute count — the repo has pre-existing lint
  debt), then manually exercise: landing page load, create dashboard, open a
  dashboard detail, add/edit/delete a visual (both in and out of layout edit
  mode), toggle layout edit mode + save/reset layout, the `create/` wizard
  save flow, the `monitor/` page load + refresh + edit modal, and the formula
  builder's Test/Save buttons with a cron schedule entered (watch Network tab
  for the debounce actually collapsing keystrokes into one request).
- **Update `docs/tanstackquery/migration-status.md`** — add a Phase 11 row to
  the "Done" table once everything above is complete and verified, following
  the same terse style as the existing Phase 5/6/7 rows (one line: what it
  removed). Mention the two plantCode bugs fixed and the two dead files
  deleted, the way the doc's existing "Outstanding sign-off" section does for
  Phase 1a's upload bug. **Re-read the file fresh first** — see the
  concurrent-edit warning at the top of this handoff.

---

## Everything downstream of `useDashboardModalForm.js` that was NOT touched (confirmed out of scope, no changes needed)

`useFormValidation.js`, `useFormResetEffect.js`, `useGridInteraction.js`,
`layoutCompaction.js`, `DetailView.jsx`, `DetailToolbar.jsx`, `DashboardGrid.jsx`,
`KpiStatusStrip.jsx`, `VisualCard.jsx`, `LandingView.jsx`, `GroupCard.jsx`,
`GroupListView.jsx`, `DashboardSkeleton.jsx`, `layout.jsx`, `page.jsx` (landing),
`Modal.jsx`, all `_components/preview/*`, all `_components/widgets/*`,
`_components/form/*` other than `FormulaBuilder.jsx`/`useFormulaBuilder.js`,
`create/_components/*`, `create/page.jsx`, `monitor/_components/*` other than
`MonitorEditModal.jsx`, `monitor/page.jsx` — none of these call a service
function directly; they only consume hook return values, so their prop
signatures are unaffected by this migration as long as the hooks above keep
returning the same shape (which every rewrite in the Done list above was
careful to preserve).
