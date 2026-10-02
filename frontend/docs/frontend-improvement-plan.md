# Frontend Improvement & Hardening Plan

**Application:** Decision Ops Frontend (Next.js 16 App Router, React 19)
**Audience:** Frontend engineering team
**Status:** Audit findings + recommended plan
**Date:** 2026-08-04
**Companion document:** [Domain Configuration — Backend Ownership Requirements](./domain-configuration-backend-requirements.md)

---

## 0. How this document was produced

Every number and every claim below was **measured against the current codebase**, not estimated. Where a finding names a file, it names the line. Nothing here is inferred from convention or memory.

Scope of the scan: all of `src/` excluding `src/app/(dashboard)/extra/` (out of bounds per project rules).

### Baseline measurements

| Metric | Value | Why it matters |
|---|---|---|
| Component files (`.jsx`) | **621** | Size of the surface being audited |
| Files marked `'use client'` | **454** (73 %) | React Server Components are almost entirely unused |
| Route pages that are client components | **50 of 52** | Nearly zero server rendering benefit |
| `loading.jsx` / `error.jsx` / `not-found.jsx` files | **0** | No route-level loading UI, **no route error boundaries** |
| `<Suspense>` usages | 11 | Mostly for `useSearchParams`, not for data |
| `useState` calls | **1,561** | Volume of client state |
| `useEffect` calls | **377** | Volume of side effects |
| `useMemo` calls | 164 | 1 memo per ~9.5 `useState` |
| `useCallback` calls | 483 | Reasonably used |
| `React.memo` wrapped components | **13 of 621** (2 %) | `useCallback` is largely wasted without it |
| `// eslint-disable … exhaustive-deps` | **24** across 20 files | Silenced dependency correctness warnings |
| `setInterval` polling sites | **48** | Hand-rolled polling everywhere |
| `AbortController` usages | **1** (`src/components/aivee/useAiveeChat.js`) | In-flight requests are never cancelled |
| `createContext` calls | **18** across 15 files | Context is the only state mechanism |
| `next/dynamic` imports | 17 | Little code splitting for 621 components |
| Server-state library (React Query / SWR) | **none** | Every fetch is hand-rolled |
| State library (Redux / Zustand / Jotai) | **none** | Everything is Context + `useState` |
| Virtualization library | **none** | No list windowing anywhere |
| Index-as-React-key sites | **113** | Violates project rule 35 |
| `console.log` in app/components (not `__DEV__`-gated) | 21 | Violates project rule 36 |

### The single sentence that explains most of the findings

> **The application has no server-state layer.** Every API call is a hand-written `useEffect` + `useState` + `try/catch`, so caching, deduplication, cancellation, retry, and staleness have to be re-invented (or, in practice, skipped) at all ~377 effect sites.

Almost every performance and "why is this API firing here?" symptom traces back to that one architectural gap.

---

## 1. Executive summary — top findings, ranked by impact

| # | Finding | Impact | Effort | Priority |
|---|---|---|---|---|
| 0 | **Scenario Extractor writes a hardcoded "AI insight"** — invented p-value, SHAP drivers and a "reduce load immediately" recommendation, stored as a `critical` alert (Part G1.1) | 🔴 Critical | S | **P0** |
| 1 | No caching / dedup / cancellation layer — every mount refetches | 🔴 Critical | M | **P0** |
| 2 | `AdminPanelContext` exposes a **187-key** context value with a **96-entry** dependency array | 🔴 Critical | M | **P0** |
| 3 | Zero route-level error boundaries (`error.jsx`) — one uncaught render error blanks the app | 🔴 Critical | S | **P0** |
| 4 | Authenticated API called on the **login page** before the user logs in | 🟠 High | S | **P0** |
| 5 | Four root-level context providers, three of which pass an **unmemoized** value object | 🟠 High | S | **P1** |
| 6 | Only **13 of 621** components are memoized — 483 `useCallback`s are mostly wasted | 🟠 High | M | **P1** |
| 7 | `DomainOntologyContext` `JSON.stringify`s the entire ontology to `sessionStorage` on **every** change | 🟠 High | S | **P1** |
| 8 | Tab-switch refetch with no cache (e.g. Model Studio) — same data re-downloaded repeatedly | 🟠 High | M | **P1** |
| 9 | No virtualization + client-side XLSX/PDF parsing — will not survive heavy data | 🟠 High | L | **P1** |
| 10 | 50 of 52 pages are client components; RSC/streaming unused | 🟡 Medium | L | **P2** |
| 11 | 48 hand-rolled `setInterval` polls, 1 `AbortController` — leaks and zombie requests | 🟡 Medium | M | **P2** |
| 12 | Appearance/Interface settings live only in `localStorage` — do not follow the user | 🟡 Medium | M | **P2** |
| 13 | Bundle: 3 charting libraries + Monaco + xyflow + cytoscape + d3, minimal splitting | 🟡 Medium | M | **P2** |
| 14 | 113 index-as-key, 24 silenced dep arrays, 21 stray `console.log` | 🟡 Medium | S | **P2** |

---

# PART A — API call hygiene

> *"Lots of APIs are just calling on different pages. Initially we don't want to call that API there, but we are calling it."*

Here is exactly where that happens, and why.

## A1. The root cause: `apiClient` is a fetch wrapper, not a data layer

`src/services/apiClient.js` (213 lines) does JSON parsing, error throwing, query-string building, and dev logging. It does **not** do:

