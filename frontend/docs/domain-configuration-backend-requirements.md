# Domain Configuration — Backend Ownership Requirements

**Module:** Admin → Domain Configuration (Data Source Integration + P&ID Workspace)
**Audience:** Backend engineering, Platform, QA
**Status:** Requirement / design intake — not yet implemented
**Owner (frontend):** Decision Ops frontend team
**Date:** 2026-08-04
**Companion document:** [Frontend Improvement & Hardening Plan](./frontend-improvement-plan.md) — frontend-side performance, state management, and API hygiene

---

## 1. The requirement in one paragraph

Domain Configuration ingests four data sources — **P&ID**, **Documents**, **Time Series (Historian)**, and **SAP** — and turns them into committed CDM context. Today the *files* reach the backend, but the **lifecycle around those files does not exist on the backend**. Which files were uploaded, which batch they belong to, which stage a source is in, whether it has been processed / validated / committed, when, by whom, what settings were used, and how far a running job actually is — all of that lives in the **user's browser** (`localStorage` / `sessionStorage`) and, where a real number is unavailable, is **animated with timers and `Math.random()`**.

**We need the backend to own the entire lifecycle** as durable, plant-scoped, multi-user, resumable state, and to expose it through a stable API. The frontend must become a **pure renderer** of backend state: it uploads bytes, sends user intent, and paints whatever the backend reports. Nothing about pipeline state may survive only in the browser.

**Acceptance definition — "the three tests".** A change is done only when all three pass, for every connector and every step:

| Test | Meaning |
|---|---|
| **F5 test** | Hard-refresh mid-process. The UI comes back on the exact same step, with the exact same real progress. Nothing is lost, nothing restarts. |
| **Second-device test** | Open the same plant in a different browser / another admin's machine. Identical state is shown, including a job that is currently running. |
| **Kill-the-tab test** | Close the tab entirely while a job runs. The job keeps running server-side and is still discoverable and resumable later. |

---

## 2. Why — what is fake today (evidence)

This is not a hypothesis; these are the exact places state is invented client-side.

| # | What the user sees | What actually happens | Where |
|---|---|---|---|
| 1 | Source cards showing *Configured / Processed / Validated / Committed*, with timestamps | Four `Set`s + two timestamp maps kept in React state and mirrored into `localStorage` keys `admin_configured_sources::<plant>`, `admin_processed_sources::<plant>`, `admin_validated_sources::<plant>`, `admin_committed_sources::<plant>`, `admin_committed_at::<plant>`, `admin_processed_at::<plant>` | `src/components/admin/hooks/useSourceLifecycle.js` |
| 2 | Pipeline progress bar climbing while a stage runs | `progress + Math.random() * 8 + 4`, capped at 90 until the poll returns a terminal status. The backend never reports a percentage. | `src/components/admin/hooks/usePipelineOrchestration.js:153` |
| 3 | "Configuring Context" progress modal (0 → 100 %) | `p += Math.random() * 18 + 8` on a 300 ms `setInterval`, then navigate. It is not connected to the commit call at all. | `src/components/admin/hooks/useAdminNavState.js:60-83` |
| 4 | P&ID "Ingesting Client Records" loader with steps *Connecting → Ingesting → Parsing → Finalizing* | `setInterval` incrementing a random number; the 4 step labels are a frontend constant. On upload **failure** it still walks to 100 % and reports success. | `src/app/(admin)/admin/domain-configuration/pnid/_hooks/useWorkspaceUpload.js:80-102`, `.../setup/IngestionLoader.jsx` |
| 5 | Per-source upload progress 0→55→60→100 | Hard-coded milestones around a real XHR byte-progress event; the 60→100 span is invented, since server-side processing has no progress channel | `src/components/admin/hooks/useConfigModalActions.js`, `useDocSourceModal.js` |
| 6 | Commit progress 0 → 20 → 70 → 95 → 100 | Fixed literals set around a single `await commitPnidContext(...)` call, with `setTimeout(…, 800)` to let the user read the last line | `usePipelineOrchestration.js:198-214` |
| 7 | "Processed" vs "Unprocessed" file grouping | Derived by comparing a client-generated upload timestamp string against a `localStorage` timestamp. No server-side notion of "this file has been processed" exists. | `src/components/admin/domainSources.js:146-169`, `views/DataConfigView.jsx` |
| 8 | Job identity surviving a refresh | Job IDs and batch IDs stashed in `admin_job_ids_<plant>`, `admin_batch_ids_<plant>`, `admin_context_params_<plant>`, `admin_pnid_files_by_batch::<batch>` | `usePipelineOrchestration.js:15-46, 77-123` |
| 9 | Document type / subtype catalog | Falls back to a 300-line frontend constant `DOC_TYPE_CATEGORIES` when the API returns nothing | `src/components/admin/admin.constants.js`, `hooks/useDocsFormState.js:16` |
| 10 | Which document files were uploaded under which subtype | `sessionStorage` key `admin_domain_config` → `uploadedDocFileNames` | `hooks/useDocsFormState.js:41-53` |

### Consequences we are living with

- **Clearing browser data = losing the plant's entire configuration history.** The backend cannot reconstruct it.
- **Two admins configuring the same plant see two different realities.** There is no shared truth.
- **A refresh during OCR orphans the job.** It keeps running on the server, but the UI can no longer find it.
- **Progress is a lie.** A user cannot distinguish "slow but healthy" from "stuck". Support cannot either.
- **No audit trail.** We cannot answer "who committed this context, when, from which files, with which model?"
- **Retry/resume is impossible** — the frontend does not know what already succeeded.

---

## 3. Scope

### In scope
- All four connectors: P&ID, Documents, Time Series, SAP.
- Both P&ID surfaces (see §3.1) — upload, file management, session, processing configuration, OCR/extract/compare, review, validate, commit.
- Every step from **file selection** to **committed CDM context + ontology population**.
- Job execution, progress, cancel, retry, resume, and history.
- File-level metadata and processed/unprocessed accounting, including cloud-sourced files.

### Out of scope for this document
- Knowledge Graph rendering/query semantics (separate spec).
- Model Studio, Risk Template, CPCP, Decision Template.
- Auth/RBAC mechanics (existing gateway; only the *authorization checks per action* are called out here).

### 3.1 Important: there are currently TWO P&ID pipelines

This must be resolved as part of this work, because it is the single biggest source of state divergence.

| | **Connector P&ID** | **P&ID Workspace** |
|---|---|---|
| Entry point | `/admin/domain-configuration/data-source-integration` | `/admin/domain-configuration/pnid/*` |
| Backend | CDM (`/api/domain-configuration/pnid/*`) | `PNID_WORKSPACE` (`/api/domain-configuration/pnid-workspace/*`) |
| Upload | `POST /pnid/upload` (`files[]`, `plant_code_id`) | `POST /pnid-workspace/upload` (`pnid_files`, `pfd_files`, `linelist_files`, `other_files`) |
| Processing | `POST /pipeline/run { stage: 'pnid' }` | `ocrProcess` → `extract` → `compareAndClean` |
| Review/commit | `getPnidContext` → `commitPnidContext` | `validate` → `uploadToCdm` |
| Shared state | **None.** Each keeps its own files, its own job IDs, its own idea of "done". |

**Requirement:** the backend must expose **one** authoritative status surface per plant per connector. Either the two backends are merged, or one of them becomes the system of record and the other reports into it. The frontend must not be the thing that stitches them together — that is what it does today, in `localStorage`.

---

## 4. Core principle and the domain model the backend must own

> **Every fact the UI displays must be readable from the backend, addressed by `plant_code_id` alone.**
> The frontend may cache; the frontend may not be the source.

### 4.1 Entities

These are the objects the backend must persist. Names are proposals; the shape is the requirement.

#### `Plant` (exists)
Scope key for everything below. Every entity carries `plant_code_id`.

#### `ConnectorState` — one row per (plant, connector)
The thing the source cards render. Replaces the six `localStorage` keys in §2.1.

```
plant_code_id            string
connector                'pnid' | 'documents' | 'timeseries' | 'sap'
status                   see §5 state machine
configured_at            timestamp | null
last_upload_batch_id     uuid | null
last_run_id              uuid | null
processed_at             timestamp | null
validated_at             timestamp | null
committed_at             timestamp | null
has_unprocessed_files    bool           # ← drives the "Unprocessed" section
unprocessed_file_count   int
total_file_count         int
locked_by                user_id | null # a run is in flight
updated_at, updated_by
```

#### `UploadBatch` — one per user upload / cloud sync action
```
batch_id                 uuid
plant_code_id, connector
source_kind              'device' | 'cloud'
cloud_provider           's3' | 'adls' | 'gcs' | null
cloud_uri                string | null      # bucket + prefix actually scanned
created_by, created_at
file_count, total_bytes
status                   'uploading' | 'uploaded' | 'partial' | 'failed'
```
Created **server-side** at the moment upload starts. The frontend must receive `batch_id` in the upload response and never mint its own.

#### `SourceFile` — one row per physical file, the heart of the model
```
file_id                  uuid
batch_id, plant_code_id, connector
original_filename        string
stored_path              string          # server-side location
content_type             string
size_bytes               int
checksum                 sha256          # for dedupe / idempotency
uploaded_at, uploaded_by

# classification
category                 e.g. 'pnid' | 'pfd' | 'linelist' | 'other'   (P&ID)
                         e.g. 'equipment_datasheets' | 'sop' | …      (Documents)
                         e.g. 'metadata' | 'values'                   (Time Series)
                         e.g. table name                              (SAP)
subtype / document_type  string | null
detected_type            string | null   # what the backend classified it as
user_confirmed_type      bool

# lifecycle — this is what "processed vs unprocessed" means
processing_status        'pending' | 'queued' | 'processing' | 'processed'
                         | 'failed' | 'skipped' | 'superseded'
processed_at             timestamp | null
processed_by_run_id      uuid | null
failure_reason           string | null
retry_count              int

# format-specific metadata (see §7.3)
page_count               int | null      # PDFs
sheet_names              string[] | null # Excel
row_count                int | null      # tabular
extracted_row_count      int | null
```

#### `ProcessingRun` — one execution of a pipeline for a connector
```
run_id                   uuid
plant_code_id, connector
batch_ids                uuid[]          # which batches this run covers
trigger                  'user' | 'retry' | 'scheduled' | 'incremental'
triggered_by, started_at, finished_at
status                   'queued' | 'running' | 'succeeded' | 'partial'
                         | 'failed' | 'cancelled'
config_snapshot          json            # §7.1 — exactly what the user chose
progress_percent         int 0..100      # REAL, monotonic, server-computed
current_stage            string
stages                   Stage[]
error                    ErrorObject | null
```

#### `Stage` — one step inside a run, with its own real progress
```
stage_key                e.g. 'validate' | 'preprocess' | 'ocr' | 'extract'
                         | 'compare' | 'load' | 'index'
label                    human string shown in UI
status                   'pending' | 'running' | 'succeeded' | 'failed'
                         | 'skipped' | 'cancelled'
weight                   int             # contribution to run progress_percent
progress_percent         int 0..100
items_total, items_done  int             # e.g. files, pages, rows
current_item             string | null   # "Chilled Water P&ID.pdf — page 3/12"
started_at, finished_at
message                  string | null
error                    ErrorObject | null
```

#### `RunEvent` — append-only log line
```
event_id, run_id, stage_key, ts, level ('info'|'warn'|'error'), message,
data json
```
This replaces the frontend's hand-built `logs: [...]` array on each source card.

#### `Artifact` — every file the pipeline *produces*
```
artifact_id, run_id, plant_code_id, connector
kind        'ocr_excel' | 'extraction_excel' | 'page_image' | 'cleaned_csv'
            | 'template_match_report' | 'markdown' | …
path, size_bytes, created_at
source_file_id  uuid | null   # which input produced it
download_url    string        # signed / proxied
```

#### `ContextStaging` + `ContextCommit`
Staged rows awaiting human review (already partly exists as `get-context`), plus an immutable record of each commit:
```
commit_id, plant_code_id, connector, run_id, batch_ids
committed_by, committed_at
tables       [{ table, rows_written }]
total_rows_written
row_snapshot_ref   # what was committed, for audit/rollback
```

### 4.2 What the frontend keeps

Only ephemeral UI state: which accordion is open, which row is being edited, which tab is active, the crop rectangle *while the user is still dragging it*. Everything else is fetched.

---

## 5. Universal lifecycle state machine

Every connector must follow the same states, so the UI can be one component. Connector-specific work happens *inside* `PROCESSING`, not as extra top-level states.

```
                ┌──────────────┐
                │ NOT_CONFIGURED│
                └──────┬───────┘
                       │ upload / cloud connect
                       ▼
                ┌──────────────┐   more files added
                │  UPLOADING   │◄────────────────────┐
                └──────┬───────┘                     │
                       │ all bytes received          │
                       ▼                             │
                ┌──────────────┐                     │
                │   UPLOADED   │─────────────────────┘
                │ (unprocessed)│
                └──────┬───────┘
                       │ user triggers process (with config)
                       ▼
                ┌──────────────┐  cancel   ┌───────────┐
                │  PROCESSING  │──────────►│ CANCELLED │
                └──────┬───────┘           └───────────┘
              ok/partial│      │ fail
                       ▼      ▼
        ┌──────────────┐   ┌────────┐  retry
        │   PROCESSED  │   │ FAILED │─────────► PROCESSING
        └──────┬───────┘   └────────┘
               │ user reviews staged rows
               ▼
        ┌──────────────┐
        │  IN_REVIEW   │
        └──────┬───────┘
               │ user approves (validate)
               ▼
        ┌──────────────┐
        │  VALIDATED   │
        └──────┬───────┘
               │ commit
               ▼
        ┌──────────────┐   new files uploaded
        │  COMMITTED   │──────────────────────► UPLOADED (has_unprocessed_files = true)
        └──────────────┘
```

**Rules the backend must enforce (not the frontend):**

1. **Only one active run per (plant, connector).** A second trigger returns `409 Conflict` with the in-flight `run_id`. Today the frontend "prevents" this with an `isCommitting` boolean — which is per-tab and therefore not a guard at all.
2. **A `COMMITTED` connector that receives new files goes back to having `has_unprocessed_files = true`** without losing the committed record. This is the "Add files to an already-processed source" case the UI already tries to model client-side.
3. **State transitions are server-side facts.** The frontend never `POST`s "mark as processed".
4. **Every transition is recorded** (who, when, from what, to what) and readable as history.
5. **Terminal-but-partial is a first-class outcome.** `PROCESSED` with 8 of 10 files successful must be representable — the current UI can only show all-or-nothing.

---

## 6. Progress contract — the 0 → 100 we actually want

This is the single most requested item. **Requirement: no percentage displayed anywhere in this module may be generated by the frontend.**

### 6.1 Computation

