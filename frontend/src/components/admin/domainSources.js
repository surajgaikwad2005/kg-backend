import { parseUTC } from '@/src/lib/time';

// Domain-source lifecycle model — the single source of truth shared by the
// data-config tab strip and the context-review surfaces, so every source tab
// behaves identically.
//
// Each source moves through ONE consistent lifecycle:
//
//   locked → empty → uploaded → validated → committed
//
// "locked" only applies to non-first sources until the client's required-first
// source is validated. Clients that have no required-first source (e.g. a client
// without P&ID) never lock — `requiredFirst` is null for them.

export const SOURCE_TYPES = {
    PNID: 'P&ID',
    DOCS: 'Documents',
    TS:   'Historian/Timeseries',
    SAP:  'SAP',
};

// Canonical ordering + the AdminPanel view each tab routes to. Components attach
// their own icons; everything data-shaped lives here so it stays reusable.
export const SOURCE_META = [
    { type: SOURCE_TYPES.PNID, view: 'pid-review',  shortLabel: 'P&ID' },
    { type: SOURCE_TYPES.DOCS, view: 'docs-review', shortLabel: 'Documents' },
    { type: SOURCE_TYPES.TS,   view: 'ts-review',   shortLabel: 'Historian' },
    { type: SOURCE_TYPES.SAP,  view: 'sap-joins',   shortLabel: 'SAP' },
];

// requiredFirst is null → NO source gates the others. Documents / Historian /
// SAP are never locked; every tab is independently configurable. (A backend
// `domain_sources.required_first` can still re-introduce a gate per client.)
const DEFAULT_CONFIG = {
    sources: SOURCE_META.map(s => s.type),
    requiredFirst: null,
};

// Per-industry / per-client overrides. Extend as clients are onboarded; a client
// without P&ID simply omits it from `sources` and sets `requiredFirst: null`.
//   e.g. cement: { sources: [SOURCE_TYPES.DOCS, SOURCE_TYPES.TS, SOURCE_TYPES.SAP], requiredFirst: null }
const CONFIG_BY_INDUSTRY = {};

/**
 * Resolve the active client's domain-source configuration.
 * Priority: backend `userConfig.domain_sources` → industry override → default.
 *
 * Backend shape (when available):
 *   { domain_sources: { sources: string[], required_first: string | null } }
 */
export function getDomainSourceConfig({ userConfig, industry } = {}) {
    const backend = userConfig?.domain_sources;
    if (backend && Array.isArray(backend.sources) && backend.sources.length > 0) {
        return {
            sources: backend.sources,
            requiredFirst: backend.required_first ?? null,
        };
    }
    if (industry && CONFIG_BY_INDUSTRY[industry]) return CONFIG_BY_INDUSTRY[industry];
    return DEFAULT_CONFIG;
}

export const SOURCE_STATUS = {
    LOCKED:    'locked',
    EMPTY:     'empty',
    UPLOADED:  'uploaded',
    VALIDATED: 'validated',
    PROCESSED: 'processed',
    COMMITTED: 'committed',
};

/**
 * Does the required-first source qualify to UNLOCK the other tabs?
 *
 * The gate opens as soon as the required-first source is PROCESSED (its pipeline
 * finished) — not only after full connection validation. `validated`/`committed`
 * also count since they imply processing already happened. This is the one place
 * the unlock timing is decided; to gate later (e.g. only after validation),
 * drop `processedTypes` from the check here.
 *
 * @param {string|null} requiredFirst source that gates the others (or null = no gate)
 * @param {object} ctx { processedTypes, validatedTypes, committedTypes }
 * @returns {boolean}
 */
export function isRequiredFirstUnlocked(requiredFirst, {
    processedTypes = [],
    validatedTypes = [],
    committedTypes = [],
} = {}) {
    if (!requiredFirst) return true; // client has no gating source (e.g. no P&ID)
    return processedTypes.includes(requiredFirst)
        || validatedTypes.includes(requiredFirst)
        || committedTypes.includes(requiredFirst);
}

/**
 * Single source of truth for a tab's lifecycle state, so the tab strip and the
 * review surfaces never disagree.
 *
 * @param {string} type   source type (one of SOURCE_TYPES)
 * @param {object} ctx
 * @param {string[]} ctx.configuredTypes  sources that have data uploaded
 * @param {string[]} ctx.processedTypes   sources whose pipeline has finished (opens the gate)
 * @param {string[]} ctx.validatedTypes   sources whose data has been verified
 * @param {string[]} ctx.committedTypes   sources written to the database
 * @param {string|null} ctx.requiredFirst source that gates the others (or null)
 * @returns {string} one of SOURCE_STATUS
 */
