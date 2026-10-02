# Domain Configuration — Frontend Audit Report

**Date:** 2026-08-18
**Branch:** `petronas-aj-3-domain-configuration` @ `bca11f17`
**Scope:** `src/app/(admin)/admin/domain-configuration/**`, `src/components/admin/**`, `src/services/domain-configuration/**`, `src/app/api/domain-configuration/**`, plus shared infra (`apiClient`, `proxy.js`, `_lib/proxy.js`, `lib/query`, `ui/DataTable`)
**Codebase size in scope:** ~28,200 LOC (17,691 `components/admin` + 9,201 route folders + 1,337 services)
**Audience:** Petronas plant data — P&ID PDFs, timeseries tags, SAP tables, documents

---

## 0. TL;DR — Ek Line Me

> Architecture ki **neev bahut solid hai** (proxy layer, service layer, TanStack Query migration, semantic tokens). Lekin **data-volume ke liye ye code likha hi nahi gaya**. Aaj ka design maan ke chal raha hai ki har connector me ~500 rows aayenge. Petronas ke ek plant me timeseries tags 50,000–200,000 tak jaate hain. Us number pe ye feature **silently galat data dikhayega** (truncation) aur **browser freeze** karega.

**Verdict scorecard:**

| Area | Score | Ek line me |
|---|---|---|
| Architecture / layering | 8/10 | Proxy → service → query flow disciplined hai, documented hai |
| Scalability (heavy data) | **2/10** | Hard 500-row cap, zero virtualization, 20k rows client memory me |
| Performance | 4/10 | Context me 105 keys, zero memoization kai jagah, zero debounce |
| Stability | 3/10 | **Zero error boundaries** poore app me, index-based deletes, fake progress |
| Security | 6/10 | HMAC-signed role cookie accha hai, par `dev-token` fallback + no per-route authz |
| Maintainability | 5/10 | 9 files 300+ lines, feature 2 jagah split, localStorage migration adhoora |

---

## 1. Audit Kaise Karein — Repeatable Playbook

Ye section aapke sawaal "how i can do that" ka jawab hai. Har baar naye feature pe yahi 7 steps chalao.

### Step 1 — Surface area naapo (5 min)

```bash
find "src/app/(admin)/admin/domain-configuration" src/components/admin -name "*.jsx" -o -name "*.js" \
  | xargs wc -l | sort -rn | head -40
```

**Kyun:** Audit se pehle pata hona chahiye ki kitna code hai. 300+ line ka har file automatically ek finding hai (CLAUDE.md rule 2). Yahan **9 files** 300 se upar nikle — `DocsReviewView.jsx` 633 lines pe sabse bada.

### Step 2 — Data-volume assumptions dhoondo (sabse important step)

Ye woh step hai jo log skip karte hain aur production me marte hain. Har jagah dhoondo jahan **ek fixed number** hardcode hai:

```bash
git grep -nE "pageSize|page_size|limit|MAX_|slice\(0,|\.length > [0-9]{2,}" -- src/services src/components/admin
```

**Kyun:** Har hardcoded page size ek **implicit contract** hai — "hum maante hain data itna hi hoga". Petronas jaise client pe ye assumption todti hai. Yahi se F-01 aur F-03 nikle.

### Step 3 — Rendering path trace karo (list se DOM tak)

Har badi list ke liye ye chain follow karo:

```
Service (kitna fetch?) -> Query hook (select/memo?) -> Component (.map?) -> DOM element (virtualized?)
```

```bash
git grep -n "\.map(" -- src/components/admin/views | grep -v "Array.from"
git grep -n "react-virtual|react-window|virtualiz" -- package.json src
```

**Kyun:** Agar chain ke aakhir me plain `.map()` hai aur beech me koi virtualization nahi, to **row count = DOM node count**. 50,000 rows × 10 columns = 500,000 DOM nodes = tab crash. Yahan virtualization ka **ek bhi package installed nahi hai**.

### Step 4 — Re-render blast radius naapo

```bash
sed -n '126,233p' src/components/admin/hooks/useAdminContextValues.js | grep -cE "^\s+[a-zA-Z_]"
```

**Kyun:** Context ki har key ek **re-render trigger** hai. 105 keys ka matlab hai 105 alag-alag reasons se poora subtree dobara render hoga.

