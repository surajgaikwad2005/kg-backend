# Migration Status

Phase numbering is fixed by the agreed feature list. ⭐ marks a business-priority
feature.

## Done

| Phase | Feature | What it removed |
|---|---|---|
| **0** | Foundation | — (deps, `QueryClient`, provider, key factory, `useJobPolling`, `useUploadMutation`, ESLint plugin, CLAUDE.md/GEMINI.md rules 46–57) |
| **0.11** | Plant Registry | `fetchedOnce` ref; manual `setPlants` append after create |
| **⭐ 1a** | P&ID workspace reads | `DomainConfigContext`'s `fetchTokenRef` stale-response guard, `fetchClientFiles`, both effects, a dead logging effect; `page.jsx`'s `useRef(new Set())` prefetch loop |
| **⭐ 1b** | manage-files OCR→Extract→Compare | **`usePipeline.js` deleted** — 265 lines, ~20 `useState`, 2 poll refs, 2 Promise-wrapped intervals, 2 empty `catch {}` |
| **⭐ 1c** | validate + template-matching | `knowledgeGraphChatService`'s internal `localStorage` read; duplicate `getHighlightOptions` and `getClientFiles` fetches |
| **⭐ 1d** | DSI uploads + connector polling | All 6 duplicated connector-job `setInterval` blocks → one shared hook |
| **⭐ 1e** | DSI review contexts + commits | The `data.length > 0` never-expiring cache guard, ×4 |
| **2** | Knowledge Graph | `initialLoadPlantRef`; manual `loadGraph()` after upload; the `getStoredPlantCode()` localStorage fallback |
| **3** | Symbolic AI | **`pendingMarkdownCache.js` deleted**; `loadedKeyRef` StrictMode guard |
| **5** | Risk Template + Unit Level | Two hand-rolled per-equipment caches + their in-flight flags |
| **⭐ 6** | Decision Template | 4-call `Promise.all` with swallowed failures |
| **7** | Data Activity | 30s `setInterval` + manual `lastRefreshed` tracking |
| **11** | Dashboard | **`useDashboardsPage.js` and local `useContainerWidth.js` deleted**; 60s `setInterval` poller; hand-rolled preview/chart fetch effects across 5 components; un-isolated `testExpression` and cron validation calls |

## Not started

Phases **8–10, 12–21**: Group Management, User Registry, Log Management,
CPCP Configuration (Home), Scenario Extractor, Model Studio (14a–14f), RCA,
Workflow Management, Workspace, Visuals, PlantGPT, Agent Factory, Developer
Options.

Phases 13 (Scenario Extractor), 15 (RCA) and 16 (Workflow Management) have **no
API surface** — verified by grep, zero service imports. They are numbered
placeholders so the plan and the feature list cannot drift apart.

## Blocked

### Phase 4 — CPCP

**The plan describes an API that does not exist.** It lists 12 methods
(`getOperatingOutcomes`, `createTemplate`, `getEquipments`, `getEquipmentFlow`,
`getParallelGroups`, `calculateSeriesCapacityChain`, …). Verified against
`src/services/cpcp/cpcpService.js`: **not one of them exists.**

The real service has 11 entirely different ontology-matrix methods (`getMatrix`,
`addTag`, `updateTag`, `verifyTag`, `deleteTag`, `runPnidAgent`, `saveEquipment`,
`deleteEquipment`, `addAttribute`, `deleteAttribute`, `getOntology`), consumed
only by `cpcp/old/hooks/useCpcpOntology.js`.

The multi-step wizard the plan called "where the win is" — supposedly collapsing
three `getEquipments` calls into one — **does not call the service at all**. It
reads and writes `localStorage` via `_lib/templateStore.js`, as does the CPCP
home list.

The service file is unmodified from `HEAD` (last touched by `a465c69`), so this
is not drift introduced by the migration — the plan was simply wrong about this
domain, and its effort estimate for Phase 4 is meaningless.

**Unblock by** establishing the real intended CPCP backend contract, then
re-planning. A migration of what actually exists is possible today but is a
different, smaller job than the plan describes — and it carries an offline SEED-data
sandbox fallback plus the same row-editing state machine as Risk Template.

## Verification baseline

- `npm run build` — passes.
- `npm run lint` — 744 errors, against a **745 clean-`HEAD` baseline**. The
  repo has a large pre-existing `react-hooks/set-state-in-effect` debt; measure
  *delta* against `HEAD`, never the absolute number. Note this total hides ~12
  new errors introduced by the migration (finding #12) that were offset by
  unrelated removals.
- If `npm run build` reports a type error inside `.next/dev/types/routes.d.ts`,
  that is a **corrupted generated artifact** from a dev server writing during the
  build, not a source error. `rm -rf .next` and rebuild.

## Commit convention

Per CLAUDE.md rule 56, three commit types that never mix:

- `migrate(<phase>):` — only the query conversion. Reverting undoes the
  migration and nothing else.
- `fix(<area>):` — a real bug found while migrating (e.g. `getDocsKnowledgeGraph`
  silently dropping its `plantCode`; `getFileArrayBuffer` never checking
  `res.ok`).
- `chore(<area>):` — adjacent cleanup with no behaviour change.

Test before committing: *if this were reverted tomorrow, would anything besides
the data-fetching layer change?* If yes, split it.

## Outstanding sign-off

`useWorkspaceUpload.js` still runs the **success** path when an upload **fails** —
progress reaches 100, step 4, and `onUploadSuccess()` fires, so the user is told
ingestion succeeded when nothing was stored. This predates the migration and was
preserved byte-for-byte so the transport swap stays revertible; the mutation is
marked `silent` so no toast contradicts the fake success.

It is a data-integrity bug. Fixing it is a one-line change but a visible
behaviour change, so it wants explicit sign-off as its own `fix(pnid-upload)`
commit.
