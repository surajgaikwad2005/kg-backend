# `GET /connectors/state` — kya yeh localStorage tab-status replace karne ke liye kaafi hai?

**Module:** Admin → Domain Configuration (Data Source Integration tab strip)
**Companion docs:** [Full backend requirement spec](./domain-configuration-backend-requirements.md) (backend ko already diya gaya, English, 29-endpoint spec) · [Executive summary](./domain-configuration-executive-summary.txt)
**Yeh doc kis liye hai:** Backend ne pehli baar ek real endpoint deliver kiya hai (`connectors/state`) jo requirements doc ke §4.1 (`ConnectorState` entity) aur §6.3 (discovery/F5-fix) se match karta hai. Is doc mein hum check kar rahe hain — **is EK endpoint se kya-kya replace ho sakta hai, kya nahi, aur aage kya karna hai.**
**Status:** Analysis / planning — abhi tak koi code nahi likha gaya iske liye
**Date:** 2026-08-13
**Backend (local dev):** `http://127.0.0.1:8000` (Swagger: `http://127.0.0.1:8000/docs#/`)

---

## 1. TL;DR — seedha jawab

> **Partially sufficient. "Uploaded / Processed / Validated / Committed" wala status aur "kitni files processed vs pending hain" — dono cleanly replace ho jaate hain, EK single GET call se.**
> **Lekin poora `localStorage`/`sessionStorage` khatam karne ke liye yeh akela endpoint kaafi NAHI hai** — kam se kam 4 aur cheezein (job/batch resume, config snapshot, per-file naam/duplicate-check, aur asli progress %) is response mein maujood nahi hain, aur unke liye alag endpoints chahiye honge (jo already requirements doc mein specify kiye ja chuke hain).

Neeche har localStorage key ko is naye API field se map karke dikhaya gaya hai, taaki "kaafi hai ya nahi" sirf opinion na ho, evidence-based ho.

**Sabse important observation:** yeh endpoint **bilkul wahi shape hai jo humne requirements doc ke §6.3 mein khud propose kiya tha** (`GET /connectors/{connector}/state?plant_code_id=…`) — bas backend ne isse aur behtar bana diya: ek hi call mein **saare 4 connectors ka state ek array mein** aa jaata hai (`data.connectors[]`), connector-by-connector alag call karne ki zaroorat nahi. Matlab jahan doc mein 4 requests propose the (per connector), wahan ab 1 request se kaam chal raha hai — yeh improvement hai, downgrade nahi.

---

## 2. Yeh API deti kya hai (verified from pasted response)

```
GET /p0/cdm/connectors/state?plant_code_id=CAPTURE_DEMO&include_groups=true
```

- **Auth:** `access_token` / `refresh_token` cookie-based — CLAUDE.md ke dual auth pattern (`src/proxy.js` + `src/app/api/_lib/proxy.js`) se already handled hoga, kuch extra karna nahi padega.
- **Query param:** `plant_code_id` — Rule 0 (plant code GET mein query param) se already match karta hai.
- **Response** ek `connectors[]` array deta hai, har connector (pnid / documents / timeseries / sap) ke liye ek object:

| Field | Kya batata hai | Frontend mein iski zaroorat kahan hai |
|---|---|---|
| `status` | e.g. `"UPLOADED"` | tab ka color/badge (`uploaded/processed/validated/committed`) |
| `counts.{files_total, pending, processing, processed, failed, skipped, superseded}` | file-level real counts | "Processed Files - X \| Unprocessed Files - Y" tag jo abhi client-side timestamp-hack se banta hai |
| `has_unprocessed_files`, `unprocessed_file_count`, `total_file_count` | seedha boolean/count | "Add Files" / "Process" button kab enable ho — abhi yeh client-side `sourceCutoff()` timestamp comparison se decide hota hai |
| `configured_at`, `processed_at`, `validated_at`, `committed_at` | server-side timestamps | `admin_committed_at`, `admin_processed_at` localStorage objects |
| `last_upload_batch_id` | batch resume ke liye | `admin_batch_ids_<plant>` |
| `last_run_id` | job/run resume ke liye | `admin_job_ids_<plant>` (partially — neeche gap #1 dekhein) |
| `has_failures` | bonus field, requirements doc mein isse explicitly maanga nahi tha par kaam ka hai | error-state badge ke liye use ho sakta hai |
| `groups[]` (jab `include_groups=true`) | category/subtype-level roll-up, apna `counts` + `file_ids` ke saath | Documents ke 15 subtypes aur SAP ke tables jaise per-row counts — abhi yeh client-side `docFiles`/`sapFiles` array filter karke banaye jaate hain |

`groups[]` ka shape generic hai (`group_kind`, `group_key`, `parent_key`, `label`, `sort_order`, `counts`, `file_ids`) — bilkul wahi design jo requirements doc §6.4.1 mein propose kiya gaya tha taaki ek hi shape P&ID (1-level), Documents (2-level: type→subtype), Timeseries (1-level: metadata/values), aur SAP (2-level: pipeline group→table) sabko cover kare.

---

## 3. Abhi localStorage mein kya-kya store ho raha hai (poora audit)

Yeh source of truth `src/components/admin/hooks/useSourceLifecycle.js` hai — is file ke `clearPlantStorage()` function mein poori list already documented hai. Maine live code padh kar confirm kiya (2026-08-13 tak, current branch), yeh sab abhi bhi active hai — is baar ki migration (upload/context transport) ne inhe touch nahi kiya:

| # | localStorage / sessionStorage key | Kahan likha/padha jaata hai | Kya store karta hai |
|---|---|---|---|
| 1 | `admin_configured_sources::<plant>` | `useSourceLifecycle.js:113,126` | Poora `configuredSources[]` array — har upload entry ka id, type, subtype, timestamp, status, jobId, logs, errors |
| 2 | `admin_processed_sources::<plant>` | `useSourceLifecycle.js:114,132` | Kaun se source TYPE "processed" ho chuke hain (Set) |
| 3 | `admin_validated_sources::<plant>` | `useSourceLifecycle.js:115,138` | Kaun se source TYPE "validated" ho chuke hain (Set) |
| 4 | `admin_committed_sources::<plant>` | `useSourceLifecycle.js:116,144` | Kaun se source TYPE "committed" ho chuke hain (Set) |
| 5 | `admin_committed_at::<plant>` | `useSourceLifecycle.js:117,150` | Type → commit timestamp map |
| 6 | `admin_processed_at::<plant>` | `useSourceLifecycle.js:118,156` | Type → process timestamp map |
| 7 | `admin_job_ids_<plant>` | `usePipelineOrchestration.js:84,120` | Type → running job ID (page refresh ke baad job dobara poll karne ke liye) |
| 8 | `admin_batch_ids_<plant>` (implied by `admin_context_params_${plantId}`) | `usePipelineOrchestration.js:23-25` | Type → last-used context params (crop box, model, selected files) |
| 9 | `admin_pnid_files_by_batch::<batchId>` | `usePipelineOrchestration.js:143` | Batch ID → uploaded file names list |
| 10 | `admin_pnid_file_names::<plant>` | `usePnidFormState.js:62,74,140` | Plant-wide uploaded P&ID file names (duplicate-name detection ke liye) |
| 11 | `admin_domain_config` (sessionStorage, NOT plant-scoped) | `useDocsFormState.js:68`, `usePnidFormState.js:39` | `uploadedDocFileNames` — kaunsi file kis Document subtype ke under upload hui |

**11 keys, 4 alag storage patterns** (per-plant array, per-plant Set, per-plant timestamp-map, aur ek global sessionStorage blob) — yehi complexity hai jo requirements doc mein "Consequences we are living with" section mein flag ki gayi thi (clear browser data = poori config history gayi, do admins ko do alag reality dikhti hai, refresh pe running job orphan ho jaata hai).

---

## 4. Field-by-field verdict — kya replace hota hai, kya nahi

| localStorage key | Naye API se cover? | Reasoning |
|---|:---:|---|
| #2 `admin_processed_sources` | ✅ **Fully** | `status` field + `processed_at != null` seedha yehi batata hai, per-connector, server-side |
| #3 `admin_validated_sources` | ✅ **Fully** | `validated_at` timestamp field present hai response mein |
| #4 `admin_committed_sources` | ✅ **Fully** | `committed_at` timestamp field present hai |
| #5 `admin_committed_at` | ✅ **Fully** | seedha `committed_at` field |
| #6 `admin_processed_at` | ✅ **Fully** | seedha `processed_at` field |
| Processed vs Unprocessed file **count** (abhi `domainSources.js`'s `sourceCutoff()` timestamp-hack se derive hota hai) | ✅ **Fully, aur BEHTAR** | `counts.{pending,processing,processed,...}` + `has_unprocessed_files`/`unprocessed_file_count` seedha backend se aata hai — client-side `parseUTC(timestamp) <= cutoff` comparison poori tarah hata sakte hain. Yeh existing logic mein ek real bug bhi tha (naive UTC string parsing) jo automatically khatam ho jaayega |
| #1 `admin_configured_sources` (poora array — id, subtype, timestamp, **logs, errors**) | ⚠️ **Partial** | Har connector ka rollup mil jaata hai, lekin per-upload-entry cheezein (jaise ek specific batch ke logs/errors) `groups[].file_ids` se sirf file IDs milte hain — filenames, per-file error messages, ya "yeh entry kis batch se aaya" wala UI list is response mein nahi hai. Iske liye `include=files` wala per-file listing chahiye (jaisा requirements doc §6.4.6 mein propose kiya gaya) |
| #7 `admin_job_ids` (running job resume) | ⚠️ **Partial** | `last_run_id` milta hai, lekin sirf "last" run — agar ek connector ke through-multiple batches parallel process ho rahe hain (theoretically), ya job abhi bhi "running" hai to uska LIVE status/progress is endpoint mein nahi hai. Job resume ke liye `last_run_id` ko `GET /runs/{run_id}` (ya existing `getConnectorJob`) ko pass karna hoga — state endpoint sirf "kya karna hai" batata hai, "abhi kitna hua" nahi |
| #8 `admin_context_params` (crop box, model choice, selected files) | ❌ **Not covered** | Yeh endpoint sirf lifecycle/count data deta hai — koi `config_snapshot` field nahi hai. Requirements doc §7.1 mein yeh already ek separate requirement hai (`ProcessingRun.config_snapshot`). Jab tak backend woh nahi banata, yeh localStorage key hatana **data-loss** hoga (refresh ke baad crop box dubara draw karna padega) |
| #9 `admin_pnid_files_by_batch` | ❌ **Not covered** | Filenames is response mein nahi hain, sirf `file_ids` (numeric, jaise sample mein `4`) |
| #10 `admin_pnid_file_names` (duplicate-name detection) | ❌ **Not covered** | Same reason — filenames chahiye, IDs nahi milte |
| #11 `admin_domain_config` (Documents subtype → filenames) | ⚠️ **Partial, pending verification** | `groups[]` agar `connector=documents` ke liye 2-level (type→subtype) roll-up deta hai (jaisa design se expect hai), to **counts** ka part cover ho jaata hai. Lekin **filenames** phir bhi nahi milte — sirf `file_ids`. Aur yeh abhi verify nahi hua — pasted sample sirf `pnid` connector (1-level: pnid/pfd/line_list/others) dikhata hai, `documents`/`sap` connector ka groups shape dekhna baaki hai |

**Counting it up:** 11 mein se **5 keys fully replace ho jaati hain**, **3 partially**, **3 not at all** (in the sense of "poora data" — kuch partial overlap sabme hai kyunki counts to milte hi hain).

---

## 5. Verification zaroori hai implementation se pehle (Swagger, `http://127.0.0.1:8000/docs#/`)

Yeh sab pasted sample se clear nahi hue — implement karne se pehle live check karna:

1. **`groups[]` ka shape `documents` aur `sap` connector ke liye kya hai?** Kya woh `parent_key` ke saath 2-level hierarchy deta hai (type→subtype for docs, pipeline_group→table for SAP)? Sample truncated hai (`"... (truncated — full shape in Swagger)"`), sirf `pnid` (1-level) confirmed hai.
2. **AIF / GLOC / LOPC kahan dikhte hain?** Yeh teeno `connector='sap'` ke through upload hote hain (`file_type` se distinguish). Kya `connector=sap` ka response inhe alag `groups[]` entries ke roop mein deta hai, ya `flows[]` array mein? (Sample mein pnid ka `flows: ["pnid"]` single-item hai — SAP ka `flows[]` shayad `["sap","AIF","GLOC","LOPC"]` jaisa ho sakta hai, guess hai, confirm karna hoga.)
3. **`status` ke poore enum values kya hain?** Sample sirf `"UPLOADED"` dikhata hai. Frontend ke `SOURCE_STATUS` (`domainSources.js`) mein `locked/empty/uploaded/validated/processed/committed` hain (lowercase) — backend ka casing/naming match karta hai ya mapping table banani padegi?
4. **`?connector=` filter query param exist karta hai kya**, ya hamesha saare connectors ek saath aate hain? (Har baar saare 4 mangwana theek hai agar response chhota hai — but agar `documents` ke 15 subtypes + `sap` ke 21 tables ka groups[] bada ho jaaye, to check karna padega ki payload size reasonable hai.)
5. **`include_groups=false` (default?) ka behaviour** — agar hum hamesha `true` bhejenge to fine, bas confirm karna hai ki yeh optional hai aur default kya hai.
6. **Poll/refresh frequency** — kya yeh endpoint ek plain GET hai (jise TanStack Query `refetchInterval` se periodically refresh kar sakte hain), ya rate-limited hai? Domain Configuration tab strip is response ko baar-baar (mount + mutations ke baad) call karega.

---

## 6. Yeh replace karne ka concrete integration plan (jab implement karna ho)

Is doc ka scope sirf analysis/plan hai, par future reference ke liye exact touch-points:

1. **Service function** — `src/services/domain-configuration/common/connectorsService.js` mein add:
   ```js
   export const getConnectorsState = (plantCode, { includeGroups = true } = {}) =>
       apiClient.get('/api/domain-configuration/connectors/state', {
           params: { plant_code_id: plantCode, include_groups: includeGroups },
       }).then(unwrap);
   ```
2. **Proxy route** — naya `src/app/api/domain-configuration/connectors/state/route.js`, exactly `connectors/upload/route.js` jaisa pattern (`createProxy({ backend: 'DOMAIN_CONFIGURATION', path: '/connectors/state', methods: ['GET'] })`).
3. **Query key** — `src/lib/query/keys.js` ke `domainConfig.connector` namespace mein: `state: (plant) => ['domain-config', plant, 'connector', 'state']`.
4. **Query hook** — `useDsiQueries.js` mein `useConnectorsState(plantCode)`, CLAUDE.md rule 48 follow karte hue (`enabled: !!plantCode`, `plantCode` key ka 2nd element).
5. **`useSourceLifecycle.js` refactor** — `configuredSources/processedSources/validatedSources/committedSources/processedAt/committedAt` ab is query se derive honge, `loadPlantArray`/`loadPlantObject`/localStorage `useEffect`s (lines 6-28, 111-157) hata sakte hain. Sirf truly-ephemeral UI state (`expandedSourceId`, `deleteConfirm`, `editingRow`) React state mein reh jaayega — koi localStorage nahi (rule 39 se bhi match karta hai: local UI state shared context mein nahi jaana chahiye, par yeh already local hai).
6. **Invalidation** — har mutation jo aaj `setConfiguredSources`/`markProcessed`/`markValidated` etc. call karti hai (upload, process/pipeline run, commit, delete) — ab is state query ko `invalidateQueries` karegi (rule 50 compliance), taaki backend hi single source of truth rahe.
7. **Gaps ke liye placeholder rakhna** — jab tak §4 ke ❌/⚠️ items ke liye backend endpoints nahi bante, `admin_context_params` (crop box/model) aur filenames wale localStorage keys **abhi ke liye rehne dena** — inhe hatana premature hoga (data loss).

---

## 7. Phased rollout — companion doc se alignment

Requirements doc ke Section 4 (Delivery Plan) mein "PHASE 1 - STATE" already yehi keh raha tha: *"Store batches, files and connector state. Provide read endpoints. Result: browser storage is removed. Refresh Test passes for state."* — **yeh naya endpoint exactly Phase 1 ka delivery hai**, poora nahi to bahut bada hissa.

| Phase | Kya cover hota hai | Status |
|---|---|---|
| **Phase 1 — State** | configured/processed/validated/committed status, per-file counts | ✅ **Yeh API se ab possible hai** (§4 ke green rows) |
| **Phase 1b — File identity** | filenames, per-file metadata, duplicate detection | ❌ Pending — chahiye `GET /connectors/{connector}/files` jaisa endpoint |
| **Phase 1c — Config persistence** | crop box, model choice, selected fields | ❌ Pending — chahiye `config_snapshot` wala endpoint (§7.1) |
| **Phase 2 — Real progress** | 0-100% asli progress, running job ka live status | ❌ Pending — `runs`/`stages` entities abhi backend mein nahi hain |

**Recommendation:** Is endpoint ko turant integrate karo Phase 1 scope ke liye (§4 ki 5 fully-covered keys + processed/unprocessed counts) — yeh sabse zyada visible bug (do admins ko alag state dikhna, refresh pe status khona) turant fix karta hai. Baaki localStorage keys (`admin_context_params`, filenames) tab tak rakho jab tak unke backend endpoints na bane — inhe abhi hata dena naya data-loss bug create karega.

---

## 8. Risk / edge cases dhyaan mein rakhna

- **Race condition on mutation:** Upload/commit ke turant baad agar `connectors/state` ko turant refetch karte hain, backend ne abhi state update na kiya ho (eventual consistency) to UI purana status dikha sakta hai. Check karna: kya upload/commit response khud updated state return karta hai (to hum wahi seedha cache mein `setQueryData` kar sakein) ya sirf invalidate karke refetch pe depend karna padega.
- **Two P&ID pipelines (requirements doc §3.1):** Yeh state API `connector: "pnid"` ek hi row deta hai — par app mein aaj bhi do alag P&ID pipelines (`Connector P&ID` vs `P&ID Workspace`) hain jinka koi shared state nahi hai. Confirm karna zaroori hai ki backend ka yeh `pnid` connector konsa pipeline represent karta hai — dono ka merge abhi bhi ek open decision hai.
- **`localStorage` clear/migration path:** Existing users ke browser mein already purana localStorage data pada hai. Naya query wire hone ke baad bhi, agar koi mismatch ho (backend down, ya naya plant jiska backend record nahi hai) to graceful fallback/empty-state UI chahiye — crash nahi.
- **Multi-tab consistency ab automatically better ho jaati hai** — yeh net-positive hai, isko as a highlight rakhna: kyunki ab state backend se aati hai, `useSourceLifecycle`'s "second-device test" apne aap pass hone lagega (jo requirements doc ka Acceptance Test #2 hai) — is API ke fully wire hone ke baad.

---

## 9. Final recommendation

**Haan, is API ko turant integrate karo** — yeh single sabse bada, sabse "won't need another backend round-trip" wala improvement hai jo abhi available hai, aur requirements doc ke Phase 1 scope se directly match karta hai. Lekin:

1. Isse "localStorage ka **complete** replacement" mat maano — sirf lifecycle-status wala hissa (§4 ke ✅ rows) replace hota hai.
2. §5 ke 6 open questions Swagger pe verify karo pehle (khaas kar `documents`/`sap` ka `groups[]` shape) — warna Documents ke 15 subtype rows aur SAP ke table drill-down galat map ho sakte hain.
3. `admin_context_params`, file-names wali keys (#8, #9, #10, #11) **abhi mat hatao** — unke liye backend se alag endpoints maango (requirements doc §7.1 aur §6.4.6 already specify karte hain kya chahiye).