### Step 5 — Failure paths audit karo (stability)

```bash
find src -name "error.jsx" -o -name "global-error*" -o -iname "*ErrorBoundary*"
git grep -n "setTimeout|setInterval" -- src/components/admin
git grep -n "filter((_, j) => j !== i)"
```

**Kyun:** Happy path sab test karte hain. Audit ka asli value **failure path** me hai — network down, backend 500, malformed row, user ne plant switch kar diya beech me.

### Step 6 — Security chokepoints padho (poore file, skim nahi)

Sirf 4 files padhne hain, par **poore**:
`src/proxy.js` · `src/app/api/_lib/proxy.js` · `src/services/apiClient.js` · `src/app/api/_lib/backends.js`

**Kyun:** Is architecture me security 100% in-hi-4-files me centralised hai. Yahan ek bug = poore app me bug. Yahi se F-14 (`dev-token`) nikla.

### Step 7 — Automated pass chalao

```
/code-review high
/code-review ultra     # multi-agent cloud review — aapko khud type karna padega
```

**Kyun:** Manual audit *patterns* pakadta hai, automated review **specific line-level bugs** pakadta hai. Dono chahiye. Is audit me `/code-review` ne 8 concrete bugs diye (section 4, F-13).

---

## 2. P0 — Petronas Scale Pe Ye Definitely Todega

### F-01 · Hard 500-row cap, server-side pagination wired hi nahi hai — CRITICAL

**File:** `src/services/domain-configuration/common/contextService.js:82`

```js
export const getContext = ({
    connector, plantCode, batchId, files, docTypes, sourceFile, table,
    page = 1, pageSize = 500, jobId, unmatchedOnly,   // page HAMESHA 1, size HAMESHA 500
} = {}) => ...
```

Code ka apna comment ye maanta hai:

> "A plant with more than 500 rows for a connector will be **truncated** until real server-side pagination is built"
> "The response now carries real `pagination.has_more`/`next_cursor` metadata … **not wired up yet**"

**Kyun ye sabse bada issue hai:** Ye sirf performance problem nahi, **data integrity problem** hai. Flow ye hai:

1. User `getContext('timeseries')` call karta hai → 500 tags aate hain
2. UI dikhata hai "Tag Mapping · 12 columns" — **kahin nahi likha ki 49,500 tags chhoot gaye**
3. User review karta hai, edit karta hai, **Commit** dabata hai
4. `commitContext` backend ko bolta hai "jo staged tha wo commit kar do"

**Real example:** Petronas plant me 50,000 tags. Engineer ne 500 review kiye, commit kiya. Baaki 49,500 tags ya to unreviewed commit ho gaye, ya bilkul aaye hi nahi — **aur UI ne kabhi bataya hi nahi**. Ye compliance audit me pakda jaayega, production me nahi.

**Direction:** Backend already `pagination.has_more` + `next_cursor` bhej raha hai. Do cheezein chahiye — (a) `useInfiniteQuery` ya server-driven pagination controls, (b) jab tak wo nahi hai, **ek loud warning banner** jab `has_more === true` ho. Point (b) aaj hi 20 minute ka kaam hai aur silent data loss rok deta hai.

---

### F-02 · Review tables me zero virtualization — DOM me 500k nodes — CRITICAL

**File:** `src/components/admin/views/TsReviewView.jsx:155-200`

```jsx
<div className="overflow-auto max-h-[600px] custom-scrollbar">
  <table>
    <tbody>
      {tsData.map((row, i) => (        // saari rows, har ek DOM me
        <tr key={row._id || row.ts_uid || row.tag_name || i}>
          {tsCols.map((col, j) => (
            <td>
              {isRowEditing ? <input ... /> : (row[col] || '—')}
            </td>
          ))}
```

**Kyun ye khatarnak hai:** `max-h-[600px] overflow-auto` sabse bura combination hai. Aap **saara DOM cost pay kar rahe ho** (browser sab render karta hai) par **visually sirf 600px dikha rahe ho**. Matlab poora nuksaan, zero fayda.

**Numbers (aaj ke 500-row cap pe bhi):**
- 500 rows × 12 columns = **6,000 `<td>` nodes** + 500 `<tr>`
- Har `<td>` pe Tailwind class string concat har render pe
- Agar F-01 fix karke pagination hataayi → 50,000 × 12 = **600,000 nodes** → tab crash

