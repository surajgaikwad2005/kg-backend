# Conventions

The normative rules are CLAUDE.md / GEMINI.md **46–57** (kept byte-identical —
rule 57). This document is the worked-example companion: the same rules with the
reasoning and the traps found while applying them.

---

## 1. Never call a service directly from a component

```js
// BAD
useEffect(() => { getThing(plantCode).then(setThing); }, [plantCode]);

// GOOD
const { data } = useThing(plantCode);   // wraps useQuery internally
```

Hooks live in the feature's `_queries/` folder. Keys live centrally in
`src/lib/query/keys.js`, because a mutation in one feature routinely has to
invalidate a read owned by another.

---

## 2. Every plant-scoped query: `plantCode` in the key **and** `enabled`

```js
useQuery({
    queryKey: queryKeys.domainConfig.pnidWs.clientFiles(plantCode),
    queryFn: ({ signal }) => pnidService.getClientFiles(plantCode, { signal }),
    enabled: !!plantCode,
});
```

Both halves matter:

- **In the key** — a different plant is a different cache entry, so a late
  response for the old plant cannot render against the new one. This is what made
  `DomainConfigContext`'s hand-rolled `fetchTokenRef` guard deletable.
- **`enabled`** — without it, `apiClient`'s `PLANT_CODE_REQUIRED` preflight fires
  a toast and throws before any network call. `plantCode` hydrates asynchronously
  from `localStorage`, so on first render it is `null`.

> **`refetch()` ignores `enabled`.** Any manual refresh path still needs its own
> `if (plantCode)` guard. This was a real bug caught in review.

---

## 3. Do not pass a `signal` the service will drop

`apiClient` supports `{ signal }`, but a service function only forwards it if it
was written to. Passing one into a function that ignores it is worse than not
passing it — the code then claims a cancellation that does not happen.

Thread it through the service first (`getClientFiles`, `checkExtractionFiles`,
`getFileArrayBuffer` were done this way), or leave it out.

---

## 4. Two kinds of transformation, two homes

| Kind | Example | Home |
|---|---|---|
| **Contract-level** — undoing the wire format | `unwrap()` stripping `{success, message, data}` | **the service** — every caller needs it identically |
| **View-level** — deriving a shape one screen needs | grouping, deduping, reshaping | **`select`** — memoized against cached data |

`select` **must** be module scope or `useCallback`-wrapped. An inline arrow is a
new identity every render and silently defeats its own memoization.

> **Trap:** `setQueryData` operates on the **raw cached value**, while `select`
> runs on read. If the cache holds raw data and a merge writes processed data,
> the two shapes drift. Where a mutation merges into a cache entry (the KG
> expand-merge), normalize inside the `queryFn` so the cache holds exactly one
> shape.

---

## 5. Never poll with `setInterval`

Use `useJobPolling` for start-job → poll-until-terminal, or `refetchInterval` for
periodic list refresh. Both stop on unmount.

- Job status polls: `refetchIntervalInBackground: true` — the job keeps running
  when the tab is hidden.
- Periodic list refreshes: `false` — there is nothing to learn while hidden.

`useJobPolling` spreads caller options **first**, so a caller passing
`refetchInterval` cannot silently replace the terminal-state stop or the failure
circuit-breaker.

> **An imperative poller still needs a cancellation path.** `usePollConnectorJob`
> loops until terminal or N failures. Called fire-and-forget it outlives its
> component — the leak class it was written to remove. Pass an `AbortSignal` tied
> to effect cleanup. (See finding #11 — currently unmet at 4 of 6 call sites.)

---

## 6. Every mutation declares what it invalidates

...in `onSuccess`/`onSettled`, or carries a comment saying why it is compute-only.

Three traps, all found in review:

**Do not return the invalidation promise.** `onSuccess: () => queryClient.invalidateQueries(...)`
makes `mutateAsync` wait for every refetch to finish — a confirm dialog stays
open for the whole round trip. Use `void queryClient.invalidateQueries(...)`.

**Invalidate the narrowest correct key.** Blanket-invalidating a whole subtree
can refetch expensive siblings. Deleting a plant's P&ID workspace should not
re-download every PDF just to recount pages — `removeQueries` those instead.

**A hook that invalidates is not a wired call site.** Four commit mutations exist
with zero consumers while their comments claim the invalidation contract is live.
Writing the hook is not the migration.

---

## 7. Errors: mutations toast, queries render

Mutations get a global `MutationCache` handler. Opt out with `meta: { silent: true }`;
retitle with `meta: { errorTitle: '...' }`.

**Never add a global `QueryCache.onError`** — with pollers running it would toast
every few seconds through an outage.

Queries render an inline error state with a retry control. Specifically: a failed
query must **not** collapse into the empty state. `data || fallback` renders a
500 as "no content" — check `isError` explicitly.

---

## 8. Seeding editable state from a query — the riskiest pattern here

When server data initialises something the **user can edit** (grid rows, a
selected drawing, markdown), you cannot derive it during render — that discards
edits on the next render. So it is seeded in an effect.

Three things go wrong, and all three were found in review:

1. **Re-seeding on every refetch wipes concurrent edits.** Saving row A
   invalidates the list, the refetch lands, and row B's unsaved input is replaced.
   **Merge, don't replace** — preserve rows in `isEditing`, reconcile by id.
2. **Shared cache entries refetch for reasons you did not cause.** Once
   `clientFiles` is shared, someone else's upload invalidates it and resets your
   selection. **Seed only when there is no current selection**, or when the
   current one is gone from the new payload.
3. **It trips `react-hooks/set-state-in-effect`.** Where the pattern is genuinely
   required, use a scoped, commented `eslint-disable` — do not leave CI red.

---

## 9. `structuralSharing: false` for large payloads

Query walks the whole response on every fetch looking for reusable sub-objects.
For multi-MB `ArrayBuffer`s and large graph payloads it can never find any.

Leave it **on** (default) for ordinary list/detail JSON — it is what stops tables
re-rendering on an identical poll result.

---

## 10. `isLoading` vs `isFetching`

- `isLoading` — no data yet (first load).
- `isFetching` — a request is in flight, including refetches.

A manual Refresh button over already-loaded data must use **`isFetching`**, or it
never disables and the user can queue duplicate requests (CLAUDE.md rule 31).

---

## 11. Dependency arrays

`useMutation` returns a **new object every render**. Depending on the whole result
gives every wrapping `useCallback` a fresh identity and silently defeats it
(rule 24). Destructure the stable member:

```js
const { mutateAsync: deleteThingAsync } = useDeleteThing(plantCode);
// ... deps: [deleteThingAsync]   not [deleteThing]
```

Same for query results — depend on `query.refetch`, not `query`.

`@tanstack/query/no-unstable-deps` catches the direct case but **not** when a
custom hook hides the `useQuery()` call from the rule. Those need review.

---

## 12. Verification

`npm run build` and `npm run lint` passing proves less than it looks like.

A missing import for a hook used inside a component **passes both** — `no-undef`
is off under the Next flat config and bundlers do not resolve free identifiers.
It crashes at render. That exact defect shipped and was caught by a user opening
a modal.

So, per phase:

1. Build + lint, measured as a **delta against clean `HEAD`**, never absolute.
2. **Open the migrated screen in a browser** and exercise one real path.
3. Check the Network tab: request count must be **≤** pre-migration; the known
   duplicate reads must be single requests.
4. Confirm pollers stop on terminal status **and on navigating away**.
5. Perform each mutation and confirm the listed query refetches — and that
   unrelated ones do not.
