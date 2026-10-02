# Code Review Findings — TanStack Query Migration

Findings from the automated review of the migrated data layer, triaged by
severity. **This is a defect list, not a changelog.** Everything marked OPEN is
still present in the code.

**Status: 1 fixed, 14 open.**

Severity key:
- **P0** — breaks at runtime, or silently loses user data.
- **P1** — wrong behaviour a user will notice, or a promise the code makes and does not keep.
- **P2** — correctness/quality debt that is not yet user-visible.

---

## P0 — Fix before shipping

### 1. `ConfigModal` crashed on open — missing import ✅ FIXED

**File:** `src/components/admin/ConfigModal.jsx:24`

`usePollConnectorJob` was called but never imported. Opening Data Source
Integration's config modal threw `Uncaught ReferenceError: usePollConnectorJob is
not defined` and crashed the whole modal subtree.

**Why nothing caught it:** ESLint's `no-undef` is off under the Next flat config,
and bundlers do not resolve free identifiers at build time — so both `npm run
lint` and `npm run build` passed. It only appears at render.

**Root cause worth remembering:** the import was added by a scripted
find-and-replace targeting `import { useAdminNav, useAdminEntities, useAdminForm }`,
but this file imports `useAdminEntities` on a *separate* line. The replace
silently matched nothing. **A scripted edit that reports success is not evidence
the edit happened** — the other five call sites were verified afterwards and all
have their import.

---

### 2. Expanding a KG node wipes the user's selection and relayouts the graph — OPEN

**File:** `src/hooks/useKnowledgeGraphPage.js:71`

The reset effect is keyed on `graphQuery.data`, but `useExpandNode.onSuccess` and
`useSetGraphData` both write that same key via `setQueryData`. So the effect
fires on *every* cache write, not just a base reload.

Expanding a node therefore immediately calls `setExploredNodeIds(new Set())`
(erasing the marker just added), `setSelectedNode(null)` (deselecting the node
the user clicked, and any node just created via the CRUD controller), and
`setLayoutVersion(v => v + 1)` (re-running the cytoscape layout and reshuffling
the entire graph).

Pre-migration only `loadGraph()` did those resets; `handleNodeExplore` was a pure
merge.

**Fix direction:** distinguish "base reload" from "cache mutation". Track the
reload with something the merge does not touch — e.g. reset on
`dataUpdatedAt` changes only when the fetch was a real network reload, or move
the reset into the base query's own `onSuccess`-equivalent rather than a
`data`-keyed effect.

---

### 3. Node-limit input fires a backend request per keystroke — OPEN

**File:** `src/hooks/useKnowledgeGraphPage.js:31`

`maxNodes` is part of `queryKeys.knowledgeGraph.explore(plant, maxNodes)`, and
`GraphLimitControl`'s input does `onChange={(e) => onChange(Number(e.target.value))}`
on every keystroke (confirmed at `GraphLimitControl.jsx:41`).

Typing `500` issues three `kg_explore` requests (5, 50, 500). Clearing the field
gives `Number('') === 0`, requesting `total_nodes=0`, and `capToLimit(..., 0)`
slices the graph to zero nodes — blanking the canvas before the user ever presses
Load.

Previously `setMaxNodes` only updated a number; the explicit Load button fetched.

**Fix direction:** keep the typed value as local UI state and put a separate
*applied* limit in the query key, updated only by `onApply`.

---

### 4. Every KG chat request sends `plant_code_id: null` — OPEN

**Files:** `src/app/(admin)/admin/domain-configuration/pnid/validate/_components/PnidKgAiveeChatbot.jsx:53`
and `validate/_hooks/useKnowledgeGraph.js:107`

`knowledgeGraphChatService` was correctly refactored to take `plantCode` as a
required first argument instead of reading `localStorage` internally — but the
caller's `useCallback(... , [])` never re-creates. `useApp().plantCode` hydrates
asynchronously, so the closure captures the initial `null` **permanently**.

`react-hooks/exhaustive-deps` warns about this; the warning was not acted on.

**Fix direction:** add `plantCode` to the dependency arrays. This is the exact
failure mode the service refactor was meant to prevent, reintroduced one layer up.

---

### 5. Saving one row discards unsaved edits in every other row — OPEN

**Files:** `src/app/(admin)/admin/risk-template/hooks/useRiskTemplate.js:138`
and `hooks/useUnitLevel.js:108`

All three record mutations invalidate `riskKeys.records(plantCode)`, which
refetches and produces new `recordsQuery.data`. The seeding effect then runs
`setRows(prev => [...serverRows, ...prev.filter(r => r.recordId == null)])`,
rebuilding **every server-backed row** from the server payload with
`isEditing: false`.

Put rows A and B into edit mode, type into both, save A → B's typed input is
silently replaced by the server's old values.

Pre-migration, `reloadRecords()` only ran on an explicit path (unknown create
response, Excel import).

**Fix direction:** merge rather than replace — preserve rows currently in
`isEditing`, or reconcile per-row by `recordId` instead of wholesale rebuild.

---

### 6. Background refetch overwrites the edited review grid — OPEN

**Files:** `useDocsFormState.js:103`, `useTsFormState.js:72`, `useSapFormState.js:78`

Two compounding problems.

**(a) The removed guard has no replacement.** The comments claim "the commit
mutation now invalidates this key" — but `useCommitPnidContext`,
`useCommitDocsContext`, `useCommitTsContext` and `useCommitSapContext` have
**zero consumers** (verified by grep). The commit paths still call the raw
services. The invalidation contract described in the code does not exist.

**(b) The grid is editable and now re-seeds.** `docDataByCategory` is mutated by
`views/DocsReviewView.jsx:119,135`. Edit rows, switch admin view for more than
the 30s `staleTime`, come back: `enabled` flips true, the stale query refetches,
the effect overwrites the edits. In `useTsFormState` it is worse — `generateId()`
re-keys every row, so React remounts them all.

**Fix direction:** wire the commit mutations to their call sites (that was the
point of writing them), and treat the edited grid like the row state machines —
seed once, merge thereafter.

---

## P1 — Wrong behaviour, ship-blocking for the affected screens

### 7. Template Matching resets the user's drawing selection mid-work — OPEN

**File:** `.../pnid/template-matching/_hooks/useTemplateMatching.js:75`

The seeding effect depends on `clientFilesQuery.data`, and that key is now
*shared* with `DomainConfigContext` and invalidated by `useDeleteClient`,
`useDeleteWorkspaceFile`, `useUploadWorkspaceFiles`, and every `refreshFiles()`.

Select drawing C page 5; any file upload or delete elsewhere in the P&ID shell
invalidates the key, the payload returns changed, and the effect unconditionally
calls `setSelectedFileOption(first.pdf)` / `setSelectedPageNo(1)` — the canvas
jumps back to drawing A page 1.

This is the cost of sharing a cache entry: the read is deduplicated, but the
consumer must now tolerate refetches it did not initiate.

**Fix direction:** seed the selection only when there is no current selection, or
when the selected drawing is no longer present in the new payload.

---

### 8. Failed loads now render as "empty" with no error — OPEN

**Files:** `symbolic-ai/[slug]/_hooks/useSymbolicAIPage.js:80` and `symbolic-ai/page.jsx`

The deleted `loadRule` had `catch { toast.error('Failed to load rule', …) }`. The
replacement effect only checks `isPending`; on error `isPending` is false and
`data` is `undefined`, so `data || '*System synchronized rule base.*'` renders the
placeholder. A 500 is indistinguishable from a genuinely empty rule.

Same in `symbolic-ai/page.jsx` — the `catch { toastError('Failed to load rules') }`
was dropped along with `toastError` itself, so a failed `listTables` renders an
empty library silently.

**This directly contradicts the migration's own stated goal** (surface real errors
instead of misleading empty states) and CLAUDE.md rule 52.

**Fix direction:** render `isError` explicitly with a retry control.

---

### 9. OCR queue failure shows an idle pipeline panel — OPEN

**File:** `.../manage-files/_queries/usePnidPipeline.js:270`

The deleted `usePipeline.start` set `jobError` and `jobStatus: 'error'`. The
replacement catch only does `setStage(STAGE.DONE)`. With stage DONE and no
`ocrJob.data`, both `jobStatus` and `jobError` resolve to `null`, so
`CombinedPipelineProgress` renders idle and `isPipelineActive` reads false.

The user clicks Process, the queue request 500s, and the UI shows nothing but a
transient toast.

**Fix direction:** keep an explicit `startError` in the state machine and surface
it as `jobError`.

---

### 10. Two undismissable / over-dismissed warning banners — OPEN

**`useUnitLevel.js:90`** — `dismissedWarning` is set once and never reset, so
dismissing one warning permanently suppresses **all future** warnings, including
for a different plant.

**`useRiskTemplate.js:126`** — `warning` falls back to `equipmentQuery.error`, but
`dismissWarning` only clears `lookupWarning`. When the equipment dropdown fails,
dismiss changes no state and the memo re-derives the same string: the banner is
**permanently undismissable**.

Pre-migration both wrote into a single `warning` state that `setWarning(null)`
cleared.

**Fix direction:** dismissal must be keyed to the specific message (or reset on
plant/query change), not a permanent boolean.

---

### 11. The connector-job poller's central claim is false at 4 of 6 call sites — OPEN

**File:** `src/components/admin/_queries/useConnectorJob.js:14`

The module header says the poll "cannot outlive the component". In practice
`ConfigModal.jsx`, `useConfigModalActions.js` (×3), `useDocSourceModal.js` and
`usePnidFormState.js` all call `pollConnectorJob({ connector, jobId })` from a
bare fire-and-forget `(async () => {…})()` — no `signal`, not tied to any effect
cleanup. The `for(;;)` loop exits only on terminal status or 5 consecutive
failures, so closing the modal mid-upload leaves the poll running *and* calling
`setConfiguredSources` on an unmounted tree.

Only `useSourceLifecycle.js` passes `controller.signal` — and even there the
signal is not forwarded into `fetchQuery`, so the in-flight request is never
aborted.

**This is the exact leak class 1d claimed to eliminate.** The duplication was
removed; the leak largely was not.

**Fix direction:** forward the signal into `fetchQuery`, and give each call site
an `AbortController` tied to effect cleanup or modal close.

---

## P2 — Debt, not yet user-visible

### 12. ~12 new `react-hooks/set-state-in-effect` lint errors — OPEN

Across `useTemplateDesigner.js:133,152`, `usePnidPipeline.js:195,222`,
`useTemplateMatching.js:75,92`, `useRiskTemplate.js:138`, `useUnitLevel.js:108`,
`useSymbolicAIPage.js:66,80`, `useDocsFormState.js:103`, `useSapFormState.js:78`,
`useTsFormState.js:72`, `useKnowledgeGraphPage.js:73`.

All the same shape: *seed editable state from a query inside an effect*. Each
costs an extra render pass per data arrival (against CLAUDE.md rule 11), and the
rule is an **error**, not a warning.

Note the repo-wide count did not rise (744 vs a 745 baseline) because unrelated
errors were removed at the same time — so the total is misleading. These are new.

**Fix direction:** this pattern is sometimes genuinely necessary (editable state
seeded from server data). Where it is, the honest move is a scoped, commented
`eslint-disable` per instance rather than leaving CI red. Where it is not
(derivable during render), remove the effect.

---

### 13. Roughly half the new query layer has no consumer — OPEN

Zero call sites exist for: the entire `useUploadMutation` module (exported from
the public barrel), `useDeletePlant`, `usePurgePreview`, all four
`useCommit*Context`, `useAddSapTable`, `useUpdateColumnRenames`,
`useUpdateUserConfig`, `usePopulateOntology`, `useExistingPnid`, `usePipelineJob`,
`useDsiQueries`' `useRunPipeline`, the declarative `useConnectorJob`,
`useSaveHighlightOptions`, `useHighlightComponents`, `useValidateConnection`,
`useUploadToCdm`, `useRunTemplateMatch`, `useSaveTemplateLibrary`,
`useExtractTextByBox`, `useImagesList`, `useExcelExists`, `useGenerateMarkdown`,
`useAddEquipmentColumn`, `useSetColumns`, `useRemoveColumns`, `useAddData`,
`useSendChat`, `useFailureModes`, `useRiskTags`, `useTemplateOptions`,
`useDeleteSnapshot`, and `DomainConfigContext`'s `isFilesError`/`filesError`.

Two consequences beyond dead weight:

1. **Comments assert behaviour that does not exist** — the commit-invalidation
   contract (finding #6), and `DomainConfigContext`'s claim that error and empty
   are now distinguishable while `pnid/page.jsx`'s `showSetup` still treats a
   failed fetch as "no files".
2. `useUploadMutation` ships with a real bug fixed but **never exercised** by any
   call site, so nothing validates it.

**Fix direction:** either wire them (several *should* be wired — the commit
mutations especially) or delete them. Writing the hook is not the migration; the
call site is.

---

### 14. Imperative fetcher hooks defeat their callers' memoization — OPEN

`useRiskLookupFetchers`, `useLoadWorkflowForEdit`, `useSeedRuleMarkdown` and
`useFetchPnidContext` all return bare arrow functions with no `useCallback`, so
every consumer callback wrapping them gets a new identity per render and
re-renders the tables it is passed to (CLAUDE.md rule 24).

Separately, several hooks list an entire `useQuery` **result object** in a
dependency array (`useDataActivity.js:30`, `DataQualitySummary.jsx:33`,
`useRiskTemplate.js:141-142`, `useUnitLevel.js:111,190`,
`useKnowledgeGraphPage.js:85`). That is precisely what
`@tanstack/query/no-unstable-deps` — enabled by this same migration — exists to
catch; it missed them only because the custom-hook indirection hides the
`useQuery()` call from the rule.

**Fix direction:** `useCallback` the returned fetchers; depend on
`query.refetch` / `mutation.mutateAsync` (stable) rather than the result object.

---

## Themes worth carrying into the remaining phases

1. **A green build and green lint prove very little here.** Finding #1 was a
   guaranteed crash that passed both. Runtime verification of at least one real
   user path per phase is not optional.
2. **Scripted find-and-replace needs verification, not trust.** Finding #1 came
   from a replace that matched nothing and reported success.
3. **Sharing a cache entry has a cost.** Findings #6 and #7 are both "the read is
   now shared, so it refetches when someone else invalidates it". Any consumer
   holding derived *editable* state must tolerate that.
4. **Seeding editable state from a query is the single riskiest pattern in this
   migration.** Findings #5, #6, #7 and #12 are all the same shape. Establish one
   reviewed helper for it rather than re-deriving it per hook.
5. **Writing a hook is not migrating a call site.** Finding #13 is large, and #6
   shows the real danger: code that documents a contract nothing implements.