**Aur ek layer:** `sticky right-0` Actions column har row me hai. Sticky positioning browser ko har scroll pe **re-layout** karne pe majboor karta hai. 500 sticky cells × 60fps scroll = jank.

**Direction:** `@tanstack/react-virtual` (MIT, TanStack se hi — already `react-query` use kar rahe ho to same ecosystem). Sirf visible ~30 rows render honge. Ye `DataTable.jsx` me ek baar add karo — poore app ko fayda milega.

---

### F-03 · 40 sequential requests, 20,000 rows client memory me — CRITICAL

**Files:** `src/services/domain-configuration/common/connectorsService.js:357` + `src/components/admin/views/components/flowFiles/FlowFilesPanel.jsx:328`

```js
export const getAllFlowFiles = async (plantCode, { lifecycle, pageSize = MERGED_PAGE_SIZE, signal } = {}) => {
    const files = [];
    for (let page = 1; page <= MAX_PAGES; page += 1) {     // MAX_PAGES = 40
        const data = await getFlowState(plantCode, { lifecycle, page, pageSize: size, signal });
        files.push(...batch);                              // 40 × 500 = 20,000 rows
```

**Teen alag problems ek saath:**

1. **Sequential await** — page 2 tab tak start nahi hoti jab tak page 1 aa na jaaye. 40 pages × 300ms latency = **12 second** loading. Parallel hota to 300ms.
2. **20,000 rows memory me** — har row 47 fields ka object (service ke apne comment ke mutabik). ~20,000 × 47 fields ≈ **40–60 MB heap**, sirf ek panel ke liye.
3. **Non-virtualized `DataTable` me jaata hai** — `src/components/ui/DataTable.jsx` me sirf `rows.map(...)`, koi virtualization/pagination nahi.

**Aur ye panel `DataConfigView` me unconditionally mount hota hai** — user ne panel dekha bhi nahi, tab bhi 40 requests fire ho chuki hain.

**Real example:** Petronas plant, 3 saal ka pipeline history, ~15,000 files. User "Data Source Integration" tab kholta hai → 30 network requests → 12s freeze → 45MB heap → DataTable 15,000 rows render karta hai → **tab hang**. Aur `truncated` banner sirf tab dikhta hai jab 20,000 se upar ho — 15,000 pe koi warning nahi, bas silent slowness.

**Direction:** Ye panel server-side pagination pe le jao (`useInfiniteQuery` + "Load more", ya proper page controls). Client-side "sab kuch le aao phir filter karo" pattern is data volume pe kaam nahi karta.

---

### F-04 · Project me virtualization ka koi package hi nahi hai — CRITICAL

```bash
$ grep -E "virtual|react-window" package.json
# (kuch nahi)
```

`@tanstack/react-table` v9 installed hai — par `DataTable.jsx` use hi nahi karta, wo plain `<table>` hai.

**Kyun mention kar raha hoon:** F-02 aur F-03 ka fix ek hi package se hota hai. Ye ek architectural gap hai, teen alag bugs nahi.

**Recommendation:** `@tanstack/react-virtual` — **MIT license** (CLAUDE.md ki allowed list me), actively maintained, TanStack ecosystem me already ho, bundle ~3kb gzipped. `react-window` bhi MIT hai par TanStack wala aapke existing stack se better fit karta hai.

---

## 3. P1 — Performance

### F-05 · Context me 105 keys — rule 25 ka limit 20 hai — HIGH

**File:** `src/components/admin/hooks/useAdminContextValues.js`

| Context | Keys | Limit | Status |
|---|---|---|---|
| `navValue` | 22 | 20 | FAIL |
| `entityValue` | 53 | 20 | FAIL — **2.6x** |
| `formValue` | **105** | 20 | FAIL — **5.2x** |

**Kyun ye performance killer hai:** React context me **koi selector nahi hota**. Value object ka reference badla = **har consumer re-render**, chahe usne wo key use ki ho ya nahi.

**Concrete example:**

```
User PnID modal me ek file add karta hai
  -> setPnidFiles([...])
  -> formValue useMemo dobara chalta hai (105 keys me se 1 badli)
  -> naya object reference
  -> TsReviewView re-render (jo pnidFiles ko chhoota bhi nahi)
  -> TsReviewView me 500 rows × 12 cols dobara render (F-02 dekho)
  -> SapMappingView re-render
  -> DocsReviewView (633 lines) re-render
```

