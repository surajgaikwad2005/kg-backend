# TanStack Query Migration — Phased Plan

## Context

Every network call in this app is hand-rolled: `useState` + `useEffect` + `setInterval`. There are ~380 service functions across 49 files in `src/services/**`, and the layer *above* them re-implements the same five concerns over and over:

- **Caching** — hand-rolled everywhere. `PlantsContext` uses a `fetchedOnce` ref. The four CDM form hooks use `if (view !== 'X' || data.length > 0 || loading) return` as a cache that never invalidates. `symbolic-ai/_lib/pendingMarkdownCache.js` is a hand-written cross-route stash. `DomainConfigContext` uses a `fetchTokenRef` to drop stale responses on plant switch.
- **Polling** — ~15 duplicated `setInterval` loops. The connector-job poll alone is copy-pasted **six times verbatim** (`usePnidFormState.js:150`, `useConfigModalActions.js:77/119/259`, `useDocSourceModal.js:160`, `ConfigModal.jsx:127`). Most have **no unmount cleanup** and swallow poll errors in empty `catch {}` blocks, so a flaky backend polls forever and a navigated-away modal keeps hitting the network.
- **Deduplication** — `useSymbolicAIPage.js:57` carries a `loadedKeyRef` purely to stop StrictMode from firing `generateMarkdown` twice. `getClientFiles(plantCode)` is fetched independently by `DomainConfigContext` *and* `useTemplateMatching`. `checkExtractionFiles(plantCode)` has three separate call sites each holding its own copy.
- **Invalidation** — manual. `handleUpload` in `useKnowledgeGraphPage` calls `loadGraph()` by hand; `handleDeleteNode` in `useSymbolicAIPage` re-calls `fetchMarkdown` by hand; `PlantsContext.createPlant` does `setPlants(prev => [...prev, plant_id])`.
- **Error surfacing** — mostly swallowed. `.catch(() => setX([]))` makes a network failure visually identical to an empty result in `usePnidFormState`, `useDocsFormState`, `useTsFormState`, `useSapFormState`, `useTemplateMatching`, `useConnections`.

TanStack Query replaces all five with one dependency. The service layer is already a perfect `queryFn` boundary — pure async functions that take `plantCode` as an explicit argument and never read context (CLAUDE.md hard rule). **`apiClient` already plumbs `signal` through**, so cancellation works on day one with zero service changes.

**Intended outcome:** one dependency absorbs ~15 poll loops, ~6 hand-rolled caches, all StrictMode dedupe hacks, and all stale-response guards — while every service function and every proxy route stays exactly as-is. The migration is strictly additive at the service layer; only the hooks/contexts above it change.

---

## Decisions locked (confirmed with user)

| Decision | Choice | Consequence |
|---|---|---|
| Hook location | **Feature-colocated** in `_queries/` next to existing `_hooks/` | Matches the codebase's existing colocation. Shared infra only in `src/lib/query/`. |
| Devtools | **Install** `@tanstack/react-query-devtools` | Dev-only, tree-shaken from prod. Essential while migrating. |
| Mock-data fallbacks | **Remove — surface real errors** | Continues the direction of commit `2c67fe5` ("surface backend failures as real error states instead of misleading empty states"). Done domain-by-domain as each is migrated. |
| `AdminPanelContext` (DSI god-context) | **Conservative** — migrate fetching/polling/uploads only, keep the context's public shape | ~30 consumer files stay untouched. Rule-25 decomposition becomes its own later phase. |

**Query keys are central, hooks are colocated.** Keys live in `src/lib/query/keys.js` because cross-feature invalidation is the entire point — `commitPnidContext` (in the DSI feature) must invalidate `clientFiles` (owned by the P&ID workspace feature). Keys are tiny pure functions; hooks are not.

---

## Phase order (canonical) and ⭐ priority features

The 21 phases below are the agreed, fixed order. Three are business-priority:

| Phase | Feature | Service fns | Effort | Why it differs from the function count |
|---|---|---|---|---|
| **⭐ 1** | **Domain Configuration** — P&ID, Documents, Timeseries, SAP | 76 | **XL** | Five sub-phases; contains the two hardest pieces in the plan (1b, 1e) |
| 2 | Knowledge Graph | 6 | **M** | Only 6 fns, but the accumulating expand-merge needs real design |
| 3 | Symbolic AI | 11 | **M** | Per-edit row mutations need a refetch-storm guard |
| **⭐ 4** | **CPCP** | 12 | **S** | Flat CRUD + a wizard that benefits enormously from one shared key |
| 5 | Risk Template | 17 | **S** | Mechanical CRUD |
| **⭐ 6** | **Decision Template** | 16 | **S** | Mechanical CRUD + rule-45 layout care |
| 7 | Data Activity | 1 | **XS** | One function, one interval — the smoke test |
| 8 | Group Management | 2 | **XS** | Two mutations; ship with Phase 9 |
| 9 | User Registry | 14 | **S** | 4 of the 14 (auth lifecycle) are explicitly excluded |
| 10 | Log Management | 6 | **S** | Five pollers, all straightforward `refetchInterval` |
| 11 | Dashboard | 18 | **M** | Per-widget keys need thought; carries an adjacent bug fix |
| 12 | CPCP Configuration (Home) — *distinct from Phase 4 CPCP* | 19 + 4 | **XL** | 543-line hook + 230-line context + job poller + multipart + raw response |
| 13 | Scenario Extractor | 0 — static | **XS** | Verify only — no API exists |
| 14 | Model Studio — ml-model, Expression, Optimizer, Forecast, Custom | 118 | **L** | Largest by count but highly repetitive; 14a is the only hard part |
| 15 | RCA | 0 — static | **XS** | Verify only — no API exists |
| 16 | Workflow Management | 0 — static | **XS** | Verify only — no API exists |
| 17 | Workspace | 16 | **M** | Shares the 603-line `useWorkspaceData.js` with Phase 18 |
| 18 | Visuals | 11 | **M** | Debounced tag search + large timeseries payloads |
| 19 | PlantGPT | 2 | **XS** | Two functions; sets the chat convention |
| 20 | Agent Factory | 17 | **M** | Context split + adding rollback to existing optimistic writes |
| 21 | Developer Options | 9 | **S** | Flat CRUD + one optimistic toggle |

**Function count is a poor proxy for effort — plan against the Effort column.** Phase 14 has 118 functions and is mostly copy-paste once 14a establishes the template; Phase 1b has six and is the hardest thing in the plan, because it inverts a promise-chained pipeline into an effect-driven state machine across four branch cases. The four XL/hard items (Phase 0, 1b, 1e, 12) are where a wrong decision propagates instead of staying local; everything else is template application.

**Two items sit outside this numbering** because they are not features:

- **Plant Registry** (`plantCodeIdService` + `PlantsContext`, 4 fns) → **Phase 0, §0.11**. It is infrastructure: `plantCode` is the key dimension for every query in Phases 1–21, so its cache and invalidation must be correct before any feature depends on it.
- **`AdminPanelContext` decomposition** (the CLAUDE.md rule-25 fix) → **post-migration cleanup**, after Phase 21.

**One sequencing note worth stating plainly:** the ⭐ priority features land early (Phases 1, 4, 6), but Phase 1 alone is five sub-phases and the largest domain in the app. If the goal is to get CPCP and Decision Template in front of users fast, Phases 4 and 6 can ship before Phase 1 is fully complete — they share no code with it, only the Phase 0 foundation. Phases 1a–1e are independently shippable, so this does not require reordering anything.

---

## Commit discipline — migration vs. adjacent cleanup

**This section governs every phase. Read it before writing the first commit.**

The whole point of phasing is that a phase can be reverted. That property is destroyed the moment a migration commit also carries a bug fix or a cleanup — `git revert` then silently reintroduces the bug or undoes the cleanup, and nobody notices until much later.

**Three commit types, never mixed:**

| Prefix | Contains | Revert semantics |
|---|---|---|
| `migrate(<phase>):` | **Only** the query/mutation conversion. Hooks added, old fetch code deleted, consumers rewired. | Reverting restores the previous data-fetching code and nothing else. |
| `fix(<area>):` | A real bug found while migrating. | Independently shippable — often *before* its phase. |
| `chore(<area>):` | Adjacent cleanup with no behavior change (skeleton standardization, dead-code removal, comment corrections). | Safe to revert or keep independently. |

**The known adjacent work, extracted.** Each of these was originally folded into a migration phase. They must not ride inside a `migrate(...)` commit:

| Item | Noticed in | Ship as | Timing |
|---|---|---|---|
| `window.layoutSaveTimeout` is a global — two open dashboards clobber each other's debounce timer (`useDashboardsPage.js:217-218`) | Phase 11 | `fix(dashboards)` — own PR | **Can ship immediately**, independent of the migration |
| `useWorkspaceUpload.js:98-102` calls `onUploadSuccess()` even when the upload **failed** | Phase 1a | `fix(pnid-upload)` — own PR | Needs explicit sign-off first (see risk #4) |
| `getDocsKnowledgeGraph(plantCode)` ignores its argument and sends no params | Phase 1e | `fix(documents)` — own PR | Before 1e, or the query key lies about what's cached |
| `knowledgeGraphChatService` reads `localStorage.admin_plant_id` inside the service (violates "services never read context") | Phase 1c | `refactor(kg-chat)` — own commit | **Prerequisite** — must land before 1c |
| `getStoredPlantCode()` localStorage fallbacks in `knowledgeGraphService`, `dashboardService`, `visualsService`, `agentFactoryService` | Phases 2, 11, 18, 20 | `refactor(<service>)` — own commit each | **Prerequisite** for each phase (see risk #6) |
| Three skeleton systems → one (`ui/Skeleton`, `ShimmerBlock`, raw `animate-pulse`, plus the `LoadingState` spinner) | everywhere | `chore(ui)` — its own track | Decoupled entirely; run in parallel, at any pace |
| Mock-data fallback removal (`MOCK_GLOBAL_VARIABLES` et al.) | many phases | `chore(<feature>)` — separate commit within the same PR | Same PR is fine, same commit is not — this is a **visible behavior change** and must be revertable on its own |

**The test to apply before every commit:** *if this were reverted tomorrow, would anything other than the data-fetching layer change?* If yes, split it.

**Why the skeleton work is fully decoupled.** The original plan folded it into migration phases on the reasoning that "every migrated component is already being edited for its loading state." That reasoning is true but the conclusion was wrong: it makes every migration PR touch presentational code, which inflates review surface and couples a visual change to a data change. Run it as an independent `chore(ui)` track against `src/components/ui/Skeleton` (it already supports `delay` and the semantic tokens, per CLAUDE.md rule 20). Migration PRs may *use* `<Skeleton>`, but converting an existing spinner is a separate commit.

---

## Phase 0 — Foundation

Nothing user-visible ships in Phase 0. It exists so Phase 1 has no infrastructure decisions left in it.

### 0.1 Dependencies

```
npm install @tanstack/react-query@^5
npm install -D @tanstack/react-query-devtools@^5
npm install -D @tanstack/eslint-plugin-query@^5
npm audit
npm run build
```

All three are **MIT** (approved license list). React 19.2.3 requires `@tanstack/react-query` ≥ 5.62 — pin the resolved minor in `package.json` rather than leaving a bare `^5`. Per CLAUDE.md rule 42, a full `npm run build` must pass before this phase is considered done (Next 16 is tightly coupled to sub-dependency versions).

**The ESLint plugin is not optional.** Wire it into `eslint.config.mjs` with the recommended ruleset. Its `exhaustive-deps` rule catches the single most dangerous bug class in this migration: a query key that omits a value the `queryFn` closes over. A key missing `plantCode` doesn't throw, doesn't warn, and doesn't fail a build — it silently serves Plant A's data to Plant B. That defect is nearly invisible in review and trivially caught by lint.

Also enable `@tanstack/query/no-rest-destructuring` (defeats Query's render optimization) and `no-unstable-deps`.

**Rule 19 note:** "don't use any library like axios use raw fetch" governs the *transport*. TanStack Query is a cache/state manager, not a transport — `apiClient`'s raw `fetch` remains the only way bytes leave the browser. This must be spelled out in the CLAUDE.md/GEMINI.md addition (see the "CLAUDE.md addition" section near the end) so the rule isn't read as a blocker later.

### 0.2 `src/lib/query/queryClient.js`

```js
import { QueryClient } from '@tanstack/react-query';

// apiClient throws ApiError({ status }). Three statuses must never be retried:
//   401 → AuthInterceptor already refreshed + replayed once below apiClient.
//         A retry here would stack on top of that and multiply requests.
//   403 → deterministic; retrying is pure noise.
//     0 → apiClient's PLANT_CODE_REQUIRED preflight; never hit the network.
//         Retrying re-fires the "Plant code required" toast N times.
const NO_RETRY_STATUS = new Set([0, 401, 403, 404, 422]);

export const shouldRetry = (failureCount, error) =>
    !NO_RETRY_STATUS.has(error?.status) && failureCount < 2;

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                gcTime: 5 * 60_000,
                retry: shouldRetry,
                retryDelay: (i) => Math.min(1000 * 2 ** i, 8000),
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
                throwOnError: false,
            },
            mutations: {
                retry: false,
            },
        },
    });
}
```

**Why `refetchOnWindowFocus: false`:** this is an internal ops tool where users tab away to Excel/SAP constantly. Default-on would fire dozens of refetches per session against backends that are, per CLAUDE.md rule 43, frequently unstable in dev. Individual dashboards that genuinely want live data opt in via `refetchInterval`.

**Why `staleTime: 30_000` and not 0:** today every mount refetches. 30s is short enough that nobody sees genuinely stale data in a workflow, but long enough that navigating between the four DSI review tabs stops re-hitting the backend. Long-lived reference data (plant registry, document types) overrides upward per-query.

**Why `throwOnError: false`:** the app has no error boundaries wired for data failures. Errors are handled per-component as `isError` render states (which is what we want anyway — see the mock-fallback decision).

**Why no `structuralSharing` override at the default level:** Query's structural sharing walks the entire response on every fetch to preserve referential equality for unchanged sub-objects. That is a net win for the typical list/detail JSON in this app — it stops tables re-rendering when a poll returns identical data. It is pure waste for payloads that are either byte-identical or wholly different, never partially shared. Those get `structuralSharing: false` **per query**, not globally (see the cheatsheet below).

**Why no SSR prefetching / `HydrationBoundary`:** deliberate omission, not an oversight. Every consumer in this app is a `'use client'` component, auth is httpOnly-cookie-based and resolved by `src/proxy.js` per request, and `plantCode` is hydrated from `localStorage` on the client — so the server cannot know which plant to prefetch for. Server prefetch would add a whole rendering mode for zero benefit. **Do not add it later thinking the migration was left unfinished.**

**Per-query override cheatsheet.** The defaults above are tuned for ordinary JSON lists. Four categories need explicit overrides:

| Category | Overrides | Where |
|---|---|---|
| **Reference data** (plant registry, document types, operating outcomes, equipment tag lists) | `staleTime: 5 * 60_000` | 0.11, Phases 4, 9 (`getMe` → `staleTime: Infinity`) |
| **Binary blobs** (P&ID images, PDFs, xlsx via `apiClient.raw` + `arrayBuffer()`) | `staleTime: Infinity`, `gcTime: 60_000`, **`structuralSharing: false`** | Phase 1a |
| **Large graph payloads** (KG explore, up to 10,000 nodes) | **`structuralSharing: false`** | Phase 2 |
| **Job status polls** | `staleTime: 0`, `gcTime: 0`, `retry: false` | `useJobPolling` sets these — see 0.5 |

For the blob and graph cases the reasoning is the same: a multi-MB `ArrayBuffer` either has not changed (in which case `staleTime: Infinity` means we never refetch it anyway) or has been replaced entirely. Walking it for shared sub-structure costs real main-thread time and can never find any.

### 0.3 `src/lib/query/QueryProvider.jsx` + placement

```jsx
'use client';
import { useState, lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from './queryClient';

// Lazy + dynamic import, not a static import with a conditional render. The
// devtools package is designed to no-op in production builds, but a static
// import still puts the module in the graph and leaves the elimination up to
// the bundler. A dynamic import behind a NODE_ENV check makes the exclusion a
// property of OUR code rather than a property we're trusting.
const Devtools = lazy(() =>
    import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools }))
);

export function QueryProvider({ children }) {
    // useState (not module scope): a module-level client would be shared across
    // requests during SSR and leak one user's cache into another's response.
    const [client] = useState(makeQueryClient);
    return (
        <QueryClientProvider client={client}>
            {children}
            {process.env.NODE_ENV !== 'production' && (
                <Suspense fallback={null}><Devtools initialIsOpen={false} /></Suspense>
            )}
        </QueryClientProvider>
    );
}
```

**Verify, don't assume, that devtools stay out of the production bundle.** Part of the Phase 0 DoD (§0.12) is running `npm run build` and confirming no `react-query-devtools` chunk is emitted. Treating it as automatic is how a dev-only dependency ends up shipping.

Placement in [src/app/layout.jsx](src/app/layout.jsx#L123-L141) — **inside `ConfirmProvider`, wrapping `AppProvider`**:

```
MsalClientProvider > ThemeProvider > CustomizationProvider > ToastProvider > ConfirmProvider
  > QueryProvider          ← NEW
    > AppProvider > DomainOntologyProvider > DeveloperAccessProvider
      > AuthInterceptor + children
```

- **Below `ToastProvider`/`ConfirmProvider`** so query error handlers can call `toast`.
- **Above `AppProvider`** so nothing that reads `plantCode` sits outside the cache.
- **Above `AuthInterceptor`** so it can call `useQueryClient()` for the logout wipe (§0.7).
- **Safe at root even though `PlantsProvider` is not.** The comment at [src/app/layout.jsx:8-14](src/app/layout.jsx#L8-L14) explains `PlantsProvider` was pushed into the authenticated shells because it *fetches on mount* and fired a guaranteed 401 on the login page. `QueryClientProvider` is inert — it fetches nothing. **But the trap it documents still applies to every query we write:** any query hoisted into a layout that also wraps `/` must be `enabled`-gated.

### 0.4 `src/lib/query/keys.js` — key factory

Hierarchical arrays so prefix invalidation works. Every plant-scoped key carries `plantCode` as its **third** element, immediately after the domain namespace.

```js
export const queryKeys = {
    plants: {
        all: () => ['plants'],
        list: () => ['plants', 'list'],
    },

    domainConfig: {
        all: (plant) => ['domain-config', plant],

        // P&ID workspace (backend: PNID_WORKSPACE)
        pnidWs: {
            all:            (plant) => ['domain-config', plant, 'pnid-ws'],
            clientFiles:    (plant) => ['domain-config', plant, 'pnid-ws', 'client-files'],
            extractionFiles:(plant, opts) => ['domain-config', plant, 'pnid-ws', 'extraction-files', opts ?? {}],
            extractionData: (plant) => ['domain-config', plant, 'pnid-ws', 'extraction-data'],
            dataFolders:    (plant) => ['domain-config', plant, 'pnid-ws', 'data-folders'],
            equipment:      (plant, page, limit) => ['domain-config', plant, 'pnid-ws', 'equipment', page, limit],
            imagesList:     (plant, docType) => ['domain-config', plant, 'pnid-ws', 'images-list', docType],
            pdfInfo:        (plant, path) => ['domain-config', plant, 'pnid-ws', 'pdf-info', path],
            fileBlob:       (plant, path) => ['domain-config', plant, 'pnid-ws', 'file-blob', path],
            clientImage:    (plant, pageName, docType) => ['domain-config', plant, 'pnid-ws', 'client-image', docType, pageName],
            highlightOptions:(plant, pdfName) => ['domain-config', plant, 'pnid-ws', 'highlight-options', pdfName ?? null],
            templateLibrary:(plant) => ['domain-config', plant, 'pnid-ws', 'template-library'],
            excelExists:    (plant) => ['domain-config', plant, 'pnid-ws', 'excel-exists'],
            kgData:         (plant, pdfName) => ['domain-config', plant, 'pnid-ws', 'kg-data', pdfName],
            ocrStatus:      (plant, jobId) => ['domain-config', plant, 'pnid-ws', 'ocr-status', jobId],
            extractStatus:  (plant, jobId) => ['domain-config', plant, 'pnid-ws', 'extract-status', jobId],
        },

        // DSI connectors (backend: CDM connectors router)
        connector: {
            all:      (plant) => ['domain-config', plant, 'connector'],
            job:      (plant, connector, jobId) => ['domain-config', plant, 'connector', connector, 'job', jobId],
            existingPnid: (plant) => ['domain-config', plant, 'connector', 'pnid', 'existing'],
        },

        // Review contexts
        context: {
            pnid: (plant, params) => ['domain-config', plant, 'context', 'pnid', params ?? {}],
            docs: (plant, params) => ['domain-config', plant, 'context', 'docs', params ?? {}],
            ts:   (plant, params) => ['domain-config', plant, 'context', 'ts', params ?? {}],
            sap:  (plant, params) => ['domain-config', plant, 'context', 'sap', params ?? {}],
        },

        docs: {
            types:          (plant) => ['domain-config', plant, 'docs', 'types'],
            knowledgeGraph: (plant) => ['domain-config', plant, 'docs', 'knowledge-graph'],
        },

        pipeline: { job: (plant, jobId) => ['domain-config', plant, 'pipeline', 'job', jobId] },
        dataQuality: (plant) => ['domain-config', plant, 'data-quality'],
    },

    knowledgeGraph: {
        all:     (plant) => ['knowledge-graph', plant],
        explore: (plant, limit) => ['knowledge-graph', plant, 'explore', limit],
        expand:  (plant, nodeId, limit) => ['knowledge-graph', plant, 'expand', nodeId, limit],
    },

    symbolicAi: {
        all:      (plant) => ['symbolic-ai', plant],
        tables:   (plant) => ['symbolic-ai', plant, 'tables'],
        markdown: (plant, dashboardName) => ['symbolic-ai', plant, 'markdown', dashboardName],
    },
};
```

**Invalidation grammar this buys us:**

| Intent | Call |
|---|---|
| Everything for a plant | `invalidateQueries({ queryKey: queryKeys.domainConfig.all(plant) })` |
| All P&ID workspace data | `invalidateQueries({ queryKey: queryKeys.domainConfig.pnidWs.all(plant) })` |
| Just the file list | `invalidateQueries({ queryKey: queryKeys.domainConfig.pnidWs.clientFiles(plant) })` |

**Plant switching needs no invalidation at all.** Because `plantCode` is baked into every key, switching plants switches to a different cache entry. `DomainConfigContext`'s `fetchTokenRef` stale-response guard ([DomainConfigContext.jsx:20-21](src/context/domain-config/DomainConfigContext.jsx#L20-L21)) becomes structurally unnecessary — this is the single clearest proof the migration is correct.

### 0.5 `src/lib/query/useJobPolling.js` — the 15-poller replacement

```js
import { useQuery } from '@tanstack/react-query';

const MAX_CONSECUTIVE_FAILURES = 5;

/**
 * Polls a backend job until it reaches a terminal state.
 * Replaces the setInterval + ref + manual-clearInterval pattern duplicated
 * ~15× across the app. Unmount cleanup is automatic (the query unsubscribes).
 */
export function useJobPolling({
    queryKey, queryFn, jobId, isTerminal,
    interval = 2500, enabled = true, ...rest
}) {
    return useQuery({
        queryKey,
        queryFn,
        enabled: Boolean(enabled && jobId),
        staleTime: 0,
        gcTime: 0,
        refetchInterval: (query) => {
            // Bounded failure — today's empty `catch {}` blocks poll a dead
            // backend forever. Stop after N consecutive failures and let the
            // error state render.
            if (query.state.fetchFailureCount >= MAX_CONSECUTIVE_FAILURES) return false;
            const data = query.state.data;
            if (!data) return interval;
            return isTerminal(data) ? false : interval;
        },
        refetchIntervalInBackground: true,
        retry: false, // the interval IS the retry
        ...rest,
    });
}
```

Two behavioral improvements over today, both intentional and worth calling out in the PR:
1. **Unmount stops the poll.** Five of the six connector pollers currently leak.
2. **Bounded failure.** Today a backend that 500s on every status check polls silently forever.

### 0.6 `src/lib/query/useUploadMutation.js` — preserving XHR byte progress

`uploadConnectorFileWithProgress` ([connectorsService.js:54-101](src/services/domain-configuration/common/connectorsService.js#L54-L101)) is `XMLHttpRequest`, because `fetch` cannot report upload progress. **It stays XHR.** TanStack Query does not care what the `mutationFn` uses internally — it only needs a Promise, which that function already returns.

```js
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

/**
 * useMutation + transient upload progress.
 * Progress lives in local state, NOT the query cache: it fires ~100×/upload and
 * writing it to the cache would re-render every cache subscriber on each tick.
 */
export function useUploadMutation({ mutationFn, onMutate, ...options }) {
    const [progress, setProgress] = useState(0);
    const [isAborting, setIsAborting] = useState(false);

    const mutation = useMutation({
        mutationFn: (vars) => mutationFn({ ...vars, onProgress: setProgress }),
        onMutate: async (vars) => { setProgress(0); setIsAborting(false); return onMutate?.(vars); },
        ...options,
    });

    const reset = useCallback(() => { setProgress(0); mutation.reset(); }, [mutation]);
    return { ...mutation, progress, isAborting, setIsAborting, reset };
}
```

**Known gap to preserve awareness of:** `AuthInterceptor` patches `window.fetch` only, so XHR uploads bypass 401 refresh-and-replay entirely. That is true today and this migration does not change it. Worth a `TODO` comment, not a fix in this scope.

### 0.7 `queryClient.clear()` on forced logout

In [AuthInterceptor.jsx](src/components/layout/AuthInterceptor.jsx#L85-L98), `handleLogout` clears localStorage and redirects. It must also wipe the cache, or the next user to log in on the same tab briefly sees the previous user's plant data.

```js
const queryClient = useQueryClient();   // component body
// inside handleLogout, after clearLocalAuth():
queryClient.clear();
```

`handleLogout` is defined inside the `useEffect` at line 71 whose dep array is `[router, pathname, error]`; `queryClient` is stable across renders so it can be closed over safely, but add it to the dep array for lint correctness.

**Do not add any 401 handling to TanStack Query.** The interceptor already refreshes and replays once, with concurrent 401s deduped through `isRefreshingRef` + `pendingQueueRef` ([AuthInterceptor.jsx:103-143](src/components/layout/AuthInterceptor.jsx#L103-L143)). A parallel burst of queries after token expiry will correctly share one `POST /api/auth/refresh`. Our only cooperation point is `shouldRetry` excluding 401.

### 0.8 Error → toast policy

**Mutations toast; queries render.** A mutation is a user-initiated action and deserves an immediate toast on failure. A query failure should render an inline error state with a retry affordance — not a toast that fires again on every background refetch.

Global mutation error handler on the `MutationCache`, so no mutation can silently fail:

```js
new QueryClient({
    mutationCache: new MutationCache({
        onError: (error, _vars, _ctx, mutation) => {
            if (mutation.meta?.silent) return;
            toast.error(mutation.meta?.errorTitle ?? 'Action failed', error?.message);
        },
    }),
    // ...defaultOptions
});
```

Import `toast` from `@/src/components/ui/toast/toastApi` — the same imperative API `apiClient` already uses at [apiClient.js:12](src/services/apiClient.js#L12), so this works outside React without a hook.

**Do not add a global `QueryCache.onError`.** With `refetchInterval` pollers running, a global query-error toast would fire every 2.5s during an outage.

### 0.9 Where transformations live: service vs. `select`

There are **two different kinds of data transformation** in this codebase today, and they currently sit in the same place. The migration is the moment to separate them, because Query gives each one a correct home.

| Kind | Example | Belongs in | Why |
|---|---|---|---|
| **Contract-level** — undoing the backend's wire format | `unwrap()` stripping `{success, message, data}` in `connectorsService`, `pipelineService`, `cpcpService`, `pnidService`; the `data.plants → toPlant()` mapping in `plantCodeIdService`; flattening `data.analysis + data.meta` in `dataQualityService` | **stays in the service** | It is part of the endpoint's contract. Every consumer needs it identically, and `api-data/*.json` documents it. Moving it would make the service return something no caller ever wants. |
| **View-level** — deriving a shape one screen needs | `groupRowsByCategory` in `documentsService`; `processBackendData` (node/rel dedupe + id normalization) in `useKnowledgeGraphPage`; `formatMarkdownForMarkmap` in symbolic-ai; the `catalog`/`nodeSizes` derivation in `WorkflowContext` | **`select`** | It is a projection, not a contract. `select` is memoized against the cached data — it re-runs only when the underlying data actually changes, not on every render, and two components can select different projections of one cached response without refetching. |

```js
// View-level derivation, memoized by Query — NOT re-run on every render.
useQuery({
    queryKey: queryKeys.knowledgeGraph.explore(plantCode, limit),
    queryFn: ({ signal }) => exploreKnowledgeGraph(plantCode, undefined, limit, { signal }),
    enabled: !!plantCode,
    structuralSharing: false,          // large payload — see 0.2 cheatsheet
    select: processBackendData,        // module-scope fn, stable identity (CLAUDE.md rule 22)
});
```

**The `select` function must have a stable identity.** Define it at module scope, or wrap it in `useCallback` — an inline arrow is a new function every render and defeats the memoization entirely, which is the exact trap that makes `select` look useless. This is CLAUDE.md rule 22 applied to a new surface, and the ESLint plugin's `no-unstable-deps` rule catches it.

**Consequence worth noting:** `groupRowsByCategory` moving out of `documentsService` is a **breaking change to that service's return shape**, so it is a `refactor(documents)` commit that lands with Phase 1e — not a silent edit inside the migration commit (see Commit discipline).

### 0.10 Phase 0 deliverables

```
src/lib/query/queryClient.js       QueryClient factory + shouldRetry predicate
src/lib/query/QueryProvider.jsx    'use client' provider + lazily-loaded Devtools
src/lib/query/keys.js              central key factory
src/lib/query/useJobPolling.js     terminal-status polling primitive
src/lib/query/useUploadMutation.js XHR-progress-preserving mutation wrapper
src/lib/query/index.js             barrel
```

Modified: `package.json`, `eslint.config.mjs`, `src/app/layout.jsx`, `src/components/layout/AuthInterceptor.jsx`, **`CLAUDE.md` AND `GEMINI.md`**.

**⚠ `CLAUDE.md` and `GEMINI.md` are byte-identical today** (both 29,831 bytes, verified by hash — they are kept in sync by hand, 38 minutes apart in mtime). The new rules 46–53 must land in **both**, or any Gemini-based tooling will keep writing `useState` + `useEffect` fetches because nothing told it the conventions changed. Better still: make one a symlink to the other, or add a pre-commit hook that fails when they diverge. Convention drift between the two files is the quietest way this migration goes wrong.

### 0.11 Plant Registry *(part of the foundation, not a numbered feature phase)*

The plant registry is not one of the 21 feature phases — it is infrastructure. `plantCode` is the key dimension for **every** query in Phases 1–21, so the registry's own cache and invalidation must be correct before any feature depends on it. It is also the smallest migration in the plan (4 network functions).

**Service:** `src/services/plant-id/plantCodeIdService.js` (4 network fns + 1 pure util)
**Context:** [src/context/PlantsContext.jsx](src/context/PlantsContext.jsx) (65 lines) — mounted in **both** `(dashboard)/layout.jsx` and `(admin)/layout.jsx`
**Keys:** `plants.list()` — **not plant-scoped** (it *is* the plant list)

| Fn | Hook | Cache effect |
|---|---|---|
| `getPlantIds()` | `usePlantsQuery()` | `staleTime: 5 * 60_000` — registry changes rarely |
| `createPlantId(id, label, industry)` | `useCreatePlant()` | invalidate `plants.list()` — replaces manual `setPlants(prev => [...prev, plant_id])` at line 42 |
| `getPurgePreview(id)` | `usePurgePreview(id)` | `enabled: !!id && modalOpen` — currently fetched imperatively in `DeletePlantModal` |
| `deletePlantId(id, {cascade, confirm})` | `useDeletePlant()` | invalidate `plants.list()` **+ `queryClient.removeQueries({ queryKey: ['domain-config', id] })`** and every other namespace for that plant — deleting a plant must evict its entire cache |
| `clearPlantLocalStorage(id)` | — | pure localStorage util, stays as-is; call it from the delete mutation's `onSuccess` |

`fetchedOnce` ref (line 15) deleted. `PlantsProvider` shrinks to a thin pass-through; **keep the provider and `usePlants()` signature** so `PlantSwitcher`, `PlantIdSelector`, and `PlantCodeBanner` are untouched. Keeping the provider also preserves the deliberate "not in root layout" placement that avoids the login-page 401.

### 0.12 Definition of Done — the template every phase must satisfy

"Phase N is done" has to mean the same thing to everyone. A phase is done when **all six** are true:

1. **Hooks exist.** Every service function in the phase's table is reachable through exactly one `useQuery`/`useMutation`/`useJobPolling` wrapper in the feature's `_queries/` folder. No component calls a service function directly.
2. **Old code is deleted, not orphaned.** Every replaced `useState`/`useEffect`/`setInterval`/ref-guard is *removed in the same commit*. CLAUDE.md's intake protocol is explicit: do not leave superseded code alive "just in case." A dead `fetchX` still imported by nothing is a failed phase.
3. **Invalidation is declared.** Every mutation in the phase names its `invalidateQueries`/`setQueryData` target, or carries a comment saying why it is compute-only (rule 50).
4. **`enabled: !!plantCode` on every plant-scoped query** — verified by opening the feature with no plant selected and confirming **zero** network requests and **zero** "Plant code required" toasts.
5. **Manual checks pass** — the relevant items from the Verification section, run and observed, not assumed.
6. **`npm run build` and `npm run lint` are clean**, including the new `@tanstack/query` rules, and no `console.log` remains in component/hook files (rule 36).

**Phase 0 additionally requires:** the token-expiry path exercised end-to-end (several parallel queries after expiry → exactly one `POST /api/auth/refresh` → successful replays), a forced logout leaving the Devtools cache empty, and a production build emitting **no** `react-query-devtools` chunk.

**Dead code that must be gone by the end of its phase.** These are the specific artifacts each phase exists to delete — if one survives, the phase did not actually land:

| Phase | Must be deleted |
|---|---|
| 1a | `DomainConfigContext`'s `clientFiles`/`isLoadingFiles` state, `fetchTokenRef`, `fetchClientFiles`, both effects, and the dead dev-logging effect (lines 24-32, opens an empty `console.groupCollapsed`) |
| 1b | `ocrPollRef`, `extractPollRef`, `stopOcrPoll`, `stopExtractPoll`, the unmount-cleanup effect, both `new Promise(resolve => …)` poll wrappers, both empty `catch {}` blocks (lines 136-137, 181-182) |
| 1c | the duplicate `getClientFiles` fetch at `useTemplateMatching.js:62`; the `Promise.all` at `useValidateData.js:64` |
| 1d | all six copies of the 2000ms connector-job `setInterval` + the resume variant in `useSourceLifecycle.js:158-199` |
| 1e | the four `if (view !== 'X' \|\| data.length > 0 \|\| loading) return` view-gates |
| 2 | `initialLoadPlantRef`, the manual `loadGraph()` call after upload, the rollback-free optimistic `setGraphData` writes |
| 3 | **`_lib/pendingMarkdownCache.js` (whole file)**, `loadedKeyRef`, the manual `fetchMarkdown` refetch in `handleDeleteNode` |
| 0.11 | `fetchedOnce` ref, manual `setPlants` append/filter |
| 7, 10, 11, 12, 21 | every `setInterval` + its `clearInterval` ref in the phase's files |

---

## Phase 1 — Domain Configuration (76 service functions)

The largest and riskiest domain, so it is split into five sub-phases with **ascending risk**. Each sub-phase is independently shippable and independently revertible.

### 1a — P&ID workspace reads *(start here — cleanest 1:1)*

`DomainConfigContext` is the closest thing in the codebase to a query cache, and its replacement is nearly mechanical. It is the ideal proving ground for the Phase 0 primitives.

**New:** `src/app/(admin)/admin/domain-configuration/pnid/_queries/usePnidWorkspaceQueries.js`

| Service fn (`pnidService.*`) | Hook | Query key | Notes |
|---|---|---|---|
| `getClientFiles(plant)` | `useClientFiles()` | `pnidWs.clientFiles(plant)` | **The key win.** Currently fetched by `DomainConfigContext` *and* independently by `useTemplateMatching.js:62`. One key = one request, shared. |
| `checkExtractionFiles(plant, {extractedOnly})` | `useExtractionFiles(opts)` | `pnidWs.extractionFiles(plant, opts)` | Three call sites today (`useManageFiles`, `usePipeline.checkDirectValidation`, `useValidateData`), three copies. Collapses to one. |
| `getExtractionData(plant)` | `useExtractionData()` | `pnidWs.extractionData(plant)` | |
| `getDataFolders(plant)` | `useDataFolders()` | `pnidWs.dataFolders(plant)` | |
| `getEquipmentList(plant, {page,limit})` | `useEquipmentList(page, limit)` | `pnidWs.equipment(plant, page, limit)` | Only server-paginated endpoint in the app. Use `placeholderData: keepPreviousData` so the table doesn't blank between pages. |
| `getImagesList(plant, docType)` | `useImagesList(docType)` | `pnidWs.imagesList(plant, docType)` | |
| `getPdfInfo(plant, path)` | `usePdfInfo(path)` | `pnidWs.pdfInfo(plant, path)` | |
| `health(plant)` | — | — | No consumer; leave unmigrated. |

**Binary/blob reads** (`getFileArrayBuffer`, `getClientImageArrayBuffer`, `viewExcel` — all `apiClient.raw` + `arrayBuffer()`):

These *can* be queries and should be, but with tuned lifetimes — a P&ID page image is multi-MB and the cache is memory-resident.

```js
useQuery({
    queryKey: queryKeys.domainConfig.pnidWs.fileBlob(plantCode, path),
    queryFn: ({ signal }) => pnidService.getFileArrayBuffer(plantCode, path, { signal }),
    enabled: !!plantCode && !!path,
    staleTime: Infinity,        // a file's bytes don't change without an explicit mutation
    gcTime: 60_000,             // but drop them 1 min after the last viewer unmounts
    structuralSharing: false,   // multi-MB ArrayBuffer: identical or wholly replaced,
                                // never partially shared — walking it is pure waste
});
```
Object URLs created from these buffers must still be `URL.revokeObjectURL`'d in an effect cleanup — the cache holds the `ArrayBuffer`, not the blob URL.

**Mutations:**

| Service fn | Hook | Invalidates |
|---|---|---|
| `uploadWorkspaceFiles(plant, formData)` | `useUploadWorkspaceFiles()` | `pnidWs.all(plant)` |
| `deleteClientFile(plant, cat, filename)` | `useDeleteClientFile()` | `pnidWs.clientFiles(plant)` |
| `deleteFile(plant, path)` | `useDeleteFile()` | `pnidWs.clientFiles(plant)` + `pnidWs.fileBlob(plant, path)` (remove) |
| `deletePdfPage` / `deletePdfPages` | `useDeletePdfPages()` | `pnidWs.pdfInfo(plant, path)` + `pnidWs.fileBlob(plant, path)` |
| `deleteClient(plant)` | `useDeleteClient()` | `domainConfig.all(plant)` (whole plant) |
| `deleteDataFolder(plant, name)` | `useDeleteDataFolder()` | `pnidWs.dataFolders(plant)` |

**Files touched:**
- [src/context/domain-config/DomainConfigContext.jsx](src/context/domain-config/DomainConfigContext.jsx) — **shrinks from 97 → ~45 lines.** Delete `clientFiles`/`isLoadingFiles` state, `fetchTokenRef`, `fetchClientFiles`, both effects. Keep `pipelineSession` (genuine client state) and re-expose `clientFiles`/`isLoadingFiles`/`refreshFiles` from `useClientFiles()` so **zero consumers change**. Also delete the dead dev-logging effect at lines 24-32 (it opens an empty `console.groupCollapsed` and logs nothing).
- `pnid/_hooks/useWorkspace.js`, `useWorkspaceUpload.js`, `useFilePreview.js` — swap manual fetch for hooks.
- `pnid/page.jsx` — the PDF page-count prefetch loop (lines 41-55) becomes `useQueries`.
- `_components/domain/WorkspaceDashboard.jsx` — `refreshFiles` now maps to `refetch()`.

**⚠ Flag for decision (see §9):** `useWorkspaceUpload.js:80-102` fakes progress with a 400ms interval **and on failure still calls `onUploadSuccess()`** (lines 98-102). Migrating this to a real mutation surfaces upload failures that are currently invisible. Recommend fixing, but it is a deliberate behavior change and needs sign-off.

### 1b — `manage-files` pipeline (OCR → Extract → Compare)

[usePipeline.js](src/app/(admin)/admin/domain-configuration/pnid/manage-files/_hooks/usePipeline.js) — 265 lines, **20 `useState` calls**, a `cfgRef` existing solely to dodge stale closures inside poll callbacks, two poll refs, two stop functions, and Promise-wrapped `setInterval` loops. It is the most complex single file in the migration.

**Shape change — this is the one place the migration changes control flow.** Today the orchestration is promise-chained: `triggerExtract()` returns a Promise that resolves only when its internal poll hits a terminal state, so `runPostOCRPipeline` can `await` it. With queries, polling is declarative, so sequencing becomes effect-driven:

```js
// _queries/usePnidPipeline.js  (sketch)
const [ocrJobId, setOcrJobId]         = useState(null);
const [extractJobId, setExtractJobId] = useState(null);
const [stage, setStage]               = useState('idle');

const startOcr = useMutation({
    mutationFn: (cfg) => pnidService.startOcr(cfg.plantCode, {...}),
    onSuccess: (res) => { setOcrJobId(res?.results?.job_id); setStage('ocr'); },
});

const ocrJob = useJobPolling({
    queryKey: queryKeys.domainConfig.pnidWs.ocrStatus(plantCode, ocrJobId),
    queryFn:  () => pnidService.getOcrStatus(plantCode, ocrJobId),
    jobId: ocrJobId,
    isTerminal: (d) => d.status === 'done' || d.status === 'error',
    enabled: stage === 'ocr',
});

const extractJob = useJobPolling({ /* extractStatus key, enabled: stage === 'extract' */ });
const compare    = useMutation({ mutationFn: () => pnidService.compareAndClean(...) });

// Sequencing: OCR done → Extract (LLM mode, no line list) → Compare.
// Extract error → compare stays 'blocked'.
useEffect(() => { /* transitions on ocrJob.data.status / extractJob.data.status */ }, [...]);
```

**What is deleted:** `ocrPollRef`, `extractPollRef`, `stopOcrPoll`, `stopExtractPoll`, the unmount-cleanup effect, `cfgRef`'s poll-closure purpose, both `new Promise(resolve => …)` wrappers, both empty `catch {}` blocks (lines 136-137, 181-182). Roughly 20 `useState` calls collapse to ~4, with progress/current-file/result/error all read directly off `ocrJob.data` / `extractJob.data`.

**What is preserved exactly:** the LLM-mode + line-list skip logic, the `400 + "line list"` → `skipped` special case (lines 144-148), `compareStatus: 'blocked'` when extract errors, and `retryExtract`/`retryCompare`.

`checkDirectValidation` becomes `useExtractionFiles()` from 1a. `compareAndClean` success invalidates `pnidWs.extractionFiles` — which removes the manual `refreshExtractedFiles()` call in `manage-files/page.jsx:50-54`.

**Files:** `_hooks/usePipeline.js` (rewritten as `_queries/usePnidPipeline.js`), `_hooks/useManageFiles.js`, `manage-files/page.jsx`, and the panel components (`OcrPanel`, `ExtractPanel`, `ComparePanel`, `PipelineIndicators`, `CombinedPipelineProgress`) — prop shapes stay identical so their edits are minimal.

### 1c — Validate + Template Matching

**Validate** — `pnid/validate/_hooks/`:

| Service fn | Hook / kind | Key |
|---|---|---|
| `getHighlightOptions(plant, pdfName)` | `useHighlightOptions(pdfName)` | `pnidWs.highlightOptions(plant, pdfName)` |
| `checkExtractionFiles` + `getImagesList` | reuse 1a hooks | — |
| `checkExcelExists(plant)` | `useExcelExists()` | `pnidWs.excelExists(plant)` |
| `getKgData(plant, pdfName)` | `useKgData(pdfName)` | `pnidWs.kgData(plant, pdfName)` |
| `saveHighlightOptions` | mutation | invalidates `pnidWs.highlightOptions` |
| `highlightComponents` / `highlightComponentsImage` / `highlightTag` | mutations | none (compute-on-demand) |
| `validateConnection` | mutation | none |
| `uploadToCdm(plant, cdmUrl)` | mutation | `domainConfig.all(plant)` |

`getHighlightOptions` is fetched by **both** `useValidateData.js:92` and `PidValidateView.jsx:87` in unrelated subtrees — same payload, two requests. One key deduplicates them.

`useValidateData.js:64` does `Promise.all([checkExtractionFiles, getImagesList])` → becomes two independent queries, so a slow images list no longer blocks the file options.

**Template Matching** — `pnid/template-matching/_hooks/`:

| Service fn | Hook / kind | Key |
|---|---|---|
| `getTemplateMatchLibrary(plant)` | `useTemplateLibrary()` | `pnidWs.templateLibrary(plant)` |
| `getClientFiles(plant)` | **reuse 1a `useClientFiles()`** | — (deletes the duplicate fetch at `useTemplateMatching.js:62`) |
| `runTemplateMatch(plant, formData)` | mutation | invalidates `pnidWs.templateLibrary` |
| `saveTemplateMatchLibrary(plant, lib)` | mutation | `setQueryData` on `pnidWs.templateLibrary` (we know the new value) |
| `extractTextByBox(plant, {...})` | mutation | none |

**⚠ Prerequisite fix:** [knowledgeGraphChatService.js:17-28](src/services/domain-configuration/pnid/knowledgeGraphChatService.js) reads `localStorage.getItem('admin_plant_id')` **inside the service**, violating the CLAUDE.md "services never read context" rule. It cannot participate in a plant-keyed cache. Refactor `update(operations)` → `update(plantCode, operations)` and `ask(...)` likewise, threading `plantCode` from `useApp()` at the call sites (`useKnowledgeGraph.js`, `PnidKgAiveeChatbot.jsx`).

### 1d — DSI connector uploads + job polling *(highest-value single change)*

The six verbatim copies of the connector-job poll collapse into **one** hook.

**New:** `src/components/admin/_queries/useConnectorJob.js`

```js
export function useConnectorJob({ connector, jobId, plantCode, onSettled }) {
    return useJobPolling({
        queryKey: queryKeys.domainConfig.connector.job(plantCode, connector, jobId),
        queryFn: () => common.getConnectorJob(connector, jobId, plantCode),
        jobId,
        isTerminal: (d) => d.status === 'completed' || d.status === 'failed',
        interval: 2000,
        enabled: !!plantCode,
    });
}
```

Replaces: `usePnidFormState.js:150`, `useConfigModalActions.js:77`, `:119`, `:259`, `useDocSourceModal.js:160`, `ConfigModal.jsx:127`, plus the resume-on-mount variant in `useSourceLifecycle.js:158-199`. **Five of these currently leak their interval on unmount** — the hook fixes all five for free.

**Upload mutations** via `useUploadMutation` (§0.6):

| Flow | Service fn | Transport | Notes |
|---|---|---|---|
| P&ID device upload | `uploadConnectorFile('pnid', fd, plant)` | fetch | fake progress today (30/60/100) → real states |
| Documents upload | `uploadConnectorFile('documents', fd, plant)` | fetch | `useDocSourceModal` + `ConfigModal.handleGlobalDocSubmit` |
| SAP upload | `uploadConnectorFileWithProgress('sap', …)` | **XHR** | real byte progress — preserved |
| Timeseries upload | `uploadConnectorFileWithProgress('timeseries', …)` | **XHR** | **two sequential uploads** (metadata then values) with hand-split progress bands (0-30%, 30-55%). Model as one mutation whose `mutationFn` awaits both; keep the band math in the `onProgress` adapter. Only the last `job_id` is polled — preserve that. |
| Cloud connect (S3/ADLS/GCS) | `connectConnectorCloud(connector, body, params, plant)` | fetch | mutation, no progress |

Every upload's `onSuccess` sets the `jobId` that `useConnectorJob` then polls; the poll's terminal state invalidates `domainConfig.context.<connector>(plant)`.

**Files:** `src/components/admin/hooks/useConfigModalActions.js`, `useDocSourceModal.js`, `usePnidFormState.js`, `useSourceLifecycle.js`, `src/components/admin/ConfigModal.jsx`, `ConfigModalPnid/Documents/Sap/Timeseries.jsx`, `modals/DocSourceModal.jsx`.

### 1e — DSI review contexts + commits + pipeline *(riskiest — conservative scope)*

The four review-context reads currently use the view-gated anti-pattern:
```js
if (view !== 'pid-review' || !plantId || data.length > 0 || loading) return;
```
This is a cache that **never invalidates** — after committing, the stale data is still displayed until a full remount.

| Service fn | Hook | Key | Consumer |
|---|---|---|---|
| `getPnidContext({plantCode, batchId, files, jobId})` | `usePnidContext(params)` | `context.pnid(plant, params)` | `usePnidFormState` → `PidReviewView` |
| `getDocsContext({plantCode, batchId, jobId})` | `useDocsContext(params)` | `context.docs(plant, params)` | `useDocsFormState` → `DocsReviewView` |
| `getTsContext({plantCode, batchId})` | `useTsContext(params)` | `context.ts(plant, params)` | `useTsFormState` → `TsReviewView` |
| `getSapContext({table, plantCode, batchId})` | `useSapContext(params)` | `context.sap(plant, params)` | `useSapFormState` → `SapTablesView` |
| `getDocumentTypes(plant)` | `useDocumentTypes()` | `docs.types(plant)` | `staleTime: 5min` — reference data |
| `getDocsKnowledgeGraph(plant)` | `useDocsKnowledgeGraph()` | `docs.knowledgeGraph(plant)` | **⚠ the service ignores its `plantCode` arg and sends no params** — fix while migrating, or the key lies about what's cached |
| `analyzeDataQuality(plant)` | `useDataQuality()` | `dataQuality(plant)` | already has proper loading/error/empty states — good reference |
| `getExistingPnid(plant)` | `useExistingPnid()` | `connector.existingPnid(plant)` | |

`enabled: view === 'pid-review' && !!plantCode` replaces the view gate; `staleTime` replaces the `data.length > 0` guard — and unlike the guard, it expires.

**Commit + config mutations:**

| Service fn | Invalidates |
|---|---|
| `commitPnidContext(body)` | `context.pnid(plant)` prefix |
| `commitDocsContext(body)` | `context.docs(plant)` prefix |
| `commitTsContext(body)` | `context.ts(plant)` prefix + `dataQuality(plant)` |
| `commitSapContext(body)` | `context.sap(plant)` prefix |
| `runPipeline({stage, plant_code_id, …})` | `domainConfig.all(plant)` on terminal |
| `getPipelineJob(jobId, plant)` | → `useJobPolling`, 3000ms, replaces `usePipelineOrchestration.js:148-173` |
| `addSapTable(payload, plant)` | `context.sap(plant)` |
| `updateColumnRenames(sourceKey, mappings, plant)` | `context.sap(plant)` |
| `updateUserConfig(patch, plant)` | `context.ts(plant)` + `context.sap(plant)` |
| `populateOntology(body)` | `domainConfig.all(plant)` |

**Conservative boundary (per user decision):** `AdminPanelContext`'s four nested contexts and ~180 exposed keys **keep their exact public shape**. `useAdminContextValues.js` continues to assemble the same memoized objects — it just reads them from query hooks instead of `useState`. No consumer under `src/components/admin/views/**` changes. The rule-25 decomposition (splitting the god-context by domain) is explicitly **out of scope** and deferred.

**Do not migrate in 1e:** the localStorage source-lifecycle Sets in `useSourceLifecycle.js` (`configured`/`processed`/`validated`/`committedSources`). These are genuinely **client-side workflow progress**, not a server cache — there is no endpoint that returns them. They stay exactly as they are.

---

## Phase 2 — Knowledge Graph (6 service functions)

Small, isolated, one page + one hook. The only genuinely interesting problem is the accumulating expand-merge.

**Reads:**

| Service fn | Hook | Key |
|---|---|---|
| `exploreKnowledgeGraph(plant, undefined, limit)` | `useExploreGraph(limit)` | `knowledgeGraph.explore(plant, limit)` |
| `exploreKnowledgeGraph(plant, nodeId, limit)` | `useExpandNode()` (mutation) | writes into `knowledgeGraph.explore(plant, limit)` |

**Two required options on the base query** (per §0.9 and the §0.2 cheatsheet):

```js
useQuery({
    queryKey: queryKeys.knowledgeGraph.explore(plantCode, maxNodes),
    queryFn: ({ signal }) => exploreKnowledgeGraph(plantCode, undefined, maxNodes, { signal }),
    enabled: !!plantCode,
    structuralSharing: false,   // up to 10,000 nodes — never partially shared
    select: processBackendData, // module-scope fn: memoized, NOT re-run per render
});
```

`processBackendData` (the node/relationship dedupe + `id.toString()` + `dbId` normalization currently at `useKnowledgeGraphPage.js:26-46`) is **view-level derivation**, so it moves to `select`. Today it runs inside `loadGraph` on every fetch and its output is re-stored in `useState`; as a `select` it re-runs only when the cached data actually changes. Move it to module scope in the same commit — as a `useCallback` inside the hook it would still be recreated per render and defeat the memoization.

**The expand-merge design.** [useKnowledgeGraphPage.js:98-114](src/hooks/useKnowledgeGraphPage.js#L98-L114) fetches neighbours for one node and merges them into `graphData` with dedupe-by-id. Modelling each expand as its own cached query then re-deriving the union on every render would be slower and far more code.

**Recommended:** base graph = a query; node-expand = a **mutation whose `onSuccess` merges into the base query's cache** via `setQueryData`. The merged graph then *is* the cache — no shadow state.

```js
const expandNode = useMutation({
    mutationFn: (nodeId) => exploreKnowledgeGraph(plantCode, nodeId, maxNodes),
    onSuccess: (raw, nodeId) => {
        const incoming = processBackendData(raw);
        queryClient.setQueryData(queryKeys.knowledgeGraph.explore(plantCode, maxNodes), (prev) => {
            if (!prev) return incoming;
            const nodeIds = new Set(prev.nodes.map(n => n.id));
            const relIds  = new Set(prev.relationships.map(r => r.id));
            return {
                nodes: [...prev.nodes, ...incoming.nodes.filter(n => !nodeIds.has(n.id))],
                relationships: [...prev.relationships, ...incoming.relationships.filter(r => !relIds.has(r.id))],
            };
        });
    },
});
```

Consequence to accept: a refetch of the base query discards accumulated expansions. That is **already today's behavior** — `loadGraph()` resets `exploredNodeIds` to an empty Set at line 80. Keep `exploredNodeIds` in local state (it's view state, not server data), reset it in the base query's `onSuccess`-equivalent effect.

`maxNodes` is part of the key, so `GraphLimitControl` changing the limit is a natural key change — the `initialLoadPlantRef` manual dedupe at line 24 disappears.

**Mutations** — `useKnowledgeGraphMutations.js` (333 lines) currently does optimistic `setGraphData` writes **with no rollback on error**. Convert to the standard `onMutate` / `onError` / `onSettled` triple so failed writes roll back:

| Service fn | Hook | Cache effect |
|---|---|---|
| `addKnowledgeGraphNode(plant, nodeData)` | `useAddNode()` | optimistic insert + rollback |
| `addKnowledgeGraphRelationship(plant, relData)` | `useAddRelationship()` | optimistic insert + rollback |
| `updateKnowledgeGraph(plant, operations)` | `useUpdateGraph()` | optimistic patch + rollback |
| `deleteFromKnowledgeGraph(plant, operations)` | `useDeleteFromGraph()` | optimistic remove + rollback |
| `uploadKnowledgeGraphFile(plant, file)` | `useUploadGraphFile()` | `invalidateQueries(knowledgeGraph.all(plant))` — replaces the manual `loadGraph()` at line 120 |

**⚠ Prerequisite:** `knowledgeGraphService.js` has a `getStoredPlantCode()` fallback reading `localStorage.admin_plant_id` — a **hidden, non-reactive query-key input**. Two callers with different `plantCode` args could hit the same backend data or vice versa. Remove the fallback and require `plantCode` explicitly. (The same pattern exists in `agentFactoryService.js`, `dashboardService.js`, `visualsService.js` — fix each when its phase arrives.)

**Also create `api-data/knowledge-graph.json`** — it's the only migrating domain with no contract reference file (CLAUDE.md intake protocol step 8).

**Files:** `src/hooks/useKnowledgeGraphPage.js` (shrinks substantially), `src/components/ui/knowledge-graph/useKnowledgeGraphMutations.js`, `knowledge-graph/_components/KG.jsx` (loading/error props), `KnowledgeGraphSkeleton.jsx`, `UploadExcelModal.jsx`.

---

## Phase 3 — Symbolic AI (11 service functions)

Smallest domain but the richest in hand-rolled cache patterns, so it validates the `setQueryData` conventions.

**Reads:**

| Service fn | Hook | Key | Replaces |
|---|---|---|---|
| `listTables(plant)` | `useRuleTables()` | `symbolicAi.tables(plant)` | `page.jsx:57-63` manual fetch |
| `fetchMarkdown(dashboardName, plant)` | `useRuleMarkdown(name)` | `symbolicAi.markdown(plant, name)` | `useSymbolicAIPage.loadRule` |

**Three hacks deleted at once:**

1. **`_lib/pendingMarkdownCache.js` — delete the file.** `stashPendingMarkdown` / `takePendingMarkdown` is a hand-written cross-route handoff so the detail page can skip a refetch after upload. Replace with:
   ```js
   queryClient.setQueryData(queryKeys.symbolicAi.markdown(plantCode, name), generatedResult);
   router.push(`/symbolic-ai/${encodeURIComponent(name)}`);
   ```
   The detail page's `useRuleMarkdown` finds fresh data already in cache and renders instantly with no request. This is the single cleanest "TanStack was designed for exactly this" moment in the migration.

2. **`loadedKeyRef` StrictMode dedupe ([useSymbolicAIPage.js:31,57-59](src/app/(dashboard)/symbolic-ai/[slug]/_hooks/useSymbolicAIPage.js#L57-L59)) — delete.** Query deduplication handles identical in-flight keys natively.

3. **`if (!plantCode) return` guards (lines 53, and `page.jsx:57`) — replace with `enabled: !!plantCode`.** Same effect, declarative, and it also prevents `apiClient`'s `PLANT_CODE_REQUIRED` preflight toast from ever firing.

**Mutations:**

| Service fn | Hook | Cache effect |
|---|---|---|
| `generateMarkdown(formData, plant)` | `useGenerateMarkdown()` | multipart INSERT → `setQueryData` on `markdown(plant, name)` + invalidate `tables(plant)` |
| `addEquipmentColumn(formData, plant)` | `useAddEquipmentColumn()` | multipart step 1 of the wizard; returns `{columns, rows, dropdowns}` — transient, no cache write |
| `setColumns` / `removeColumns` | mutations | invalidate `markdown(plant, name)` |
| `addData` / `deleteData` | mutations | invalidate `markdown(plant, name)` |
| `updateDynamic` | mutation | invalidate `markdown(plant, name)` |
| `deleteTable(name, plant)` | `useDeleteTable()` | invalidate `tables(plant)`, remove `markdown(plant, name)` |
| `sendChat({user_query, dashboard_name}, plant)` | `useSendChat()` | mutation; message list stays in local state (see "What does NOT migrate") |

`handleDeleteNode` ([useSymbolicAIPage.js:165-191](src/app/(dashboard)/symbolic-ai/[slug]/_hooks/useSymbolicAIPage.js#L165-L191)) currently does mutate → toast → **manual `fetchMarkdown` refetch** → fallback to local markdown edit. Becomes `deleteData` mutation with `onSuccess: invalidate(markdown)`. Keep the local-edit fallback — it's a deliberate resilience path when the refetch fails.

**Note on the multipart contract** (from `api-data/symbolic-ai.json` and CLAUDE.md): `plant_code_id` is a **`Query()` param on both multipart endpoints**, not a form field. That placement is already correct in the service layer and this migration does not touch it — but do not "tidy" it into the FormData.

**⚠ `CreateTableView.jsx`** fires `removeColumns`/`setColumns`/`deleteData`/`addData` **per edit**, unbatched, against the live table. Each becomes its own mutation invalidating the same key — which would trigger a refetch storm on rapid edits. Mitigation: give these mutations a shared `mutationKey` and invalidate in `onSettled` only when no other mutation of that key is in flight (`queryClient.isMutating({ mutationKey }) === 1`).

---

## Phases 4–21 — Every remaining feature

Phase numbering below is **fixed by the agreed feature list** — it is the canonical order. Each phase gets its own key namespace in `src/lib/query/keys.js` and a colocated `_queries/` folder.

⭐ **Priority features are Phase 1 (Domain Configuration), Phase 4 (CPCP), and Phase 6 (Decision Template).**

Two items are *not* numbered feature phases: **Plant Registry** (moved into Phase 0 as §0.11 — it is infrastructure every phase depends on) and **`AdminPanelContext` decomposition** (post-migration cleanup, after Phase 21).

### ⭐ Phase 4 — CPCP *(PRIORITY)*

**Service:** `src/services/cpcp/cpcpService.js` (12 methods, `BASE = /api/cpcp`) · **Routes:** `admin/cpcp/`, `cpcp/new/` (wizard), `cpcp/old/`

This domain's JS params are named `plantCodeId` while the wire field is `plant_code_id`. `apiClient`'s preflight guard covers `plantCodeId` explicitly for exactly this domain ([apiClient.js:23](src/services/apiClient.js#L23)) — so `enabled: !!plantCode` is doubly important here. Keys still use the resolved plant string.

| Reads (queries) | Key | Notes |
|---|---|---|
| `getOperatingOutcomes(plant)` | `cpcp.operatingOutcomes(plant)` | dropdown options — `staleTime: 5 * 60_000` |
| `getEquipments(plant)` | `cpcp.equipments(plant)` | full tag list — `staleTime: 5 * 60_000`. **Needed by three separate wizard steps.** |
| `getEquipmentFlow(plant, from, to)` | `cpcp.equipmentFlow(plant, from, to)` | keyed on both tags, so revisiting a pair is instant |
| `getParallelGroups(plant)` | `cpcp.parallelGroups(plant)` | |

| Writes (mutations) | Invalidates |
|---|---|
| `createTemplate(plant, payload)` | `cpcp.all(plant)` |
| `saveEquipmentFlowConfiguration(plant, payload)` | `cpcp.equipmentFlow(plant)` prefix |
| `saveProductionRiskConfiguration(plant, payload)` | `cpcp.all(plant)` |
| `saveParallelGroupsConfiguration(plant, payload)` | `cpcp.parallelGroups(plant)` |
| `saveRepairRestorationAssumptions(plant, payload)` | `cpcp.all(plant)` |
| `saveAlternateRoutes(plant, payload)` | `cpcp.all(plant)` |
| `calculateSeriesCapacityChain(plant, payload)` | **none** — compute-only |
| `calculateDerivedPathMetrics(plant, payload)` | **none** — compute-only |

**Where the win is:** the multi-step wizard at `cpcp/new/`. `getEquipments` is required by the asset-mapping, source-to-sink topology, and parallel-group steps — today that's one request per step, re-fired on every back-navigation through the wizard. One key makes it one request for the entire wizard, and stepping backward becomes free.

The two `calculate*` endpoints are genuinely compute-only (they derive headroom / PaR / exposure from a posted payload and persist nothing), so per CLAUDE.md rule 50 they are the documented exception to "every mutation declares an invalidation."

### Phase 5 — Risk Template

**Services:** `riskTemplateService.js` (10) + `unitLevelService.js` (7) · **Route:** `admin/risk-template/` + `hooks/`

Plain RPN template CRUD + unit-level hierarchy. Keys `riskTemplate.list(plant)` / `.detail(plant, id)` / `.unitLevels(plant)`. Mutations invalidate the list. Mechanical — no polling, no uploads, no streaming.

The one thing to watch: the page hooks here follow the `useState + useEffect + actionLoading` shape and **fall back to mock arrays on error**. Per the locked decision, replace with real `isError` states + retry.

### ⭐ Phase 6 — Decision Template *(PRIORITY)*

**Services:** `src/services/decision-template/decisionService.js` (12) + `assetConfigService.js` (4)
**Routes:** `admin/decision-template/[templateId]/`, `(dashboard)/asset-config/[assetId]/` · **Hooks:** `decision-template/hooks/`

| Group | Keys | Treatment |
|---|---|---|
| Template list / detail | `decisionTemplate.list(plant)`, `.detail(plant, templateId)` | queries; `enabled: !!plantCode && !!templateId` on detail |
| Template create / update / delete | — | mutations → invalidate `decisionTemplate.list(plant)`; update also `setQueryData` on the detail key so the editor doesn't flash |
| Asset config | `assetConfig.detail(plant, assetId)` | query + update mutation |

**Two things to handle deliberately:**

1. **Route-shell interaction with CLAUDE.md rule 45.** These routes are the ones rule 45 was written about — `<Sidebar/>` + `<PageHeader/>` live in a shared `layout.jsx` so they survive navigation between the list and `[templateId]`. **Query hooks must live in the pages, not the layout.** A query hoisted into the layout re-runs on every `[templateId]` change and defeats the persistence the layout exists to provide.
2. **Mock fallbacks.** The page hooks here follow the `useState + useEffect + actionLoading` shape with mock-array fallbacks on error. Per the locked decision, replace with real `isError` + retry states.

Otherwise mechanical: no polling, no uploads, no streaming.

### Phase 7 — Data Activity *(smallest — proves `refetchInterval`)*

**Service:** `src/services/data-activity/activityService.js` (1 fn) · **Hook:** `admin/data-activity/_hooks/useDataActivity.js`

| Fn | Hook | Notes |
|---|---|---|
| `getPipelineJobs({stage, plantCode})` | `usePipelineJobs(stage)` | `refetchInterval: 30_000` replaces `useDataActivity.js:52`. The code comment there — *"silently fail on poll; manual refresh will surface UI errors"* — is exactly `isFetching` vs `isError` semantics: keep the last good data on screen while a background poll fails, surface the error only after `MAX_CONSECUTIVE_FAILURES`. |

One file, one function, one interval. If this phase has any friction, the Phase 0 primitives are wrong — find out here, not in Phase 14.

### Phase 8 — Group Management

**Service:** `src/services/group-management/groupManagementService.js` (2 fns) · **View:** `admin/views/GroupsView.jsx` + `views/components/groups/`

| Fn | Kind | Cache effect |
|---|---|---|
| `createGroup({group_name})` | mutation | invalidate the group list (served by `user-registry` — see Phase 9) |
| `assignUserToGroup({email, group})` | mutation | invalidate both the group list and `users.list()` |

Neither takes a plant code — these are global admin operations. **Do not add one.** Phases 8 and 9 share invalidation targets, so ship them together in one PR even though they're numbered separately.

### Phase 9 — User Registry

**Service:** `src/services/user-registry/user-registry.js` (5 fns) + `authService.js` (9 fns) · **Views:** `admin/views/UsersView.jsx`, `views/hooks/useUsers.js`, `modals/user/*`

| Group | Fns | Treatment |
|---|---|---|
| User CRUD | list / create / update / delete / assign-role | queries + mutations, `users.list()` / `users.detail(id)`, mutations invalidate the list |
| `authService` — `getMe()` | 1 | `useMe()`, `staleTime: Infinity`, invalidated only on login/logout. Feeds the RBAC role used across the app. |
| `authService` — login / logout / refresh / `establishAzureSession` | 4 | **Do NOT migrate.** These *are* the auth lifecycle; wrapping them in Query creates a circular dependency with `AuthInterceptor`, which must call `refresh` outside React using the pre-patched `originalFetch`. |
| `authService` — health | 1 | optional query, `staleTime: 60_000` |

`UsersView.jsx:153-162` uses raw `animate-pulse` divs — swap for `<Skeleton>` as a separate `chore(ui)` commit, not inside the migration commit (see Commit discipline).

### Phase 10 — Log Management

**Service:** `src/services/log-management/logsService.js` (5 fns + `PIPELINE_LOG_KEYS` const)
**Components:** `admin/views/LogsManagement.jsx`, `PipelineLogsViewer.jsx`, `views/hooks/useConnectorActivity.js`, `(dashboard)/developer-options/log-management/`

| Fn | Hook | Interval |
|---|---|---|
| `getLogsSummary({plantCodeId})` | `useLogsSummary()` | 30s (`LogsManagement.jsx:254`) |
| `getActivity({plantCodeId, limit})` | `useLogActivity(limit)` | 30s — same effect today, now two independent queries |
| `getLogEvents({plantCodeId, source, level, q, limit})` | `useLogEvents(filters)` | filters go in the key; `placeholderData: keepPreviousData` so the table doesn't blank while filtering |
| `getLogs(logKey, lines, plantCodeId)` | `useLogTail(logKey, lines)` | **5s** (`PipelineLogsViewer.jsx:36`) |
| `fetchMultipleLogs(keys, lines, plantCodeId)` | `useQueries` over `PIPELINE_LOG_KEYS` | replaces the fan-out in `useConnectorActivity.js:39`; per-key loading states come free |

Set **`refetchIntervalInBackground: false`** on all of these — a log tail running in a hidden tab is pure waste. (This is the opposite of the job pollers in 1b/1d, which *must* keep running when hidden.)

### Phase 11 — Dashboard

**Service:** `src/services/dashboard/dashboardService.js` (18) · **Routes:** `(dashboard)/dashboards/`, `create/`, `monitor/`, `[id]/` · **Hook:** `_hooks/useDashboardsPage.js`

| Concern | Today | After |
|---|---|---|
| Workspace refresh | 60s `setInterval` with a hand-rolled `{ silent: true }` flag (`useDashboardsPage.js:135`) | `refetchInterval: 60_000` — `isLoading` vs `isFetching` gives "silent" natively |
| Dashboard CRUD | imperative + manual list patching | mutations invalidating `dashboards.list(plant)` |
| Widget data | per-widget fetch | one query per widget, keyed by widget id + params — independent loading states, and identical widgets across dashboards dedupe |
| Layout save | **⚠ global `window.layoutSaveTimeout`** (`useDashboardsPage.js:217-218`) | debounced mutation with a `useRef` timer. This is a genuine bug (two dashboards open = one clobbers the other's timer) — fix it here even though it isn't strictly a Query concern. |

**⚠ `getStoredPlantCode()` fallback** in `dashboardService.js` — remove per risk #6.

### Phase 12 — CPCP Configuration / Home Workflow Diagram *(distinct from Phase 4 CPCP)*

**Services:** `src/services/cpcp-configuration/diagram/diagramService.js` (19) + `src/services/notification/notificationService.js` (4)
**Routes:** `(dashboard)/home/`, `home/workflow-diagram/**` · **Hook:** `_hooks/useSidebarState.js` (543 lines) · **Context:** `src/context/workflow-management/WorkflowContext.jsx` (230 lines)

| Group | Fns | Treatment |
|---|---|---|
| Sidebar / catalog reads | `getPnidSidebarData`, `listPnidComponents`, `getPnidComponent`, `getPnidComponentsFromFolder`, `listPnidFolders`, `listPnidEquipments` | queries keyed `cpcpConfig.*(plant, …)`. `listPnidComponents` currently lives in `WorkflowContext` — same 1:1 replacement as `DomainConfigContext` in 1a. |
| Diagram CRUD | `listPnidDiagrams`, `loadPnidDiagram`, `savePnidDiagram`, `deletePnidDiagram`, `pinPnidDiagram` | queries + mutations; **`pinPnidDiagram` is optimistic** (a pin toggle must feel instant) with rollback |
| **Batch generation job** | `generateEquipment`, `generateFile` (multipart), `getGenerateJobStatus`, `listGenerateJobs` | `useJobPolling` at 2000ms replaces `useSidebarState.js:413`. Terminal = `completed`/`failed`. The hook already tracks `processed / total_rows / success_count / failure_count` — read those straight off `job.data`. |
| Detailed equipment summary | `getPnidDetailedEquipmentSummaryStatus`, `…Preview(page)`, `generate…Raw` (`apiClient.raw`), `…Url` | status + paginated preview = queries; `generate…Raw` = mutation. The `…Url` builder is not a request — leave it. |
| Notification flows | `getAllNotifications`, `matchObservation`, `generateWorkorder`, `generateNotification` | `getAllNotifications` = query (**not plant-scoped** — no plant param today; do not invent one). The other three are mutations invalidating the notification list. |

**Stays put:** `WorkflowContext`'s module-level `SVG_RENDER_CACHE` Map (a render cache, not server data) and its `localStorage['ai_equipment_catalog']` AI catalog (client-authored, no endpoint returns it).

This is the second-hardest phase after 1e — 543-line hook, 230-line context, a job poller, a multipart upload, and a raw-response generator all in one feature.

### Phase 13 — Scenario Extractor *(no API today — verify only)*

**Verified:** `grep` for `from '@/src/services` across `src/app/(dashboard)/scenario-extractor/` returns **zero matches**. The route renders static content only.

**Verdict: nothing to migrate.** This is a ~15-minute re-verification at the time the phase comes up, not an implementation phase — the codebase may have grown a real endpoint by then. If it has, migrate it with whichever template fits: CRUD (Phase 5) or metric-cards-with-refresh (Phase 7).

### Phase 14 — Model Studio *(118 fns — six independent sub-phases)*

By far the largest domain, but also the most repetitive: all six page hooks share an identical `useState(data) + useState(loading) + useState(error) + useCallback(fetch) + useEffect + actionLoading` shape (see `_hooks/useGlobalVariablePage.js`, `useExpressionPage.js`, `useModelsTab.js`, `useExperimentsTab.js`, `useDeploymentsTab.js`). **Sub-phase 14a establishes the template; 14b–14f apply it mechanically.**

| Sub | Feature | Service file(s) | Fns | Notable |
|---|---|---|---|---|
| **14a** | **Global Variable** | `global-variable/globalVariableService.js` | 6 | The template. Also the clearest `MOCK_GLOBAL_VARIABLES` fallback in the app — removing it here sets the pattern for the other five. |
| **14b** | **Expression** | `expression/expressionService.js` | 9 | **300ms debounced cron validation** (`useExpressionPage.js:66-67`) → query keyed on the debounced expression, `enabled: expr.length > 0`. Tag search → `keepPreviousData`. |
| **14c** | **Custom Function** | `function/functionService.js` | 6 | Plain CRUD. Monaco editor content is client state. |
| **14d** | **Forecast** — Overview, Models, Pipelines, Experiments | `forecast/forecastService.js` (18) + `forecast/forecastExperimentService.js` (6) | 24 | **`run_workflow` and `run_pipeline` use `apiClient.raw`** and hand the raw `Response` to the caller (lines 44, 50) — wrap as mutations, but the raw-response consumption stays in the caller. One tab per key so tab switching is cached. |
| **14e** | **Optimizer** | `optimizer/{constants,constraints,deployment,experiment,objectiveFunction,search}Service.js` | 26 | Six files, six key sub-namespaces. `searchService` (2 fns) is a tag search → `keepPreviousData`. Constraints/constants edits invalidate the parent experiment. |
| **14f** | **ML Model** — Overview, Model, Pipelines, Experiments, Deployments, Artifacts | `ml-model/{model,pipeline,experiment,deployment,modelRegistry,artifact}Service.js` | 45 | Largest single sub-phase. Six tabs = six key namespaces under `modelStudio.mlModel.*`. `useDeploymentsTab.js:72-90` has a debounced async effect → debounced key. Deploy/undeploy mutations invalidate both `deployments` and `modelRegistry`. |

**Explicitly excluded from all six:** `model-studio/shared/aiSuggestionService.js` → `streamCodeSuggestion()`. It is the app's only true SSE stream (`apiClient.raw` + `response.body.getReader()` + `TextDecoder`, parsing `data:` lines until `[DONE]`), consumed by Monaco autocomplete. **It does not migrate** — see "What does NOT migrate".

### Phase 15 — RCA *(no API today — verify only)*

**Verified:** `grep` for `from '@/src/services` across `src/app/(dashboard)/rca/` returns **zero matches**. Static page.

**Verdict: nothing to migrate.** Same re-verification treatment as Phase 13. (Note: written "RCS" in earlier notes — confirmed typo for RCA / root-cause analysis.)

### Phase 16 — Workflow Management *(no API today — verify only)*

**Verified:** `grep` for `from '@/src/services` across `src/app/(dashboard)/workflow-management/` returns **zero matches**. A historical investigation table plus metric cards, all backed by mock data.

**Verdict: nothing to migrate.** Same re-verification treatment as Phase 13.

**⚠ Naming collision to avoid:** `src/context/workflow-management/WorkflowContext.jsx` does **not** belong to this route — it belongs to **Phase 12** (home/workflow-diagram). Do not migrate it here.

### Phase 17 — Workspace

**Service:** `src/services/workspace/workspaceService.js` (16) · **Routes:** `(dashboard)/workspace/`, `workspace/[id]/`

Workspace CRUD + per-type analyses + custom tags + multi-chart visualization. Keys `workspace.list(plant)` / `.detail(plant, id)` / `.analyses(plant, id, type)` / `.customTags(plant, id)`.

Analyses are the interesting part: several run per workspace *type* and are re-requested on every tab switch today. Keying by `(plant, workspaceId, type)` makes tab switching free after the first visit.

### Phase 18 — Visuals

**Service:** `src/services/visuals/visualsService.js` (11) · **Routes:** `(dashboard)/visuals/`, `visuals/[id]/` · **Components:** `_components/AddTagsPanel.jsx`, `CustomTagModal.jsx`

| Concern | Treatment |
|---|---|
| Visual CRUD | `visuals.list(plant)` / `.detail(plant, id)`, mutations invalidate |
| **Tag search** | debounced term goes **in the key**: `visuals.tagSearch(plant, debouncedTerm)`. Add `placeholderData: keepPreviousData` so results don't flash empty between keystrokes, and `enabled: term.length >= 2`. Every previously-typed prefix stays cached, so backspacing is instant. |
| Timeseries data | `visuals.timeseries(plant, tags, range)` — potentially large payloads; `gcTime: 60_000` |

**⚠ `getStoredPlantCode()` fallback** — remove per risk #6.

`useWorkspaceData.js` (603 lines, shared with Phase 17) is the largest hook in the app and should shrink hardest — budget real time for it and split Phases 17/18 if it resists.

### Phase 19 — PlantGPT

**Service:** `src/services/plant-gpt/plantGptService.js` (2) · **Hook:** `_hooks/usePlantGpt.js`

| Fn | Kind |
|---|---|
| `askPlantGpt(body)` | **mutation** — one per chat turn |
| root/info | query, `staleTime: Infinity` |

**The transcript is NOT a query.** Sessions are append-only local state persisted to `localStorage.plant_gpt_sessions`; that stays exactly as-is. The only change is `askPlantGpt` becoming a mutation so `isPending` drives the typing indicator and errors route through the global mutation-error toast.

Smallest phase with real work. Its purpose is to lock the chat convention that the other Aivee chatbots (Phase 3 Symbolic AI, Phase 20 Agent Factory) then copy.

### Phase 20 — Agent Factory

**Service:** `src/services/agent-factory/agentFactoryService.js` (17, incl. React-Flow↔backend graph mappers) · **Context:** `_context/AgentContext.jsx` (248 lines, `useReducer`)

| Concern | Today | After |
|---|---|---|
| Bootstrap | `Promise.all([listTemplates().catch(()=>null), listModels().catch(()=>[]), listTools().catch(()=>[]), getNodeCatalog().catch(()=>[])])` (lines 143-163) — one slow call blocks all four, and every failure is swallowed | **four independent queries**, independent loading + error states, and the `let cancelled = false` guard disappears |
| Delete | optimistic `dispatch(REMOVE_AGENT)` then `await deleteTemplate(id)` with **no rollback** | `useMutation` with `onMutate` / `onError` rollback / `onSettled` invalidate |
| Create | fire-and-forget `saveTemplate(...).catch(() => {})` | mutation with real error surfacing |
| Graph editor | nodes / edges / undo / redo in the reducer | **unchanged** — client state |
| Graph mappers | pure functions | **unchanged** — they run inside `queryFn`/`mutationFn`, not around them |

`AgentContext` keeps its provider and public shape (same conservative approach as 1e); only the four server slices move out of the reducer.

**⚠ `getStoredPlantCode()` fallback** — remove per risk #6.

The `AiveeChatbot.jsx` / `ChatSandbox.jsx` transcripts follow the Phase 19 chat convention: mutations + local state.

### Phase 21 — Developer Options / Scheduler

**Service:** `src/services/developer-options/schedulerService.js` (9 fns) · **Hooks:** `(dashboard)/developer-options/scheduler/_hooks/`
(The `developer-options/log-management/` route is covered by Phase 10.)

| Fn | Kind | Cache effect |
|---|---|---|
| `getSchedulerHealth()` | query | **not plant-scoped** — no `plant_code_id` param. `staleTime: 60_000` |
| `listSchedules(plant_code_id)` | query | `schedules.list(plant)` |
| `getSchedule(plant_code_id, id)` | query | `schedules.detail(plant, id)` |
| `createSchedule` / `updateSchedule` / `deleteSchedule` | mutations | invalidate `schedules.list(plant)` |
| `enableSchedule` / `disableSchedule` | mutations | **optimistic toggle** — a switch that lags a full round-trip feels broken. `onMutate` flips it, `onError` rolls back, `onSettled` invalidates. |
| `reloadSchedules(plant_code_id)` | mutation | invalidate `schedules.list(plant)` |

Access is gated by `DeveloperAccessContext` (the "taitaitai" unlock) — thread that into `enabled` so locked users fire no requests at all. Being last in the order is fine: this is an internal tool, so it carries the least user-facing risk.

### Post-migration cleanup — `AdminPanelContext` decomposition *(not a numbered phase)*

The rule-25 fix deliberately excluded from Phase 1e. `AdminPanelContext.jsx` composes four nested contexts (`AdminNavContext`, `AdminEntityContext`, `AdminFormContext`, merged) exposing ~180 keys via `useAdminContextValues.js`, against a limit of 20 per context.

After 1a–1e, every server value it holds is already a query, so the context is a pure pass-through — decomposition becomes a mechanical re-grouping of client state (nav, modals, form drafts) rather than a data-flow rewrite. **Only attempt this once every DSI query hook exists and has been running in the app for a while.** Doing it earlier means rewriting data flow and context topology simultaneously across ~30 consumer files.

### Coverage check

Phase numbers match the agreed feature list 1:1 — see the canonical table near the top of this document. **~380 service functions across 21 phases; every domain in `src/services/**` is accounted for**, plus Plant Registry in Phase 0 §0.11 and the `AdminPanelContext` decomposition as post-migration cleanup.

Three phases (13 Scenario Extractor, 15 RCA, 16 Workflow Management) have **no API surface today** — verified by grep, zero service imports. They are placeholders that stay in the numbering so the feature list and the plan never drift apart.

---

## What does NOT migrate

Being explicit here prevents over-application, which is the most common way a Query migration makes a codebase worse.

| Thing | Where | Why not |
|---|---|---|
| **SSE streaming** | `aiSuggestionService.streamCodeSuggestion` (`apiClient.raw` + `body.getReader()`) | Query caches a resolved value. A token stream has no single resolved value and the consumer (Monaco autocomplete) needs tokens as they arrive. Leave as-is. |
| **XHR transport internals** | `uploadConnectorFileWithProgress` | The XHR stays. Only the *call* is wrapped in `useMutation`. Progress stays in local state, never the cache. |
| **Client-only contexts** | `AppContext`, `ThemeContext`, `CustomizationContext`, `DeveloperAccessContext`, `MsalClientProvider`, `PnidRouterContext` | Zero network calls. Untouched. |
| **Canvas / editor state** | `useValidateCanvas` (zoom/pan/RAF), `AgentContext` node/edge/undo/redo, `useReactFlowCanvas`, `WorkflowContext.SVG_RENDER_CACHE` | Client state and render caches. Not server data. |
| **Chat message accumulation** | `usePlantGpt`, `AiveeChat`, `AiveeChatbot`, `PnidKgAiveeChatbot` | Each turn is a **mutation**; the transcript is append-only local state (persisted to localStorage in plant-gpt's case). Do not model a transcript as a query. |
| **Workflow-progress localStorage** | `useSourceLifecycle`'s configured/processed/validated/committed Sets, `admin_job_ids_*`, `admin_context_params_*` | No endpoint returns these. They are genuinely offline client state, not a server cache. |
| **`DomainOntologyContext`** | `sessionStorage['domain_ontology']` | A write-through scratchpad populated *from* server responses by feature code — cross-feature working state, not a cache of any single endpoint. |
| **URL-as-source-of-truth state** | `?view=`, `?rule=`, `?id=` search params | CLAUDE.md rule 38. Query keys read *from* the URL; they never replace it. |

---

## Verification (no test suite exists)

Manual, per sub-phase. The Devtools panel makes most of this observable directly.

**Per sub-phase checklist:**

1. **Network tab — request count.** Open the migrated feature. The count must be **≤** pre-migration. Specifically confirm the known duplicates are now single requests:
   - `getClientFiles` — 1 request, not 2 (was `DomainConfigContext` + `useTemplateMatching`)
   - `checkExtractionFiles` — 1 request, not 3
   - `getHighlightOptions` — 1 request, not 2
2. **Devtools — key shape.** Every plant-scoped key shows `plantCode` in position 3. No key contains `undefined` or `null` where a plant should be.
3. **StrictMode double-mount.** Dev mode double-invokes effects. Confirm exactly **one** network request per query on mount (this is what `loadedKeyRef` was hand-patching in symbolic-ai).
4. **Plant switch mid-flight.** Start a load, switch plant in the header before it resolves. The old plant's response must not render. Devtools should show two separate cache entries, not one being overwritten.
5. **Poller lifecycle** (Phases 1b, 1d, 7, 10, 11, 12, 21):
   - Start a job → status requests appear at the expected interval.
   - Job reaches `completed`/`failed` → requests **stop**.
   - Navigate away mid-poll → requests **stop** (this is the leak fix; verify explicitly).
   - Kill the backend mid-poll → requests stop after 5 failures and an error state renders (not infinite silent polling).
6. **Invalidation.** Perform each mutation and confirm the listed query refetches — and that unrelated queries do not.
7. **Upload progress.** SAP + timeseries uploads must still show smooth byte-level progress. Timeseries must still show the two-band split (0-30% metadata, 30-55% values).
8. **Error states.** Stop the backend and load the feature. It must render a **visible error with a retry affordance** — not an empty table (this is the mock-fallback removal, verified per-domain).
9. **401 path.** Let the token expire (or clear the `auth_token` cookie), then trigger several queries at once. Devtools/console must show **one** `POST /api/auth/refresh`, then successful replays. Confirm no query retried the 401 itself.
10. **Logout.** Force logout → Devtools cache must be empty. Log in as another user → no flash of the previous user's data.
11. **`select` is actually memoizing.** For any query using `select`, confirm the derivation fn is at module scope (or `useCallback`-wrapped) and that React DevTools' Profiler shows it is not re-running on unrelated re-renders. An inline arrow silently disables the whole optimization — it looks correct and does nothing.
12. **Revertability.** `git log --oneline` for the phase must show migration, fix, and chore commits separated. Dry-run `git revert` the `migrate(...)` commit and confirm nothing but data-fetching code moves.
13. `npm run build` passes (rule 42) and emits **no** `react-query-devtools` chunk; `npm run lint` clean including the new `@tanstack/query` rules; no `console.log` left in component/hook files (rule 36).

---

## Risks & mitigations

| # | Risk | Mitigation |
|---|---|---|
| 1 | **Stale data where the app previously always refetched.** `staleTime: 30_000` is a real behavior change; a user who commits in one tab and switches views may see 30s-old data. | Every mutation invalidates its read keys explicitly (the tables above are the contract). For flows where freshness is non-negotiable — job status, review contexts right after commit — set `staleTime: 0` per-query. |
| 2 | **`apiClient` `PLANT_CODE_REQUIRED` preflight fires a toast on every unguarded query.** Any query missing `enabled: !!plantCode` toasts *and* throws `status: 0` before touching the network. | `shouldRetry` excludes status 0 (so it toasts once, not three times). Beyond that: **`enabled: !!plantCode` is mandatory on every plant-scoped query** — make it a review checklist item and a CLAUDE.md rule. |
| 3 | **God-context decomposition scope creep.** `AdminPanelContext` has ~180 keys and ~30 consumers; touching its shape in 1e would balloon the phase. | Locked by user decision: 1e keeps the public shape and only swaps the data source. Decomposition is deferred to the post-migration cleanup section (after Phase 21). |
| 4 | **Upload-failure behavior change.** `useWorkspaceUpload.js:98-102` currently calls `onUploadSuccess()` even when the upload **fails**. A correct mutation surfaces the failure. | **Flagged for explicit sign-off before 1a ships.** Recommendation: fix it — silently reporting success on a failed upload is a data-integrity bug, and it contradicts the direction of commit `2c67fe5`. But it *will* look like a regression to anyone used to the current flow, so it must be a conscious, announced change. |
| 5 | **Pipeline control-flow inversion (1b).** `usePipeline` goes from promise-chained `await` to an effect-driven state machine. Sequencing bugs here are subtle and user-visible. | 1b is a standalone sub-phase with a dedicated end-to-end run (OCR → Extract → Compare) across all four branch cases: LLM mode, non-LLM mode, with line list, and extract-fails-so-compare-is-blocked. |
| 6 | **Services with hidden localStorage plant fallbacks.** `getStoredPlantCode()` in `knowledgeGraphService`, `agentFactoryService`, `dashboardService`, `visualsService`; direct `localStorage` reads in `knowledgeGraphChatService`. These are non-reactive inputs invisible to the query key — the cache would silently lie. | Remove each fallback as its phase arrives: 1c (`knowledgeGraphChatService`), Phase 2 (`knowledgeGraphService`), Phase 11 (`dashboardService`), Phase 18 (`visualsService`), Phase 20 (`agentFactoryService`). Thread `plantCode` explicitly. Non-negotiable prerequisite, not a nice-to-have. |
| 7 | **Binary blobs in cache cause memory growth.** Multi-MB P&ID `ArrayBuffer`s with a default 5-minute `gcTime` across many pages. | `staleTime: Infinity` + `gcTime: 60_000` on all blob queries. Verify with a heap snapshot after browsing ~20 P&ID pages. |
| 8 | **Refetch storm from per-edit mutations.** `CreateTableView` fires one mutation per cell edit, each invalidating the same markdown key. | Shared `mutationKey`; invalidate in `onSettled` only when `queryClient.isMutating({ mutationKey }) === 1`. |
| 9 | **Two migration styles coexisting for months.** Half the app on Query, half hand-rolled — new code could be written either way. Worse: `GEMINI.md` is a hand-maintained byte-identical mirror of `CLAUDE.md`, so agents reading it will follow superseded conventions until it is updated too. | The convention rules land in **both files** in Phase 0, before any feature migrates (rule 57). Enforce with a symlink or a pre-commit divergence check. Boy-scout rule: touching a file that still hand-rolls a fetch means migrating it. |
| 10 | **XHR uploads still bypass 401 recovery.** Pre-existing (`AuthInterceptor` patches `window.fetch` only). | Out of scope — but add a `TODO` comment at `uploadConnectorFileWithProgress` so it stops being invisible. |
| 11 | **A phase can't be reverted because it carries a bug fix.** The original plan folded `window.layoutSaveTimeout`, the upload-success-on-failure fix, skeleton consolidation, and mock-fallback removal into migration phases. Reverting a phase would then silently reintroduce a bug or undo a fix. | See **Commit discipline**: `migrate(...)` / `fix(...)` / `chore(...)` never mix, and the seven known adjacent items are extracted with their own ship timing. DoD item 12 dry-runs the revert. |
| 12 | **`select` looks applied but does nothing.** An inline arrow `select: (d) => transform(d)` is a new function identity every render; Query re-runs it every time and the "memoization" is fiction. Nothing errors, nothing warns. | Module-scope or `useCallback` (rule 54), the ESLint plugin's `no-unstable-deps`, and Verification item 11 (Profiler check). This is the most likely way the §0.9 work gets done wrong while looking right. |

---

## CLAUDE.md addition (to be inserted after "API & Proxy Architecture")

```markdown
## Data Fetching — TanStack Query

TanStack Query (@tanstack/react-query v5) is the ONLY way client code reads or
writes server state. It sits ABOVE the service layer; it does not replace it.

    Component → useQuery/useMutation → Service (src/services) → apiClient
      → /api/* Route Handler → Real Backend

Rule 19 ("no axios, use raw fetch") is unchanged: apiClient's raw `fetch` is
still the only transport. TanStack Query is a cache and request-state manager,
not an HTTP client.

46. Never call a service function directly from a component or a hand-rolled
    useEffect. Wrap it in useQuery (reads) or useMutation (writes). No new
    `useState(loading) + useEffect(fetch)` pairs.
    BAD:  useEffect(() => { getThing(plantCode).then(setThing); }, [plantCode]);
    GOOD: const { data } = useThing();  // wraps useQuery internally

47. Query hooks are colocated with their feature in a `_queries/` folder next to
    `_hooks/`. Query KEYS are central, in `src/lib/query/keys.js` — cross-feature
    invalidation requires a shared vocabulary.

48. Every plant-scoped query MUST carry `plantCode` as the third element of its
    key AND set `enabled: !!plantCode`. Without `enabled`, apiClient's
    PLANT_CODE_REQUIRED preflight fires a toast and throws before any network
    call. plantCode in the key is also what makes plant switching correct for
    free — never hand-roll a stale-response guard again.
    GOOD: useQuery({ queryKey: qk.domainConfig.pnidWs.clientFiles(plantCode),
                     queryFn: ({ signal }) => pnidService.getClientFiles(plantCode, { signal }),
                     enabled: !!plantCode })

49. Never poll with setInterval. Use `useJobPolling` (src/lib/query) for
    start-job → poll-until-terminal flows, or `refetchInterval` for periodic
    list refresh. Both stop automatically on unmount.

50. Every mutation must declare what it invalidates in onSuccess/onSettled.
    A mutation with no invalidation and no setQueryData is a bug unless the
    endpoint is genuinely compute-only (e.g. highlightComponents).

51. Retries: never retry status 0 (PLANT_CODE_REQUIRED), 401, or 403. 401 is
    already refreshed-and-replayed once by AuthInterceptor BELOW apiClient — a
    Query-level retry stacks on top and multiplies requests. Use the shared
    `shouldRetry` predicate from src/lib/query/queryClient.js.

52. Mutations toast on error (via the global MutationCache handler); queries
    render an inline error state with a retry control. Never add a global
    QueryCache.onError — with pollers running it would toast every few seconds
    during an outage.

53. Do NOT put in the query cache: SSE/streaming responses, upload progress
    percentages (local state — they fire ~100×/upload), canvas/editor state,
    chat transcripts (each turn is a mutation; the transcript is local state),
    or localStorage workflow progress that no endpoint returns.

54. Two kinds of transformation, two homes. CONTRACT-level transforms (unwrapping
    the {success, message, data} envelope, renaming wire fields) stay in the
    service — every caller needs them identically. VIEW-level derivation
    (grouping, deduping, reshaping for one screen) goes in `select`, where it is
    memoized against the cached data instead of running on every render.
    The `select` fn MUST be defined at module scope or wrapped in useCallback —
    an inline arrow is a new identity each render and defeats the memoization
    entirely (rule 22 applied to a new surface).

55. Set `structuralSharing: false` on queries whose payload is large and never
    partially shared — binary ArrayBuffers, big graph payloads. Query otherwise
    walks the whole response on every fetch looking for reusable sub-objects it
    can never find. Leave it ON (the default) for ordinary list/detail JSON,
    where it is what stops tables re-rendering on an identical poll result.

56. Commit hygiene: a `migrate(...)` commit contains ONLY the query conversion.
    Bug fixes found while migrating ship as `fix(...)`, adjacent cleanup as
    `chore(...)`. Test before committing: "if this were reverted, would anything
    besides the data-fetching layer change?" If yes, split it. A migration phase
    that cannot be reverted cleanly is not a phase.

57. CLAUDE.md and GEMINI.md are byte-identical mirrors. Any rule added to one
    MUST be added to the other in the same commit — otherwise agents reading
    GEMINI.md keep following superseded conventions.
```

---

## Sub-phase ship order (summary)

```
Phase 0     Foundation                  — infra only, nothing user-visible
   §0.11    └ Plant Registry            — PREREQUISITE: plantCode keys everything

⭐ Phase 1a  P&ID workspace reads        — DomainConfigContext 97 → ~45 lines
⭐ Phase 1b  manage-files pipeline       — usePipeline 265 lines, 20 useState → ~4
⭐ Phase 1c  validate + template-match   — 3 duplicate fetches deduped
⭐ Phase 1d  DSI uploads + job polling   — 6 duplicate pollers → 1 hook, 5 leaks fixed
⭐ Phase 1e  DSI review contexts+commits — view-gate anti-pattern removed ×4
   Phase 2   Knowledge Graph             — expand-merge via setQueryData; rollback added
   Phase 3   Symbolic AI                 — pendingMarkdownCache.js deleted
⭐ Phase 4   CPCP                        — wizard: 1 request instead of 1 per step
   Phase 5   Risk Template               — CRUD; mock fallbacks removed
⭐ Phase 6   Decision Template           — CRUD + rule-45 layout care
   Phase 7   Data Activity               — 1 fn; refetchInterval smoke test
   Phase 8   Group Management            ┐ ship together —
   Phase 9   User Registry               ┘ shared invalidation targets
   Phase 10  Log Management              — 5 pollers, background-off
   Phase 11  Dashboard                   — 60s poll; window.layoutSaveTimeout bug fixed
   Phase 12  CPCP Configuration (Home)   — 543-line hook + job poller + multipart
   Phase 13  Scenario Extractor          — static; verify only, no work
   Phase 14a–f Model Studio              — 118 fns: global-var → expression → function
                                            → forecast → optimizer → ml-model
   Phase 15  RCA                         — static; verify only, no work
   Phase 16  Workflow Management         — static; verify only, no work
   Phase 17  Workspace                   ┐ share useWorkspaceData.js (603 lines)
   Phase 18  Visuals                     ┘ debounced tag search + keepPreviousData
   Phase 19  PlantGPT                    — locks the chat convention
   Phase 20  Agent Factory               — Promise.all → 4 queries; rollback added
   Phase 21  Developer Options           — optimistic enable/disable toggle

Post-migration  AdminPanelContext decomposition — deferred rule-25 cleanup
```

**Hardest phases, in order:** 1e (god-context), 12 (543-line hook + poller + multipart), 1b (control-flow inversion), 14f (45 functions across six tabs).
**Easiest wins, in order:** 7 (1 function), 8 (2 functions), 19 (2 functions), 13/15/16 (zero — verification only).
