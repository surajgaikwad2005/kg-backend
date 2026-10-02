# DecisionOps Frontend — Folder Structure Reference

Single source of truth for how the 21 DecisionOps features are (and should be) organized
across the three architectural layers — Pages, API routes, Services — per the
`Component → Service → apiClient → API Route → Backend` flow defined in `CLAUDE.md`.

**Status:** The API Routes Layer (§2) and Services Layer (§3) restructuring below has been
executed (2026-07-21) — build verified clean, zero broken imports. The Pages Layer (§1)
remains a proposal only. See the [Execution Checklist](#execution-checklist) for what's
done vs. still pending confirmation.

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Already matches the target structure — no change |
| 🔁 | Rename / move / regroup required |
| ➕ | Gap — folder/file doesn't exist yet, needs to be created |
| ❓ | Still open / unconfirmed |

## Feature List (canonical)

1. Domain Configuration — P&ID, Documents, Timeseries, SAP
2. Knowledge Graph
3. Symbolic AI
4. CPCP
5. Risk Template
6. Decision Template
7. Data Activity
8. Group Management
9. User Registry
10. Log Management
11. Dashboard
12. CPCP Configuration (Home) — **distinct feature from #4 CPCP**
13. Scenario Extractor
14. Model Studio — ml-model (Overview, Model, Pipelines, Experiments, Deployments, Artifacts), Expression, Optimizer, Forecast (Overview, Models, Pipelines, Experiments), Custom
15. RCA (formerly written "RCS" — confirmed typo)
16. Workflow Management
17. Workspace
18. Visuals
19. PlantGPT
20. Agent Factory
21. Developer Options

---

## 1. Pages Layer — `src/app/(dashboard)/*` and `src/app/(admin)/admin/*`

```
(dashboard)/
├─ home/                                     Feature 12 — CPCP Configuration (Home)   ✅
├─ knowledge-graph/                          Feature 2                                 ✅
├─ symbolic-ai/                              Feature 3                                 ✅
├─ scenario-extractor/                       Feature 13                                ✅
├─ model-studio/                             Feature 14                                ✅ (reference structure — already correctly nested)
│  ├─ ml-model/    (_tabs: Overview, Models, Pipelines, Experiments, Deployments, Artifacts)
│  ├─ expression/
│  ├─ optimizer/
│  ├─ forecast/    (_components: Overview, Models, Pipelines, Experiments)
│  └─ custom/                                canonical name — do not rename to "suggest"
├─ rca/                                      Feature 15                                ✅
├─ workflow-management/                      Feature 16                                ✅
├─ workspace/                                Feature 17                                ✅
├─ visuals/                                  Feature 18                                ✅
├─ plant-gpt/                                Feature 19                                ✅
├─ agent-factory/                            Feature 20                                ✅
├─ developer-options/                        Feature 21                                ✅
├─ dashboards/                               Feature 11 (naming: plural, kept as-is)   ✅
└─ extra/                                    DO NOT TOUCH — per CLAUDE.md rule 44

(admin)/admin/
├─ domain-configuration/                     Feature 1
│  ├─ pnid/                                                                            ✅
│  ├─ data-source-integration/               shared onboarding shell across pnid/documents/timeseries/sap — NOT a standalone sub-feature
│  ├─ documents/                             ➕ not yet built (API already exists)
│  ├─ timeseries/                            ➕ not yet built (API already exists)
│  └─ sap/                                   ➕ not yet built (API already exists)
├─ cpcp/                                     Feature 4 — CPCP (distinct from Feature 12) ✅
├─ risk-template/                            Feature 5                                 ✅
├─ decision-template/                        Feature 6                                 ✅
├─ data-activity/                            Feature 7                                 ✅
├─ group-management/                         Feature 8                                 ✅
├─ user-registry/                            Feature 9                                 ✅
└─ log-management/                           Feature 10                                ✅
```

## 2. API Routes Layer — `src/app/api/*`

```
api/
├─ domain-configuration/                     Feature 1                                 ✅
│  ├─ pnid/
│  ├─ pnid-workspace/
│  ├─ documents/
│  ├─ timeseries/
│  ├─ sap/
│  └─ config/, ontology/, pipeline/, shared/    cross-cutting infra, shared across sub-features
├─ knowledge-graph/                          Feature 2                                 ✅
├─ symbolic-ai/                              Feature 3                                 ✅
├─ cpcp/[...path]                            Feature 4                                 ✅
├─ risk-template/[...path]                   Feature 5                                 ✅
├─ decision-template/[...path]               Feature 6                                 ✅
├─ data-activity/                            Feature 7                                 ✅
├─ group-management/                         Feature 8                                 ✅
├─ user-registry/                            Feature 9                                 ✅
├─ log-management/[...path]                  Feature 10                                ✅
├─ dashboards/                               Feature 11                                ✅
├─ cpcp-configuration/                       Feature 12                                ✅
│  ├─ diagram/
│  ├─ industrial-data/
│  └─ pnid/[...path]
├─ scenario-extractor/                       Feature 13                                ✅
├─ model-studio/                             Feature 14
│  ├─ ml-model/                              ✅ DONE — grouped overview/, model-registry/, pipeline/, experiment/, artifacts/
│  │  ├─ overview/                           ✅ moved from api/model-studio/overview/
│  │  ├─ model-registry/                     ✅ moved from api/model-studio/model-registry/
│  │  ├─ pipeline/                           ✅ moved from api/model-studio/pipeline/
│  │  ├─ experiment/                         ✅ moved from api/model-studio/experiment/
│  │  ├─ artifacts/                          ✅ moved from api/model-studio/artifacts/
│  │  └─ deployment/                         ➕ still unconfirmed — DeploymentsTab may currently reuse optimizer/deployment; verify before assuming
│  ├─ expression/                            ✅ already its own sibling
│  ├─ optimizer/                             ✅ already fully nested (constants/, constraints/, deployment/, experiment/, objective-function/, search-tags)
│  ├─ forecast/                              ✅ mostly matches (experiment/, overview/, [...path] catch-all covers models/pipelines)
│  └─ custom/                                ✅ DONE — renamed from suggest/route.js to custom/route.js
├─ rca/                                      ➕ Feature 15 — no dedicated api/rca folder found; confirm if RCA calls another domain's API or is unbuilt
├─ workflow-management/                      Feature 16                                ✅
├─ workspace/[...path]                       Feature 17                                ✅
├─ visuals/                                  Feature 18                                ✅
├─ plant-gpt/                                Feature 19                                ✅
├─ agent-factory/[...path]                   Feature 20                                ✅
├─ developer-options/                        Feature 21                                ✅
├─ auth/, notification/, generate-equipment-file/, generate-job-status/, plant-id/     infra — not numbered features
└─ _lib/                                     proxy factory (createProxy/createCatchAllProxy) + backends registry
```

## 3. Services Layer — `src/services/*`

```
services/
├─ domain-configuration/                     Feature 1
│  ├─ pnid/                                  ✅ DONE — moved from top-level services/pnid/ (pnidService.js, knowledgeGraphChatService.js)
│  │                                              — confirmed already 100% Domain-Configuration-scoped (per its own header
│  │                                                comments); no data mixing with CPCP-configuration existed, so this was a
│  │                                                straight move, not a split.
│  ├─ documents/                             ✅
│  ├─ timeseries/                            ✅
│  ├─ sap/                                   ➕ gap — not found as its own service file, confirm where sap logic lives
│  └─ common/                                ✅ DONE — merged from services/cdm/ (configService, contextService, dataQualityService,
│                                                  ontologyService) — services/cdm/ deleted after merge (legacy pre-rename name)
├─ knowledge-graph/                          Feature 2                                 ✅
├─ symbolic-ai/                              Feature 3                                 ✅
├─ cpcp/                                     Feature 4 — cpcpService.js                ✅ (owns its own PNID-backend calls, separate from domain-configuration's pnid/)
├─ risk-template/                            Feature 5                                 ✅
├─ decision-template/                        Feature 6                                 ✅
├─ data-activity/                            Feature 7                                 ✅
├─ group-management/                         Feature 8                                 ✅
├─ user-registry/                            Feature 9                                 ✅
├─ log-management/                           Feature 10                                ✅
├─ dashboard/                                Feature 11                                ✅
├─ cpcp-configuration/                       Feature 12                                ✅ DONE — new grouping
│  ├─ diagram/                               ✅ moved from top-level services/diagram/ (diagramService.js — owns its own
│  │                                              PNID-backend calls for this feature; no separate pnid/ subfolder created here)
│  └─ industrial-data/                       ✅ moved from top-level services/industrial-data/
├─ scenario-extractor/                       Feature 13                                ✅
├─ model-studio/                             Feature 14
│  ├─ ml-model/                              ✅ (artifactService, experimentService, modelRegistryService, pipelineService)
│  │  └─ modelService.js                     ✅ DONE — split from services/model-studio/modelService.js (kept getOverviewStats only)
│  ├─ expression/                            ✅
│  ├─ optimizer/                             ✅ (constantsService, constraintsService, deploymentService, experimentService,
│  │                                              objectiveFunctionService, searchService — already fully nested)
│  ├─ forecast/                              ✅ (forecastService, forecastExperimentService)
│  └─ custom/                                ✅ DONE — new customService.js (streamCodeSuggestion split out of the old modelService.js)
├─ rca/                                      ➕ Feature 15 — confirm if a dedicated service is needed
├─ workflow-management/                      ➕ Feature 16 — confirm if a dedicated service is needed
├─ workspace/                                Feature 17                                ✅
├─ visuals/                                  Feature 18                                ✅
├─ plant-gpt/                                Feature 19                                ✅
├─ agent-factory/                            Feature 20                                ✅
├─ developer-options/                        Feature 21                                ✅
└─ apiClient.js                              shared client, stays at services/ root per CLAUDE.md rule 9
```

---

## Key Architectural Decisions

1. **`services/cdm/` → merged into `services/domain-configuration/common/`.**
   Both held the same responsibility (config/context/ontology/data-quality) — `cdm` was
   the pre-rename name for what is now the Domain Configuration feature. No functional
   split needed, just consolidation under the current feature name.

2. **`services/pnid/` → moved into `services/domain-configuration/pnid/`, not split.**
   Verified by reading both files: `pnidService.js` and `knowledgeGraphChatService.js`
   already carry header comments stating they belong exclusively to the Domain
   Configuration P&ID workspace feature (routed through
   `/api/domain-configuration/pnid-workspace/*` and
   `/api/domain-configuration/pnid/knowledge-graph/*`). CPCP-Configuration's own
   PNID-backend calls already live in a separate file, `services/diagram/diagramService.js`
   (routed through `api/cpcp-configuration/pnid`), and CPCP's (#4) in
   `services/cpcp/cpcpService.js` (routed through `api/cpcp`). There was no actual data
   mixing to segregate — this is a straight relocation.

3. **CPCP (#4) and CPCP Configuration/Home (#12) are two distinct features**, not one.
   `(admin)/admin/cpcp/` + `api/cpcp/[...path]` + `services/cpcp/` = Feature 4, unchanged.
   `(dashboard)/home/` + `api/cpcp-configuration/*` + new `services/cpcp-configuration/`
   = Feature 12.

4. **Model Studio's `custom` (not `suggest`) is the canonical name.** The page folder
   was already `custom/`; the API route (`suggest/`) and the (missing) service must be
   renamed/created to match, not the other way around.

5. **`data-source-integration` is a shared onboarding shell**, not a 5th Domain
   Configuration sub-feature — same pattern as `api/domain-configuration/shared/`.

---

## Execution Checklist

### Done (2026-07-21) — API Routes Layer + Services Layer

- [x] `services/cdm/*.js` → `services/domain-configuration/common/*.js`; deleted `services/cdm/`
- [x] `services/pnid/pnidService.js` → `services/domain-configuration/pnid/pnidService.js`
- [x] `services/pnid/knowledgeGraphChatService.js` → `services/domain-configuration/pnid/knowledgeGraphChatService.js`; deleted `services/pnid/`
- [x] `services/diagram/*` → `services/cpcp-configuration/diagram/*`
- [x] `services/industrial-data/*` → `services/cpcp-configuration/industrial-data/*`
- [x] `services/model-studio/modelService.js` split → `services/model-studio/ml-model/modelService.js` (getOverviewStats) + new `services/model-studio/custom/customService.js` (streamCodeSuggestion)
- [x] `api/model-studio/overview/` → `api/model-studio/ml-model/overview/`
- [x] `api/model-studio/model-registry/` → `api/model-studio/ml-model/model-registry/`
- [x] `api/model-studio/pipeline/` → `api/model-studio/ml-model/pipeline/`
- [x] `api/model-studio/experiment/` → `api/model-studio/ml-model/experiment/`
- [x] `api/model-studio/artifacts/` → `api/model-studio/ml-model/artifacts/`
- [x] `api/model-studio/suggest/route.js` → `api/model-studio/custom/route.js`
- [x] created `services/model-studio/custom/customService.js`
- [x] every consumer import updated (`@/src/services/cdm`, `@/src/services/pnid/*`, `@/src/services/diagram/*`, `@/src/services/industrial-data/*`, old `modelService` imports, and all `/api/model-studio/{overview,model-registry,pipeline,experiment,artifacts,suggest}` URL literals) — verified zero stale references left, `npm run build` clean

### Still pending confirmation (not part of this pass — Pages Layer / unresolved gaps)

- [ ] confirm + create `(admin)/admin/domain-configuration/{documents,timeseries,sap}/` pages
- [ ] confirm `services/domain-configuration/sap/` location
- [ ] confirm `api/rca/` and `services/rca/` — build vs. reuse another domain's API
- [ ] confirm `services/workflow-management/` — needed or not
- [ ] confirm Model Studio `ml-model/deployment/` endpoint — new build or reuse of `optimizer/deployment/`