Ek file add karne pe **poora admin panel** dobara render ho raha hai. F-02 ke saath milkar ye compounding hai — ek keystroke pe 6,000 `<td>` dobara render.

**Direction:** Rule 25 ka spirit follow karo — domain ke hisaab se split. `formValue` ko `PnidFormContext` / `TsFormContext` / `SapFormContext` / `DocsFormContext` me todo. Har connector apna hi context sunega. Ye badi refactor hai par sabse zyada ROI wali.

---

### F-06 · `.map()` / `.filter()` bina `useMemo` — rule 23 violation

**File:** `src/components/admin/views/PidReviewView.jsx:71,76`

```jsx
const displayData = currentFileConnectivity.map(r => ({    // har render pe naya array
    source:      r.from_equipment_ref || r.source_asset || r.source || Object.values(r)[0] || '',
    destination: r.to_equipment_ref || r.destination_asset || r.destination || Object.values(r)[1] || '',
}));
const currentFileEquipment = currentPid
    ? equipmentPidData.filter(r =>                          // har render pe full scan
        (r.source_file || '') === currentPid.name || ...)
    : [];
```

**Kyun:** `equipmentPidData` ek P&ID-heavy plant me hazaaron rows hoti hai. F-05 ki wajah se ye component **bahut baar** re-render hota hai. Har render = full array scan + naya array = child components ko naya prop reference = wo bhi re-render.

**Bonus bug:** `Object.values(r)[0]` — object key order pe depend kar raha hai. Backend ne field order badla to **UI silently galat column dikhayega**, koi error nahi. Ye rule 35 wale index-key problem ka hi cousin hai.

---

### F-07 · `structuralSharing` heavy payloads pe ON hai

Poore repo me sirf **ek** jagah off hai:

```
src/app/(dashboard)/knowledge-graph/_queries/useKnowledgeGraphQueries.js:104:  structuralSharing: false
```

CLAUDE.md rule 55 kehta hai binary ArrayBuffers aur bade graph payloads pe off hona chahiye. Domain-configuration me ye kahin off nahi:

- P&ID PDF/image ArrayBuffers (`pnidService.getFileArrayBuffer`)
- 20,000-row flow state (F-03)
- Knowledge graph payloads P&ID validate screen me

**Kyun:** Query har fetch pe poore response tree ko walk karta hai reusable sub-objects dhoondne ke liye. Ek 20MB ArrayBuffer pe ye **pure waste** hai — kuch reuse nahi ho sakta, sirf CPU jalti hai.

---

### F-08 · Zero debouncing poore feature me

```bash
$ git grep "debounce|useDeferredValue|startTransition" -- src/components/admin "src/app/(admin)/admin/domain-configuration"
# (kuch nahi)
```

**Kyun:** Jahan bhi search/filter input hai, har keystroke pe full list filter + full re-render. 500 rows pe chalega. 20,000 rows (F-03) pe har keystroke 200ms+ lock karega — typing hi impossible ho jaayegi.

**Direction:** React 18 ka `useDeferredValue` — koi package nahi chahiye, input responsive rehta hai aur list background me update hoti hai.

---

### F-09 · Excel parsing main thread pe

**File:** `src/app/(admin)/admin/domain-configuration/pnid/_hooks/useFilePreview.js:106`

```js
const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
setPreviewData(XLSX.utils.sheet_to_json(sheet, { header: 1 }));
```

**Achha:** `await import('xlsx')` lazy hai — bundle me nahi aata jab tak zaroorat na ho.

**Problem:** `XLSX.read` **synchronous blocking** call hai. Petronas ki tag-list Excel 20–80MB hoti hai. Us par:

- Poora UI freeze (scroll nahi, click nahi, spinner bhi nahi ghoomega)
- Aur `sheet_to_json` **poori sheet** ko JS array me convert karta hai — 50,000 rows ka array memory me

**Direction:** Web Worker me le jao, ya `sheet_to_json` pe range limit lagao (preview ke liye pehli 100 rows kaafi hain — ye preview modal hai, editor nahi).

---

## 4. P2 — Stability

