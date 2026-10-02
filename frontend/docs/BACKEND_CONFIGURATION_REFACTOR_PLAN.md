# Backend Configuration Refactor — Final Plan

## Goal

Application ke API endpoints fixed rahenge, lekin deployment ke according backend ka **base URL** aur **gateway prefix** `.env.local` se easily change kiya ja sakega.

Final upstream URL ka rule:

```text
BASE_URL + PREFIX + FIXED_ENDPOINT
```

Example:

```text
http://172.16.0.12
+ /api/decisionops-pod1/p0/cdm
+ /configRouter/plants
```

## Current State Verification

- Browser-side service functions `src/services` se local Next.js routes, jaise `/api/plant-id`, call karti hain.
- Server-side proxy configuration `src/app/api/_lib/backends.js` mein hai.
- Base URLs `.env.local` se resolve hoti hain.
- Gateway prefixes abhi `BACKEND_PATHS` mein hardcoded hain.
- Fixed API endpoints individual `route.js` files mein defined hain.
- Actual configuration file ka naam `backends.js` hai, `backend.js` nahi.

## Naming Decisions

### 1. Sirf `MODEL_STUDIO` use hoga

`MODEL_FACTORY` old logical name hai aur application mein abhi bhi kaafi Model Studio route files aur comments mein present hai.

Plan:

- `BACKEND_ENV.MODEL_FACTORY` remove karna.
- `BACKEND_PATHS.MODEL_FACTORY` remove karna.
- Har `backend: "MODEL_FACTORY"` ko `backend: "MODEL_STUDIO"` mein migrate karna.
- Comments aur documentation mein old `MODEL_FACTORY` logical backend references ko `MODEL_STUDIO` karna.
- Env naming `SERVICE_MODEL_STUDIO_URL` aur `SERVICE_MODEL_STUDIO_PREFIX` hogi.
- Actual upstream endpoint segment mein agar backend contract ke karan `modelFactory` text required hai, woh configurable prefix ya fixed endpoint ka part reh sakta hai. Logical application name phir bhi `MODEL_STUDIO` hi hoga.

Reason: Ek hi feature/backend ke liye do logical names configuration ko confusing banate hain aur wrong prefix resolve hone ka risk create karte hain.

### 2. `PLANT_CODE_ID` separate backend hoga

Current code mein `PLANT_CODE_ID` aur `DOMAIN_CONFIGURATION` same
`SERVICE_DOMAIN_CONFIGURATION_URL` reuse karte hain. Yeh current deployment detail hai,
final ownership model nahi.

Final structure:

```text
PLANT_CODE_ID base URL
+ PLANT_CODE_ID prefix
+ fixed plant endpoint
```

Plan:

- `PLANT_CODE_ID` logical backend key retain karna.
- Iske liye dedicated `SERVICE_PLANT_CODE_ID_URL` add karna.
- Iske liye dedicated `SERVICE_PLANT_CODE_ID_PREFIX` add karna.
- Plant proxy routes mein `backend: "PLANT_CODE_ID"` unchanged rakhna.
- Fixed plant endpoints route files mein hi rakhna:
  - `/plants`
  - `/plants/{plantCode}`
  - `/plants/{plantCode}/purgePreview`
- `DOMAIN_CONFIGURATION` aur `PLANT_CODE_ID` ki configuration ko independently resolve karna.
- Migration ke waqt dedicated Plant Code ID variables ko current working host/prefix values
  se initialize kiya ja sakta hai, lekin future mein dono independently change ho sakenge.

Reason: Plant Code ID ki deployment ownership separate hai. Aaj same host use hone ke
bawajood uski URL aur prefix ko Domain Configuration se couple rakhna future backend
migration ko difficult banayega.

## Implementation Plan

### Step 1: `.env.local` mein URL aur prefix separate karna

Har logical backend ke liye independent URL aur prefix variables add/update honge:

```env
SERVICE_DOMAIN_CONFIGURATION_URL=http://172.16.0.12
SERVICE_DOMAIN_CONFIGURATION_PREFIX=/api/decisionops-pod1/p0/cdm

SERVICE_PLANT_CODE_ID_URL=http://172.16.0.12
SERVICE_PLANT_CODE_ID_PREFIX=/api/decisionops-pod1/p0/cdm/configRouter

SERVICE_MODEL_STUDIO_URL=http://172.16.0.12
SERVICE_MODEL_STUDIO_PREFIX=/api/decisionops-pod2/p2/modelFactory
```

Jin backends ka prefix nahi hai, unke liye explicit empty value rakhi jayegi:

```env
SERVICE_VISUALS_PREFIX=
```

Reason: Host/IP/port aur gateway mount independently change kiye ja sakenge, bina application endpoints edit kiye.

### Step 2: Backend configuration ko single structured mapping banana

`backends.js` mein separate `BACKEND_ENV` aur hardcoded `BACKEND_PATHS` ke badle logical backend se URL env aur prefix env ka centralized mapping banega.

Conceptual example:

```js
MODEL_STUDIO: {
    urlEnv: "SERVICE_MODEL_STUDIO_URL",
    prefixEnv: "SERVICE_MODEL_STUDIO_PREFIX",
}
```

Reason: Ek backend ki complete infrastructure configuration ek place par visible aur maintainable rahegi.

### Step 3: Resolver mein safe URL composition

`resolveBackend(name)`:

- Base URL required validate karega.
- Prefix env variable resolve karega.
- Explicit empty prefix allow karega.
- Base URL ki trailing slashes normalize karega.
- Prefix ki leading/trailing slashes normalize karega.
- Duplicate slash ya missing slash ke bina final base-plus-prefix return karega.
- Missing/unknown configuration par clear error dega.

Reason: Environment values ke formatting difference se malformed upstream URLs nahi banenge.

### Step 4: `MODEL_FACTORY` migration

Application-wide inventory ke basis par:

- Model Studio optimizer routes
- ML model routes
- Forecast routes
- Expression routes
- Dashboard ka relevant route

mein old logical backend name replace hoga.

Migration ke time har route ka current resolved target compare karna zaroori hai, kyunki current code mein:

- `MODEL_FACTORY` common `/api/decisionops-pod2/p2/modelFactory` prefix use karta hai.
- Kuch `MODEL_STUDIO` routes bare host ke saath paths jaise `/p1_kpi/...` use karte hain.

Har route ko final Model Studio contract ke according classify karke endpoint path set kiya jayega, taaki rename ke baad prefix double-add ya remove na ho.

Reason: Sirf text replacement karna unsafe hoga; existing aliases abhi different prefix behavior rakhte hain.

### Step 5: Plant Code ID configuration separation

`PLANT_CODE_ID` ko dedicated env URL aur prefix se resolve karaya jayega. Current
`SERVICE_DOMAIN_CONFIGURATION_URL` reuse remove hoga.

Plant proxy routes ka logical backend `PLANT_CODE_ID` aur browser-side
`plantCodeIdService` ka local URL `/api/plant-id` unchanged rahega.

Reason: UI aur fixed endpoint contracts stable rahenge, jabki Plant Code ID backend
host/prefix ko Domain Configuration se independently change kiya ja sakega.

### Step 6: Remaining hardcoded prefix audit

`src/app/api` ke catch-all routes mein present route-level prefixes ko classify karenge:

- Infrastructure/gateway prefix → `.env.local`
- Stable API resource path → route ka fixed endpoint

Examples:

- `/api/decisionops-pod1/...` environment prefix hai.
- `/connectors/pnid`, `/ontology`, `/optimizer/...` API endpoint/resource paths hain.

Reason: Har string ko env mein move karna sahi nahi hoga. Sirf changeable deployment prefix configurable hona chahiye; business API endpoints code mein fixed rahenge.

### Step 7: Agent Factory special prefix cleanup

`AGENT_FACTORY_PREFIX` helper aur `BACKEND_PATHS.AGENT_FACTORY` ke roles inspect karke naming clear ki jayegi:

- Gateway/deployment mount → `SERVICE_AGENT_FACTORY_PREFIX`
- Stable sub-application/resource endpoint → fixed route path

Reason: Do alag prefix layers ko same concept treat karne se duplicated path ban sakta hai.

### Step 8: Documentation and environment consistency

- Error message mein stale `.env.services` reference ko actual supported env file/config terminology se update karna.
- Relevant comments mein old backend names remove karna.
- Agar repository mein `.env.example` maintain hoti hai, toh same URL/prefix keys wahan document karna without real credentials.

Reason: Runtime behavior aur developer setup instructions consistent rahenge.

## Verification Plan

Implementation ke baad:

1. Har logical backend ka resolved `base URL + prefix` verify karna.
2. `MODEL_FACTORY` ke zero remaining executable references confirm karna.
3. `PLANT_CODE_ID` ke dedicated URL/prefix env mapping aur route references verify karna.
4. Representative fixed routes aur catch-all routes ke final upstream targets test karna.
5. Model Studio ki har route family mein missing ya duplicate `modelFactory` prefix check karna.
6. Plant endpoints ke final targets verify karna:

```text
.../cdm/configRouter/plants
.../cdm/configRouter/plants/{plantCode}
.../cdm/configRouter/plants/{plantCode}/purgePreview
```

7. Empty-prefix backends verify karna.
8. Missing base URL/prefix configuration ke error cases test karna.
9. Lint/build ya focused automated tests run karna.
10. Confirm karna ki `src/services` ke local `/api/...` contracts unchanged hain.

## Expected Result

- Infrastructure changes ke liye mainly `.env.local` update karni hogi.
- Fixed backend endpoints application code mein stable rahenge.
- Application mein sirf `MODEL_STUDIO` logical name use hoga.
- Plant Code ID independently configurable backend ke roop mein modeled hoga.
- Duplicate backend aliases aur hardcoded deployment prefixes remove ho jayenge.

## Scope Boundary

Yeh document implementation plan hai. Is step mein application source code ya `.env.local` configuration modify nahi ki gayi hai.