- Each `Stage` declares a `weight`. Run progress = `Σ(weight_i × stage_progress_i) / Σ(weight_i)`.
- Stage progress comes from **countable work**: files done / files total, pages done / pages total, rows loaded / rows total. Where nothing is countable, the stage reports a **coarse phase** and the UI renders an indeterminate bar — an honest indeterminate bar is better than a fake determinate one.
- Progress is **monotonic**. It never decreases within a run.
- Progress **survives restarts**. It is persisted, not held in worker memory.
- `100` is reported **only** when the run reaches a terminal state.

### 6.2 Transport — required

**Primary: Server-Sent Events.**
`GET /runs/{run_id}/events` (SSE) streaming `stage`, `progress`, `log`, `done` frames.
Rationale: OCR and LLM extraction routinely run for minutes; polling every 2.5 s (today's `POLL_INTERVAL`) across four connectors is both laggy and wasteful.

**Mandatory fallback: polling.**
`GET /runs/{run_id}` returns the full run object. The frontend degrades to a 2–3 s poll if SSE is unavailable (proxy, corporate network). **Both must be implemented** — SSE alone is not acceptable given our gateway topology.

**Reconnect semantics:** SSE must support `Last-Event-ID` so a reconnect after a network blip replays missed events rather than dropping them.

### 6.3 Discovery — the F5 fix

```
GET /connectors/{connector}/state?plant_code_id=…
GET /runs?plant_code_id=…&connector=…&status=running
```
On mount, the frontend asks "is anything running for this plant?" and reattaches. It must **never** need a job ID from `localStorage` to find its own work.

### 6.4 The complete run response — progress **plus** files, taxonomy, and metadata

A progress-only payload is not enough. The screen has to render *which files are in this run, what type/subtype each one is, what state each one is in, and what the server knows about it*. All of that must come from **one** response.

#### 6.4.1 The taxonomy problem — and why one generic shape solves it

Each connector groups its files differently. Verified from the code:

| Connector | Levels | Level 1 | Level 2 | Source of truth |
|---|---|---|---|---|
| **P&ID** | 1 | `pnid` · `pfd` · `line_list` · `others` | — | `FileCategoryList.jsx:12-16`, `WorkspaceDashboard.jsx:20-24`, `pnid/page.jsx:16` |
| **Documents** | 2 | Type (4) | Subtype (15) | `admin.constants.js` → `DOC_TYPE_CATEGORIES` |
| **Time Series** | 1 | `metadata` · `values` | — (tags are a separate entity, §8.3.2) | `ConfigModalTimeseries.jsx:111` |
| **SAP** | 2 | Pipeline group (4) | Table (21) | `admin.constants.js` → `MANDATORY_SAP_TABLES` |

SAP being two-level was not obvious — its 21 tables are grouped into four pipelines:

| Pipeline group | Tables |
|---|---|
| `workorder` (13) | AUFK, AFKO, AFVC, AFVV, QMEL, QMSM, JEST, JSTO, RESB, COEP, EQUI, STXH, STXL |
| `floc` (2) | IFLOT, ILOA |
| `tasklist` (3) | PLKO, PLPO, MAPL |
| `material` (3) | MARA, MARC, MARD |

**Because Documents and SAP are both two-level and P&ID and Time Series are both one-level, a single generic `groups[]` array with an optional `parent_key` covers all four.** No connector-specific response shape is needed — which is what keeps the API at ~29 endpoints instead of 50+.

#### 6.4.2 ⚠️ Verified bug: P&ID buckets have two different names depending on direction

Checked three times, in three independent files:

| Bucket | Name when **uploading** (form field) | Name when **reading** (`uploads` key) |
|---|---|---|
| P&ID drawings | `pnid_files` | `pnid` |
| PFD | `pfd_files` | `pfd` |
| Line list | `linelist_files` | **`line_list`** |
| Other | `other_files` | **`others`** |

**Evidence — upload side:** `useWorkspaceUpload.js:16-21` (`FIELD_MAP`).
**Evidence — read side:** `FileCategoryList.jsx:15-16`, `WorkspaceDashboard.jsx:23-24`, `pnid/page.jsx:16` (`PDF_KEYS = ['pnid','pfd','line_list','others']`).
**Proof they collide:** `useWorkspaceUpload.js:29-32` holds local state under `linelist`/`other` but reads the server payload with `'line_list'`/`'others'` — the same hook translates between the two vocabularies.

> **Required:** pick **one** canonical set and use it in both directions. Recommendation: `pnid` · `pfd` · `line_list` · `others` (the read side already has three files agreeing on it, versus one on the upload side). Upload form fields become `files[]` + a `category` field rather than four differently-named file fields.

#### 6.4.3 The complete response

`GET /runs/{run_id}?include=files,groups`

```jsonc
{
  "success": true,
  "message": "Run in progress",
  "data": {
    // ── IDENTITY ──────────────────────────────────────────────────────────
    "run_id": "run_4d8a1c",
    "plant_code_id": "Plant_1",
    "connector": "pnid",
    "status": "running",
    "trigger": "user",
    "triggered_by": { "user_id": "usr_18", "name": "J. Smith", "email": "…" },
    "started_at": "2026-08-04T09:12:05Z",
    "finished_at": null,
    "batch_ids": ["bat_7f21"],

    // ── PROGRESS ──────────────────────────────────────────────────────────
    "progress": {
      "percent": 62,
      "is_determinate": true,
      "current_stage": "ocr",
      "current_item": "Chilled Water P&ID.pdf — page 8 of 12",
      "eta_seconds": 145
    },

    "counters": {
      "files_total": 4,  "files_done": 2, "files_failed": 0, "files_skipped": 1,
      "pages_total": 48, "pages_done": 27,
      "rows_extracted": 1204
    },

    // ── STAGES ────────────────────────────────────────────────────────────
    "stages": [
      { "stage_key": "validate", "label": "Validating files", "status": "succeeded",
        "weight": 5, "progress_percent": 100, "items_done": 4, "items_total": 4,
        "started_at": "2026-08-04T09:12:06Z", "finished_at": "2026-08-04T09:12:09Z",
        "message": "4 files valid", "error": null, "skip_reason": null,
        "per_file": [
          { "file_id": "fil_9f3c", "status": "succeeded", "progress_percent": 100,
            "items_done": 1, "items_total": 1, "error": null }
        ] },

      { "stage_key": "ocr", "label": "Reading drawings", "status": "running",
        "weight": 40, "progress_percent": 55, "items_done": 27, "items_total": 48,
        "started_at": "2026-08-04T09:12:40Z", "finished_at": null,
        "message": null, "error": null, "skip_reason": null,
        "per_file": [
          { "file_id": "fil_9f3c", "filename": "Chilled Water P&ID.pdf",
            "status": "running",   "progress_percent": 66, "items_done": 8,  "items_total": 12,
            "current_item": "page 8 of 12", "error": null },
          { "file_id": "fil_2b8e", "filename": "Unit 2 PFD.pdf",
            "status": "succeeded", "progress_percent": 100, "items_done": 15, "items_total": 15,
            "current_item": null, "error": null }
        ] },

      { "stage_key": "extract", "label": "AI extraction", "status": "skipped",
        "weight": 30, "progress_percent": 0, "items_done": 0, "items_total": null,
        "started_at": null, "finished_at": null, "message": null, "error": null,
        "skip_reason": { "code": "LINE_LIST_PRESENT",
                         "message": "Line list uploaded — extraction not required" },
        "per_file": [] },

      { "stage_key": "compare", "label": "Reconciling line list", "status": "pending",
        "weight": 10, "progress_percent": 0, "items_done": 0, "items_total": null,
        "started_at": null, "finished_at": null, "message": null, "error": null,
        "skip_reason": null, "per_file": [] }
    ],

    // ── TAXONOMY ROLL-UP ──────────────────────────────────────────────────
    // Generic 1-or-2 level tree. `parent_key` is null at level 1.
    // P&ID/TS use level 1 only; Documents and SAP use both levels.
    "groups": [
      { "group_kind": "category", "group_key": "pnid", "parent_key": null,
        "label": "P&ID Diagrams", "is_custom": false, "sort_order": 1,
        "counts": { "files_total": 2, "pending": 0, "processing": 1,
                    "processed": 1, "failed": 0, "skipped": 0, "superseded": 0 },
        "file_ids": ["fil_9f3c", "fil_7a11"] },

      { "group_kind": "category", "group_key": "pfd", "parent_key": null,
        "label": "PFD Diagrams", "is_custom": false, "sort_order": 2,
        "counts": { "files_total": 1, "pending": 0, "processing": 0,
                    "processed": 1, "failed": 0, "skipped": 0, "superseded": 0 },
        "file_ids": ["fil_2b8e"] },

      { "group_kind": "category", "group_key": "line_list", "parent_key": null,
        "label": "Line Lists", "is_custom": false, "sort_order": 3,
        "counts": { "files_total": 1, "pending": 0, "processing": 0,
                    "processed": 0, "failed": 0, "skipped": 1, "superseded": 0 },
        "file_ids": ["fil_5c04"] },

      { "group_kind": "category", "group_key": "others", "parent_key": null,
        "label": "Other Files", "is_custom": false, "sort_order": 4,
        "counts": { "files_total": 0, "pending": 0, "processing": 0,
                    "processed": 0, "failed": 0, "skipped": 0, "superseded": 0 },
        "file_ids": [] }
    ],

    // ── FILES — the full record for every file in this run ────────────────
    "files": [
      {
        "file_id": "fil_9f3c",
        "batch_id": "bat_7f21",
        "plant_code_id": "Plant_1",
        "connector": "pnid",

        // identity
        "original_filename": "Chilled Water P&ID.pdf",
        "display_name": "Chilled Water P&ID",
        "stored_path": "plants/Plant_1/pnid/bat_7f21/fil_9f3c.pdf",
        "content_type": "application/pdf",
        "extension": "pdf",
        "size_bytes": 18422031,
        "checksum": "sha256:4f9a2c…",
        "version": 1,
        "superseded_by": null,
        "duplicate_of": null,

        // where it came from
        "source_kind": "device",
        "cloud_provider": null,
        "cloud_object_key": null,
        "uploaded_at": "2026-08-04T09:12:03Z",
        "uploaded_by": { "user_id": "usr_18", "name": "J. Smith" },

        // TAXONOMY — which bucket / type / subtype this file belongs to
        "taxonomy": {
          "group_kind": "category",
          "group_key": "pnid",              // P&ID: pnid|pfd|line_list|others
          "group_label": "P&ID Diagrams",
          "parent_key": null,               // Documents → type_key; SAP → pipeline group
          "parent_label": null
        },
        "detected_type": { "value": "pnid", "confidence": 0.94,
                           "source": "content_heuristic" },
        "user_confirmed_type": false,

        // LIFECYCLE
        "processing_status": "processing",
        "processed_at": null,
        "processed_by_run_id": "run_4d8a1c",
        "last_successful_run_id": null,
        "failure_reason": null,
        "retry_count": 0,

        // SERVER-EXTRACTED METADATA (removes browser-side pdfjs/xlsx parsing)
        "metadata": {
          "kind": "pdf",
          "page_count": 12,
          "has_text_layer": true,
          "producer": "AutoCAD 2024",
          "created_at": "2026-05-11T00:00:00Z",
          "pages": [
            { "page_number": 1, "width_px": 3370, "height_px": 2384, "dpi": 300,
              "rotation": 0, "has_text": true,
              "processing_status": "processed",
              "thumbnail_url": "/api/…/files/fil_9f3c/pages/1/thumbnail",
              "preview_url":   "/api/…/files/fil_9f3c/pages/1/preview" },
            { "page_number": 8, "width_px": 3370, "height_px": 2384, "dpi": 300,
              "rotation": 0, "has_text": true,
              "processing_status": "processing",
              "thumbnail_url": "/api/…/files/fil_9f3c/pages/8/thumbnail",
              "preview_url":   "/api/…/files/fil_9f3c/pages/8/preview" }
          ]
        },

        "validation": {
          "valid": true,
          "errors": [],
          "warnings": [ { "code": "LOW_DPI_PAGES", "message": "3 pages below 200 DPI",
                          "field": null, "row": null, "details": { "pages": [4, 7, 9] } } ]
        },

        // WHAT THIS FILE PRODUCED
        "artifacts": [
          { "artifact_id": "art_11", "kind": "ocr_excel", "filename": "ocr_result.xlsx",
            "size_bytes": 204811, "created_at": "2026-08-04T09:15:00Z",
            "download_url": "/api/…/artifacts/art_11/download" }
        ],
        "row_counts": { "extracted": 612, "committed": 0 },

        "links": {
          "self":      "/api/…/files/fil_9f3c",
          "download":  "/api/…/files/fil_9f3c/download",
          "thumbnail": "/api/…/files/fil_9f3c/pages/1/thumbnail",
          "pages":     "/api/…/files/fil_9f3c/pages"
        }
      },

      {
        "file_id": "fil_5c04",
        "batch_id": "bat_7f21",
        "original_filename": "Line List Rev C.xlsx",
        "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "extension": "xlsx",
        "size_bytes": 884213,
        "checksum": "sha256:bb17e0…",
        "source_kind": "device",
        "taxonomy": { "group_kind": "category", "group_key": "line_list",
                      "group_label": "Line Lists", "parent_key": null, "parent_label": null },
        "processing_status": "skipped",
        "failure_reason": null,
        "metadata": {
          "kind": "spreadsheet",
          "sheets": [
            { "name": "Line List", "row_count": 4821, "header_row": 1,
              "columns": [
                { "index": 0, "header": "Line No",  "detected_type": "string",
                  "null_count": 0,  "sample_values": ["101-A", "101-B"] },
                { "index": 1, "header": "Service",  "detected_type": "string",
                  "null_count": 12, "sample_values": ["Chilled Water"] }
              ] }
          ]
        },
        "validation": { "valid": true, "errors": [], "warnings": [] },
        "artifacts": [],
        "row_counts": { "extracted": 0, "committed": 0 },
        "links": { "self": "…", "download": "…", "thumbnail": null, "pages": null }
      }
    ],

    // ── CONFIG USED ───────────────────────────────────────────────────────
    "config_snapshot": {
      "processing_mode": "llm",
      "model": { "provider": "claude", "model_id": "claude-opus-5", "label": "Claude Opus 5" },
      "usable_area": { "x1": 120, "y1": 80, "x2": 2400, "y2": 1600,
                       "space": "image_px", "reference_dpi": 300 },
      "selected_file_ids": ["fil_9f3c", "fil_2b8e"],
      "has_line_list": true
    },

    "usage": { "llm_tokens_in": 184021, "llm_tokens_out": 20114, "cost_usd": 1.84 },
    "error": null,
    "warnings": [],
    "links": { "self": "…", "events": "…", "logs": "…", "cancel": "…", "retry": "…" }
  }
}
```

#### 6.4.4 The same shape for the other three connectors

**Only `groups[]` and each file's `taxonomy` change. Nothing else does.**

**Documents** — two levels, `parent_key` populated:

```jsonc
"groups": [
  { "group_kind": "type",    "group_key": "design_documents", "parent_key": null,
    "label": "Design Documents", "is_custom": false, "sort_order": 1,
    "counts": { "files_total": 12, "pending": 2, "processing": 0, "processed": 10,
                "failed": 0, "skipped": 0, "superseded": 0 },
    "file_ids": [] },
  { "group_kind": "subtype", "group_key": "equipment_datasheets",
    "parent_key": "design_documents",
    "label": "Equipment Datasheets", "is_custom": false, "sort_order": 1,
    "counts": { "files_total": 8, "pending": 1, "processing": 0, "processed": 7,
                "failed": 0, "skipped": 0, "superseded": 0 },
    "file_ids": ["fil_a1", "fil_a2"],
    "selected_field_keys": ["equipment_tag", "manufacturer", "design_pressure"] },
  { "group_kind": "subtype", "group_key": "cause_effect_matrix",
    "parent_key": "design_documents", "label": "Cause & Effect Matrix", "…": "…" }
],

// a Documents file's taxonomy block:
"taxonomy": {
  "group_kind": "subtype",  "group_key": "equipment_datasheets",
  "group_label": "Equipment Datasheets",
  "parent_key": "design_documents", "parent_label": "Design Documents"
},
"field_set": {                       // resolved for THIS file — see §8.2.4
  "inherited_from_subtype": ["equipment_tag", "manufacturer", "design_pressure"],
  "file_overrides": [ { "field_key": "impeller_dia", "label": "Impeller Diameter" } ],
  "effective": ["equipment_tag", "manufacturer", "design_pressure", "impeller_dia"]
}
```

**Time Series** — one level by role, plus a tag roll-up that files alone cannot express:

```jsonc
"groups": [
  { "group_kind": "file_role", "group_key": "metadata", "parent_key": null,
    "label": "Metadata Upload",
    "counts": { "files_total": 3, "pending": 0, "processing": 0, "processed": 3,
                "failed": 0, "skipped": 0, "superseded": 0 },
    "file_ids": ["fil_m1", "fil_m2", "fil_m3"] },
  { "group_kind": "file_role", "group_key": "values", "parent_key": null,
    "label": "Values Upload",
    "counts": { "files_total": 20, "pending": 4, "processing": 1, "processed": 15,
                "failed": 0, "skipped": 0, "superseded": 0 },
    "file_ids": ["fil_v1", "…"] }
],

"tags_summary": {                    // §8.3.2 — tags are NOT derivable from files
  "total": 10432, "recognised": 10011, "unrecognised": 289,
  "duplicate": 112, "no_values": 20
},

// a Time Series file's extra fields:
"taxonomy": { "group_kind": "file_role", "group_key": "values",
              "group_label": "Values Upload", "parent_key": null, "parent_label": null },
"file_role": "values",
"tag_count": 4210,
"row_count": 18400221,
"time_range": { "start": "2026-01-01T00:00:00Z", "end": "2026-08-01T00:00:00Z" }
```

**SAP** — two levels, pipeline group → table:

```jsonc
"groups": [
  { "group_kind": "pipeline_group", "group_key": "workorder", "parent_key": null,
    "label": "Work Order", "sort_order": 1,
    "counts": { "files_total": 13, "pending": 1, "processing": 0, "processed": 12,
                "failed": 0, "skipped": 0, "superseded": 0 },
    "file_ids": [] },
  { "group_kind": "table", "group_key": "AUFK", "parent_key": "workorder",
    "label": "Order Master Data", "sort_order": 1,
    "counts": { "files_total": 1, "pending": 0, "processing": 0, "processed": 1,
                "failed": 0, "skipped": 0, "superseded": 0 },
    "file_ids": ["fil_s1"],
    "column_mappings": { "AUFNR": "work_order_number", "AUART": "order_type" } }
],

"taxonomy": { "group_kind": "table", "group_key": "AUFK",
              "group_label": "Order Master Data",
              "parent_key": "workorder", "parent_label": "Work Order" }
```

#### 6.4.5 Why it is built this way

| Design choice | Reason |
|---|---|
| `groups[]` is generic with `parent_key` | One response shape covers 1-level (P&ID, TS) and 2-level (Documents, SAP) taxonomies. No `if connector === …` in the frontend. |
| `taxonomy` lives **on each file** *and* `groups[]` carries `file_ids` | The UI needs both directions: "what type is this file?" and "which files are in this subtype?" — without either a second request or a client-side `.filter()` over 50,000 files. |
| Every group carries the **same 7 counts** | The source card, the type header, and the subtype tab all render from the same object. Counts are never computed client-side. |
| `files[]` is paginated and `include=`-gated | A run over 50,000 files must not return them all inline. Default `include=groups` (cheap roll-up); `include=files` opts in. |
| `metadata.pages[]` carries per-page `processing_status` | Page-level progress and page-deletion (§8.1 step 4) both need it. |
| `artifacts` and `row_counts` are per file | Answers "what did *this* drawing produce?" — impossible today. |
| `is_custom` on groups | User-added types/subtypes (§8.2.4) must be distinguishable from catalog ones. |
| `sort_order` on groups | Display order is a backend decision, not a hardcoded frontend array. |

#### 6.4.6 Query parameters

```
GET /runs/{run_id}
    ?include=groups,files,stages     default: groups,stages  (files excluded — can be huge)
    &files_group_key=equipment_datasheets    filter files to one group
    &files_status=failed                     filter by processing_status
    &page=1&page_size=100                    paginate files[]
```

When `files` is included, `data.files_pagination` accompanies it using the standard `Pagination` object (Appendix B.1).

---

## 7. Cross-cutting requirements (all four connectors)

### 7.1 Configuration must be persisted server-side
Every choice the user makes before pressing *Process* is currently held in React state and lost on refresh. The backend must store it in `ProcessingRun.config_snapshot` and return it on read:

- **P&ID:** processing mode (`llm` / non-LLM), selected model, **usable-area crop box**, per-file selection (which P&IDs, which PFDs), line-list presence.
- **Documents:** document type, per-file extraction field list (including user-added custom fields), category/subtype.
- **Time Series:** retention setting, metadata/values file roles.
- **SAP:** selected tables, per-table column rename mappings.

Two hard requirements:
1. **Re-running a source must reuse the last config as the default**, fetched from the backend — the user should not re-draw a crop box after a refresh.
2. The config that produced a committed result must be **immutable and auditable** — "this context was extracted with `claude`, crop box `[120,80,2400,1600]`, on 4 Aug".

### 7.2 Processed vs unprocessed — server-side, file-level

Currently inferred by comparing a browser-generated timestamp string to a `localStorage` value. Required instead:

- Every `SourceFile` carries `processing_status` and `processed_by_run_id`.
- `GET /connectors/{connector}/files?plant_code_id=…&status=pending|processed|failed|all` returns the split directly.
- "Process unprocessed only" is a **backend capability**, not a frontend filter: `POST /runs { scope: 'unprocessed' }` selects the pending set server-side and returns which files it picked.
- Re-uploading a file with the same checksum is **detected server-side**; the response tells the frontend `duplicate_of: <file_id>` so the existing duplicate dialog can be driven by real data instead of a name-string comparison against `getExistingPnid`.
- Deleting a file that has already been processed and committed must be either blocked or explicitly marked `superseded` — the backend decides, and says so in the response.

**Cloud sources specifically** (the case called out for Documents, and it applies to all four):
- The backend enumerates the bucket/prefix and records **one `SourceFile` per discovered object**, not one row per "connection".
- A cloud connector must support **incremental re-sync**: re-scanning the prefix, diffing against known objects by `etag`/`checksum`/`last_modified`, and creating only the new/changed ones as `pending`.
- The UI must be able to show, for a cloud source: *N discovered, M processed, K pending, J failed* — all from the backend.
- Cloud credentials must be stored server-side as a named, reusable **connection**, not re-posted from the browser on each sync.

### 7.3 File metadata and validation — server-side
The frontend currently parses PDFs and XLSX **in the browser** (`pdfjs`, `getFileArrayBuffer` → client-side xlsx parsing) to learn page counts and sheet names. Required from the backend at upload time:

| Type | Must return |
|---|---|
| PDF | page count, per-page dimensions, whether text layer exists (drives OCR-vs-text-extract decision), page thumbnail URLs |
| Excel/CSV | sheet names, per-sheet header row, row count, detected column types |
| Images | dimensions, DPI |
| All | `content_type`, `size_bytes`, `checksum`, virus/corruption verdict |

**Validation must fail server-side, before a run starts**, with a structured, per-file reason: wrong format, unsupported version, empty, corrupt, over size limit, missing required companion file (e.g. Time Series values uploaded without metadata). The UI renders the reasons; it does not invent the rules.

### 7.4 Error contract
One shape everywhere:
```jsonc
{
  "code": "OCR_ENGINE_TIMEOUT",         // stable, machine-readable
  "message": "OCR timed out on page 8", // human, shown to the user
  "stage": "ocr",
  "file_id": "…",                       // null if not file-specific
  "retryable": true,
  "retry_after_seconds": 30,            // optional
  "details": { }                        // free-form, for support
}
```
The frontend currently swallows most errors (`catch { /* ignore */ }` appears throughout `usePipelineOrchestration.js`) precisely because there is nothing structured to show. With this contract we stop swallowing.

### 7.5 Idempotency, concurrency, cancel, retry
- Every mutating request accepts an **`Idempotency-Key`**; a replay returns the original result rather than starting a second run. (Today a double-click can genuinely fire two commits.)
- **Server-side lock** per (plant, connector) while a run is active; `409` with the active `run_id` on conflict.
- **`POST /runs/{run_id}/cancel`** — real cancellation, releasing the lock and leaving partial artifacts clearly marked.
- **`POST /runs/{run_id}/retry`** with `scope: 'failed_only' | 'all'` — resumes from the failed stage/files rather than from zero.

### 7.6 Audit, history, RBAC
- `GET /connectors/{connector}/history?plant_code_id=…` — every run and commit, with actor, timestamps, config, counts, outcome. This is what makes the module defensible to an auditor and is what the current `localStorage` model can never provide.
- Authorization is enforced **per action** (upload / process / commit / delete / reset), server-side, against the caller's role. The frontend hides buttons; the backend refuses calls.
- **Reset pipeline** (`resetAllPipelines` today just clears `localStorage`) must be a real, audited, permissioned backend operation with an explicit blast-radius contract: which tables, which files, which commits.

### 7.7 User Settings (Appearance / Interface) must persist per user, server-side

This is not part of Domain Configuration, but it is the same class of problem — **user-owned state trapped in one browser** — so it is specified here rather than in a separate document.

**Current state (verified in code):**

| Setting group | Where it lives today |
|---|---|
| Theme mode, light variant, dark variant | `localStorage` keys `theme`, `theme-light-variant`, `theme-dark-variant` (`src/context/visuals/ThemeContext.jsx:47`) |
| Accent colour, font family, font scale, line height, letter spacing, tabular numbers, layout density, motion/animation speed, dropdown animation, geometry/radius, blur, profile display, toast duration, toast animation | a single `localStorage` key `do-customization-v1` (`src/context/visuals/CustomizationContext.jsx:290-309`) |

Nothing is sent to a backend. A user who logs in from a different machine, a different browser, or after clearing site data gets factory defaults with no warning.

**Requirements:**

1. **Per-user preference store**, keyed by the authenticated user identity — not by plant, not by device.
   ```
   GET   /users/me/preferences   → { preferences, org_defaults, updated_at, version }
   PUT   /users/me/preferences   → full replace
   PATCH /users/me/preferences   → partial update (what the UI actually sends)
   ```
2. **Free-form but versioned payload.** The frontend adds new appearance controls regularly; the backend must store the preferences object without needing a schema migration per new control, while carrying a `schema_version` so future migrations are possible.
3. **Organisation-level defaults.** An admin must be able to set org-wide defaults (branding, accent, corporate font). A user's own value overrides it; if the user has never set one, the org default applies. The `GET` returns both so the UI can show "using organisation default" versus "customised".
4. **Conflict rule, stated explicitly:** on login, the **server value wins** and overwrites the local cache. `localStorage` remains only as a synchronous first-paint cache — the app sets CSS variables from it in an inline script before hydration, so it cannot be removed, but it must never be the source of truth.
5. **Debounced writes.** The UI will `PATCH` at most once per ~500 ms while a user drags a slider. The endpoint must tolerate frequent small patches and be idempotent.
6. **No plant scoping.** These are user preferences and must survive a plant switch untouched — unlike everything else in this document, `plant_code_id` does **not** apply here.
7. **Reset endpoint** — `DELETE /users/me/preferences` restores org defaults.

Frontend-side work for this is specified in the companion document, [Frontend Improvement & Hardening Plan](./frontend-improvement-plan.md), Part E.

---

## 8. Per-connector requirements

### 8.1 P&ID — the deepest flow

Full step list, in order, with the ownership requirement for each.

| # | Step | User action | Backend must own |
|---|---|---|---|
| 1 | **Bucket upload** | Drops files into 4 buckets: P&ID drawings, PFD, Line List, Other | One `UploadBatch`; one `SourceFile` per file with `category`. Multi-file for P&ID/Other, single for PFD/Line List — **enforced server-side**, not only in `MULTI_BUCKETS` on the client. Reject unsupported types with per-file reasons. |
| 2 | **Ingest / session init** | Presses *Ingest* and watches the 4-step loader | A real `ProcessingRun` of kind `ingest` with real stages. The current 4 labels (*Connecting / Ingesting / Parsing / Finalizing*) must map to real server stages or be replaced by whatever the real stages are. **Critically: on failure it must fail** — today the loader completes successfully even when the upload throws. |
| 3 | **File management** | Views the file list, previews a PDF, opens pages as thumbnails | Server-rendered page thumbnails + page count. The browser must stop parsing PDFs to count pages. Per-file status badges come from `SourceFile.processing_status`. |
| 4 | **Page editing** | Deletes one or several pages from a PDF | Server-side page deletion producing a **new version** of the file (`version`, `superseded_by`), not an in-place mutation. Must return the updated page count and invalidate any artifacts derived from removed pages. Multi-page delete must be **transactional** — all-or-nothing. Page indices must be documented as 0- or 1-based **once** (today the client sends 0-indexed for one endpoint and passes the same list under two different query keys defensively). |
| 5 | **File deletion** | Removes an uploaded file | Cascade rules: what happens to derived artifacts, staged context rows, and a prior commit that used it. Backend answers; frontend displays. |
| 6 | **Process configuration** | Opens the Process modal, picks mode + model, **draws a usable-area rectangle on a page preview** | Persist `processing_mode`, `model/provider`, and `usable_area` as `[x1,y1,x2,y2]` **in the coordinate space the backend defines** (image pixels at a stated DPI, or normalized 0–1 — must be specified; today it is stringified JSON whose reference frame is undocumented). Persist per-run and return as the default next time. Also: the **list of selectable models must come from the backend**, not the frontend's `LLM_OPTIONS`/`PROVIDER_MAP` constant, with availability/health per provider. |
| 7 | **OCR** | Presses Start | Run with stage `ocr`; **real per-file and per-page progress**; `current_item`; per-file success/failure; `ocr_excel` artifact registered. |
| 8 | **AI Extract** | (automatic, LLM mode without line list) | Stage `extract`. The skip rule ("line list present ⇒ skip extraction") must be a **backend decision returned as `status: 'skipped'` with a reason**, not a frontend `if`. Token/cost usage per run should be recorded. |
| 9 | **Compare & Clean** | (automatic) | Stage `compare`. The backend must resolve its own inputs (OCR output, line-list file, document path) from the run — today the frontend reconstructs these filenames by hand and the code comments flag it as unverified guesswork. |
| 10 | **Template matching** | Draws/selects a symbol template, runs matching | Persisted template library per plant (already partly exists), match runs as first-class `ProcessingRun`s with progress, results as artifacts. |
| 11 | **Review / Validate** | Reviews equipment + connectivity rows, fixes connections, highlights on the drawing | Staged rows with stable IDs, server-side edit persistence (edits must survive refresh — today edited rows live in React state until commit), per-connection validation verdicts. |
| 12 | **Commit** | Presses Commit | Real progress for the commit itself; returns `commit_id`, per-table `rows_written`; **idempotent**; sets `committed_at` server-side. |
| 13 | **Ontology / KG populate** | (automatic after commit) | Its own run with progress. Currently fired as a fire-and-forget `populateOntology()` inside a `try { } catch { }` that ignores failures — the user is told everything succeeded regardless. |

**Additional P&ID requirements**
- Resolve the two-pipeline split (§3.1) — one status surface.
- `uploadToCdm` currently needs a `cdm_url` that has no per-plant source and falls back to an env var placeholder; the backend should resolve its own CDM destination per plant.
- Image/artifact endpoints must accept a **stable file identifier**, not a filename, so that names containing `&`, spaces, and other filesystem-unsafe characters stop breaking lookups (a documented live failure today).

### 8.2 Documents — Type → Subtype → Files, and the field system

#### 8.2.1 ⚠️ Naming must be settled before anything is built

There is a **real naming conflict in the current code**, and if the backend copies the code's names it will build the wrong model.

| Level | What the business calls it | What the **UI button** says | What the **code** calls it | Example |
|---|---|---|---|---|
| Outer | **Type** | `Add Type` (`ConfigModalDocuments.jsx:70`) | `category` / `docCustomCategories` | Design Documents |
| Inner | **Subtype** | `Add Subtype` (`:164`) | `types[]` / `docCategorySubtypes` | Equipment Datasheets |

The UI is already inconsistent with itself: the button reads **"Add Type"** but its input placeholder reads **"Category name…"** and it pushes into `docCustomCategories` (`ConfigModalDocuments.jsx:42, 46`).

> **Decision required: the backend contract uses `type` and `subtype`.** This matches the business language and the button labels. The frontend's internal `category` naming is the outlier and will be renamed to match. Do **not** name the API after `DOC_TYPE_CATEGORIES`.

#### 8.2.2 The real hierarchy today

Four types, fifteen subtypes — the complete current tree from `src/components/admin/admin.constants.js`:

| Type | Subtypes | Count |
|---|---|---|
| **Design Documents** | `equipment_datasheets`, `cause_effect_matrix` | 2 |
| **Operations Documents** | `sop`, `startup_shutdown`, `operating_manuals`, `log_sheets`, `batch_reports` | 5 |
| **Maintenance Documents** | `maintenance_manuals`, `rca_reports` | 2 |
| **Safety & Compliance Documents** | `hazop`, `jsa_jha`, `ptw`, `msds_sds`, `incident_reports`, `erp_plan` | 6 |

Operations Documents having five subtypes is the "multiple tabs the user clicks through to upload" — each subtype is its own upload target with its own field set.

**This entire tree currently lives in the frontend as a constant** and is used as a silent fallback whenever `GET /configRouter/documentTypes` returns nothing (`useDocsFormState.js:16`). It must become backend-owned, per plant and per industry.

#### 8.2.3 Structure the backend must model

```
Type  (Design Documents)                    ← user can ADD custom types
 └─ Subtype  (Equipment Datasheets)         ← user can ADD custom subtypes, per type
     ├─ default extraction fields[]         ← from the catalog, editable
     ├─ selected/global fields[]            ← what the user CHOSE for this subtype
     └─ Files[]                             ← many files per subtype
         └─ per-file field overrides[]      ← fields added for ONE file only
```

Three levels of field customisation exist in the UI **today**, and all three must round-trip:

| Level | UI state today | Persisted? |
|---|---|---|
| Catalog defaults for a subtype | `selectedDocDef.fields` from the API | ✅ read-only from backend |
| User's edits to that subtype's field list | `editableFields` (`useDocSourceModal.js:24`) | ❌ React state, lost on refresh |
| Fields added for **one specific file** | `docExtraFields[filename]` (`:59-64`) | ❌ React state, lost on refresh |

#### 8.2.4 The global/selected field problem — write-only today

When a user picks fields, the app **does** send them to the backend:

```js
// useDocSourceModal.js:95-101 (and duplicated in ConfigModal.jsx:83-88)
await updateUserConfig({
  document_processing: {
    document_types: {
      [docType]: { document_type: docLabel, source_columns: [...new Set(fieldsForSave.map(f => f.name))] }
    }
  }
}, plantCode);
```

**But nothing ever reads it back.** There is no `GET` for user config anywhere in the codebase. So the user's field selection is written to the server and then forgotten — next session the UI shows catalog defaults again.

**Requirement — this is exactly the "everything should come from the GET" ask:**

`GET /connectors/documents/catalog` must return, per subtype, **all three** layers resolved:

```jsonc
{
  "subtype_key": "equipment_datasheets",
  "label": "Equipment Datasheets",
  "fields": [
    { "field_key": "equipment_tag", "label": "Equipment Tag",
      "description": "Unique equipment identifier (e.g. P-101)",
      "origin": "catalog",        // catalog | user_added
      "selected": true,           // ← the user's saved choice, from user config
      "required": true }
  ],
  "selected_field_keys": ["equipment_tag", "manufacturer"],   // resolved global selection
  "file_overrides": {                                          // per-file additions
    "Pump Datasheet Rev C.pdf": [
      { "field_key": "impeller_dia", "label": "Impeller Diameter", "origin": "user_added" }
    ]
  }
}
```

Plus write endpoints so custom types, custom subtypes, custom fields, and per-file overrides survive a refresh:

```
POST   /connectors/documents/types                          { label }
POST   /connectors/documents/types/{type_key}/subtypes      { label }
PUT    /connectors/documents/subtypes/{subtype_key}/fields  { fields[], selected_field_keys[] }
PUT    /connectors/documents/files/{file_id}/fields         { fields[] }   ← per-file override
DELETE /connectors/documents/types/{type_key}               (blocked if files exist)
```

#### 8.2.5 Upload and processed/unprocessed accounting

- Upload is **per subtype** — one upload action targets exactly one subtype, and the batch records it. `document_type` is already sent (`useDocSourceModal.js:144`); `type_key` must be added alongside it.
- A subtype holds **many files**; a type holds many subtypes. Counts must be available at **all three levels** (type, subtype, file) so the UI can show "Operations Documents: 34 files, 30 processed, 4 pending" without counting client-side.
- File→subtype attribution currently lives in `sessionStorage` (`uploadedDocFileNames`, `useDocsFormState.js:41-53`). The `SourceFile.subtype_key` field replaces it.
- **Cloud documents** (§7.2): enumerate one `SourceFile` per discovered object, each attributed to a subtype, each with its own `processing_status`. A cloud source must never collapse into one opaque "connected" row, which is what happens today.

---

### 8.3 Time Series / Historian — 3 sources × 2 roles, many files, many tags

#### 8.3.1 The real UI structure

Confirmed from `ConfigModalTimeseries.jsx:97` and `:111`:

```
Time Series
├── Tab 1: "Local Files"     (internal key: 'device')
│    ├── Sub-tab: "Metadata Upload"   → tsMetadataFiles[]   ← MULTIPLE files
│    └── Sub-tab: "Values Upload"     → tsValuesFiles[]     ← MULTIPLE files
├── Tab 2: "Historian"       (internal key: 'source')   ← ⚠️ misleading key name
│    └── tsHistorianType (default "OSIsoft PI") + tsHistorianConfig
└── Tab 3: "Cloud Storage"   (internal key: 'cloud')
     └── tsCloudType (s3 | adls | gcs) + tsCloudConfig
```

> ⚠️ The Historian tab's internal key is `'source'`, not `'historian'` (`ConfigModalTimeseries.jsx:97`). Do **not** carry this into the API — use `historian`. Flagged so the rename happens on both sides at once.

**Both roles must be available from all three sources.** Today Metadata/Values sub-tabs exist only under Local Files; Historian and Cloud have no role split. The backend model must not bake that limitation in — `file_role` is a property of a file, independent of where it came from.

#### 8.3.2 Multiple files and multiple tags — the core requirement

- **Multiple files per role:** `<input multiple accept=".csv,.xlsx,.xls,.tsv">` (`:144`), and files **accumulate across drops** — `setTsMetadataFiles(prev => [...prev, ...files])` (`:127, :147`). A user can add 5 metadata files and 20 values files in one configuration.
- **Multiple tags per file:** one metadata file defines many tags; one values file carries readings for many tags. Neither the file count nor the tag count is 1:1 with anything.

**Therefore the backend must model a `Tag` as a first-class entity**, not as a row inside a file:

```
UploadBatch
 ├── SourceFile (file_role: "metadata")  ×N  →  defines Tags
 └── SourceFile (file_role: "values")    ×M  →  carries readings for Tags
                                                 │
                                                 └── Tag ×K  (the real unit of work)
```

Per-tag outcome must be reportable: `recognised` · `unrecognised` (values with no metadata) · `duplicate` (defined in two metadata files) · `no_values` (metadata with no readings) · `out_of_range_timestamps`.

**Progress must be tag-based or row-based, not file-based.** One 2 GB values file covering 10,000 tags is a single file — file-level progress would sit at 0 % then jump to 100 %.

#### 8.3.3 Two uploads, two jobs, one is lost — a real bug

`useConfigModalActions.js:213-249` uploads metadata and values as **two separate requests**, then:

```js
if (hasMetadata) { const data = await upload(...); jobId = data.job_id; }   // :229
if (hasValues)   { const data = await upload(...); jobId = data.job_id; }   // :248  ← overwrites
```

Only the **last** `job_id` is kept and polled. If the metadata upload fails or is still processing, nobody ever finds out.

**Requirement:** one `UploadBatch` covering both roles, returning **one** `batch_id` and **one** `run_id` that spans metadata + values. Per-file status lives inside it.

#### 8.3.4 Validation must move server-side — with evidence of why

Current client-side validation (`useTsFormState.js:23-55`):

| Role | Columns required | Real limitation |
|---|---|---|
| Metadata | tag name · description · ranges/limits | **XLSX/XLS are skipped entirely** (`:25` — "binary formats, cannot be validated as text"). Excel metadata files get **zero** validation today. |
| Values | timestamp · value | Same 8 KB limit |

Both read only `file.slice(0, 8192)` — **the first 8 KB**. Validation is partial by construction: a malformed row at line 50,000 is never caught.

There is also a silent data-loss path: `useTsFormState.js:65-66` discards the **entire** returned dataset if any column name starts with `"Unnamed"`, with no message to the user.

**Requirement:** the backend validates the whole file, for every format, and returns structured per-file results — `missing_columns[]`, `detected_columns[]`, `row_count`, `tag_count`, `time_range`, plus per-row rejections with row numbers. The UI renders reasons; it must not own the rules.

#### 8.3.5 Other Time Series requirements

- **Retention** — `{ value: "90", unit: "days" }` is pushed via `updateUserConfig` and, like the documents field selection, is **never read back**. It must be returned by a `GET` so the UI shows the real current value instead of the hardcoded default.
- **Historian connections** — stored connection config, a test endpoint, scheduled/incremental pull, and a **per-tag last-sync watermark**.
- **Data-quality analysis** — currently one blocking request over the whole dataset. It must become a job with progress and a persisted, timestamped result so the last analysis is viewable without re-running it.
- **Tag catalog** — `GET /connectors/timeseries/tags` with pagination and filtering. With 10,000–100,000 tags this cannot be a single unpaginated array (§D3).

### 8.4 SAP

| Requirement | Detail |
|---|---|
| **Table catalog is backend-owned** | Which SAP tables exist, their columns, key fields, and canonical mappings must come from the backend. The frontend currently holds `SAP_TABLE_COLUMNS` as a constant and uses it to build the rename payload. |
| **File → table detection** | Upload of table extracts must be classified server-side (`detected_type` = table name) with confidence; the user confirms. Today `sapDetectedTables` matching happens in the browser by filename. |
| **Column mapping persists** | `sapColumnMappings` (SAP field → canonical name, per table) is React state today and is pushed **fire-and-forget** at commit time (`updateColumnRenames(...).catch(() => {})`). It must be persisted per plant/table, readable, versioned, and applied deterministically at load. |
| **Per-table lifecycle** | Each selected table has its own upload → processed → validated → committed state and its own row counts. Today one commit sends the *same* row array under every selected table name — the backend must define and validate the correct per-table payload. |
| **Direct SAP connection** | For the "source"/direct-connect mode: stored connection, connection test, table discovery, incremental extraction with a watermark. |
| **Commit result** | Per-table `rows_written`, rejected rows with reasons, and a `commit_id`. |

---

## 9. Proposed API surface

### 9.0 How many APIs is this, actually? — read this first

The most common first question is *"do we build one API for Domain Configuration, or a separate API per connector per step?"*

**Neither. Build one generic set of endpoints, parameterized by connector.**

#### Why not one single mega-endpoint

A single `POST /domain-configuration` with an `action` field would:
- make every request body a union of four unrelated schemas — impossible to validate, impossible to document in Swagger;
- give every operation the same URL, so logs, metrics, rate limits, caching and RBAC cannot distinguish "upload a 2 GB PDF" from "read a status flag";
- force the frontend to invent its own routing on top, which is the exact class of problem this document exists to remove.

#### Why not one API per connector per step

P&ID alone has 13 steps (§8.1). Four connectors × ~13 steps ≈ **50+ bespoke endpoints** that are 80 % identical to each other. That means four copies of upload, four copies of job polling, four copies of commit — four places to fix every bug, and four different response shapes for the frontend to special-case. This is what today's code already suffers from.

#### The right answer: three tiers

**The four connectors do the same six things.** Only the *inside* of a processing run differs:

```
upload files ─► list files ─► start a run ─► watch progress ─► review rows ─► commit
     ▲              ▲              ▲              ▲               ▲            ▲
     └──────────────┴──── identical for pnid / documents / timeseries / sap ───┘
                                    (only the run's internal stages differ)
```

So the surface splits into three tiers:

| Tier | What it is | Endpoint count | Serves |
|---|---|---|---|
| **1 — Generic core** | Same endpoints for all four connectors; `{connector}` is a path parameter | **~16** | 100 % of the lifecycle for all four connectors |
| **2 — Catalogs & config** | Reference data that differs by connector (document type tree, SAP tables, model registry, last-used run config) | ~5 | Read-mostly, low churn |
| **3 — Connector-specific** | Only where the domain genuinely has no equivalent elsewhere | ~8 | P&ID page editing / crop preview / template matching / connection validation; TS data quality |
| | | **≈ 29 total** | vs 50+ if duplicated per connector |

**Tier 1 is where ~80 % of the value is.** Build those 16 first and all four connectors work end-to-end. Tiers 2 and 3 are additive and can follow.

#### This is not a new pattern — it is the pattern you already use

The existing, live code already proves connector-parameterized endpoints work against the real backend:

```js
// src/services/domain-configuration/common/connectorsService.js
uploadConnectorFile(connector, formData)   // → /api/domain-configuration/{connector}/upload
connectConnectorCloud(connector, body)     // → /api/domain-configuration/{connector}/connect/cloud
getConnectorJob(connector, jobId)          // → connector-agnostic job polling

// src/services/domain-configuration/common/pipelineService.js
runPipeline({ stage: 'sap' | 'docs' | 'ts' | 'pnid' | 'full' })   // ONE endpoint, every stage
```

`POST /pipeline/run` is **already** one endpoint that takes a `stage` and serves every connector. This proposal is simply that same idea applied to the whole lifecycle — state, files, runs, review, commit — instead of only to the trigger.

#### Rule of thumb for the backend team

> **Add a connector-specific endpoint only when the operation has no meaning for the other three connectors.**
>
> "Delete page 5 of a PDF" is genuinely P&ID-only → Tier 3.
> "Which files have been processed?" is meaningful for all four → Tier 1, `{connector}` as a parameter. Never four copies.

#### Build order

1. **Tier 1, runs + state first** (`POST /runs`, `GET /runs/{id}`, `GET /connectors/{c}/state`) — this alone kills the fake progress and the `localStorage` state.
2. **Tier 1, files** (`/uploads`, `/files`) — this delivers processed/unprocessed accounting.
3. **Tier 1, review + commit.**
4. **Tier 2 catalogs**, then **Tier 3** connector specifics.

---

### 9.1 Endpoint list

Uniform across connectors; `{connector} ∈ pnid | documents | timeseries | sap`. All requests carry `plant_code_id` (query for GET/DELETE, body for POST/PUT/PATCH — never a custom header), per our existing convention.

### Connector state & files
```
GET    /connectors/{connector}/state                      → ConnectorState
GET    /connectors/{connector}/files?status=&batch_id=     → SourceFile[]
GET    /connectors/{connector}/files/{file_id}             → SourceFile + metadata
DELETE /connectors/{connector}/files/{file_id}             → cascade report
GET    /connectors/{connector}/history                     → runs + commits
```

### Upload & cloud
```
POST   /connectors/{connector}/uploads                     → { batch_id, files[] }   (multipart)
GET    /connectors/{connector}/uploads/{batch_id}          → UploadBatch + files
POST   /connectors/{connector}/uploads/precheck            → duplicates, validation, per file
POST   /connectors/{connector}/connections                 → stored cloud/system connection
POST   /connectors/{connector}/connections/{id}/test       → reachability
POST   /connectors/{connector}/connections/{id}/sync       → incremental scan → run_id
```

### Catalogs & config
```
GET    /connectors/documents/catalog                       → categories → types → fields
POST   /connectors/documents/catalog/categories|types|fields
GET    /connectors/sap/tables                              → tables + columns
GET/PUT /connectors/sap/column-mappings
GET/PUT /connectors/{connector}/config                     → last-used run config (crop box, model, retention…)
GET    /processing/models                                  → available LLM providers + health
```

### Runs
```
POST   /runs                { connector, scope, config }   → { run_id }   (409 if locked)
GET    /runs/{run_id}                                      → ProcessingRun + stages
GET    /runs/{run_id}/events                               → SSE stream
GET    /runs/{run_id}/logs?since=                          → RunEvent[]
GET    /runs?connector=&status=                            → discovery (F5 recovery)
POST   /runs/{run_id}/cancel
POST   /runs/{run_id}/retry { scope: failed_only | all }
GET    /runs/{run_id}/artifacts                            → Artifact[]
```

### Review & commit
```
GET    /connectors/{connector}/context?run_id=&batch_id=   → staged rows (+ grouping)
PATCH  /connectors/{connector}/context/rows                → persist review edits
POST   /connectors/{connector}/context/validate            → validation verdicts
POST   /connectors/{connector}/context/commit              → { commit_id, tables[], total_rows_written }  (idempotent)
GET    /connectors/{connector}/commits                     → commit history
```

### P&ID-specific
```
GET    /pnid/files/{file_id}/pages                         → page list + thumbnails + text-layer flag
DELETE /pnid/files/{file_id}/pages                         → transactional multi-page delete → new version
POST   /pnid/files/{file_id}/preview                       → page image for crop-box drawing
GET/PUT /pnid/template-library
POST   /pnid/template-match                                → run_id
GET/PUT /pnid/connections/highlight-options
POST   /pnid/connections/validate
```

---

### 9.2 Response contracts — the real shape, step by step

**Nothing in this section is invented.** Every "today" block below is the **actual** response, taken from the captured live contracts in `api-data/*.json` and cross-checked against the service function that unwraps it and the component that renders it. Every "must add" line names the specific frontend workaround it removes.

Read each step as three parts:
1. **Returns today** — verbatim real shape, with its evidence.
2. **Frontend actually reads** — the exact fields consumed, with file:line.
3. **Must be added** — the gap, and which fake behaviour it kills.

---

#### 9.2.0 The envelope — already correct, keep it

```jsonc
{ "success": true, "message": "Operation completed successfully", "data": { /* payload */ } }
```

**Evidence:** `api-data/domain-configuration-documents.json` → `backend.responseEnvelope`, and six independent `unwrap()` implementations in `src/services/domain-configuration/**`.

**Two endpoints break it and must be normalised** (both already flagged in `pnidService.js`):

| Endpoint | Returns today | Required |
|---|---|---|
| `POST /clients/highlightOptions` | `{status, source, message}` — flat | Wrap in the envelope |
| `POST /validateConnection` | `{valid, source, message, from_tag, to_tag, page_no, from_bbox, to_bbox}` — flat | Wrap in the envelope |

---

#### STEP 1 — Upload files

##### 1a. Connector upload (Documents / TS / SAP / P&ID) — `POST /connectors/{connector}/upload`

**Returns today** — CONFIRMED LIVE (`api-data/domain-configuration-documents.json`):

```jsonc
{
  "success": true,
  "data": {
    "job_id": "string",
    "plant_code_id": "string",
    "document_type": "string",
    "files": [
      { "name": "string", "size": 0, "status": "string",
        "flow_uid": 0, "stage": "string", "content_hash": "string" }
    ]
  }
}
```

**Frontend actually reads:** only `data.job_id` — `useDocSourceModal.js:149`, `useConfigModalActions.js:67`. The entire `files[]` array, including `content_hash`, is **returned and thrown away**.

**Must be added:**

| Field | Why | Kills |
|---|---|---|
| `batch_id` | There is no batch identity in the upload response. The frontend gets `upload_batch_id` only later, from `runPipeline`, and stores it in `localStorage` | `admin_batch_ids_<plant>`, `admin_context_params_<plant>` |
| `files[].file_id` | `name` is the only handle. Files with `&` or spaces already break image lookup (documented live failure in `pnidService.clientImageUrl`) | filename-as-identity everywhere |
| `files[].processing_status` | `status`/`stage` exist but their enum is undocumented — the UI cannot branch on them | `admin_processed_sources::<plant>` |
| `files[].metadata` (page_count, sheets, has_text_layer) | Browser currently parses PDFs/XLSX itself to get this | `usePdfjs.js`, `getFileArrayBuffer` page counting, client-side `xlsx` parsing |
| `files[].validation` + `rejected[]` | No per-file rejection reason exists | silent failures |
| `duplicate_of` (via `content_hash`) | `content_hash` **is already returned** but no duplicate verdict is. The frontend instead calls `getExistingPnid` and compares **filename strings** (`useConfigModalActions.js:143-147`) | filename-based duplicate detection |

> `content_hash` already being present means server-side dedupe is largely a matter of **exposing a verdict**, not new computation.

##### 1b. P&ID Workspace upload — `POST /upload` (multipart)

**Returns today:** not captured in `api-data` — `uploadWorkspaceFiles` has no `responseSample`. The consumer (`useWorkspaceUpload.js:93`) **ignores the response entirely** and runs a `setInterval` with `Math.random()` instead, then **calls `onUploadSuccess()` even in the `catch` branch** (`:98-102`).

**Must return:** `{ batch_id, run_id, files[] }` with the same file shape as 1a — and the frontend must stop treating a thrown error as success.

---

#### STEP 2 — Poll the connector job — `GET /connectors/jobs/{jobId}`

**Returns today:** shape not captured. Consumers read exactly two fields:

```js
// useConfigModalActions.js:80-86, useDocSourceModal.js:163, useSourceLifecycle.js:165
jd.status   // compared against 'completed' | 'failed'
jd.error    // string, optional
```

**Must be added:** `progress_percent`, `stage`, `current_item`, `counts`. Without them the frontend invents the 60 → 100 span (`useConfigModalActions.js:68, 74, 84`).

---

#### STEP 3 — Run the pipeline — `POST /pipeline/run`

**Returns today** — CONFIRMED LIVE:

```jsonc
{ "success": true,
  "data": { "pipeline_job_id": "string", "upload_batch_id": "string",
            "stage": "string", "plant_code_id": "string", "industry": "string" } }
```

**Frontend reads:** `pipeline_job_id` and `upload_batch_id`, with legacy aliases still accepted (`usePipelineOrchestration.js:128-129`) — then **writes both into `localStorage`** because nothing else remembers them (`:139`).

**Must be added:** `stages_planned[]` (so the stepper renders before work starts), `selected_file_ids[]` / `skipped_file_ids[]` (so the user knows what will run), `config_snapshot`, `poll_url`, `events_url`.

---

#### STEP 4 — Poll the pipeline job — `GET /pipeline/jobs/{jobId}` 🔴 **the critical gap**

**Returns today** — CONFIRMED LIVE:

```jsonc
{ "success": true,
  "data": {
    "pipeline_job_id": "string",
    "stage": "string",
    "plant_code_id": "string",
    "upload_batch_id": "string",
    "status": "queued|running|completed|failed|cancelled",
    "output_tables": [],
    "record_counts": {},
    "total_records": 0
  } }
```

> **There is no progress field of any kind.** This single omission is the direct cause of the most visible fake behaviour in the product:
>
> ```js
> // usePipelineOrchestration.js:153 — because the backend has nothing to report
> progress: Math.min(prev[stage].progress + Math.random() * 8 + 4, 90)
> ```
>
> The status enum is good and the terminal handling is correct. **Only progress is missing.**

**Frontend reads:** `status`, `error`, and `upload_batch_id` on completion (`usePipelineOrchestration.js:151-165`).

**Must be added — this is the highest-value change in the entire document:**

```jsonc
"data": {
  "pipeline_job_id": "…", "stage": "docs", "status": "running",
  "plant_code_id": "Plant_1", "upload_batch_id": "…",

  "progress_percent": 62,          // ← server-computed, monotonic. Kills Math.random()
  "is_determinate": true,          // false → UI shows an honest indeterminate bar
  "current_stage": "ocr",
  "current_item": "Chilled Water P&ID.pdf — page 8 of 12",
  "eta_seconds": 145,              // omit the key entirely rather than guess

  "stages": [                      // full planned list, incl. still-pending ones
    { "stage_key": "validate", "label": "Validating files", "status": "completed",
      "weight": 5,  "progress_percent": 100, "items_done": 4,  "items_total": 4,
      "started_at": "…", "finished_at": "…", "message": "4 files valid", "error": null },
    { "stage_key": "ocr", "label": "Reading drawings", "status": "running",
      "weight": 40, "progress_percent": 55,  "items_done": 27, "items_total": 48,
      "started_at": "…", "finished_at": null, "message": null, "error": null },
    { "stage_key": "extract", "label": "AI extraction", "status": "skipped",
      "weight": 30, "progress_percent": 0,
      "skip_reason": { "code": "LINE_LIST_PRESENT",
                       "message": "Line list uploaded — extraction not required" } }
  ],

  "output_tables": [],             // already exists — keep
  "record_counts": {},             // already exists — keep
  "total_records": 0,              // already exists — keep

  "error": null                    // structured «error» object, not a bare string
}
```

`skip_reason` matters specifically: today the "line list present ⇒ skip extraction" rule is a **frontend `if`** (`usePipeline.js:99-102`) that also has to pattern-match on English error text (`:144`, `detail.toLowerCase().includes('line list')`). That decision belongs to the backend.

---

#### STEP 5 — P&ID OCR / Extract status — `GET /ocrStatus/{jobId}`, `GET /extractStatus/{jobId}`

This is the **one place the backend already streams real progress** — and it is the model the pipeline job should copy.

**Returns today** — derived from the consumer (`usePipeline.js:167-180`) and the renderers:

```jsonc
{ "success": true,
  "data": {
    "status": "queued|running|done|error",
    "progress": [ { "time": "ISO-8601", "msg": "string" } ],   // ← an append-only LOG, not a %
    "current_file": "string",
    "result": { /* see below */ },
    "error": "string"
  } }
```

**Evidence for `progress[]` element shape:** `ProcessLog.jsx:27-31` reads `e.time` and `e.msg` — nothing else.

**`result` on OCR done** — read by `OcrPanel.jsx:37-45`:

```jsonc
{ "processed_files": ["…"], "skipped_files": ["…"], "ocr_excel_path": "string" }
```

**`result` on Extract done** — read by `ExtractPanel.jsx:44-51`:

```jsonc
{ "message": "string", "provider": "string", "files_processed": 0,
  "extraction_result": "string", "output_files": ["…"], "skipped": false }
```

**`result` on Compare done** — read by `ComparePanel.jsx:45-51`:

```jsonc
{ "rows_before": 0, "rows_removed": 0, "rows_after": 0,
  "ocr_excel": "string", "linelist": "string" }
```

**Job-start responses** are nested one level deeper than the rest of the domain — `startOcr` / `startExtract` return `data.results.job_id`, not `data.job_id` (`usePipeline.js:115, 229`; `convertPdfPreview` likewise returns `data.results.images`). **This inconsistency should be flattened.**

**Must be added:** `progress_percent`, `items_done` / `items_total`, and a `level` (`info|warn|error`) on each log entry — `ProcessLog.jsx:10-15` currently infers severity by **string-matching the message** for "error"/"done"/"complete".

---

#### STEP 6 — List files — `GET /clients/checkExtractionFiles`

**Returns today** — CONFIRMED LIVE, verbatim from `api-data/domain-configuration-pnid-workspace.json`:

```jsonc
{ "success": true, "message": "Operation completed successfully",
  "data": [
    { "file_name": "Chilled Water P&ID.pdf",
      "pages": 1,
      "ocr_excel": "new123/preprocess_files/pnid/Chilled Water P&ID/ocr_result.xlsx",
      "extraction_file": "new123/extraction/pnid/Chilled Water P&ID/gemini/merged_extraction_142345.xlsx",
      "images_folde": "new123/preprocess_files/pnid/Chilled Water P&ID",
      "status": "extracted" } ] }
```

> ⚠️ **`images_folde` is a real typo in the live backend response** (missing `r`). It is captured as-is because the frontend depends on the misspelling. Fix it backend-side and coordinate the rename — do not silently correct it in one place only.

**This endpoint is the closest thing that exists to the required file model** — it already carries per-file status and derived artifact paths.

**Must be added:** `file_id`, `size_bytes`, `content_hash`, `uploaded_at`, `category`, `processed_at`, `processed_by_run_id`, `failure_reason`, and a `pending`/`failed` status value so unprocessed files are listable.

##### `GET /clients/files` — the other file listing

**Returns today:** `{ uploads: {...} | [...], preprocessed: [...] }`.

**Evidence:** `domainConfigUtils.js:24-34` handles `uploads` as **either** a keyed object (`pnid`/`pfd`/`line_list`/`others`) **or** a flat array **or** an array of bare path strings, and `useTemplateMatching.js:63` reads `data.preprocessed`.

> The frontend carries a three-way normaliser because the response shape is not stable. **Pick one shape and guarantee it.** Recommended: always the keyed-object form, always arrays of file objects, never bare strings.

---

#### STEP 7 — Review staged context — `GET /context/getDocsContext`

**Returns today** — CONFIRMED LIVE:

```jsonc
{ "success": true,
  "data": { "source": "docs", "plant_code_id": "string", "upload_batch_id": "string",
            "scope": "string",
            "rows": [ { "document_id": "string", "title": "string",
                        "document_type": "string", "category": "string",
                        "equipment_tag": "string", "extracted_entities": "string" } ] } }
```

Same envelope for `getPnidContext` (`equipment_pid` + `equipment_connectivity`), `getTsContext`, `getSapContext`.

**Note a real cost already paid:** the backend changed from a grouped `rows_by_category` shape to a flat `rows[]`, and rather than update the UI the team added a **client-side regrouping function** (`documentsService.js:28-35`). Decide the grouping ownership once and document it.

**Must be added:**

| Field | Why | Kills |
|---|---|---|
| `rows[].row_id` | Rows have `document_id` but P&ID/TS/SAP rows have no stable ID | 113 index-as-key sites |
| `columns[]` | Column definitions are hardcoded in the frontend (`SAP_TABLE_COLUMNS`) | frontend column constants |
| `rows[].status` + `issues[]` | No way to mark a row as needing review | — |
| `rows[].provenance` (file_id, page, bbox) | Cannot trace a row back to its source drawing | — |
| `pagination` | Full collection is returned; will not survive 50k rows | future scale failure |
| A **PATCH that is actually used** | `patchDocsRows` **exists** but has zero consumers — edits live in React state until commit (documented in `api-data`) | edits lost on refresh |

---

#### STEP 8 — Commit — `POST /context/commitDocsContext`

**Returns today** — CONFIRMED LIVE:

```jsonc
{ "success": true,
  "data": { "status": "committed",
            "tables": [ { "table": "document_metadata", "rows_written": 0 } ],
            "total_rows_written": 0 } }
```

**Frontend reads:** `total_rows_written` and `tables[].{table, rows_written}` (`usePipelineOrchestration.js:205-206`) — **this is the one step whose response is genuinely sufficient today.**

**Must be added:** `commit_id` (there is no commit identity), `committed_at` / `committed_by` (frontend writes `Date.now()` into `localStorage` instead — `useSourceLifecycle.js:73`), `rejected_rows[]`, and `downstream.ontology_run_id` — because `populateOntology()` is currently fired inside a `try { } catch { }` that ignores failure (`usePipelineOrchestration.js:287-288`), so the user is told it succeeded regardless.

---

#### STEP 9 — Commit history — `GET /context/getCommitHistory`

**Returns today** — CONFIRMED LIVE, and **already close to correct**:

```jsonc
{ "success": true,
  "data": { "commits": [
    { "commit_uid": 0, "source": "string", "plant_code_id": "string",
      "status": "string", "rows_written": 0,
      "tables": [ { "table": "string", "rows_written": 0 } ],
      "committed_by": "string", "committed_at": "string" } ] } }
```

**Consumers: zero.** The endpoint exists, is contract-correct, and no UI reads it — while the frontend simultaneously maintains `admin_committed_at::<plant>` in `localStorage` for the same information.

**Must be added:** `batch_ids` / `run_id` / `file_ids` (what was committed), and `config_snapshot` (how). Then delete the `localStorage` key.

---

#### STEP 10 — Document type catalog — `GET /configRouter/documentTypes`

**Returns today** — CONFIRMED LIVE:

```jsonc
{ "success": true,
  "data": { "version": "1.0",
            "categories": [ { "category": "string",
                              "types": [ { "key": "string", "label": "string",
                                           "fields": [ { "name": "string", "desc": "string" } ] } ] } ] } }
```

**This shape is correct and matches the UI's needs exactly.** The problem is behavioural, not structural: `useDocsFormState.js:16` **silently falls back** to the hardcoded `DOC_TYPE_CATEGORIES` constant whenever `categories` is empty or the call fails — so a backend outage looks identical to a working system showing different data, with no error surfaced.

**Must be added:** `category_key` / `type_key` (stable IDs — `category` is currently a display label doing double duty as a key), `is_custom`, `accepted_formats`, and **write endpoints**, since user-created categories/subtypes/fields are frontend-only state today (`docCustomCategories`, `docCategorySubtypes`, `docExtraFields`).

---

#### 9.2.11 Summary — real gap table

| Step | Endpoint | Response today | Verdict |
|---|---|---|---|
| Upload (connector) | `POST /connectors/{c}/upload` | `job_id` + `files[{name,size,status,flow_uid,stage,content_hash}]` | Add `batch_id`, `file_id`, metadata, validation, duplicate verdict |
| Upload (P&ID ws) | `POST /upload` | **uncaptured; response ignored** | Define it; stop treating errors as success |
| Connector job | `GET /connectors/jobs/{id}` | `status`, `error` only | **Add progress** |
| Pipeline run | `POST /pipeline/run` | `pipeline_job_id`, `upload_batch_id`, `stage`, `industry` | Add `stages_planned`, file selection, `poll_url` |
| **Pipeline job** | `GET /pipeline/jobs/{id}` | `status` + `record_counts`, **no progress at all** | 🔴 **Add `progress_percent` + `stages[]`** — highest value change |
| OCR/Extract status | `GET /ocrStatus/{id}` | `status`, `progress[]` log, `current_file`, `result` | ✅ Best existing model. Add `progress_percent`, `items_done/total`, log `level` |
| File list | `GET /clients/checkExtractionFiles` | `file_name`, `pages`, `ocr_excel`, `extraction_file`, `images_folde`, `status` | Closest to right. Add IDs/timestamps; fix `images_folde` typo |
| File list (alt) | `GET /clients/files` | `uploads` (3 possible shapes), `preprocessed` | **Stabilise to one shape** |
| Context | `GET /context/get*Context` | `rows[]` flat | Add `row_id`, `columns`, `status`, `provenance`, pagination |
| Commit | `POST /context/commit*Context` | `status`, `tables[]`, `total_rows_written` | ✅ Nearly sufficient. Add `commit_id`, `committed_at/by`, `downstream` |
| History | `GET /context/getCommitHistory` | full commit records | ✅ Correct — **just needs a UI consumer** |
| Doc catalog | `GET /configRouter/documentTypes` | `categories[].types[].fields[]` | ✅ Correct shape. Add stable keys + write endpoints |

### The three findings that matter most

1. **`GET /pipeline/jobs/{id}` has no progress field.** That one omission produces the `Math.random()` progress bar. Adding `progress_percent` + `stages[]` here fixes the single most visible problem in the product.
2. **The good model already exists in-house.** `getOcrStatus` returns a real streaming log, `current_file`, and a structured `result`. The P&ID workspace backend already does what the CDM pipeline backend does not — this is a consistency problem, not a research problem.
3. **Some required data is already returned and discarded.** `content_hash` (dedupe), `record_counts` / `total_records` (progress denominators), and the entire `getCommitHistory` endpoint are live today with no consumer — while the frontend reimplements all three in `localStorage`.

---

## 10. What changes on the frontend

Deliberately listed so the backend team knows exactly what we will delete and can size the contract accordingly.

**Deleted outright**
- All `localStorage` / `sessionStorage` pipeline keys: `admin_configured_sources::*`, `admin_processed_sources::*`, `admin_validated_sources::*`, `admin_committed_sources::*`, `admin_committed_at::*`, `admin_processed_at::*`, `admin_job_ids_*`, `admin_batch_ids_*`, `admin_context_params_*`, `admin_pnid_file_names::*`, `admin_pnid_files_by_batch::*`, `admin_domain_config`.
- `simulateContextProgress` and `startProgress` (`useAdminNavState.js`) — every fake timer.
- The `Math.random()` progress increment in `usePipelineOrchestration.js`.
- The simulated ingest interval in `useWorkspaceUpload.js`, including its "succeed even on failure" branch.
- `DOC_TYPE_CATEGORIES` and `SAP_TABLE_COLUMNS` fallback constants.
- Browser-side PDF page counting and XLSX parsing where server metadata replaces it.

**Rewritten**
- `useSourceLifecycle` → thin reader of `GET /connectors/{connector}/state`.
- `usePipelineOrchestration` → run trigger + SSE subscription + polling fallback.
- New `useRunStream(run_id)` hook: subscribes, exposes `{ status, progress, stages, logs, error }`, auto-reconnects, degrades to polling. Every connector shares it.
- Source cards, progress modal, and the P&ID pipeline stepper all render `Stage[]` from the backend — one component, four connectors.
- On mount: `GET /runs?status=running` and reattach (the F5 fix).

**Kept as-is**
- `services/` → `apiClient` → `/api/*` proxy → backend architecture. New endpoints slot into the existing pattern; no client ever calls a backend directly.

---

## 11. Delivery phases

| Phase | Backend deliverable | Frontend unblocked |
|---|---|---|
| **1 — Truth** | `ConnectorState`, `UploadBatch`, `SourceFile` persisted; `GET /connectors/{c}/state`, `/files`; upload returns `batch_id` + file rows | Delete all lifecycle `localStorage`; source cards read real state; the F5 test passes for *state* |
| **2 — Real progress** | `ProcessingRun` + `Stage` + `RunEvent`; `POST /runs`; `GET /runs/{id}`; polling contract; run discovery | Delete every fake timer; real progress bars; the F5 test passes for *running jobs* |
| **3 — Streaming & control** | SSE `/runs/{id}/events` with `Last-Event-ID`; cancel; retry with scope; idempotency keys; server-side lock | Live logs; cancel/retry buttons; double-submit protection is real |
| **4 — File-level accounting** | `processing_status` per file; processed/unprocessed queries; checksum dedupe; cloud enumeration + incremental sync | Real "Unprocessed files" section; real duplicate dialog; cloud sources show per-file status |
| **5 — Config & catalogs** | Persisted run config (crop box, model, fields, mappings, retention); backend-owned document & SAP catalogs; model registry | Delete frontend constants; settings reload after refresh |
| **6 — Audit & governance** | Commit records; history endpoint; per-action RBAC; audited reset | History view; correct permission behaviour |

Phases 1 and 2 together already fix the majority of the visible problem and are the recommended first milestone.

---

## 12. Open questions for the backend team

1. **P&ID unification** — do we merge the CDM P&ID connector and the P&ID Workspace backend, or does one become the system of record? Which one? *(Blocks §3.1, and everything downstream in §8.1.)*
2. **SSE feasibility** through the existing gateway(s) — if it cannot be supported, we need agreed polling cadence and payload budget instead.
3. **Crop-box coordinate space** — image pixels at what DPI, PDF points, or normalized 0–1? Must be stated once and used everywhere.
4. **PDF page indexing** — 0-based or 1-based, in every endpoint, documented once.
5. **Page deletion semantics** — new version vs in-place mutation, and what happens to artifacts derived from a deleted page.
6. **Partial success policy** — if 8 of 10 files process, can the user review and commit the 8, or must all 10 succeed first?
7. **Cloud connections** — where are credentials stored, and are connections shared across connectors or scoped per connector?
8. **Deletion after commit** — blocked, soft-deleted, or superseded? Same question for "Reset pipeline": what is its exact blast radius?
9. **Retention** — how long do uploaded source files, artifacts, and run history live?
10. **Concurrency policy** — one run per (plant, connector) is proposed. Is a global per-plant lock needed instead (e.g. because `stage: 'full'` touches everything)?
11. **Model registry** — who owns the list of available LLM providers, and do we need per-plant availability/cost limits?
12. **Row-count truth for progress** — for SAP and Time Series, can the backend know `items_total` before starting, or do we need indeterminate progress for the load stage?

---

## Appendix A — Terminology

| Term | Meaning |
|---|---|
| **Connector** | One of the four data sources: P&ID, Documents, Time Series, SAP |
| **Batch** | One upload or cloud-sync action; groups the files that arrived together |
| **Run** | One execution of a connector's processing pipeline over one or more batches |
| **Stage** | A named step inside a run (validate, preprocess, OCR, extract, compare, load…) |
| **Artifact** | A file the pipeline produces (OCR Excel, page image, cleaned CSV…) |
| **Staged context** | Extracted rows awaiting human review, before commit |
| **Commit** | Writing reviewed context into the CDM tables — the irreversible step |
| **Processed / unprocessed** | Per-file, server-side: has this specific file been consumed by a successful run? |


---

## Appendix B — JSON Schemas (draft 2020-12)

Machine-readable contracts for every endpoint. These can be dropped into FastAPI/Pydantic, used for request validation, or used to generate the frontend's TypeScript types.

**Shared definitions live in `B.1` and are referenced by every endpoint via `$ref`.** Define them once.

---

### B.1 Shared definitions — `common.schema.json`

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://decisionops/schemas/common.schema.json",
  "$defs": {

    "Envelope": {
      "type": "object",
      "required": ["success", "message", "data"],
      "properties": {
        "success": { "type": "boolean" },
        "message": { "type": "string" },
        "data":    { "description": "Endpoint-specific payload; null on error" },
        "error":   { "$ref": "#/$defs/Error" },
        "meta":    { "$ref": "#/$defs/Meta" }
      }
    },

    "Meta": {
      "type": "object",
      "required": ["request_id", "timestamp"],
      "properties": {
        "request_id":  { "type": "string" },
        "timestamp":   { "type": "string", "format": "date-time" },
        "duration_ms": { "type": "integer", "minimum": 0 }
      }
    },

    "Error": {
      "type": ["object", "null"],
      "required": ["code", "message", "retryable"],
      "properties": {
        "code":     { "type": "string", "pattern": "^[A-Z][A-Z0-9_]*$",
                      "description": "Stable machine-readable code. Never localised." },
        "message":  { "type": "string" },
        "stage":    { "type": ["string", "null"] },
        "file_id":  { "type": ["string", "null"] },
        "retryable": { "type": "boolean" },
        "retry_after_seconds": { "type": ["integer", "null"], "minimum": 0 },
        "details":  { "type": "object", "additionalProperties": true }
      }
    },

    "Actor": {
      "type": "object",
      "required": ["user_id", "name"],
      "properties": {
        "user_id": { "type": "string" },
        "name":    { "type": "string" },
        "email":   { "type": ["string", "null"], "format": "email" }
      }
    },

    "Pagination": {
      "type": "object",
      "required": ["page", "page_size", "total_items", "has_more"],
      "properties": {
        "page":        { "type": "integer", "minimum": 1 },
        "page_size":   { "type": "integer", "minimum": 1, "maximum": 1000 },
        "total_items": { "type": "integer", "minimum": 0 },
        "total_pages": { "type": "integer", "minimum": 0 },
        "next_cursor": { "type": ["string", "null"] },
        "has_more":    { "type": "boolean" }
      }
    },

    "Connector": { "enum": ["pnid", "documents", "timeseries", "sap"] },

    "ProcessingStatus": {
      "enum": ["pending", "queued", "processing", "processed", "failed", "skipped", "superseded"]
    },

    "StatusCounts": {
      "description": "The SAME 7 counts on every group and every connector state. Never computed client-side.",
      "type": "object",
      "required": ["files_total", "pending", "processing", "processed", "failed", "skipped", "superseded"],
      "properties": {
        "files_total": { "type": "integer", "minimum": 0 },
        "pending":     { "type": "integer", "minimum": 0 },
        "processing":  { "type": "integer", "minimum": 0 },
        "processed":   { "type": "integer", "minimum": 0 },
        "failed":      { "type": "integer", "minimum": 0 },
        "skipped":     { "type": "integer", "minimum": 0 },
        "superseded":  { "type": "integer", "minimum": 0 }
      }
    },

    "GroupKind": {
      "description": "Which taxonomy level this is. P&ID/TS use one level; Documents/SAP use two.",
      "enum": ["category", "type", "subtype", "file_role", "pipeline_group", "table"]
    },

    "Taxonomy": {
      "description": "Where a single file sits in its connector's tree. Present on EVERY SourceFile.",
      "type": "object",
      "required": ["group_kind", "group_key", "group_label"],
      "properties": {
        "group_kind":   { "$ref": "#/$defs/GroupKind" },
        "group_key": {
          "type": "string",
          "description": "P&ID: pnid|pfd|line_list|others (canonical READ vocabulary — see §6.4.2). Documents: subtype_key. Time Series: metadata|values. SAP: table name e.g. AUFK."
        },
        "group_label":  { "type": "string" },
        "parent_key":   { "type": ["string", "null"],
                          "description": "null for 1-level connectors. Documents: type_key. SAP: pipeline group." },
        "parent_label": { "type": ["string", "null"] }
      }
    },

    "Group": {
      "description": "One node of the taxonomy roll-up. Generic across all four connectors.",
      "type": "object",
      "required": ["group_kind", "group_key", "parent_key", "label", "counts", "file_ids"],
      "properties": {
        "group_kind": { "$ref": "#/$defs/GroupKind" },
        "group_key":  { "type": "string" },
        "parent_key": { "type": ["string", "null"] },
        "label":      { "type": "string" },
        "is_custom":  { "type": "boolean", "description": "User-added type/subtype vs catalog" },
        "sort_order": { "type": "integer", "description": "Display order is a BACKEND decision" },
        "counts":     { "$ref": "#/$defs/StatusCounts" },
        "file_ids":   { "type": "array", "items": { "type": "string" },
                        "description": "Empty on parent nodes; populated on leaf nodes." },

        "selected_field_keys": { "type": "array", "items": { "type": "string" },
                                 "description": "documents subtypes only" },
        "column_mappings": { "type": "object", "additionalProperties": { "type": "string" },
                             "description": "sap tables only — SAP field -> canonical name" }
      }
    },

    "RunStatus": {
      "enum": ["queued", "running", "succeeded", "partial", "failed", "cancelled"]
    },

    "StageStatus": {
      "enum": ["pending", "running", "succeeded", "failed", "skipped", "cancelled"]
    },

    "FileMetadata": {
      "description": "Server-extracted. Replaces browser-side pdfjs/xlsx parsing.",
      "oneOf": [
        {
          "type": "object",
          "required": ["kind", "page_count"],
          "properties": {
            "kind":           { "const": "pdf" },
            "page_count":     { "type": "integer", "minimum": 0 },
            "has_text_layer": { "type": "boolean" },
            "producer":       { "type": ["string", "null"] },
            "pages": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["page_number", "width_px", "height_px"],
                "properties": {
                  "page_number":   { "type": "integer", "minimum": 1,
                                     "description": "1-BASED. See open question #4." },
                  "width_px":      { "type": "integer" },
                  "height_px":     { "type": "integer" },
                  "dpi":           { "type": ["integer", "null"] },
                  "rotation":      { "type": "integer", "enum": [0, 90, 180, 270] },
                  "has_text":      { "type": "boolean" },
                  "thumbnail_url": { "type": ["string", "null"] },
                  "preview_url":   { "type": ["string", "null"] }
                }
              }
            }
          }
        },
        {
          "type": "object",
          "required": ["kind", "sheets"],
          "properties": {
            "kind": { "const": "spreadsheet" },
            "sheets": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "row_count"],
                "properties": {
                  "name":       { "type": "string" },
                  "row_count":  { "type": "integer", "minimum": 0 },
                  "header_row": { "type": ["integer", "null"] },
                  "columns": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": ["index", "header"],
                      "properties": {
                        "index":         { "type": "integer", "minimum": 0 },
                        "header":        { "type": "string" },
                        "detected_type": { "enum": ["string", "number", "datetime", "boolean", "unknown"] },
                        "null_count":    { "type": "integer", "minimum": 0 },
                        "sample_values": { "type": "array", "items": { "type": "string" }, "maxItems": 5 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "type": "object",
          "required": ["kind", "width_px", "height_px"],
          "properties": {
            "kind":        { "const": "image" },
            "width_px":    { "type": "integer" },
            "height_px":   { "type": "integer" },
            "dpi":         { "type": ["integer", "null"] },
            "color_space": { "type": ["string", "null"] }
          }
        }
      ]
    },

    "Validation": {
      "type": "object",
      "required": ["valid", "errors", "warnings"],
      "properties": {
        "valid":    { "type": "boolean" },
        "errors":   { "type": "array", "items": { "$ref": "#/$defs/ValidationIssue" } },
        "warnings": { "type": "array", "items": { "$ref": "#/$defs/ValidationIssue" } }
      }
    },

    "ValidationIssue": {
      "type": "object",
      "required": ["code", "message"],
      "properties": {
        "code":    { "type": "string" },
        "message": { "type": "string" },
        "field":   { "type": ["string", "null"] },
        "row":     { "type": ["integer", "null"] },
        "details": { "type": "object", "additionalProperties": true }
      }
    },

    "SourceFile": {
      "type": "object",
      "required": ["file_id", "batch_id", "plant_code_id", "connector",
                   "original_filename", "size_bytes", "checksum",
                   "processing_status", "taxonomy", "metadata", "validation"],
      "properties": {
        "file_id":           { "type": "string" },
        "batch_id":          { "type": "string" },
        "plant_code_id":     { "type": "string" },
        "connector":         { "$ref": "#/$defs/Connector" },
        "original_filename": { "type": "string" },
        "stored_path":       { "type": "string" },
        "content_type":      { "type": "string" },
        "size_bytes":        { "type": "integer", "minimum": 0 },
        "checksum":          { "type": "string", "pattern": "^sha256:[a-f0-9]{64}$" },
        "uploaded_at":       { "type": "string", "format": "date-time" },
        "uploaded_by":       { "$ref": "#/$defs/Actor" },

        "taxonomy":  { "$ref": "#/$defs/Taxonomy",
                       "description": "REQUIRED on every file — replaces the loose category/type_key/subtype_key trio." },
        "file_role":   { "type": ["string", "null"], "enum": ["metadata", "values", null],
                         "description": "Time Series only — duplicated from taxonomy.group_key for convenience" },
        "tag_count":   { "type": ["integer", "null"], "minimum": 0, "description": "Time Series only" },
        "row_count":   { "type": ["integer", "null"], "minimum": 0 },
        "time_range":  { "type": ["object", "null"], "description": "Time Series values files",
                         "properties": { "start": { "type": "string", "format": "date-time" },
                                         "end":   { "type": "string", "format": "date-time" } } },
        "field_set":   { "type": ["object", "null"],
                         "description": "Documents only — resolved extraction fields for THIS file (§8.2.4)",
                         "properties": {
                           "inherited_from_subtype": { "type": "array", "items": { "type": "string" } },
                           "file_overrides": { "type": "array", "items": { "type": "object" } },
                           "effective":      { "type": "array", "items": { "type": "string" } } } },
        "artifacts":   { "type": "array", "items": { "$ref": "#/$defs/Artifact" },
                         "description": "What THIS file produced" },
        "row_counts":  { "type": "object",
                         "properties": { "extracted": { "type": "integer" },
                                         "committed": { "type": "integer" } } },
        "detected_type": {
          "type": ["object", "null"],
          "required": ["value", "confidence", "source"],
          "properties": {
            "value":      { "type": "string" },
            "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
            "source":     { "enum": ["content_heuristic", "filename", "user"] }
          }
        },
        "user_confirmed_type": { "type": "boolean" },

        "processing_status":   { "$ref": "#/$defs/ProcessingStatus" },
        "processed_at":        { "type": ["string", "null"], "format": "date-time" },
        "processed_by_run_id": { "type": ["string", "null"] },
        "failure_reason":      { "type": ["string", "null"] },
        "retry_count":         { "type": "integer", "minimum": 0 },

        "metadata":      { "$ref": "#/$defs/FileMetadata" },
        "validation":    { "$ref": "#/$defs/Validation" },
        "duplicate_of":  { "type": ["string", "null"] },
        "version":       { "type": "integer", "minimum": 1 },
        "superseded_by": { "type": ["string", "null"] },

        "links": {
          "type": "object",
          "properties": {
            "self":      { "type": "string" },
            "download":  { "type": "string" },
            "thumbnail": { "type": ["string", "null"] }
          }
        }
      }
    },

    "UploadBatch": {
      "type": "object",
      "required": ["batch_id", "plant_code_id", "connector", "status", "file_count"],
      "properties": {
        "batch_id":       { "type": "string" },
        "plant_code_id":  { "type": "string" },
        "connector":      { "$ref": "#/$defs/Connector" },
        "source_kind":    { "enum": ["device", "historian", "cloud"] },
        "cloud_provider": { "type": ["string", "null"], "enum": ["s3", "adls", "gcs", null] },
        "cloud_uri":      { "type": ["string", "null"] },
        "status":         { "enum": ["uploading", "uploaded", "partial", "failed"] },
        "file_count":     { "type": "integer", "minimum": 0 },
        "total_bytes":    { "type": "integer", "minimum": 0 },
        "created_at":     { "type": "string", "format": "date-time" },
        "created_by":     { "$ref": "#/$defs/Actor" }
      }
    },

    "Stage": {
      "type": "object",
      "required": ["stage_key", "label", "status", "weight", "progress_percent"],
      "properties": {
        "stage_key":        { "type": "string" },
        "label":            { "type": "string" },
        "status":           { "$ref": "#/$defs/StageStatus" },
        "weight":           { "type": "integer", "minimum": 0, "maximum": 100 },
        "progress_percent": { "type": "integer", "minimum": 0, "maximum": 100 },
        "items_total":      { "type": ["integer", "null"], "minimum": 0,
                              "description": "null => indeterminate for this stage" },
        "items_done":       { "type": "integer", "minimum": 0 },
        "current_item":     { "type": ["string", "null"] },
        "started_at":       { "type": ["string", "null"], "format": "date-time" },
        "finished_at":      { "type": ["string", "null"], "format": "date-time" },
        "message":          { "type": ["string", "null"] },
        "error":            { "$ref": "#/$defs/Error" },
        "skip_reason": {
          "type": ["object", "null"],
          "required": ["code", "message"],
          "properties": {
            "code":    { "type": "string" },
            "message": { "type": "string" }
          }
        },
        "per_file": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["file_id", "status"],
            "properties": {
              "file_id":          { "type": "string" },
              "filename":         { "type": "string" },
              "status":           { "$ref": "#/$defs/StageStatus" },
              "progress_percent": { "type": "integer", "minimum": 0, "maximum": 100 },
              "items_done":       { "type": "integer" },
              "items_total":      { "type": ["integer", "null"] },
              "error":            { "$ref": "#/$defs/Error" }
            }
          }
        }
      }
    },

    "LogEntry": {
      "type": "object",
      "required": ["ts", "level", "message"],
      "properties": {
        "ts":        { "type": "string", "format": "date-time" },
        "level":     { "enum": ["info", "warn", "error"],
                       "description": "REQUIRED. ProcessLog.jsx currently string-matches the message to guess severity." },
        "stage_key": { "type": ["string", "null"] },
        "message":   { "type": "string" },
        "data":      { "type": "object", "additionalProperties": true }
      }
    },

    "Artifact": {
      "type": "object",
      "required": ["artifact_id", "kind", "filename", "download_url"],
      "properties": {
        "artifact_id":    { "type": "string" },
        "kind":           { "enum": ["ocr_excel", "extraction_excel", "cleaned_csv",
                                     "page_image", "template_match_report", "markdown"] },
        "filename":       { "type": "string" },
        "size_bytes":     { "type": "integer", "minimum": 0 },
        "created_at":     { "type": "string", "format": "date-time" },
        "source_file_id": { "type": ["string", "null"] },
        "download_url":   { "type": "string" }
      }
    }
  }
}
```

---

### B.2 `POST /connectors/{connector}/upload` — multipart

**Request form fields**

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "UploadRequest (multipart/form-data)",
  "type": "object",
  "required": ["plant_code_id", "files"],
  "properties": {
    "plant_code_id": { "type": "string" },
    "files":         { "type": "array", "items": { "format": "binary" }, "minItems": 1 },

    "type_key":      { "type": "string", "description": "documents only — e.g. design_documents" },
    "subtype_key":   { "type": "string", "description": "documents only — e.g. equipment_datasheets" },
    "file_role":     { "enum": ["metadata", "values"], "description": "timeseries only" },
    "category":      { "enum": ["pnid", "pfd", "line_list", "others"],
                       "description": "pnid only. CANONICAL vocabulary — replaces the four separate pnid_files/pfd_files/linelist_files/other_files form fields (see §6.4.2)." },

    "idempotency_key": { "type": "string" }
  }
}
```