### F-10 · Poore app me EK BHI error boundary nahi hai — CRITICAL

```bash
$ find src -name "error.jsx" -o -name "error.js" -o -name "global-error*" -o -iname "*ErrorBoundary*"
# (kuch nahi)
```

**Kyun ye P0-level stability issue hai:** React me ek component ka render throw kar de to **poora tree unmount ho jaata hai** — user ko white screen milta hai, console me error, aur recovery ka koi rasta nahi except page reload (jismein saara unsaved edit chala jaata hai).

**Concrete crash paths jo aaj exist karte hain:**

- `PidReviewView.jsx:72` → `Object.values(r)[0]` — agar `r` null hua (backend ne null row bheja) → `TypeError` → **poora admin panel white**
- `TsReviewView.jsx:68` → `Object.keys(tsData[0])` — agar `tsData[0]` undefined hua
- `useFilePreview.js:106` → corrupt Excel pe `XLSX.read` throw karta hai

Petronas ka data messy hoga — legacy SAP exports, haath se bane Excel, scanned P&ID. **Malformed row aayegi hi.** Aaj wo poore panel ko le jaayegi.

**Direction:** Next.js App Router native support deta hai — `src/app/(admin)/admin/domain-configuration/error.jsx` banao. Plus har bade view (TsReview, PidReview, DocsReview, FlowFilesPanel) ke around ek reusable `<ErrorBoundary>` wrapper, taaki ek table ka crash sirf us table ko le jaaye, poore page ko nahi.

---

### F-11 · Fake progress — rule 34 violation

**File:** `src/app/(admin)/admin/domain-configuration/pnid/_hooks/useWorkspaceUpload.js:85,116`

```js
const interval = setInterval(() => { ... });                            // fake progress ticks
setTimeout(() => { setProgress(100); setStep(4); finish(800); }, 1500);  // 1.5s baad "done"
```

**Kyun:** Petronas ka ek P&ID PDF 200–500MB ho sakta hai. Slow VPN pe upload 3–5 minute lega. Ye code **1.5 second me 100% dikha dega**. User modal band kar dega, upload abort ho jaayega, aur usse lagega kaam ho gaya. Ye sirf cosmetic nahi — **user ko galat information de rahe ho**.

**Direction:** `XMLHttpRequest.upload.onprogress` real bytes deta hai (fetch me upload progress abhi bhi nahi hai). Ya `ReadableStream` se manual counting. CLAUDE.md rule 53 already kehta hai upload progress local state me rakho, query cache me nahi — wo hissa sahi hai, bas **number real hona chahiye**.

---

### F-12 · Index-based row deletion — galat row delete hogi

**File:** `src/components/admin/views/TsReviewView.jsx:127,133`

```js
onSuccess: () => {
    setTsData(prev => prev.filter((_, j) => j !== i));   // array index se delete
}
```

**Kyun:** `i` render ke waqt ka index hai. Beech me agar:

- Koi doosra async response `tsData` ko replace kar de
- User ne sort/filter kar diya ho
- Ek aur delete pehle complete ho gaya ho

...to `i` ab **kisi aur row ko point kar raha hai**. User "TAG_101" delete karega, list se "TAG_204" gayab ho jaayega. Aur backend pe sahi row delete hui hai — to ab UI aur DB **out of sync** hain.

Ironically usi file me stable ID already compute ho raha hai:

```js
const stableId = row._id || row.ts_uid || row.iotdb_tag_id || row.tag_name || i;
```

Bas delete me use nahi ho raha.

**Direction:** `filter((r) => r._id !== row._id)` — stableId se filter karo, index se nahi.

---

### F-13 · `/code-review` ke 8 confirmed bugs

Automated pass ne ye specific bugs nikale (`bca11f17` diff pe):