| Capability | Present? | Consequence |
|---|---|---|
| Response caching | ❌ | Every component mount = a new network request for the same data |
| In-flight deduplication | ❌ | Two components asking for the same thing = two identical requests |
| Request cancellation | ⚠️ `signal` is accepted at [apiClient.js:129](../src/services/apiClient.js#L129) but is passed by exactly **one** caller in the app | Navigating away mid-request wastes bandwidth and CPU; late responses write into dead components |
| Timeout | ❌ | A hung backend hangs that part of the UI indefinitely, with no error state |
| Retry / backoff | ❌ | One transient blip = a permanent error state until the user manually refreshes |
| Staleness / refetch policy | ❌ | No concept of "this data is 5 seconds old, don't refetch" |

**Why this is the root cause:** without these, the *only* way any component can be sure it has data is to fetch it itself, on mount. That is precisely the pattern that produces "APIs firing on pages that don't need them" — each screen defensively re-fetches because nothing else guarantees the data is there.

**Also worth fixing while we are in this file:** [apiClient.js:166](../src/services/apiClient.js#L166) logs every request's proxy target with a `console.log` that is **not** wrapped in the `__DEV__` guard used by every other log in the file. It ships to production.

## A2. An authenticated API fires on the unauthenticated login page

- `PlantsProvider` is mounted in the **root** layout ([src/app/layout.jsx:124](../src/app/layout.jsx#L124)).
- On first mount it calls `plantCodeIdService.getPlantIds()` ([PlantsContext.jsx:33-37](../src/context/PlantsContext.jsx#L33-L37)).
- `src/app/page.jsx` is the **login page** — it renders inside that same root layout.

**Result:** every visitor who lands on the login screen fires a plant-registry request before authenticating. It will 401 (or return nothing useful), it is wasted, and it puts an authenticated endpoint on the public surface of the app.

**Fix:** move `PlantsProvider` (and any other authenticated provider) below the auth boundary, or gate its fetch on `useApp().user`:

```js
useEffect(() => {
  if (!user || fetchedOnce.current) return;   // ← gate on auth
  fetchedOnce.current = true;
  refresh().catch(() => {});
}, [user, refresh]);
```

> **Note:** `PlantsContext` is otherwise the **best-written context in the codebase** — single fetch guarded by a ref, memoized value, stable callbacks. Use it as the reference pattern. It just needs an auth gate.

## A3. Provider-level fetches that run regardless of the current view

`AdminPanelProvider` is mounted in [data-source-integration/layout.jsx:14](<../src/app/(admin)/admin/domain-configuration/data-source-integration/layout.jsx#L14>). Because it is a **layout**, it stays mounted across `/data-source-integration` and `/data-source-integration/review?view=…`. On mount it instantiates **eight** hooks at once ([AdminPanelContext.jsx:65-116](../src/components/admin/AdminPanelContext.jsx#L65-L116)):

`useAdminNavState`, `useSourceLifecycle`, `usePipelineOrchestration`, `usePnidFormState`, `useDocsFormState`, `useTsFormState`, `useSapFormState`, `useAdminPersistence`.

Three of the four connector hooks correctly gate their fetch on the active view:

| Hook | Gate | Verdict |
|---|---|---|
| `useSapFormState` | `if (view !== 'sap-tables' …) return;` ([:67](../src/components/admin/hooks/useSapFormState.js#L67)) | ✅ Correct |
| `useTsFormState` | `if (view !== 'ts-review' …) return;` ([:60](../src/components/admin/hooks/useTsFormState.js#L60)) | ✅ Correct |
| `usePnidFormState` | `if (view !== 'pid-review' …) return;` ([:77](../src/components/admin/hooks/usePnidFormState.js#L77)) | ✅ Correct |
| `useDocsFormState` | **none** — fires on every plant change ([:8-14](../src/components/admin/hooks/useDocsFormState.js#L8-L14)) | ❌ **Bug** |

```js
// useDocsFormState.js:8 — no view gate, unlike its three siblings
useEffect(() => {
    if (!selectedPlantId?.id) return;
    docs.getDocumentTypes(selectedPlantId.id).then(...)   // ← fires on pid-review, ts-review, sap-tables
}, [selectedPlantId?.id]);
```

`getDocumentTypes` is requested when the user is looking at the **P&ID review**, the **Time Series review**, or the **SAP tables** screen. This is the exact class of problem described. It is a one-line fix, and the same audit must be applied to every provider-mounted hook.

**Structural point:** even with all four gated, mounting eight stateful hooks — including a polling orchestrator — in a *layout* means their timers, effects, and `localStorage` writes are alive on every route in that subtree. Provider scope should match data scope.

## A4. Refetch-on-every-tab-switch, because there is no cache

Model Studio's ML Model page is, ironically, one of the **better-written** fetch layers — it gates each request on the active tab ([useMLModelPage.js:180-197](<../src/app/(dashboard)/model-studio/ml-model/_hooks/useMLModelPage.js#L180-L197>)):

```js
useEffect(() => {
    if (activeTab === 'Models' || activeTab === 'Artifacts' || isPipelineBuilderOpen) fetchModelList();
    if (activeTab === 'Pipelines' || isPipelineBuilderOpen) fetchPipelineList();
}, [activeTab, isPipelineBuilderOpen, fetchModelList, fetchPipelineList]);
```

But because nothing caches, the sequence **Models → Overview → Models** issues `getModelList` + `getAssetList` + `getModelOptions` **twice**. Five tabs, repeatedly visited, multiply that. The same shape exists in Forecast and Optimizer.

This is not a bug in the page — it is the missing cache layer surfacing as a page-level symptom. No amount of per-page discipline fixes it; only a shared cache does.

## A5. 48 polling loops, 1 `AbortController`

There are **48** `setInterval` sites in `src/app` + `src/components`. Representative patterns:

| Location | Cadence | Cleanup |
|---|---|---|
| `usePipelineOrchestration.js:149` | 3 s | `clearInterval` only on terminal status — **no unmount cleanup** |
| `useConfigModalActions.js:77, 119, 259` | 2 s | Same — interval survives if the component unmounts mid-poll |
| `useSourceLifecycle.js:173` | 2 s | Same |
| `useDocSourceModal.js:160` | 2 s | Same |
| `usePipeline.js` (P&ID) | 2.5 s | ✅ Has an unmount cleanup ([:49](<../src/app/(admin)/admin/domain-configuration/pnid/manage-files/_hooks/usePipeline.js#L49>)) — the correct pattern |

The intervals started inside `.then()` callbacks (not inside `useEffect`) have **no unmount path at all**. Leave the page while a pipeline polls and the interval keeps firing network requests against a component that no longer exists.

Meanwhile only **one** file in the entire application uses `AbortController`. Every other in-flight request continues to completion after navigation.

## A6. Recommended target architecture

Adopt **TanStack Query v5** (`@tanstack/react-query`, MIT — on the auto-approved licence list) as the server-state layer. It is not a rewrite: it wraps the existing `services/` functions unchanged.

```js
// Before — repeated ~377 times, in various states of correctness
const [models, setModels] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
useEffect(() => {
  if (!plantCode) return;
  setLoading(true);
  getModelList(plantCode)
    .then(setModels)
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
}, [plantCode]);

// After — the existing service function is untouched
const { data: models = [], isLoading, error } = useQuery({
  queryKey: ['models', plantCode],
  queryFn : () => getModelList(plantCode),
  enabled : Boolean(plantCode),
  staleTime: 60_000,
});
```

What this gives us **for free**, everywhere:

- **Deduplication** — ten components asking for `['models', plantCode]` in the same tick produce one request.
- **Caching + `staleTime`** — the tab-switch refetch problem disappears without touching page code.
- **Automatic cancellation** — `queryFn` receives an `AbortSignal`; navigating away aborts the request.
- **Retry with exponential backoff** — transient failures self-heal.
- **`refetchInterval`** — replaces all 48 hand-rolled `setInterval`s, with correct unmount cleanup guaranteed.
- **Cache invalidation on mutation** — `invalidateQueries(['models'])` after a create, instead of manual refetch calls.
- **Devtools** — a live panel showing exactly which queries fired, from where, and when. This alone answers "which API is calling on which page?" permanently.

### Non-negotiable rules to adopt alongside it

1. **Query keys always include `plantCode`.** Plant switch must invalidate, never leak another plant's data.
2. **A provider may not fetch data its subtree does not need.** Provider scope = data scope.
3. **No `setInterval` for polling.** Use `refetchInterval`.
4. **Every fetch effect that survives (streams, uploads) must have an unmount cleanup.**
5. **Gate on auth.** No authenticated query may run before `user` exists.

---

# PART B — Re-render performance

## B1. Unmemoized context values at the root of the tree

Four providers wrap the entire application ([layout.jsx:118-139](../src/app/layout.jsx#L118-L139)). Three pass a **freshly created object** on every render, which forces every consumer in the app to re-render whenever the provider renders — even if nothing they read actually changed.

| Provider | Value memoized? | Evidence |
|---|---|---|
| `ThemeProvider` | ❌ | `value={{ … }}` inline at [ThemeContext.jsx:101](../src/context/visuals/ThemeContext.jsx#L101) |
| `DeveloperAccessProvider` | ❌ | `value={{ unlocked, hasAccess, consumeReveal }}` at [DeveloperAccessContext.jsx:77](../src/context/DeveloperAccessContext.jsx#L77) |
| `DomainConfigProvider` | ❌ | `value={{ … }}` at [DomainConfigContext.jsx:77](../src/context/domain-config/DomainConfigContext.jsx#L77) |
| `CustomizationProvider` | ✅ | `useMemo` at [:312](../src/context/visuals/CustomizationContext.jsx#L312) |
| `AppProvider` | ✅ | `useMemo` at [:74](../src/context/AppContext.jsx#L74) |
| `PlantsProvider` | ✅ | `useMemo` at [:49](../src/context/PlantsContext.jsx#L49) |
| `DomainOntologyProvider` | ✅ | `useMemo` at [:80](../src/context/domain-config/DomainOntologyContext.jsx#L80) |

`ThemeProvider` is the outermost of these and holds five state values — a theme toggle currently re-renders **the whole application tree**.

**Fix:** wrap all three in `useMemo`. Roughly 15 lines of change, immediate app-wide benefit.

## B2. `AppContext` — one object, four unrelated concerns

[AppContext.jsx:74-89](../src/context/AppContext.jsx#L74-L89) memoizes on `[state]`, where `state` is `{ user, globalLoading, industry, plantId }`. Because it is one reducer object, **any** change re-creates the value.

Concretely: calling `setGlobalLoading(true)` re-renders **every** `useApp()` consumer in the application — and `useApp()` is how every plant-scoped component in the app reads `plantCode`, so that is a very large set.

Two secondary issues in the same block:
- The setter functions are re-created inside the `useMemo` on every `state` change, so they are never referentially stable for children.
- `industryCode` reads `localStorage` **during render** ([:81](../src/context/AppContext.jsx#L81)) — a side effect in render, and a value React cannot track for invalidation.

**Fix:** split into `AuthContext` (user), `PlantContext` (plantId/plantCode/industry), and a `UiContext` (globalLoading), or expose setters via a separate, permanently-stable context. Consumers that only need `plantCode` then stop re-rendering on loading toggles.

## B3. The biggest single offender: `AdminPanelContext`'s `formValue`

Measured from [useAdminContextValues.js](../src/components/admin/hooks/useAdminContextValues.js):

| Context value | Keys exposed | Dependency-array entries |
|---|---|---|
| `navValue` | 37 | 21 |
| `entityValue` | 40 | 27 |
| **`formValue`** | **187** | **96** |
| `mergedValue` | **264** (all three spread together) | 3 |

The project's own rule 25 caps a context at **20** state values. `formValue` is **9× over**, and `mergedValue` — consumed via `useAdminPanel()` — is **13× over**.

**What this means in practice:** typing one character into a SAP column-mapping input updates `sapColumnMappings` → `formValue` is rebuilt → `mergedValue` is rebuilt → **every** component calling `useAdminForm()` or `useAdminPanel()` re-renders, including the P&ID review table, the Documents review grid, and the Time Series table, none of which care about SAP.

The four-way context split (`Nav` / `Entity` / `Form` / merged) was the right instinct, but `formValue` merges four independent connector domains into one object, and `mergedValue` then undoes the split entirely for any consumer that uses `useAdminPanel()`.

**Fix (in priority order):**
1. **Delete `mergedValue`** and migrate its consumers to the specific context they need. This restores the benefit of the existing split for free.
2. **Split `formValue` into four:** `PnidFormContext`, `DocsFormContext`, `TsFormContext`, `SapFormContext`. Each lands near the 20-key rule and a SAP keystroke stops touching P&ID.
3. **Move genuinely local UI state out of context entirely** (project rule 39). `docAddingType`, `docNewFieldName`, `docNewSubtypeName`, `sapExpandedTable`, `editingFieldIdx`, `expandedSourceId` are single-component concerns sitting in a global store.

## B4. `useCallback` without `React.memo` does almost nothing

**483** `useCallback` calls; **13** memoized components out of 621.

`useCallback` exists to keep a prop referentially stable so a memoized child can skip re-rendering. If the child is not wrapped in `React.memo`, it re-renders anyway — the `useCallback` only adds bookkeeping cost.

**Fix:** wrap the components that actually matter — list rows, table cells, chart wrappers, canvas nodes. Highest-value targets found in the scan:

- `SourceCard` (rendered once per configured source, re-renders on any admin state change)
- Table row components under `views/components/pidReview/`, `sapTables/`, `DocsReviewView`
- `@xyflow/react` custom nodes (49 files import xyflow) — node re-renders are the most expensive thing on a canvas
- `src/components/charts/*` — chart re-mounts are very expensive

## B5. Full-object `JSON.stringify` to `sessionStorage` on every change

[DomainOntologyContext.jsx:51-55](../src/context/domain-config/DomainOntologyContext.jsx#L51-L55):

```js
useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ontology));
}, [ontology]);
```

`ontology` holds `equipment[]`, `connectivity[]`, `documents{}`, `timeseries[]`, `sap{}` — the full extracted context of a plant. Every mutation serialises **the entire object** synchronously on the main thread.

Today, with small test datasets, this is invisible. With a real plant — thousands of equipment rows and connectivity edges — this becomes a multi-hundred-millisecond main-thread block **on every edit keystroke**, and will eventually exceed the ~5 MB `sessionStorage` quota and throw (silently swallowed by the `catch`).

`getSlice` ([:69-72](../src/context/domain-config/DomainOntologyContext.jsx#L69-L72)) also depends on `ontology`, so its identity changes on every update, which changes `value`, which re-renders all consumers.

**Fix:** debounce the write (250–500 ms), persist only small slices (never bulk row arrays — those belong to the server per Document 1), and drop `getSlice` from the context value.

## B6. 113 index-as-key sites

Project rule 35 forbids `key={i}`. There are **113** occurrences. Beyond correctness (wrong element reused after a sort/filter/delete), React cannot reconcile efficiently and re-renders more rows than necessary.

Highest risk: any list that is sortable, filterable, or has rows deleted — which is most review tables in Domain Configuration.

## B7. 24 silenced dependency arrays

**24** `// eslint-disable-next-line react-hooks/exhaustive-deps` across 20 files. Each is either a deliberate run-once (should be a ref guard, as `PlantsContext` does correctly) or a genuine stale-closure bug waiting to surface. They need individual review, not blanket removal.

---

# PART C — State management: Context vs Redux

This is the question that needs a decision, so here is the evidence first and then a clear recommendation.

## C1. Current inventory — all 18 contexts

| Context | File | Scope | Value memoized | State held | Assessment |
|---|---|---|---|---|---|
| `AppContext` | `src/context/AppContext.jsx` | Root | ✅ | user, plantId, industry, globalLoading | Right idea, **too coarse** — split it (B2) |
| `PlantsContext` | `src/context/PlantsContext.jsx` | Root | ✅ | plants list + loading | ✅ **Reference implementation** — just add an auth gate |
| `ThemeContext` | `src/context/visuals/ThemeContext.jsx` | Root | ❌ | 5 theme values | Memoize |
| `CustomizationContext` | `src/context/visuals/CustomizationContext.jsx` | Root | ✅ | prefs + 14 option catalogs | Move the static option catalogs to module scope (rule 22); persist prefs to backend (Part E) |
| `DomainOntologyContext` | `src/context/domain-config/DomainOntologyContext.jsx` | Root | ✅ | Full plant ontology | **Wrong scope** — root-level, but only Domain Config writes it. Heavy payload in `sessionStorage` (B5) |
| `DeveloperAccessContext` | `src/context/DeveloperAccessContext.jsx` | Root | ❌ | 3 flags | Memoize. Otherwise fine |
| `DomainConfigContext` | `src/context/domain-config/DomainConfigContext.jsx` | Feature | ❌ | files, pipeline session | Memoize |
| `AdminNavContext` | `src/components/admin/AdminPanelContext.jsx` | Feature | ✅ | 37 keys | Acceptable |
| `AdminEntityContext` | ″ | Feature | ✅ | 40 keys | Slightly over rule 25 |
| `AdminFormContext` | ″ | Feature | ✅ | **187 keys** | 🔴 **Split into 4** (B3) |
| `AdminPanelContext` (merged) | ″ | Feature | ✅ | **264 keys** | 🔴 **Delete** (B3) |
| `WorkflowContext` | `src/context/workflow-management/WorkflowContext.jsx` | Feature | ✅ | catalog, sizes, pnid components | Fine |
| `TemplateMatchingContext` | `.../pnid/template-matching/_context/` | Page | — | Page state | ✅ Correct scoping |
| `ValidateContext` | `.../pnid/validate/_context/` | Page | — | Page state | ✅ Correct scoping |
| `PnidRouterContext` | `.../pnid/_context/` | Feature | — | Routing helpers | ✅ Fine |
| `AgentContext` | `.../agent-factory/_context/` | Page | — | Page state | ✅ Correct scoping |
| `ToastProvider` | `src/components/ui/toast/ToastProvider.jsx` | Root | — | Toast queue | ✅ Fine |
| `ConfirmProvider` | `src/components/ui/ConfirmModal.jsx` | Root | — | Confirm dialog | ✅ Fine |

**Honest summary:** Context is used **correctly in 13 of 18 cases**. The architecture is not broken. There are three specific problems — one of which is severe.

## C2. The real problem is not Context. It is that we store two different kinds of state in it.

State in a frontend application comes in two fundamentally different kinds, and they need different tools:

| | **Client state** | **Server state** |
|---|---|---|
| Examples here | `isSidebarOpen`, `activeTab`, `expandedSourceId`, theme prefs, crop-box-while-dragging | `plants[]`, `modelsList`, `docDataByCategory`, `sapData`, `pipelineStatuses`, `equipmentPidData` |
| Who owns the truth | The browser | The backend |
| Can it go stale | No | **Yes, constantly** |
| Needs caching/dedup/retry/invalidation | No | **Yes** |
| Right tool | Context / `useState` / Zustand | **A server-state cache (TanStack Query)** |

Right now, **both** live in Context and `useState`. That is why `formValue` has 187 keys — it is not 187 pieces of UI state, it is mostly **server data** (`sapData`, `docDataByCategory`, `tsData`, `pidData`, `equipmentPidData`, `pnidImages`) plus **upload/job state that Document 1 says belongs on the backend** (`docJobId`, `pnidJobStatus`, `tsUploadProgress`).

**Moving server state to a query cache removes an estimated 60–70 % of `formValue`'s keys on its own** — before any Context-vs-Redux decision is even relevant.

## C3. Options evaluated

| Option | Bundle | Fixes caching/dedup/API hygiene? | Fixes `formValue` bloat? | Boilerplate | Learning curve | Licence |
|---|---|---|---|---|---|---|
| **Stay Context-only, fix the 3 problems** | 0 KB | ❌ No | Partly | Low | None | — |
| **Redux Toolkit + RTK Query** | ~13 KB gz | ✅ Yes (RTK Query) | ✅ Yes | **High** — slices, reducers, store wiring | Medium-high | MIT |
| **Zustand** | ~1.2 KB gz | ❌ No (client state only) | ✅ Yes | Very low | Very low | MIT |
| **Jotai** | ~3 KB gz | ❌ No | ✅ Yes | Low | Medium (atomic model) | MIT |
| **✅ TanStack Query + Zustand + trimmed Context** | ~14 KB gz | ✅ **Yes** | ✅ **Yes** | Low | Low | MIT (both) |

### Why not Redux Toolkit

RTK Query would genuinely solve the caching problem. But:

1. **Boilerplate cost is real.** Every one of the ~55 service modules would need slice/endpoint definitions. TanStack Query wraps the **existing, already-correct** `services/*` functions with zero changes to them — and our services layer is one of the healthier parts of this codebase.
2. **A global store is the wrong shape for this app.** Our state is naturally feature-scoped: P&ID validate state, template-matching state, agent-factory state. Page-scoped contexts already model this correctly (and are among the 13 things done right). Flattening them into one global store makes them *harder* to reason about, not easier.
3. **Redux's core win is time-travel debugging and strict action discipline** for complex, deeply-shared client state. Our genuinely-shared client state is small: user, plant, theme, prefs. That does not justify the ceremony.
4. **We would still need a server-cache layer**, because Redux itself does not cache HTTP — so it is RTK Query either way, and RTK Query for the same job costs more code than TanStack Query.

### ✅ Recommendation

> **Adopt TanStack Query for all server state. Adopt Zustand for the few genuinely-shared client stores. Keep Context for what it is actually good at — dependency injection of stable, rarely-changing values (theme, auth, plant selection, toast, confirm). Do not adopt Redux.**

**Why this is the right answer for *this* codebase specifically:**

- It attacks the **actual** measured problem (no cache/dedup/cancel across 377 effects), which Redux-vs-Context does not.
- It is **incremental**. One hook at a time, both systems coexist, nothing needs a big-bang rewrite.
- It **preserves what already works** — the `services/` layer, the page-scoped contexts, the proxy architecture. All unchanged.
- The **devtools directly answer the original question** ("which API is calling on which page, and why?") permanently, instead of one-off audits like this document.
- Combined bundle (~14 KB gzipped) is negligible next to the charting libraries already shipping.
- Both are MIT — on the auto-approved licence list, no review needed.

## C4. Migration plan

| Phase | Work | Outcome | Effort |
|---|---|---|---|
| **0** | Memoize the 3 unmemoized providers; gate `PlantsContext` on auth; fix `useDocsFormState`'s missing view gate; add `error.jsx` + `loading.jsx` at each route-group root | Immediate app-wide win, near-zero risk | **~1 day** |
| **1** | Add `QueryClientProvider`. Migrate **one** feature (recommend Model Studio → ML Model — highest refetch waste, well-isolated). Set the query-key convention `[domain, entity, plantCode, …filters]`. Enable devtools in dev | Pattern established; devtools become the permanent answer to "which API fires where" | **~3 days** |
| **2** | Migrate all read paths feature-by-feature: Dashboards → Visuals → Workspace → Symbolic AI → Risk/Decision Template → Domain Config | Tab-switch refetching gone; dedup app-wide | **~2–3 weeks, parallelisable** |
| **3** | Replace all 48 `setInterval` polls with `refetchInterval`. Coordinate with Document 1 Phase 3 (SSE) | Leak-free polling; the P&ID/pipeline job flows become correct | **~1 week** |
| **4** | Delete `mergedValue`; split `AdminFormContext` into four; push local UI state down into components | `formValue` drops from 187 keys to roughly 40–60 across four contexts | **~1 week** |
| **5** | Introduce Zustand **only** where a genuine cross-tree client store remains after phases 2–4 (likely: workflow canvas, dashboard layout editor) | Small, focused stores; no global-store ceremony | **~3 days** |

**Total ≈ 5–6 weeks**, fully incremental, shippable at every phase, no big-bang rewrite, no feature freeze.

---

# PART D — Scalability for heavy data

> *"Right now we don't have much data on the frontend, but in future it will be a heavy-data-loaded application."*

Everything below is fine today at test-data scale and **will break at production scale**. These are the load-bearing walls to reinforce before the data arrives.

## D1. No virtualization anywhere

There is **no** windowing library in `package.json` and no manual windowing in the code. Every table, list, and dropdown renders every row as a DOM node.

At risk, with expected production volumes:

| Screen | Expected rows | Today |
|---|---|---|
| P&ID equipment / connectivity review | 5,000–50,000 | All rows in the DOM |
| Documents review (per category) | 1,000–20,000 | All rows in the DOM |
| Time Series tag metadata | 10,000–100,000+ | All rows in the DOM |
| SAP table preview | 10,000+ | All rows in the DOM |
| Log Management | Unbounded | All rows in the DOM |

Browsers begin to stutter around 1,000–2,000 complex rows and become unusable well before 10,000. **This is the single largest future-scale risk in the application.**

**Fix:** adopt `@tanstack/react-virtual` (MIT, same family as the query library, ~3 KB) and build **one** shared `<VirtualTable>` primitive that every review table uses. Do it once, in `src/components/ui/`, rather than per-screen.

## D2. Heavy parsing on the main thread, in the browser

- **XLSX parsing** in `home/workflow-diagram/_utils/fileParser.js` and `_hooks/useFileMapper.js`.
- **PDF page counting / rendering** via `pdfjs` in `pnid/_hooks/usePdfjs.js` and `PdfCanvasViewer.jsx`, plus `getFileArrayBuffer` fetching raw bytes to count pages client-side.

The project already supports files up to **10 GB** ([next.config.js](../next.config.js) sets `proxyClientMaxBodySize` to 10 GiB). Parsing files at that scale in a browser tab is not viable.

**Fix (two parts):**
1. **Server-side metadata** — Document 1 §7.3 already requires the backend to return page counts, sheet names, row counts, and thumbnails at upload time. Once that lands, delete the client-side parsing.
2. **Web Worker** for whatever client-side parsing genuinely must remain (e.g. instant local preview before upload), so it never blocks the main thread.

## D3. No pagination contract

No list endpoint in `src/services/` accepts `page`/`limit` except `pnidService.getEquipmentList` ([:73](../src/services/domain-configuration/pnid/pnidService.js#L73)). Everything else fetches the full collection.

**Fix:** a **cursor-based** pagination convention agreed with the backend (see Document 1), plus infinite-scroll via `useInfiniteQuery`. Cursor, not offset — offset pagination breaks when rows are inserted while the user is scrolling.

## D4. Bundle size

| Package | Files using it | Note |
|---|---|---|
| `@xyflow/react` | 49 | Core to the product — keep |
| `recharts` | 16 | Primary chart library |
| `react-grid-layout` | 12 | Dashboard layout |
| `highcharts` + `highcharts-react-official` | 3 | ⚠️ **Second** chart library — and Highcharts is **commercially licensed**; free only for non-commercial use. This is a proprietary commercial product, so this needs a licence check |
| `d3` | 3 | Third visualisation library |
| `plotly.js-dist-min` + `react-plotly.js` | 1 | ⚠️ **Third** chart library (~3 MB). Correctly `dynamic()`-imported in `TrendStatsNode.jsx`, but it is one node using a very large dependency |
| `cytoscape` + `cytoscape-fcose` | 1 | Fourth graph library |
| `@monaco-editor/react` | 1 | ~2 MB, correctly `dynamic()`-imported |
| `markmap-*` (3 packages) | 1 | Fifth visualisation library |
| `chrome-devtools-mcp` | **0** | ⚠️ A **development tool sitting in `dependencies`** with zero source references — it ships to production |

**Findings:**
1. **Five visualisation libraries** (recharts, highcharts, plotly, d3, cytoscape) + xyflow + markmap. This directly contradicts the project's own dependency policy ("avoid multiple libraries for the same purpose").
2. **Highcharts licensing must be verified.** Highcharts is not free for commercial products. Three files use it and `recharts` (MIT) already covers 16. Migrating those three and removing Highcharts resolves both a bundle and a licence risk.
3. **`chrome-devtools-mcp` must move to `devDependencies`** or be removed.
4. Only **17** `next/dynamic` imports across 621 components. Heavy, rarely-visited screens (Knowledge Graph, Visual Pipeline Canvas, the 1,596-line investigation page) should be lazily loaded.

## D5. React Server Components are essentially unused

**50 of 52 pages** are `'use client'`. **454 of 621** components are client components. There are **zero** `loading.jsx`, `error.jsx`, or `not-found.jsx` files.

Consequences:
- **No route-level error boundaries.** An uncaught render error anywhere blanks the whole application instead of degrading one route. This is a production-stability issue, not a performance one — and it is the cheapest fix in this entire document.
- **No streaming.** The user waits for the full client bundle + hydration before anything meaningful appears.
- **No route-level skeletons**, despite the project standard requiring shimmer/skeleton loading states.

**Fix (in order of value-per-hour):**
1. Add `error.jsx` + `loading.jsx` to each route-group root — `(admin)/`, `(dashboard)/` — and to heavy sections. **A few hours; disproportionate stability payoff.**
2. Push `'use client'` down to the leaves that actually need interactivity, instead of marking whole pages.
3. Move static/config data fetching into server components where the data is not user-interactive.

## D6. Two files over 1,000 lines

The project standard is 50–150 lines, refactor above 300.

| File | Lines |
|---|---|
| `home/workflow-diagram/compressor-details/[id]/investigation/page.jsx` | **1,596** |
| `home/workflow-diagram/compressor-details/[id]/tag-analysis/page.jsx` | **1,177** |
| `components/settings/SettingsModal.jsx` | 726 |
| `components/pipeline-builder/VisualPipelineCanvas.jsx` | 644 |
| `knowledge-graph/_components/KG.jsx` | 605 |
| `visuals/_hooks/useWorkspaceData.js` | 603 |

Beyond maintainability, a 1,596-line client page is a single component whose every state change re-renders the entire subtree. These are also the best `React.memo` and code-splitting candidates.

---

# PART E — Settings (Appearance / Interface) must come from the cloud

Currently **100 % browser-local**:

| Setting group | Storage | Evidence |
|---|---|---|
| Theme mode + light/dark variant | `localStorage` keys `theme`, `theme-light-variant`, `theme-dark-variant` | [ThemeContext.jsx:47](../src/context/visuals/ThemeContext.jsx#L47), [layout.jsx:74-76](../src/app/layout.jsx#L74-L76) |
| Accent, font family, font scale, line height, letter spacing, tabular numbers, density, motion, dropdown animation, geometry/radius, blur, profile display, toast duration, toast animation | one `localStorage` key `do-customization-v1` | [CustomizationContext.jsx:290, 302, 309](../src/context/visuals/CustomizationContext.jsx#L290) |

**Problems:**
1. Settings do not follow the user across devices or browsers.
2. Clearing browser data silently resets everything.
3. No organisation-level defaults or branding can be enforced.
4. `useCustomization` has **no provider guard** ([:338](../src/context/visuals/CustomizationContext.jsx#L338)) — unlike every other hook in the codebase, it returns `undefined` outside the provider instead of throwing, so a misuse fails as a confusing runtime crash later.
5. `prefs` initialises to `DEFAULT_PREFS` and hydrates in an effect, so React renders once with defaults before correcting. The inline bootstrap script in `layout.jsx` covers CSS variables at first paint, but any component reading `prefs` in JS still sees defaults on the first render pass.

**Backend contract** is specified in Document 1 (new §7.7). **Frontend work:**

- `CustomizationContext` and `ThemeContext` read from `GET /users/me/preferences` on login, write through `PATCH /users/me/preferences` (debounced ~500 ms).
- **`localStorage` becomes the offline cache, not the source of truth** — keep it, because the pre-hydration bootstrap script needs a synchronous read for first paint. Backend value wins on conflict.
- Support a server-provided **organisation default** that a user can override.
- Add the missing provider guard to `useCustomization`.
- Move the 14 static option catalogs (`ACCENT_PALETTES`, `FONT_OPTIONS`, …) out of the context value — they are constants, and including them makes the value object larger than it needs to be.

---

# PART F — Code-quality gaps found during the scan

Measured violations of the project's own standards:

| Rule | Standard | Found | Action |
|---|---|---|---|
| 25 | Max 20 state values per context | `formValue` = **187**, `mergedValue` = **264** | Split (B3) |
| 35 | Never use array index as React key | **113** sites | Fix during feature work; lint-enforce |
| 36 | No `console.log` in components/hooks | **21** non-`__DEV__` sites, plus [apiClient.js:166](../src/services/apiClient.js#L166) ungated | Remove or `__DEV__`-gate |
| 2 | Refactor components over 300 lines | 2 files over 1,000; 6 over 500 | Extract hooks/subcomponents |
| 39 | Local UI state must not live in shared context | `docAddingType`, `sapExpandedTable`, `editingFieldIdx`, `expandedSourceId`, … | Push down into components |
| 22 | No constants/objects defined inside a component body | 14 option catalogs inside `CustomizationContext`'s value | Move to module scope |
| — | Dependency policy: avoid multiple libraries for one purpose | **5** visualisation libraries | Consolidate |
| — | Licensing: commercial licences prohibited without approval | `highcharts` (commercial licence, 3 files) | **Verify licence or migrate to recharts** |
| — | Dev tools must not ship in `dependencies` | `chrome-devtools-mcp`, 0 source references | Move to `devDependencies` |

**Recommended automation** (so this document does not need to be re-written in six months):
- ESLint: `react-hooks/exhaustive-deps` as **error**, `react/no-array-index-key` as **error**, `no-console` as **warn** with a `__DEV__` allowance.
- `@next/bundle-analyzer` in CI with a size budget per route.
- A PR checklist item: *"Does this add a `useEffect` that fetches? If so, why is it not `useQuery`?"*

---

# PART G — App-wide sweep: where else is state fake or trapped in the browser?

Domain Configuration was the trigger for this audit, but the same pattern exists across the product. This part is a **complete sweep of every `localStorage` / `sessionStorage` write and every simulated-async call site in `src/`** (excluding `(dashboard)/extra/`).

**Method:** every `setItem` call was enumerated, then each one was opened and traced to its reader. Findings are classified by whether the data is *fabricated*, *trapped*, *dead*, or *legitimate*.

**Result: 41 browser-storage write sites across 24 files.** Of those — 9 hold business data that belongs on a server, 2 produce fabricated content, 1 is a dead write, and the rest are legitimate UI preferences.

---

## G1. Fabricated content presented as product output

### G1.1 Scenario Extractor writes a hardcoded "AI insight" — 🔴 most serious finding

`src/app/(dashboard)/scenario-extractor/page.jsx:93-103`

```js
const insightText = `AI PLANTOPS Alert: Pattern identified as 'Bearing Degradation Risk' on ${modalAsset}. Granger Analysis shows ${modalObserved[0]} causes Temperature (p=0.04). SHAP drivers: Vibration, Power. Real-time recommendation: Reduce load immediately.`;
// Save to local storage for Home Page System Alerts to pick up
const existingAlerts = JSON.parse(localStorage.getItem('system_alerts') || '[]');
localStorage.setItem('system_alerts', JSON.stringify([{ id: …, title: …, description: insightText, type: 'critical' }, ...existingAlerts]));
```

This is a **template string**, not an analysis. The p-value `p=0.04`, the SHAP drivers `Vibration, Power`, the diagnosis `Bearing Degradation Risk`, and the recommendation `Reduce load immediately` are **hardcoded literals**. Only the asset name and one observed variable are interpolated. It is written as `type: 'critical'`.

**Verified — and this is important to state precisely:** the code comment says *"for Home Page System Alerts to pick up"*, but **no consumer exists**. A repo-wide search for `system_alerts` returns only this writer plus an unrelated `system_alerts_field` widget key in `decision-template`. So the fabricated alert is currently written and never displayed.

That makes it a **latent** risk rather than a live one — but it is one `getItem` away from putting an invented p-value and a "reduce load immediately" instruction in front of a plant operator.

**Action (priority over everything else in this document):** delete the fabricated string. If the feature is intended, it must call a real analysis endpoint. If it is a demo placeholder, it must be behind an explicit demo flag and never write to a key named `system_alerts`.

### G1.2 Agent Factory chatbot fakes AI responses with a random delay

`src/app/(dashboard)/agent-factory/_components/AiveeChatbot.jsx:26-60`

```js
const DRAFT_RESPONSES = [ "To add a model node, click the **Models** tab…", … ];   // :26

if (!isLive) {
  await new Promise(r => setTimeout(r, 700 + Math.random() * 600));   // fake "thinking" delay
  return DRAFT_RESPONSES[Math.floor(Math.random() * DRAFT_RESPONSES.length)];
}
```

Before an agent is deployed, the assistant returns a **random canned string** after a **randomised fake latency**. The content is genuine UI help text, so this is far less severe than G1.1 — but it violates two project rules at once: mock data in a production source file (rule 37) and `setTimeout` standing in for real async work (rule 34).

**Action:** these are static help strings — render them as help content immediately, with no artificial delay and no `Math.random()`. Do not disguise static text as an AI response.

---

## G2. Business data trapped in the browser

Same class of problem as Domain Configuration: data the backend should own, living in `localStorage` — so it is per-browser, lost on clear, invisible to other users, and unauditable.

| # | Data | Key | File | Why it matters |
|---|---|---|---|---|
| 1 | **Equipment connections** | `connections_${type}` | `home/workflow-diagram/_hooks/useEquipmentNodeState.js:82-97` | Real engineering relationships. Written **twice** under two spellings (`normalizedType` and `componentType`) and read with a `||` fallback across both (`:47`) — the **same dual-vocabulary bug** found in P&ID's `linelist`/`line_list` |
| 2 | **AI-generated equipment catalog** | `ai_equipment_catalog` | `context/workflow-management/WorkflowContext.jsx:61,144-147` | User generates an SVG component via AI; it exists **only** in that browser. Another engineer cannot see it; clearing data destroys it |
| 3 | **Plant GPT chat history** | `plant_gpt_sessions` | `plant-gpt/_hooks/usePlantGpt.js:57,74` | Entire conversation history. No cross-device continuity, no retention policy, no audit |
| 4 | **Dashboard layouts** | `dashboardLayouts` + `dashboardLayoutsVersion` | `dashboards/_hooks/useDashboardsPage.js:101-124` | A user's dashboard arrangement. The manual `…Version` key exists to hand-migrate the schema — a home-grown migration system for data that should be in a database |
| 5 | **Starred dashboards / groups** | `star-dashboard-${id}`, `star-group-${id}` | `dashboards/_hooks/useDashboardGroups.js:44-69` | User favourites. Reading them **iterates every key in `localStorage`** and string-matches prefixes (`:44`) — O(all storage) on each read |
| 6 | **Compressor board layouts** | per-train `storageKey` | `compressor-details/_hooks/usePersistedLayouts.js:26-42` | Same as #4, scoped per train |
| 7 | **CPCP panel visibility** | `show_cpcp_${componentType}` | `useEquipmentNodeState.js`, `_nodes/components/ConnectionTable.jsx` | Also double-written under two spellings |
| 8 | **Global time range** | `timeRange` | `hooks/dashboard/useTimeRange.js`, `ui/TimeSelector.jsx`, `layout/DateRangePicker.jsx` | Written from **three separate files** to one key with no shared owner — classic drift risk |
| 9 | **Domain Config lifecycle** | 12 `admin_*` keys | `components/admin/hooks/*` | Already covered in Part A / Document 1 |

**The shared consequence:** none of this survives a device change, none of it is visible to a second user, none of it can be audited, and none of it can be backed up. For a plant-operations product, items 1–3 are the ones that should worry us most — equipment connections, generated components, and operator conversations are real work product.

### G2.1 The dual-key-spelling bug appears in two unrelated features

Worth calling out because it is now a **pattern**, not a one-off:

```js
// useEquipmentNodeState.js:47 — read with a fallback across two spellings
const cachedConns = localStorage.getItem(`connections_${normalizedType}`)
                 || localStorage.getItem(`connections_${componentType}`);
// :82-83 — and write to BOTH
localStorage.setItem(`connections_${normalizedType}`, JSON.stringify(newConns));
if (componentType && componentType !== normalizedType)
  localStorage.setItem(`connections_${componentType}`, JSON.stringify(newConns));
```

This is the same defensive double-write already documented in Domain Configuration (`plant_code` **and** `plant_code_id`; `pages` **and** `page`; `linelist_files` vs `line_list`). Each instance is a workaround for an identifier whose canonical form was never decided. **Deciding the canonical key once removes the whole class.**

---

## G3. Dead code — writes that can never be read

`src/lib/fileStorage.js` (used by `components/admin/hooks/useAdminPersistence.js`)

```js
export async function persistFiles(key, files) { … localStorage.setItem(PREFIX + key, JSON.stringify(meta)); }

export function loadPersistedFiles(key) {
  try { localStorage.removeItem(PREFIX + key); } catch {}   // ← always clears
  return [];                                                 // ← always empty
}
```

`persistFiles` serialises and stores metadata on every file selection; `loadPersistedFiles` **unconditionally deletes it and returns `[]`**. The file's own comment explains why (File handles cannot survive a refresh — correct), but that means **every write is dead**. It costs a JSON serialise and a storage write on each selection for a value that is never read.

**Action:** delete `persistFiles`, or keep the metadata and actually use it — e.g. to show "you had selected 4 files before refreshing; re-select them."

---

## G4. Legitimate uses — leave these alone

Not everything in `localStorage` is wrong. These are correct:

| Key | File | Verdict |
|---|---|---|
| `theme`, `theme-light-variant`, `theme-dark-variant` | `ThemeContext.jsx` | ✅ Needed synchronously by the pre-hydration script in `layout.jsx`. Should **also** sync to backend (Part E) — but the local copy must stay |
| `do-customization-v1` | `CustomizationContext.jsx` | ✅ Same reasoning |
| `auth`, `role`, `username`, `token_expires_at` | `app/page.jsx`, `AuthInterceptor.jsx` | ✅ Non-sensitive session markers. The real token is in an httpOnly cookie |
| Sidebar collapsed / sections | `layout/Sidebar.jsx` | ✅ Pure UI preference |
| Plant-code banner dismissal | `layout/PlantCodeBanner.jsx` | ✅ Pure UI preference |
| `symbolic-ai:pending-markdown:*` | `symbolic-ai/_lib/pendingMarkdownCache.js` | ✅ **Exemplary.** A deliberate, documented, read-once handoff that clears itself on read. Use this as the model for any legitimate cross-page handoff |

---

## G5. Summary — the pattern across the whole product

The Domain Configuration findings were not a local problem. The same three habits recur everywhere:

| Habit | Where it appears | Fix |
|---|---|---|
| **Server state stored in the browser** | 9 features (G2) | Backend endpoints + TanStack Query cache (Part A/C) |
| **Fabricated output where a real call is missing** | 2 features (G1) + all of Domain Config's progress bars (Part A) | Call the real API, or show an honest empty/disabled state |
| **Double-writing under two key spellings** | Workflow Diagram, Domain Config, CPCP flags (G2.1) | Decide the canonical identifier once |

### Prioritised actions

| Priority | Action | Effort |
|---|---|---|
| **P0** | Delete the hardcoded "Bearing Degradation Risk" insight (G1.1) | Hours |
| **P0** | Remove the fake-latency random chatbot responses (G1.2) | Hours |
| **P1** | Move equipment connections + AI equipment catalog to the backend (G2 #1, #2) | Backend work required |
| **P1** | Move Plant GPT sessions to the backend (G2 #3) | Backend work required |
| **P2** | Move dashboard layouts + stars to per-user backend preferences (G2 #4, #5, #6) — same endpoint family as Settings in Part E | Backend work required |
| **P2** | Give `timeRange` a single owner instead of three writers (G2 #8) | Frontend only |
| **P3** | Delete the dead `persistFiles` write (G3) | Minutes |

### What this means for the backend document

Document 1 currently scopes the backend requirement to Domain Configuration's four connectors. This sweep shows **at least four more features need server-side persistence**: equipment connections, the AI equipment catalog, Plant GPT sessions, and per-user dashboard preferences (layouts + stars).

Items 4–6 in G2 are all **per-user preference data** and should reuse the **same `/users/me/preferences` endpoint family** already specified in Document 1 §7.7 for Appearance/Interface settings — not four new bespoke endpoints. Items 1–3 are genuine domain data and need their own endpoints.

---

# 2. Prioritised roadmap

### Sprint 1 — Quick wins (~1 week, very high value per hour)

0. **Delete the fabricated "Bearing Degradation Risk" insight** (`scenario-extractor/page.jsx:93-103`) and the random fake-latency chatbot responses (`AiveeChatbot.jsx:26-60`) — see Part G1. **Do this first; it is hours of work and removes invented analytics from the product.**
1. Add `error.jsx` + `loading.jsx` to `(admin)/` and `(dashboard)/` route groups — **stops whole-app white-screens**.
2. Memoize `ThemeContext`, `DeveloperAccessContext`, `DomainConfigContext` values.
3. Gate `PlantsContext`'s fetch on authentication.
4. Add the missing view gate to `useDocsFormState`.
5. `__DEV__`-gate `apiClient.js:166`; remove the 21 stray `console.log`s.
6. Move `chrome-devtools-mcp` to `devDependencies`; open the Highcharts licence question.
7. Add the missing provider guard to `useCustomization`.

### Sprint 2–3 — Server-state layer (~2 weeks)

8. Introduce TanStack Query; migrate Model Studio as the reference implementation.
9. Establish and document the query-key convention (always plant-scoped).
10. Enable devtools in development.

### Sprint 4–6 — Rollout (~3 weeks, parallelisable)

11. Migrate remaining features' read paths to `useQuery`.
12. Replace all 48 `setInterval` polls with `refetchInterval`.
13. Delete `mergedValue`; split `AdminFormContext` into four connector contexts.
14. Push local UI state out of shared contexts.

### Sprint 7–8 — Heavy-data readiness (~2 weeks)

15. Build a shared `<VirtualTable>` on `@tanstack/react-virtual`; adopt it in every review table.
16. Agree cursor pagination with the backend; adopt `useInfiniteQuery`.
17. Move remaining client-side XLSX/PDF parsing to a Web Worker or to the backend (Document 1 §7.3).
18. `React.memo` the hot components (list rows, xyflow nodes, chart wrappers).

### Sprint 9+ — Structural (ongoing)

19. Split `AppContext` into Auth / Plant / UI.
20. Push `'use client'` down to leaves; adopt RSC where data is not interactive.
21. Consolidate visualisation libraries.
22. Refactor the 1,000+ line pages.
23. Settings persistence to backend (Part E), paired with Document 1 §7.7.

---

# 3. Definition of done — metrics to track

Measure before starting so the improvement is provable, not asserted.

| Metric | Today | Target |
|---|---|---|
| Duplicate API requests per session (measured in devtools) | Unmeasured — no tooling exists | **0** for identical key + params inside `staleTime` |
| API calls fired on a page that does not display the data | ≥ 2 confirmed (`getPlantIds` on login, `getDocumentTypes` on 3 wrong views) | **0** |
| `React.memo` coverage on list/canvas/chart components | 13 / 621 | **100 % of hot-path components** |
| Largest context value (keys) | 264 | **≤ 20** per rule 25 |
| Route-level error boundaries | 0 | **1 per route group minimum** |
| Rows renderable without jank | ~1,000 | **50,000+** via virtualization |
| `setInterval` polling sites | 48 | **0** |
| `AbortController` / cancellable requests | 1 file | **All** (automatic via TanStack Query) |
| Index-as-key sites | 113 | **0**, lint-enforced |
| Pages that are client components | 50 / 52 | Reduce incrementally |

---

## Appendix — Files worth reading as good examples

Not everything needs fixing. These are the patterns to copy:

| File | Why |
|---|---|
| [`src/context/PlantsContext.jsx`](../src/context/PlantsContext.jsx) | Ref-guarded single fetch, memoized value, stable callbacks. The reference context. |
| [`src/services/`](../src/services/) (whole layer) | Clean domain separation, documented contracts, no direct `fetch` in components. This layer is a genuine asset — TanStack Query wraps it without changing a line. |
| [`.../pnid/manage-files/_hooks/usePipeline.js`](<../src/app/(admin)/admin/domain-configuration/pnid/manage-files/_hooks/usePipeline.js>) | The only polling implementation with correct unmount cleanup and ref-held config to avoid stale closures. |
| [`.../model-studio/ml-model/_hooks/useMLModelPage.js`](<../src/app/(dashboard)/model-studio/ml-model/_hooks/useMLModelPage.js>) | Per-tab fetch gating done deliberately. It only refetches because no cache exists — the page logic itself is right. |
| [`.../pnid/validate/_context/ValidateContext.jsx`](<../src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext.jsx>) | Correctly page-scoped context — exactly the scoping a global Redux store would have destroyed. |
