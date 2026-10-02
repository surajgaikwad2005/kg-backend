/**
 * equipmentIdentity.js
 * Resolving "which drawing belongs to the node the user just clicked".
 *
 * The detail page is reached from a workflow node, so all it receives is the
 * node's `componentType` (the route's `[id]`) and its `?label=`. Neither is a
 * catalog key: the backend emits types such as `api_suctionisolationvalve`
 * while the component catalog stores `pnid_suctionisolationvalve` and the
 * built-in catalog stores `suction_scrubber`. Matching therefore has to happen
 * on a normalized form rather than on the literal string — which is why the old
 * page, keying a 12-entry hardcoded map off the raw id, drew a grey placeholder
 * rectangle for every component that wasn't one of the six original A/B-train
 * assets.
 *
 * Module scope, pure functions — no React, no fetching (Rule 22).
 */

/**
 * Source-prefixes a componentType/catalog key can carry. Anchored and required
 * to end in `_`, so a genuine name that merely starts with these letters (e.g.
 * `air_cooler`, `apiheader`) keeps its first characters instead of being
 * silently mangled into `r_cooler`.
 */
const SOURCE_PREFIX = /^(?:api|pnid|ai)_/;

/**
 * Collapse any identifier to its comparable core:
 *   `api_suctionisolationvalve` → `suctionisolationvalve`
 *   `pnid_suction_isolation_valve` → `suctionisolationvalve`
 *   `SuctionIsolationValve` → `suctionisolationvalve`
 */
export const normalizeComponentKey = (value) =>
    String(value || '')
        .toLowerCase()
        .replace(SOURCE_PREFIX, '')
        .replace(/[^a-z0-9]/g, '');

/**
 * Find the backend component whose `name` describes this node.
 *
 * `label` is tried first: it is the node's own caption, which the P&ID
 * generator sets from the component name, so it is the most reliable of the
 * two. `componentType` is the fallback for nodes renamed on the canvas.
 *
 * @param {{name?: string, description?: string, code?: string}[]} components
 * @param {{componentType?: string, label?: string}} node
 * @returns {object | null}
 */
export function findBackendComponent(components, { componentType, label }) {
    if (!Array.isArray(components) || components.length === 0) return null;

    for (const candidate of [label, componentType]) {
        const needle = normalizeComponentKey(candidate);
        if (!needle) continue;
        const hit = components.find((c) => c?.name && normalizeComponentKey(c.name) === needle);
        if (hit) return hit;
    }
    return null;
}

/**
 * Find the matching entry in a built-in catalog keyed by ids like
 * `suction_scrubber` (COMPONENT_CATALOG from IndustrialSvgs).
 *
 * @param {Record<string, {render: Function, label?: string, desc?: string}>} catalog
 * @param {{componentType?: string, label?: string}} node
 * @returns {{key: string, entry: object} | null}
 */
export function findCatalogEntry(catalog, { componentType, label }) {
    if (!catalog) return null;
    const keys = Object.keys(catalog);
    if (keys.length === 0) return null;

    for (const candidate of [componentType, label]) {
        const needle = normalizeComponentKey(candidate);
        if (!needle) continue;
        const key = keys.find(
            (k) =>
                normalizeComponentKey(k) === needle ||
                normalizeComponentKey(catalog[k]?.label) === needle
        );
        if (key) return { key, entry: catalog[key] };
    }
    return null;
}

/**
 * Human-readable name for the header when the URL carries no `?label=`.
 * Only word-boundary information that actually exists in the id is used —
 * `suction_scrubber` becomes "Suction Scrubber", while an already-collapsed
 * `api_suctionisolationvalve` can only become "Suctionisolationvalve". The
 * resolved catalog entry's own name is preferred over this wherever available.
 */
export function formatEquipmentId(rawId) {
    const stripped = String(rawId || '').replace(SOURCE_PREFIX, '');
    if (!stripped) return 'Equipment';
    return stripped
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Ordered hints for matching this node against the live P1 equipment list.
 * Most specific (the node's own caption) first — `resolveEquipmentByHints`
 * takes the first hit, so ordering is the preference.
 */
export function buildEquipmentHints({ label, componentType }) {
    const hints = [];
    const push = (value) => {
        const trimmed = String(value || '').trim().toLowerCase();
        if (trimmed && !hints.includes(trimmed)) hints.push(trimmed);
    };

    push(label);
    push(String(componentType || '').replace(SOURCE_PREFIX, '').replace(/_/g, ' '));
    push(String(componentType || '').replace(SOURCE_PREFIX, ''));
    return hints;
}