**Response `data`**

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "UploadResponse.data",
  "type": "object",
  "required": ["batch", "files", "summary"],
  "properties": {
    "batch": { "$ref": "common.schema.json#/$defs/UploadBatch" },
    "files": { "type": "array", "items": { "$ref": "common.schema.json#/$defs/SourceFile" } },
    "rejected": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["original_filename", "reason"],
        "properties": {
          "original_filename": { "type": "string" },
          "size_bytes":        { "type": "integer" },
          "reason":            { "$ref": "common.schema.json#/$defs/ValidationIssue" }
        }
      }
    },
    "summary": {
      "type": "object",
      "required": ["accepted", "rejected", "duplicates"],
      "properties": {
        "accepted":    { "type": "integer", "minimum": 0 },
        "rejected":    { "type": "integer", "minimum": 0 },
        "duplicates":  { "type": "integer", "minimum": 0 },
        "total_bytes": { "type": "integer", "minimum": 0 }
      }
    }
  }
}
```

---

### B.3 `GET /pipeline/jobs/{id}` — 🔴 the critical schema

This is the response that currently has **no progress field**. Adding it removes the `Math.random()` progress bar.

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PipelineJobResponse.data",
  "type": "object",
  "required": ["pipeline_job_id", "plant_code_id", "stage", "status",
               "progress_percent", "is_determinate", "stages"],
  "properties": {
    "pipeline_job_id": { "type": "string" },
    "upload_batch_id": { "type": ["string", "null"] },
    "plant_code_id":   { "type": "string" },
    "stage":           { "enum": ["sap", "docs", "ts", "pnid", "full"] },
    "status":          { "enum": ["queued", "running", "completed", "failed", "cancelled"] },

    "progress_percent": {
      "type": "integer", "minimum": 0, "maximum": 100,
      "description": "Server-computed as Σ(weight × stage_percent) / Σ(weight). MONOTONIC. Persisted. Reaches 100 only at a terminal status."
    },
    "is_determinate": {
      "type": "boolean",
      "description": "false => the UI renders an indeterminate bar instead of a percentage."
    },
    "current_stage": { "type": ["string", "null"] },
    "current_item":  { "type": ["string", "null"] },
    "eta_seconds":   { "type": ["integer", "null"], "minimum": 0,
                       "description": "Omit the key entirely rather than guess." },

    "stages": {
      "type": "array", "minItems": 1,
      "items": { "$ref": "common.schema.json#/$defs/Stage" },
      "description": "ALWAYS the full planned list, including still-pending stages."
    },

    "counters": {
      "type": "object",
      "properties": {
        "files_total":    { "type": "integer" },
        "files_done":     { "type": "integer" },
        "files_failed":   { "type": "integer" },
        "rows_extracted": { "type": "integer" }
      }
    },

    "output_tables":  { "type": "array", "items": { "type": "string" } },
    "record_counts":  { "type": "object", "additionalProperties": { "type": "integer" } },
    "total_records":  { "type": "integer", "minimum": 0 },

    "started_at":   { "type": ["string", "null"], "format": "date-time" },
    "finished_at":  { "type": ["string", "null"], "format": "date-time" },
    "triggered_by": { "$ref": "common.schema.json#/$defs/Actor" },

    "artifacts": { "type": "array", "items": { "$ref": "common.schema.json#/$defs/Artifact" } },
    "logs":      { "type": "array", "items": { "$ref": "common.schema.json#/$defs/LogEntry" } },
    "error":     { "$ref": "common.schema.json#/$defs/Error" }
  }
}
```

