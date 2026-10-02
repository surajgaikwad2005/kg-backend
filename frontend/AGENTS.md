# Development Standards

You are a Staff/Senior Frontend Engineer.

For every task:

1. Prioritize reusable and scalable architecture.
2. Follow Component-Based Architecture.
(Component Length Rules: Next.js has no strict code limit, but industry best practice prefers 50–150 lines per file. If a component exceeds 300 lines, refactor it by extracting custom hooks, helper utilities, or sub-components to ensure codebase maintainability and optimal performance.)
3. Use Tailwind CSS exclusively.
4. act as world's one of the best senior frontend developer and UI/UX designer. Build premium, modern, polished UI.
5. Add smooth animations and micro-interactions.
6. Ensure responsive design - UI should be responsive in nature for mobile, tablet, laptop, desktop view.
7. Add loading, empty, and error states.
8. Every button must include cursor-pointer.
9. Every modal must have same enter/exit animations.
10. Maintain accessibility standards.
11. Optimize performance and avoid unnecessary re-renders.
<!-- 12. Remove dead code and unused imports. -->
13. Deliver production-ready code only but right now we are in development phase.
14. Prefer composition over duplication.
15. Keep components small, reusable, and maintainable.
16. Always create scalable, reusable, and configurable components similar to modern UI libraries (shadcn/ui, Radix, MUI). Prefer composition over duplication, expose customization through props, support className extension, and avoid creating one-off components for specific screens or features.
17. For security, always use backend/proxy API routes instead of calling external APIs directly from the frontend. Never expose API keys, tokens, secrets, or sensitive endpoints in client-side code.
18. for clickable things(like button links) use cursor-pointer.
19. don't use any library like axios use raw fetch
20. for loading use shimmer effect live skeleton loading with animation which support light/dark/system theme.
21. ask required useraskquestion with recommendation in hinglish with explanation.

## API & Proxy Architecture