| # | File | Bug |
|---|---|---|
| 1 | `FlowFileDetailModal.jsx:78` | `Children.toArray(children).some(Boolean)` elements test karta hai, unka **output** nahi — khaali "Counts"/"Timeline" headings dikhti hain |
| 2 | `FlowFilesPanel.jsx:328` | 20,000 rows non-virtualized table me (= F-03) |
| 3 | `FlowFileRowActions.jsx:38` | `disabled` button pe tooltip — browser disabled controls pe mouse events fire hi nahi karta, tooltip **kabhi dikhega hi nahi** |
| 4 | `FlowFilesPanel.jsx:78` | `flowFilter` rebuilt `flowOptions` se reconcile nahi hota — Select placeholder dikhata hai par grid abhi bhi purane flow pe scoped |
| 5 | `FlowFileDetailModal.jsx:95` | `open` aur `file` ek hi state se — close pe exit-animation ke beech skeleton flash |
| 6 | `connectorsService.js:273` | `FLOW_VALUES`/`CONNECTOR_VALUES`/`LIFECYCLE_VALUES` — **zero importers**, dead code |
| 7 | `connectorsService.js:362` | Live `updated_at` sort pe offset paging → **duplicate `flow_uid` keys** grid me |
| 8 | `connectorState.js:153` | `isFileProcessed` `status === 'failed'` ignore karta hai — failed file grid me "Failed" dikhti hai par source card pe "processed" count hoti hai |

Inme **#7 aur #8 data-correctness bugs hain**, sirf UI polish nahi.

---

## 5. P3 — Security

### F-14 · `dev-token` fallback — environment misconfig pe auth bypass — HIGH

**File:** `src/app/api/_lib/proxy.js`

```js
function getToken(req) {
    const fromHeader = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (fromHeader) return fromHeader;
    const fromCookie = req.cookies.get("access_token")?.value;
    if (fromCookie) return fromCookie;
    return isProd ? null : "dev-token";     // <-- yahan
}
```

**Kyun risk hai:** Ye `NODE_ENV === 'production'` pe **poori tarah** depend karta hai. Real scenarios jahan ye galat ho jaata hai:

- Staging/UAT deployment jahan `NODE_ENV` set karna bhool gaye
- Docker container jisme env var pass nahi hui
- `next dev` se demo chalaya customer ko dikhane ke liye

Un cases me **har unauthenticated request** backend pe literal string `"dev-token"` ke saath jaayegi. Agar backend ne kabhi testing ke liye ye accept kiya ho, to **complete auth bypass**.

**Direction:** Explicit opt-in flag banao — `process.env.ALLOW_DEV_TOKEN === 'true'` — taaki ye "default on unless prod" ki jagah "default off unless explicitly enabled" ho jaaye. Fail-closed, fail-open nahi. (CLAUDE.md rule 43 kehta hai dev me insecure routes chahiye — ye theek hai, bas **deliberate** hona chahiye.)

---

### F-15 · Token do jagah — httpOnly cookie **aur** localStorage

`src/proxy.js` httpOnly `access_token` cookie se padhta hai (secure), par `AuthInterceptor` client-side localStorage se padhta hai.

**Kyun:** httpOnly cookie ka **poora point** hi ye hai ki JavaScript usse padh na sake — XSS hone pe bhi token safe rahe. Agar wahi token localStorage me bhi hai, to XSS attacker ek line me le jaata hai:

```js
localStorage.getItem('access_token')   // httpOnly protection bypass
```

Aap security control lagakar uske paas hi bypass rakh rahe ho.

**Direction:** Ek source of truth chuno. Cookie-only best hai (proxy already sab inject kar raha hai, client ko token ki zaroorat hi nahi honi chahiye). Agar client-side token genuinely chahiye kisi kaam ke liye, to wo requirement pehle document karo.

---

### F-16 · Proxy routes pe zero authorization

`src/proxy.js` **page-level** guard karta hai:

```js
if (pathname.startsWith('/admin') && isAuthenticated && userRole !== 'admin') { redirect }
```

Par `/api/*` branch pe:

```js
if (pathname.startsWith('/api/')) {
    // sirf headers inject -> NextResponse.next()
    // koi role check NAHI
}
```

**Kyun:** Ek non-admin authenticated user `/admin/*` page nahi dekh sakta, par browser console se ye chala sakta hai:

```js
fetch('/api/domain-configuration/flow/12345/reset', { method: 'POST', body: ... })
fetch('/api/domain-configuration/context/commit', { method: 'POST', ... })
```

Frontend guard **sirf UI hai, security nahi**. Aap poori tarah backend pe trust kar rahe ho ki wo role validate karega. Wo assumption **document nahi hai aur verify nahi hui**.