---

### B.4 `GET /connectors/documents/catalog` — Type → Subtype → Fields

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DocumentCatalogResponse.data",
  "type": "object",
  "required": ["types", "version", "plant_code_id"],
  "properties": {
    "version":       { "type": "integer" },
    "plant_code_id": { "type": "string" },
    "industry":      { "type": ["string", "null"] },

    "types": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type_key", "label", "is_custom", "subtypes"],
        "properties": {
          "type_key":   { "type": "string", "pattern": "^[a-z0-9_]+$" },
          "label":      { "type": "string" },
          "is_custom":  { "type": "boolean" },
          "sort_order": { "type": "integer" },
          "counts": {
            "type": "object",
            "properties": {
              "files_total":     { "type": "integer" },
              "files_processed": { "type": "integer" },
              "files_pending":   { "type": "integer" },
              "files_failed":    { "type": "integer" }
            }
          },

          "subtypes": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["subtype_key", "label", "is_custom", "fields", "selected_field_keys"],
              "properties": {
                "subtype_key":      { "type": "string", "pattern": "^[a-z0-9_]+$" },
                "label":            { "type": "string" },
                "is_custom":        { "type": "boolean" },
                "accepted_formats": { "type": "array", "items": { "type": "string" } },

                "fields": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["field_key", "label", "origin", "selected"],
                    "properties": {
                      "field_key":   { "type": "string" },
                      "label":       { "type": "string" },
                      "description": { "type": ["string", "null"] },
                      "type":        { "enum": ["string", "number", "date", "boolean", "text"] },
                      "required":    { "type": "boolean" },
                      "origin":      { "enum": ["catalog", "user_added"] },
                      "selected":    { "type": "boolean",
                                       "description": "The user's saved choice. Currently written via updateUserConfig and NEVER read back." }
                    }
                  }
                },

                "selected_field_keys": {
                  "type": "array", "items": { "type": "string" },
                  "description": "Resolved global selection for this subtype."
                },

                "file_overrides": {
                  "type": "object",
                  "description": "Keyed by file_id. Fields added for ONE file only.",
                  "additionalProperties": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": ["field_key", "label"],
                      "properties": {
                        "field_key": { "type": "string" },
                        "label":     { "type": "string" },
                        "description": { "type": ["string", "null"] }
                      }
                    }
                  }
                },

                "counts": {
                  "type": "object",
                  "properties": {
                    "files_total":     { "type": "integer" },
                    "files_processed": { "type": "integer" },
                    "files_pending":   { "type": "integer" },
                    "files_failed":    { "type": "integer" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

### B.5 Time Series — upload result with multi-file, multi-tag

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TimeseriesUploadResponse.data",
  "type": "object",
  "required": ["batch", "files", "tags_summary"],
  "properties": {
    "batch": { "$ref": "common.schema.json#/$defs/UploadBatch" },

    "files": {
      "type": "array",
      "description": "BOTH roles in ONE batch. Today metadata and values are two separate uploads and only the last job_id survives.",
      "items": {
        "allOf": [
          { "$ref": "common.schema.json#/$defs/SourceFile" },
          {
            "type": "object",
            "required": ["file_role"],
            "properties": {
              "file_role":  { "enum": ["metadata", "values"] },
              "tag_count":  { "type": ["integer", "null"], "minimum": 0 },
              "row_count":  { "type": ["integer", "null"], "minimum": 0 },
              "time_range": {
                "type": ["object", "null"],
                "properties": {
                  "start": { "type": "string", "format": "date-time" },
                  "end":   { "type": "string", "format": "date-time" }
                }
              }
            }
          }
        ]
      }
    },

    "tags_summary": {
      "type": "object",
      "required": ["total", "recognised", "unrecognised", "duplicate", "no_values"],
      "properties": {
        "total":        { "type": "integer", "minimum": 0 },
        "recognised":   { "type": "integer", "minimum": 0,
                          "description": "Defined in metadata AND present in values" },
        "unrecognised": { "type": "integer", "minimum": 0,
                          "description": "Present in values with no metadata definition" },
        "duplicate":    { "type": "integer", "minimum": 0,
                          "description": "Defined in more than one metadata file" },
        "no_values":    { "type": "integer", "minimum": 0,
                          "description": "Defined in metadata with no readings" }
      }
    },

    "tags": {
      "type": "array",
      "description": "Paginated — 10k–100k tags is normal. Never return them all inline.",
      "items": {
        "type": "object",
        "required": ["tag_id", "tag_name", "status"],
        "properties": {
          "tag_id":          { "type": "string" },
          "tag_name":        { "type": "string" },
          "description":     { "type": ["string", "null"] },
          "unit":            { "type": ["string", "null"] },
          "upper_limit":     { "type": ["number", "null"] },
          "lower_limit":     { "type": ["number", "null"] },
          "status":          { "enum": ["recognised", "unrecognised", "duplicate", "no_values"] },
          "defined_in_file_id": { "type": ["string", "null"] },
          "value_file_ids":  { "type": "array", "items": { "type": "string" } },
          "row_count":       { "type": "integer", "minimum": 0 }
        }
      }
    },

    "pagination": { "$ref": "common.schema.json#/$defs/Pagination" },

    "validation_by_file": {
      "type": "object",
      "description": "Keyed by file_id. Whole-file validation — the browser only reads the first 8 KB and skips XLSX entirely.",
      "additionalProperties": {
        "type": "object",
        "required": ["valid", "detected_columns", "missing_columns"],
        "properties": {
          "valid":            { "type": "boolean" },
          "detected_columns": { "type": "array", "items": { "type": "string" } },
          "missing_columns":  { "type": "array", "items": { "type": "string" } },
          "rejected_rows": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "row":    { "type": "integer" },
                "reason": { "type": "string" }
              }
            }
          }
        }
      }
    }
  }
}
```

---

### B.6 `GET /connectors/{connector}/context` — staged review rows

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ContextResponse.data",
  "type": "object",
  "required": ["connector", "plant_code_id", "tables"],
  "properties": {
    "connector":     { "$ref": "common.schema.json#/$defs/Connector" },
    "plant_code_id": { "type": "string" },
    "run_id":        { "type": ["string", "null"] },
    "batch_ids":     { "type": "array", "items": { "type": "string" } },
    "review_status": { "enum": ["not_started", "in_progress", "complete"] },

    "tables": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["table_key", "label", "columns", "rows", "summary"],
        "properties": {
          "table_key": { "type": "string" },
          "label":     { "type": "string" },

          "columns": {
            "type": "array",
            "description": "Backend-owned. Replaces the frontend SAP_TABLE_COLUMNS constant.",
            "items": {
              "type": "object",
              "required": ["key", "label", "type", "editable"],
              "properties": {
                "key":      { "type": "string" },
                "label":    { "type": "string" },
                "type":     { "enum": ["string", "number", "date", "boolean"] },
                "editable": { "type": "boolean" },
                "required": { "type": "boolean" },
                "format":   { "type": ["string", "null"] },
                "width":    { "type": ["integer", "null"] }
              }
            }
          },

          "rows": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["row_id", "values", "status"],
              "properties": {
                "row_id": { "type": "string",
                            "description": "STABLE server ID. Fixes 113 index-as-key sites." },
                "values": { "type": "object", "additionalProperties": true },
                "status": { "enum": ["ok", "needs_review", "edited", "rejected"] },
                "issues": { "type": "array", "items": { "$ref": "common.schema.json#/$defs/ValidationIssue" } },
                "provenance": {
                  "type": ["object", "null"],
                  "properties": {
                    "file_id":      { "type": "string" },
                    "filename":     { "type": "string" },
                    "page_number":  { "type": ["integer", "null"] },
                    "bbox": {
                      "type": ["object", "null"],
                      "required": ["x1", "y1", "x2", "y2"],
                      "properties": {
                        "x1": { "type": "number" }, "y1": { "type": "number" },
                        "x2": { "type": "number" }, "y2": { "type": "number" }
                      }
                    },
                    "extracted_by": { "type": "string" }
                  }
                },
                "edited_by": { "$ref": "common.schema.json#/$defs/Actor" },
                "edited_at": { "type": ["string", "null"], "format": "date-time" }
              }
            }
          },

          "pagination": { "$ref": "common.schema.json#/$defs/Pagination" },
          "summary": {
            "type": "object",
            "properties": {
              "total":        { "type": "integer" },
              "ok":           { "type": "integer" },
              "needs_review": { "type": "integer" },
              "edited":       { "type": "integer" },
              "rejected":     { "type": "integer" }
            }
          }
        }
      }
    }
  }
}
```

