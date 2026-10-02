# TanStack Query Migration

Living documentation for the migration of this app's data layer from hand-rolled
`useState` + `useEffect` + `setInterval` onto TanStack Query v5.

| Document | What it is |
|---|---|
| [`conventions.md`](./conventions.md) | How to write a query/mutation here. Read before touching the data layer. |
| [`migration-status.md`](./migration-status.md) | Which of the 21 phases are done, which are not, and what is blocked. |
| [`code-review-findings.md`](./code-review-findings.md) | Open defects from the review of the migrated code, triaged. **Read before shipping.** |

## The one-paragraph version

TanStack Query sits **above** the service layer and replaces nothing below it:

```
Component → useQuery/useMutation → Service (src/services) → apiClient → /api/* → Backend
```

`apiClient`'s raw `fetch` is still the only transport, so CLAUDE.md rule 19
("no axios, use raw fetch") is untouched. Query is a cache and request-state
manager, not an HTTP client. Every service function is unchanged in shape — it
was already the correct `queryFn` boundary: pure, plant-code-as-argument, never
reading context.

## Shared foundation

Everything reusable lives in `src/lib/query/`. Import from `@/src/lib/query`,
never reach into the individual modules — except `QueryProvider`, which the root
layout imports directly so the barrel does not drag every hook module into every
route's client bundle.

| Module | Purpose |
|---|---|
| `queryClient.js` | The `QueryClient` factory, the shared `shouldRetry` predicate, and the global mutation-error toast handler. |
| `QueryProvider.jsx` | `'use client'` provider. Creates the client via `useState` (never module scope) and lazily loads Devtools behind a `NODE_ENV` check. |
| `keys.js` | The central query-key factory. Keys are central even though hooks are colocated — cross-feature invalidation needs a shared vocabulary. |
| `useJobPolling.js` | Poll a backend job until a terminal state. Replaces the `setInterval` + ref + manual-`clearInterval` pattern. |
| `useUploadMutation.js` | `useMutation` plus transient byte-level upload progress, preserving the XHR transport. **Currently has no consumer** — see finding #14. |
| `usePlantRegistry.js` | The plant registry (infrastructure, not a feature — `plantCode` keys everything). |

Feature hooks are colocated in a `_queries/` folder next to the feature's
`_hooks/`:

```
src/app/(admin)/admin/decision-template/_queries/useDecisionTemplate.js
src/app/(admin)/admin/domain-configuration/pnid/_queries/usePnidWorkspace.js
src/app/(admin)/admin/domain-configuration/pnid/manage-files/_queries/usePnidPipeline.js
src/app/(admin)/admin/domain-configuration/pnid/validate/_queries/usePnidValidate.js
src/app/(admin)/admin/risk-template/_queries/useRiskTemplateQueries.js
src/app/(admin)/admin/data-activity/_queries/useDataActivityQueries.js
src/app/(dashboard)/knowledge-graph/_queries/useKnowledgeGraphQueries.js
src/app/(dashboard)/symbolic-ai/_queries/useSymbolicAi.js
src/components/admin/_queries/useConnectorJob.js
src/components/admin/_queries/useDsiQueries.js
```

## Why this was done

Every one of these was hand-rolled before, in several incompatible ways:

- **Caching** — a `fetchedOnce` ref in `PlantsContext`; `if (data.length > 0) return`
  guards in four CDM form hooks; a module-level `pendingMarkdownCache.js` for
  cross-route handoff; a `fetchTokenRef` in `DomainConfigContext` to drop stale
  responses on plant switch.
- **Polling** — ~15 duplicated `setInterval` loops, six of them byte-identical
  copies of the connector-job poll, most with no unmount cleanup.
- **Deduplication** — a `loadedKeyRef` existing purely to defeat StrictMode's
  double effect; `getClientFiles` and `getHighlightOptions` each fetched twice by
  unrelated subtrees.
- **Invalidation** — manual `loadGraph()` / `fetchTables()` calls after mutations.
- **Error surfacing** — `.catch(() => setX([]))` making a failed request visually
  identical to an empty result.

`plantCode` in every key is what makes plant switching correct for free: a
different plant is a different cache entry, so a late response for the previous
plant structurally cannot render against the new one.

## Status at a glance

Twelve of 21 phases migrated. See [`migration-status.md`](./migration-status.md)
for detail, and **[`code-review-findings.md`](./code-review-findings.md) for 14
open defects** — one of which (a crash) is already fixed, the rest are not.