**Direction:** Do cheezein — (a) confirm karo ki backend har `/p0/cdm/*` endpoint pe role validate karta hai (**ye ek question hai, assumption nahi**), (b) defence-in-depth ke liye `_lib/proxy.js` me ek optional `requireRole` option add karo, taaki write endpoints declare kar saken ki unhe kya chahiye.

---

### F-17 · RBAC granularity — sirf binary admin/non-admin

Aapne bataya "we are using RBAC (customise by admin role for user role)". Aaj implementation binary hai: `userRole === 'admin'` ya nahi.

Domain-configuration me ye destructive actions hain, sab same permission pe:

- `DeletePlantModal.jsx` (432 lines) — **poora plant delete**
- `commitContext` — CDM me permanent commit
- `resetFlow` — extraction results discard
- `deleteContextRow` — row deletion

**Kyun matter karta hai:** Petronas jaise enterprise me typically chahiye — plant-level scoping (Engineer A sirf apne plant ko chhoo sake), aur action-level separation (review kar sakta hai par commit nahi). Aaj koi bhi admin **kisi bhi plant** ko delete kar sakta hai.

**Achhi baat:** Role cookie **HMAC-signed** hai (`verifyRole()` in `_lib/cookies.js`) — forged/unsigned value null return karti hai. Ye correctly implemented hai. Foundation sahi hai, bas granularity nahi hai.

---

### Security me jo sahi hai (credit where due)

- Debug headers (`X-Target-Url`, `X-Proxy-Name`) **prod me strip** hote hain — backend IPs leak nahi hote
- Role cookie HMAC-signed, `verifyRole()` fail-closed hai
- Multipart uploads **stream** hote hain (`body = req.body`), `req.formData()` nahi — bade P&ID files pe OOM nahi hoga. Ye explicitly documented bhi hai.
- Backend URLs sirf `backends.js` me, kabhi client bundle me nahi
- `apiClient` ka PLANT_CODE preflight galat-scoped requests network se pehle rok deta hai

---

## 6. P4 — Architecture & Maintainability

### F-18 · 9 files 300-line limit se upar (rule 2)

| File | Lines | Over by |
|---|---|---|
| `views/DocsReviewView.jsx` | 633 | **2.1x** |
| `connectorState.js` | 516 | 1.7x |
| `modals/DocSourceModal.jsx` | 451 | 1.5x |
| `views/DeletePlantModal.jsx` | 432 | 1.4x |
| `views/hooks/useSourceTabs.js` | 417 | 1.4x |
| `_queries/useDsiQueries.js` | 391 | 1.3x |
| `flowFiles/FlowFilesPanel.jsx` | 367 | 1.2x |
| `hooks/useConfigModalActions.js` | 365 | 1.2x |
| `ConfigModal.jsx` | 361 | 1.2x |

**Kyun:** 633-line component ka matlab hai koi bhi single change ka blast radius poora file hai. Testing mushkil, review mushkil, aur F-05 ke saath milkar re-render optimization impossible.

### F-19 · Feature do jagah bata hua hai

```
src/app/(admin)/admin/domain-configuration/    <- routes (9,201 LOC)
src/components/admin/                          <- implementation (17,691 LOC)
```

P&ID ne proper co-location kar li hai (`_components/`, `_hooks/`, `_queries/`, `_lib/`, `_context/`) — **ye pattern sahi hai**. Par SAP / Timeseries / Documents abhi bhi `components/admin/` me hain.

**Kyun:** Naye developer ke liye "timeseries review kahan hai?" ka jawab do folder trees me dhoondna padta hai. Migration adhoora hai — ya poora karo, ya document karo ki kyun P&ID alag hai.

### F-20 · localStorage migration adhoori — do systems parallel

Aaj ke active keys:

```
admin_plant_id
admin_job_ids_<plantCode>
admin_context_params_<plantCode>
admin_pnid_files_by_batch::*     <- ye "retired" hai par cleanup code abhi bhi chal raha hai
```

`connectorState.js:477-508` me ek "purani keys clear karo" cleanup routine hai. Matlab **do state systems ek saath chal rahe hain** — server-derived (naya) aur localStorage (purana).

**Kyun risky hai:** State divergence. Ek user jisne page reload nahi kiya uske paas stale localStorage state hai jabki server kuch aur keh raha hai. Aur `usePipelineRuns.js:79` job IDs localStorage se recover karta hai — agar wo stale hue, to UI un jobs ko poll karega jo exist hi nahi karte.