---

### B.7 `POST /connectors/{connector}/context/commit`

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "CommitResponse.data",
  "type": "object",
  "required": ["commit_id", "committed_at", "committed_by", "tables", "total_rows_written"],
  "properties": {
    "commit_id":    { "type": "string" },
    "run_id":       { "type": ["string", "null"] },
    "batch_ids":    { "type": "array", "items": { "type": "string" } },
    "committed_at": { "type": "string", "format": "date-time" },
    "committed_by": { "$ref": "common.schema.json#/$defs/Actor" },
    "idempotency_key": { "type": ["string", "null"],
                         "description": "A replay returns this same object — no double write." },

    "status": { "enum": ["committed", "partial", "failed"] },

    "tables": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["table", "rows_written"],
        "properties": {
          "table":         { "type": "string" },
          "rows_written":  { "type": "integer", "minimum": 0 },
          "rows_updated":  { "type": "integer", "minimum": 0 },
          "rows_skipped":  { "type": "integer", "minimum": 0 },
          "rows_rejected": { "type": "integer", "minimum": 0 }
        }
      }
    },
    "total_rows_written": { "type": "integer", "minimum": 0 },

    "rejected_rows": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "row_id": { "type": "string" },
          "table":  { "type": "string" },
          "reason": { "$ref": "common.schema.json#/$defs/ValidationIssue" }
        }
      }
    },

    "downstream": {
      "type": ["object", "null"],
      "description": "Ontology populate as a REAL tracked job. Today it is fire-and-forget inside a swallowed catch.",
      "properties": {
        "ontology_run_id": { "type": "string" },
        "status":          { "$ref": "common.schema.json#/$defs/RunStatus" },
        "poll_url":        { "type": "string" }
      }
    }
  }
}
```

---

### B.8 Using these schemas

- **Backend (FastAPI):** these map 1:1 to Pydantic models. `$defs` become shared base models; `oneOf` on `FileMetadata` becomes a discriminated union on `kind`.
- **Frontend:** run them through `json-schema-to-typescript` to generate types, so a contract change surfaces as a compile error rather than a runtime `undefined`.
- **Contract testing:** validate real responses against these schemas in CI. That is what prevents the drift already visible today — `plant_code` vs `plant_code_id`, `job_id` vs `pipeline_job_id`, three different shapes from `GET /clients/files`, and `images_folde`.