export function getSourceStatus(type, {
    configuredTypes = [],
    processedTypes = [],
    validatedTypes = [],
    committedTypes = [],
    requiredFirst = null,
} = {}) {
    if (committedTypes.includes(type)) return SOURCE_STATUS.COMMITTED;
    // Processed is the final "pipeline done" state — overrides validated.
    if (processedTypes.includes(type)) return SOURCE_STATUS.PROCESSED;
    // Validated = staged to CDM (yellow). Intermediate between uploaded and processed.
    if (validatedTypes.includes(type)) return SOURCE_STATUS.VALIDATED;
    if (configuredTypes.includes(type)) return SOURCE_STATUS.UPLOADED;

    if (requiredFirst && type !== requiredFirst
        && !isRequiredFirstUnlocked(requiredFirst, { processedTypes, validatedTypes, committedTypes })) {
        return SOURCE_STATUS.LOCKED;
    }
    return SOURCE_STATUS.EMPTY;
}

// ── Upload-batch bucketing ───────────────────────────────────────────────────
// A source TYPE stays in processedSources even after the user hits "Add Files" on
// it, so completion must be judged per upload ENTRY against that type's last run —
// never by the type-level processed/committed Sets alone.
//
// `source.timestamp` is a naive UTC string ("2026-07-30 04:59:58") produced by
// `new Date().toISOString()` at every creation site, so it MUST be parsed with
// parseUTC. Plain `new Date(str)` reads it as LOCAL time and shifts the epoch by the
// viewer's UTC offset, which silently buckets every fresh upload as already-processed.

/** Last moment `type` was processed or committed (0 = never run). */
export function sourceCutoff(type, { processedAt = {}, committedAt = {} } = {}) {
    return Math.max(processedAt?.[type] || 0, committedAt?.[type] || 0);
}

/**
 * Split upload entries into batches covered by a pipeline run vs newer ones.
 *
 * Entries that came from GET /flow/state carry `isProcessed` — the backend's
 * own per-file verdict — and that always wins. The timestamp comparison below
 * is now only the fallback for entries that exist ONLY on the client: an upload
 * still in flight, or one that failed before the server ever recorded it.
 * (That fallback is also where the naive-UTC parsing bug lived, which is why
 * `parseUTC` is mandatory here and not plain `new Date`.)
 */
export function splitSourceEntries(configuredSources = [], { processedAt, committedAt } = {}) {
    const processedEntries = [];
    const unprocessedEntries = [];
    configuredSources.forEach(source => {
        const isCovered = typeof source.isProcessed === 'boolean'
            ? source.isProcessed
            : (() => {
                const cutoff = sourceCutoff(source.type, { processedAt, committedAt });
                return cutoff > 0 && parseUTC(source.timestamp).getTime() <= cutoff;
            })();
        (isCovered ? processedEntries : unprocessedEntries).push(source);
    });
    return { processedEntries, unprocessedEntries };
}

/**
 * Does a Documents `subtype` (e.g. "Inspection Reports") have any upload batch
 * that is NOT failed, other than `excludeId`? Backs both the sidebar's
 * per-subtype status (useSourceTabs.js) and the `uploadedDocSubtypes` cleanup
 * that runs when an upload fails (useDocSourceModal.js / ConfigModal.jsx) —
 * uploadedDocSubtypes is set optimistically at submit time, before the result
 * is known, and previously was never unset on failure. That let a subtype
 * whose ONLY upload attempt failed still read as "uploaded" — and once the
 * type-level Documents commit had happened once (commitDocsContext commits
 * every reviewed subtype in one call, so committedTypes is type-level, not
 * per-subtype — this part is correct by design), that stale "uploaded" flag
 * was enough to show the subtype as COMMITTED in the sidebar despite never
 * having a single successful file.
 */
export function hasActiveDocSubtype(configuredSources = [], subtype, excludeId = null) {
    return configuredSources.some(s =>
        s.type === 'Documents' && s.subtype === subtype && s.status !== 'failed' && s.id !== excludeId
    );
}

/**
 * Types with at least one upload batch newer than their last run AND ready to run.
 * `running` (mid-upload — no data yet) and `failed` (nothing usable) are excluded,
 * even though those entries still SHOW in the unprocessed list.
 */
export function getUnprocessedTypes(configuredSources = [], { processedAt, committedAt } = {}) {
    const { unprocessedEntries } = splitSourceEntries(configuredSources, { processedAt, committedAt });
    return [...new Set(
        unprocessedEntries
            .filter(s => s.status !== 'running' && s.status !== 'failed')
            .map(s => s.type)
    )];
}