Plus **rule 38 violation**: plant selection, active view — ye shareable state hai, URL me hona chahiye, localStorage me nahi. Aaj koi engineer apne colleague ko "ye tag mapping dekho" ka link nahi bhej sakta.

---

## 7. Prioritized Roadmap

### Sprint 1 — "Data loss roko" (~2-3 din)

Ye cheezein production me galat data dikhne se rokti hain:

1. **F-01 truncation banner** — jab `pagination.has_more === true` ho to loud warning. *~4 ghante.* **Sabse zyada value per hour** poore audit me.
2. **F-12 index-based delete** → stableId se filter. *~1 ghanta.*
3. **F-10 error boundaries** — `error.jsx` + bade views pe wrapper. *~4 ghante.*
4. **F-14 `dev-token`** → explicit opt-in flag. *~30 min.*
5. `/code-review` ke #7 (duplicate keys) aur #8 (failed-status mismatch). *~2 ghante.*

### Sprint 2 — "Scale ke liye taiyaar karo" (~1 hafta)

6. **`@tanstack/react-virtual` install** karo, `DataTable.jsx` me virtualize karo — F-02, F-03 dono ek saath. Poore app ko fayda.
7. **F-01 real server-side pagination** — `useInfiniteQuery`, backend already ready hai.
8. **F-03 `getAllFlowFiles`** → sequential loop hatao, paged UI lao.
9. **F-08 `useDeferredValue`** har search/filter input pe.
10. **F-07 `structuralSharing: false`** ArrayBuffer + bade payload queries pe.

### Sprint 3 — "Architecture theek karo" (~2 hafte)

11. **F-05 context split** — `formValue` (105 keys) ko per-connector contexts me. Sabse badi refactor, sabse bada performance gain.
12. **F-18** — 633-line `DocsReviewView` se shuru karo.
13. **F-19** — SAP/TS/Docs ko P&ID wale co-location pattern pe lao.
14. **F-20** — localStorage migration poori karo, URL state (rule 38) lao.

### Backlog — "Pehle confirm karna hai"

15. **F-16** — backend se confirm karo ki `/p0/cdm/*` pe role validation hai. **Ye ek sawaal hai, assumption nahi.**
16. **F-17** — plant-level + action-level RBAC ka product decision.
17. **F-11** — real upload progress (`XMLHttpRequest.upload.onprogress`).
18. **F-09** — Excel parsing Web Worker me, ya preview pe row limit.

---

## 8. Audit Checklist — Har Naye Feature Pe Chalao

```
[ ] Koi hardcoded pageSize/limit hai? -> us number pe explicit contract likho
[ ] Har list virtualized hai ya bounded? -> warna row count = DOM count
[ ] Context me 20 se kam keys hain?
[ ] Har .map/.filter jo JSX me jaata hai wo useMemo me hai?
[ ] Feature boundary pe error boundary hai?
[ ] Delete/update stable ID se ho raha hai, index se nahi?
[ ] Koi setTimeout real async ka substitute to nahi ban raha?
[ ] Search/filter input debounced ya deferred hai?
[ ] Naya /api route factory use kar raha hai, hand-rolled nahi?
[ ] Har mutation kuch invalidate kar rahi hai?
[ ] Har plant-scoped query me enabled: !!plantCode hai?
[ ] 300 lines se bada koi file to nahi bana?
[ ] /code-review high chalaya?
```

---

## 9. Closing

Is codebase ki **discipline impressive hai** — proxy layer, service layer, TanStack Query migration, semantic design tokens, aur code me jo detailed comments hain (contract history, "kyun aisa kiya" wale notes) wo genuinely maintainable hai. `api-data/*.json` ka living-contract pattern industry me kam hi dikhta hai.

Gap **architecture me nahi, assumptions me hai**. Har layer maan ke chal rahi hai ki data "reasonable" size ka hoga. Wo assumption ek demo plant pe sahi thi. Petronas pe nahi hai.

Achhi khabar: foundation solid hone ki wajah se fix **surgical** hain — F-02 aur F-03 dono ek hi `DataTable.jsx` file me virtualization add karne se theek ho jaate hain, poora rewrite nahi chahiye.

---

*Ye audit read-only tha — koi code change nahi kiya gaya.*