All backend communication follows ONE flow. The browser never calls a real backend
directly — every call goes through a local `/api/*` proxy route on our Next.js server:

    Component → Service (src/services) → apiClient → /api/* Route Handler (src/app/api) → Real Backend

> **Components no longer call services directly** — they go through a TanStack Query
> hook, which sits above the service layer without changing anything below it:
> `Component → useQuery/useMutation → Service → apiClient → /api/* → Backend`.
> See "Data Fetching — TanStack Query" (rules 46–57) for the query/mutation
> conventions. Everything in THIS section still applies unchanged.

**`src/services/*` vs `src/app/api/*` (know the difference):**
- `src/services/*` runs in the BROWSER. Pure async functions (e.g. `getKpiMonitoring()`)
  that only know the local `/api/...` path — no backend URL, no token, no secrets.
  Components call services; components never `fetch` directly.
- `src/app/api/*` route handlers run on the SERVER. They are the proxy: attach auth and
  forward to the real backend. Backend URL + token live ONLY here, so they never reach
  client code.
- One line: `services/` = which `/api` path to call (client, safe); `app/api/` = where
  that path actually goes (server, holds URL + secrets).

**Why this flow** (maps to our core principles):
- Security: no secrets/URLs in client code (rule 17).
- Scalability + single source of truth: backend addresses live in one registry, so a
  backend move is a one-file change.
- Code quality / less duplication: reusable service functions + one proxy factory instead
  of copy-pasted `fetch` logic.
- Easy debugging: every proxied request logs `[Proxy:<BACKEND> <METHOD>] --> <url>` and a
  status line on the server, and errors return a consistent `{ error, details }` shape.

**Plant Code — Required in Body/Query, Never as a Header (Rule 0 for every API call):**

Every service function that operates on plant-scoped data MUST send `plant_code` (or the
domain's literal field name, e.g. `plant_code_id` — see the Backend API Refactor Intake
Protocol) in ONE of these two places, regardless of whether the backend Swagger marks it
as required or optional:

1. **Request body** — include it as a field in the JSON body for plain-JSON POST/PUT/PATCH.
2. **Query params** — include it in `params` for GET/DELETE (no body), AND for multipart
   (`FormData`) POST/PUT/PATCH calls where the backend declares it as a `Query()` param
   even though the call is a POST — do not assume every scalar on a multipart endpoint is
   a form field. Verify each scalar field's placement individually per endpoint — don't
   assume the whole set is query or the whole set is form just because one field turned
   out to be query on a different endpoint. Case in point: `symbolic-ai`'s
   `addEquipmentColumn`/`generateMarkdown` (both multipart) each bounced between
   query-only, body-only, and both-at-once across several rounds of live 4xx testing
   before landing on a confirmed final answer, per direct user instruction (2026-07-22):
   `plant_code_id` goes in the multipart **body** as a form field on both — not query —
   even though the actual file(s) also live in that same `FormData` body. See
   `api-data/symbolic-ai.json` for the full per-endpoint placement history.

   Also note the error SHAPE difference: FastAPI's own auto-validation 422s are
   `{"detail": [{"type", "loc", "msg", "input"}]}` (array) — reliable for pinpointing
   location. This backend's `generateMarkdown` instead returns its OWN app-level 400 with
   `{"detail": {"success": false, "message": "...", "data": null}}` (object, no `loc`) —
   which cannot tell you WHERE a field was expected, only that it was missing by name. Do
   not assume placement from a message-only error; only a `loc`-bearing error or a Swagger
   schema can confirm placement.

Do NOT also send it as a custom `X-PlantCodeId` (or any other custom) HTTP header. An
earlier version of this rule required a duplicate `X-PlantCodeId` header on every call;
it was removed app-wide because no backend ever consumed it — plant scoping was always
driven entirely by the body/query field, and the header was dead weight duplicated on
every single request. Do not reintroduce it.

The value comes exclusively from `useApp().plantCode` (AppContext) in components/hooks,
and is passed down into the service call as a parameter. Services must NEVER read
AppContext directly — they are pure functions that receive `plant_code` as an argument.

Canonical pattern for POST/PUT/PATCH:
```js
// service function
export const doSomething = (plant_code, payload) =>
    apiClient.post('/api/some/endpoint', { plant_code, ...payload });

// calling component / hook
const { plantCode } = useApp();
doSomething(plantCode, { foo: 'bar' });
```

Canonical pattern for GET/DELETE (no body):
```js
export const getSomething = (plant_code, params) =>
    apiClient.get('/api/some/endpoint', { params: { plant_code, ...params } });
```

This rule overrides Swagger — even if a new backend endpoint does not list `plant_code`
in its schema, ALWAYS send it in the body/query. The backend may silently depend on it
for data segregation.

**Rules for API work:**
1. Add a proxy route with the shared factory, not a hand-written handler:
   `export const { POST } = createProxy({ backend: "MODEL_FACTORY", path: "/p1_x/y" })`
   (use `createCatchAllProxy` for `[...path]` routes). See `src/app/api/_lib/proxy.js`.
2. Resolve backend base URLs only via `resolveBackend(name)` in
   `src/app/api/_lib/backends.js`. Never hardcode an IP/host or read `process.env` in a route.
   Some domains sit behind a shared API gateway (e.g. `decisionops-pod2`) whose mount path
   is fixed per domain but NOT part of the bare host in `.env*`. For those, add an entry to
   `BACKEND_PATHS` in `backends.js` with the full gateway + domain prefix (originally added
   for `AUTH`, `RISK_TEMPLATE`, `SYMBOLIC_AI` — the pattern has since grown to 17+ domains,
   so check the current `BACKEND_PATHS` entries in `backends.js` rather than assuming which
   domains do or don't need it) — keep `SERVICE_*_URL` in `.env*` as just
   the bare host, and each route's own `path:` as only the leaf operation name. Never bake
   the gateway prefix into individual route files or `.env*` — one wrong assumption here
   breaks every endpoint in the domain at once (this bit us on `SYMBOLIC_AI`: a manually
   edited `.env.local` host without the gateway prefix produced a domain-wide 404 until the
   prefix was moved into `BACKEND_PATHS` instead).
3. Do NOT add auth manually — the token is injected globally: AuthInterceptor attaches
   `Authorization: Bearer` on the client; `src/proxy.js` — the actual Next.js middleware
   (the project intentionally renamed `middleware.js` to `proxy.js`; its own header
   comment says "Do NOT add a second proxy/middleware file") — injects BOTH
   `Authorization: Bearer <token>` and `Cookie: access_token=<token>` on the server for
   every `/api/*` request. Re-adding either per-route causes duplicate/drifting headers.

   Why both schemes: the backend(s) behind this app's gateways authenticate at least some
   endpoints via a cookie literally named `access_token`, not solely via
   `Authorization: Bearer` — confirmed via (a) a live Swagger "Try it out" screenshot for
   `GET /p0/cdm/configRouter/plants`, whose declared security parameter is `access_token`,
   type `string (cookie)`; (b) `src/app/api/auth/refresh/route.js`, which already
   authenticates its own call to `/refreshToken` with `Cookie: refresh_token=<token>` and
   reads the ROTATED token back out of the backend's raw `Set-Cookie: access_token=...`
   response header, not the JSON body; (c) live 401s on RISK_TEMPLATE (an unrelated
   domain/gateway) with a refresh-succeeds-but-retry-still-401 signature, which rules out
   a stale token and points at a transport/scheme mismatch. Our app stores that value
   under a DIFFERENT cookie name on our own domain (`auth_token`, httpOnly) and must
   translate it back to the name the backend expects on every outgoing call.

   This is injected in TWO places because of the two coexisting proxy mechanisms — do not
   re-derive either header per-route, both chokepoints already exist:
     - `src/proxy.js` merges `Cookie: access_token=<token>` into whatever Cookie header
       the browser already sent, for the `next.config.js` rewrite-routed CDM/connectors
       endpoints (which bypass route handlers entirely).
     - `src/app/api/_lib/proxy.js`'s `forward()` — the core of `createProxy`/
       `createCatchAllProxy` — sets `Cookie: access_token=<token>` unconditionally next to
       `Authorization: Bearer <token>`, because it builds its upstream headers from
       scratch and does NOT auto-forward the browser's raw Cookie header the way
       `src/proxy.js` does.

   A few hand-rolled routes that don't use either factory (e.g.
   `src/app/api/domain-configuration/timeseries/data-quality/analyze/route.js`) build
   their own headers from scratch too — they need their own copy of this same
   Authorization + Cookie logic, not a `fetch` that forwards only Authorization.
4. Query params and request bodies pass through automatically; IDs travel as `?id=...`.
5. Keep a route custom ONLY when it transforms the RESPONSE (the factory has no response
   hook) — e.g. `investigate-observe`. Otherwise always use the factory.
6. The CDM/Domain Configuration cluster no longer uses `next.config.js` rewrites — it was
   fully migrated (2026-07-20) onto route handlers under `src/app/api/domain-configuration/`,
   organized by connector feature (`pnid/`, `pnid-workspace/`, `sap/`, `timeseries/`,
   `documents/`, each owning its own context review/commit + connector-specific config +
   upload/jobs endpoints) plus a small shared group (`config/user-config`, `ontology/`,
   `pipeline/`). Note: `log-management` is NOT nested under `domain-configuration/` despite
   being a CDM-adjacent feature — it's its own top-level route at
   `src/app/api/log-management/[...path]/route.js`.
   `next.config.js` has no CDM-related rewrite rules anymore — every CDM/domain-configuration
   route is a real, reachable factory-based handler like every other domain in this app.
7. Backend URLs must be set in `.env.local` (see `.env.example`).
8. Client code (components, pages, hooks, context) must NEVER call `fetch('/api/...')`
   directly. Every backend call goes through a domain service in `src/services/` (one file
   per domain, e.g. `workspaceService.js`), and services use `apiClient` — not raw `fetch` —
   so error handling and JSON parsing stay uniform. Streaming endpoints may use
   `apiClient.raw`, but still wrapped inside a service function. When you touch a file that
   still calls `/api/*` directly, migrate it to a service (boy-scout rule).
9. Group services into domain subfolders for readability (e.g.
   `src/services/workspace/`, `src/services/cdm/`) instead of one flat directory; keep
   `apiClient.js` at the root as the shared client.

## Backend API Refactor Intake Protocol

When the user pastes a table of backend API endpoints (columns: #, Method, Path,
Headers, Description, Request Body sample, Response Body sample) describing a
refactored/updated backend contract for an existing domain, follow this protocol
before writing any code:

1. Identify the domain's existing files: the service module under src/services/**,
   its proxy routes under src/app/api/**, and every component/hook that imports
   that service. Read them in full — do not assume shape from memory.
2. Diff each pasted endpoint against the current implementation:
   - Path: compare literally against the proxy route's `path:` argument. Do not
     guess whether a prefix (e.g. "/p1_x/") still applies — if the doc's path
     doesn't match current code, this is a required question, not an assumption.
     If the user shares a Swagger/OpenAPI URL alongside the table, decode its
     `operationId` instead of guessing: FastAPI auto-generates it as
     `<function_name>_<path_with_slashes_as_underscores>_<method>` — e.g.
     `set_columns_p1_symbolicAi_setColumns_post` decodes to path segments
     `p1`, `symbolicAi`, `setColumns` joined by `_`, method `post` — BUT this
     is ambiguous about where the real `/` boundaries are: FastAPI's default
     `generate_unique_id` runs `re.sub(r"\W", "_", name + path)`, which
     collapses BOTH `/` and any literal `_` already in the path to the same
     `_` character. So `/p1_symbolicAi/setColumns` (2 segments) and
     `/p1/symbolicAi/setColumns` (3 segments) decode to the byte-identical
     operationId — the operationId alone cannot tell you which slash pattern
     is real (confirmed on the symbolic-ai domain: the real path turned out
     to be the 3-segment `/p1/symbolicAi/setColumns`, not a 2-segment guess).
     Only trust a decoded path once you've either (a) fetched the actual
     Swagger JSON/UI (not just the deep-link) and read the route's literal
     `path` field — Swagger UI shows this unambiguously above each operation,
     separate from the operationId — or (b) the user has independently
     confirmed a real request against it succeeded with that exact path.
     Treat a bare operationId decode as a hypothesis to verify, not a fact —
     flag the ambiguity to the user explicitly rather than presenting a
     guessed slash pattern as confirmed. Never change a `SERVICE_*_URL` or an
     existing, empirically-verified path in `.env*`/`backends.js` from a
     guessed decode — that is always a required question, especially for
     auth/session-critical domains.
   - Method: confirm against the route's `methods`.
   - Auth scheme: check the Swagger's declared **security scheme type** for the endpoint
     (`cookie`, `header`/`apiKey`, or `http bearer`) before assuming
     `Authorization: Bearer` works — do not assume every endpoint on a domain shares the
     same scheme. This cost real debugging time across every domain: at least one
     endpoint's Swagger declares `access_token` as a `string (cookie)` parameter, not a
     header (confirmed live on `GET /p0/cdm/configRouter/plants`), which is why
     `src/proxy.js` and `src/app/api/_lib/proxy.js` both send `Authorization: Bearer` AND
     `Cookie: access_token=<token>` on every call. If a new domain's Swagger declares a
     different scheme, flag it before writing the route.
   - Request body: diff field-by-field, including the plant/client identifier
     field. Use the field name literally shown in the doc, even if it differs
     from another domain's convention (e.g. `plant_code_id` vs `plant_code`) —
     backend-specific naming overrides the generic CLAUDE.md example above.
   - Response body: diff shape against every place in the UI that consumes it
     (destructured fields, raw-text vs JSON, envelope wrapping). Trace every
     consumer file, not just the service function.
3. Classify each endpoint: unchanged / additive-safe / breaking. For breaking
   changes, list every consumer file that must change.
4. Surface unresolved ambiguities (path format, field naming, endpoint
   consolidation/merges, adjacent-cleanup scope, env/base-URL changes) via
   AskUserQuestion — in Hinglish, each option carrying a clear recommendation +
   one-line reasoning (per rule 21). Do not silently guess on anything that
   changes file scope or touches `.env*`.
5. After confirmation, implement: update the service functions, proxy route(s),
   and every consumer in the same pass. Do not leave an old endpoint/service
   export/route alive "just in case" once its replacement is confirmed — delete
   it. Do not delete or comment out code, or drop existing comments, that isn't
   actually superseded by the contract change. If a comment becomes inaccurate
   because of the change (e.g. "returns raw markdown" after a JSON-envelope
   migration), correct it — don't leave it stale and don't delete it outright.
6. Keep Rule 0 (the plant/client identifier — body for POST/PUT/PATCH, query params for
   GET/DELETE, never a custom header; see "Plant Code" above) intact using the literal
   field name confirmed in step 4, sourced from `useApp().plantCode` (or the domain's
   equivalent) threaded down as a parameter — never read AppContext inside a service file.
7. Report a short migration summary (endpoint → verdict → files touched)
   instead of only diffing silently.
8. Persist whatever API data the user shares for the domain — endpoint tables, Swagger
   deep-links, curl output, raw request/response bodies from browser DevTools, error
   payloads, anything that describes the real contract — into a single living reference
   file: `api-data/<domain-slug>.json` (e.g. `api-data/symbolic-ai.json`). Create the file
   the first time API data is shared for that domain; on every later message in the same
   domain, UPDATE that same file in place rather than creating a new one or leaving the
   new information only in chat. Capture per endpoint: method, full real URL, local proxy
   route + file, service function signature, description, content-type, request
   body/params (with each field's placement — body vs query vs form — and a
   `confirmed: true/false` flag backed by real evidence, not assumption), response body
   sample, and any open/unresolved issues (e.g. a field whose placement is still failing)
   called out explicitly rather than silently guessed. This file is the single source of
   truth for that domain's live contract — consult it before re-deriving anything from
   memory, and keep it current as more ground truth arrives.

## Performance Rules

22. Never define constants, arrays, or objects inside a component body if they don't
    depend on props or state. Define them at module scope (top of file, outside the
    component) so they are not re-created on every render.
    BAD:  function MyComp() { const OPTIONS = ['a', 'b']; ... }
    GOOD: const OPTIONS = ['a', 'b']; function MyComp() { ... }

23. Memoize derived values and expensive computations with useMemo. Any .map(),
    .filter(), or .reduce() on props/state that feeds into JSX must be wrapped in
    useMemo unless the array has ≤3 items and the operation is trivial.

24. Wrap event handler functions that are passed as props to child components in
    useCallback so children do not re-render unnecessarily.

25. Never put more than 20 state values into a single React context object. If a
    context grows beyond this, split it by domain (e.g. NavContext, FormContext,
    EntityContext). Each context must have a single, focused responsibility.

## Design & Styling Rules

26. Never use hardcoded Tailwind color classes such as text-blue-600, bg-slate-50,
    text-emerald-500, text-red-400, border-slate-200, etc. Always use the semantic
    design tokens defined in globals.css @theme:
      text-brand, bg-brand-hover, bg-brand-muted, text-success, text-danger, text-warning,
      text-info, text-text-primary, text-text-secondary, text-text-muted, text-text-subtle,
      bg-surface, bg-surface-2, bg-canvas, border-border, border-border-strong,
      bg-highlight, bg-highlight-hover, overlay, overlay-hover, chart-1 through chart-5,
      toast-success, toast-danger, toast-warning, toast-info.
    Note: the danger/error status token is text-danger/bg-danger/border-danger (backed by
    --color-danger) — there is no "-error" token. Using text-error/bg-error/border-error
    silently renders no color since that class doesn't exist.
    If a token does not exist for the color you need, add it to globals.css first.

27. Never use inline style={{ }} for colors, spacing, or layout.
    All other styling must use Tailwind utility classes.

28. Whenever you read or write any UI code (component, page, or layout), verify it is
    fully customizable from Settings and correctly supports every Appearance and
    Interface feature: it must respond to all 12 theme variants (not just light/.dark),
    the accent color, font family, font size (--do-font-scale), layout density, motion/
    animation speed, blur toggle, and geometry (--do-radius) — via the semantic tokens
    and data-attributes in globals.css / CustomizationContext, never one-off hardcoded
    values that silently opt a component out of a Settings control. If a component adds
    a new visual property, mention explicitly which Settings controls it does and does
    not respond to, rather than leaving it unstated.

## Accessibility Rules

29. Every modal or dialog must have:
      role="dialog"
      aria-modal="true"
      aria-labelledby pointing to the modal title's id
    Every modal close button must have aria-label="Close".

30. Every icon-only button (no visible text label) must have an aria-label describing
    its action. Example: <button aria-label="Delete row"><Trash2 /></button>.

31. Every async button (triggers a fetch/submit) must set disabled={isLoading} and
    include aria-busy={isLoading} during the loading state so screen readers
    announce the busy state.

32. Form inputs must have an associated label via htmlFor/id or aria-labelledby.
    Never render a bare <input> without a label association.

## Code Quality Rules

33. Never use alert(), confirm(), or prompt() in any component, hook, or utility.
    Use the project's useToast() hook for all user-facing notifications.
    alert() is a blocking call and breaks the UX completely.

34. Never use setTimeout or setInterval as a substitute for a real API call.
    Mock timers are acceptable only in unit tests (__tests__/). Production code
    must call the real service function and show a loading state while waiting.

35. Never use array index as a React key in .map() calls:
      BAD:  items.map((item, i) => <Row key={i} />)
      GOOD: items.map((item) => <Row key={item.id} />)
    If items have no stable ID, create one (nanoid, crypto.randomUUID) at the
    data source, not in the render function.

36. Never commit console.log, console.warn, or console.error statements in
    component or hook files. Debug logs must be removed before a PR is raised.
    The only allowed server-side logs are in src/app/api/ route handlers for
    request tracing. Exception: a console.* call gated behind an `if (__DEV__)`
    check for deliberate request/response/token-lifecycle debug tracing (e.g.
    src/services/apiClient.js, src/components/layout/AuthInterceptor.jsx) is
    intentional dev instrumentation that never fires in production — it is not
    the leftover debug cruft this rule targets, and should not be stripped.

37. Never put mock data (sample arrays, fake response objects) in production
    source files. Mock data belongs exclusively in __mocks__/ or __fixtures__/
    directories and must never be imported in non-test code.

## State & Routing Rules

38. Client-side view state that a user could want to share or bookmark must be
    stored in the URL using useSearchParams (Next.js App Router) or a query-param
    library — not only in React state or context. Context is the cache; the URL
    is the source of truth.

39. Local UI state (which row is being edited, whether a dropdown is open, a
    hover flag) must never be stored in a shared React context. Keep it in
    useState inside the component that owns the interaction. Only lift state
    when two or more sibling subtrees genuinely need it.

## Dependency Security Rules

40. Before installing any npm package, verify it is actively maintained and has no
    open High/Critical Dependabot or npm audit vulnerabilities. Run `npm audit` after
    every `npm install`. Never add a package that is abandoned on npm (no updates in
    2+ years) or that has unpatched High/Critical CVEs without explicit team approval.
    BAD:  npm install xlsx          (abandoned on npm registry — use CDN tarball instead)
    GOOD: npm install https://cdn.sheetjs.com/xlsx-0.20.2/xlsx-0.20.2.tgz

41. Use `"overrides"` in package.json to force-patch vulnerable transitive dependencies
    when the parent package has not yet released a fix. Document every override with a
    comment (in the PR description) naming the CVE/GHSA and the parent that pulls it in.
    Never silently override a dependency without a recorded reason.
    Example: dompurify overridden to 3.4.11 because monaco-editor@0.55.1 pulls 3.2.7
    which has GHSA-cmwh-pvxp-8882 (XSS via setConfig hook pollution).

42. Transitive dependency overrides must be verified with a full `npm run build` after
    `npm install`. Some host packages (especially next.js) are tightly coupled to specific
    sub-dependency versions. If the build breaks, investigate compatibility before shipping.

43.  application is in development mode and we are testing for now so most of the time we have to use not secure route as well.

44. Don't make any changes in the (dashboard)/extra folder. don't touch it or read it

45. When two or more sibling routes share the same persistent chrome — `<Sidebar />`,
    `<PageHeader />`, or any other app shell — put that shell in a route-segment
    `layout.jsx`, never duplicated inside each `page.jsx`. Next.js App Router only
    preserves a component's instance (state, mount effects, no remount flicker) across
    a navigation when it lives in a `layout.jsx` shared by both routes; the identical
    JSX repeated in two separate `page.jsx` files gets fully unmounted and remounted on
    every navigation between them, even though it looks visually identical.
    BAD:  admin/decision-template/page.jsx renders <Sidebar/><PageHeader/>...
          admin/decision-template/[id]/page.jsx renders <Sidebar/><PageHeader/>... again
          → navigating between them remounts Sidebar + PageHeader every time
    GOOD: admin/decision-template/layout.jsx renders <Sidebar/><PageHeader .../>{children}
          → both page.jsx files return only their own content; Sidebar/PageHeader persist
    If the shared header needs per-page data (title, breadcrumbs), compute it inside the
    layout itself via `usePathname()`/`useSearchParams()` — a layout can be a Client
    Component and read the current URL directly, since it does not receive props from
    the page it wraps. When adding a new nested route (e.g. a `[id]` page) next to an
    existing `page.jsx` that already renders its own Sidebar/PageHeader, extract that
    shell into a `layout.jsx` for the shared folder first, rather than copy-pasting the
    shell into the new page too.

## Data Fetching — TanStack Query

TanStack Query (@tanstack/react-query v5) is the ONLY way client code reads or
writes server state. It sits ABOVE the service layer; it does not replace it.
The flow in "API & Proxy Architecture" above gains one step at the front:

    Component → useQuery/useMutation → Service (src/services) → apiClient
      → /api/* Route Handler → Real Backend

Rule 19 ("don't use any library like axios use raw fetch") is unchanged:
apiClient's raw `fetch` is still the only transport. TanStack Query is a cache
and request-state manager, not an HTTP client.

The shared foundation lives in `src/lib/query/` — import from `@/src/lib/query`,
never reach into the individual modules.

46. Never call a service function directly from a component or a hand-rolled
    useEffect. Wrap it in useQuery (reads) or useMutation (writes). No new
    `useState(loading) + useEffect(fetch)` pairs.
    BAD:  useEffect(() => { getThing(plantCode).then(setThing); }, [plantCode]);
    GOOD: const { data } = useThing();  // wraps useQuery internally

47. Query HOOKS are colocated with their feature in a `_queries/` folder next to
    `_hooks/`. Query KEYS are central, in `src/lib/query/keys.js` — cross-feature
    invalidation requires a shared vocabulary (a mutation in one feature routinely
    has to invalidate a read owned by another).

48. Every plant-scoped query MUST carry `plantCode` as the second element of its
    key AND set `enabled: !!plantCode`. Without `enabled`, apiClient's
    PLANT_CODE_REQUIRED preflight fires a toast and throws before any network
    call. plantCode in the key is also what makes plant switching correct for
    free — a different plant is a different cache entry, so a late response for
    the old plant can never render against the new one. Never hand-roll a
    stale-response guard again.
    GOOD: useQuery({ queryKey: queryKeys.domainConfig.pnidWs.clientFiles(plantCode),
                     queryFn: ({ signal }) => pnidService.getClientFiles(plantCode, { signal }),
                     enabled: !!plantCode })

49. Never poll with setInterval. Use `useJobPolling` (src/lib/query) for
    start-job → poll-until-terminal flows, or `refetchInterval` for periodic list
    refresh. Both stop automatically on unmount. Job-status polls set
    refetchIntervalInBackground: true (the job keeps running when the tab is
    hidden); periodic LIST refreshes set it to false.

50. Every mutation must declare what it invalidates in onSuccess/onSettled. A
    mutation with no invalidateQueries and no setQueryData is a bug unless the
    endpoint is genuinely compute-only (e.g. highlightComponents,
    calculateDerivedPathMetrics) — in which case say so in a comment.

51. Retries: never retry status 0 (PLANT_CODE_REQUIRED), 401, 403, 404, or 422.
    401 is already refreshed-and-replayed once by AuthInterceptor BELOW apiClient
    — a Query-level retry stacks on top of that and multiplies requests during an
    outage. Use the shared `shouldRetry` predicate from
    src/lib/query/queryClient.js rather than writing a new one.

52. Mutations toast on error (via the global MutationCache handler); queries
    render an inline error state with a retry control. Never add a global
    QueryCache.onError — with refetchInterval pollers running it would toast every
    few seconds for the whole duration of an outage. Opt a mutation out with
    meta: { silent: true }; retitle it with meta: { errorTitle: '...' }.

53. Do NOT put in the query cache: SSE/streaming responses, upload progress
    percentages (local state — they fire ~100x per upload), canvas/editor state,
    chat transcripts (each turn is a mutation; the transcript is append-only local
    state), or localStorage workflow progress that no endpoint returns.

54. Two kinds of transformation, two homes. CONTRACT-level transforms (unwrapping
    the {success, message, data} envelope, renaming wire fields) stay in the
    service — every caller needs them identically and api-data/*.json documents
    them. VIEW-level derivation (grouping, deduping, reshaping for one screen)
    goes in `select`, where it is memoized against the cached data instead of
    running on every render. The `select` fn MUST be defined at module scope or
    wrapped in useCallback — an inline arrow is a new identity every render and
    silently defeats its own memoization (rule 22 applied to a new surface).

55. Set `structuralSharing: false` on queries whose payload is large and never
    partially shared — binary ArrayBuffers (P&ID images/PDFs), big graph payloads.
    Query otherwise walks the entire response on every fetch looking for reusable
    sub-objects it can never find. Leave it ON (the default) for ordinary
    list/detail JSON, where it is what stops tables re-rendering on an identical
    poll result.

56. Commit hygiene: a `migrate(...)` commit contains ONLY the query conversion.
    Bug fixes found while migrating ship as `fix(...)`, adjacent cleanup (skeleton
    standardization, dead-code removal) as `chore(...)`. Test before committing:
    "if this were reverted, would anything besides the data-fetching layer
    change?" If yes, split it. A migration phase that cannot be reverted cleanly
    is not a phase.

57. CLAUDE.md and GEMINI.md are byte-identical mirrors. Any rule added to one MUST
    be added to the other in the same commit — otherwise agents reading GEMINI.md
    keep following superseded conventions.

# Dependency & Licensing Rules

This is a commercial proprietary SaaS/PaaS product. Source code is not distributed to customers.

## Allowed Licenses
<!-- libraries/packages which we have already installed or in future we will install before installation pls verify that package -->
Prefer and auto-approve:

- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC
- Zlib

## Review Required

Before recommending or adding these licenses, explain why an approved alternative cannot be used:

- MPL-2.0
- LGPL-2.1
- LGPL-3.0
- EPL
- CDDL

## Prohibited

Do not recommend, install, or introduce dependencies using:

- GPL
- AGPL
- SSPL
- BSL
- Commons Clause
- Unknown License
- No License
- Any commercial/proprietary license requiring purchase

## Dependency Policy

Before adding a new package:

1. Check whether an existing dependency already solves the problem.
2. Prefer reusing existing libraries over adding new ones.
3. Avoid multiple libraries for the same purpose.
4. Minimize dependency count and bundle size.
5. Prefer actively maintained libraries.

## Required For Every New Dependency

Provide:

- Package name
- License
- Purpose
- Why existing libraries cannot solve the requirement

If license information cannot be verified, do not recommend the package.

we are using RBAC (customise by admin role for user role)