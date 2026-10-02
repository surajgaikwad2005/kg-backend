'use client';

/**
 * useSourceLifecycle — Data Source Integration lifecycle state.
 *
 * 2026-08-17: rewritten from a localStorage cache into a server-derived view.
 * The screen used to rebuild itself on reload from eleven browser keys, which
 * meant a hard refresh, a second browser, or a second admin each saw a
 * different reality, and "clear browsing data" erased the plant's whole config
 * history. State now comes from two reads:
 *
 *   GET /connectors/state → the lifecycle Sets + timestamps + real file counts
 *   GET /flow/state       → the configured-source rows (per file, per batch)
 *
 * Nine keys were retired (see RETIRED_PLANT_KEYS in ../connectorState.js). Two
 * deliberately remain in localStorage because no endpoint returns them yet:
 * `admin_context_params_<plant>` / `admin_job_ids_<plant>` (crop box, model
 * choice, selected files) — removing those would be a data-loss bug, not a fix.
 *
 * ── The public shape is unchanged on purpose ─────────────────────────────────
 * Roughly fifteen files read `configuredSources` / `processedSources` /
 * `markProcessed` / … straight off AdminPanelContext. Every one of those names
 * still exists here with the same type, so this migration is a data-source
 * swap, not a context rewrite (the same discipline useDsiQueries.js applied in
 * Phase 1e). Decomposing that context stays a separate job.
 *
 * ── How local and server state coexist ───────────────────────────────────────
 * Server data is the source of truth; local state is only an OPTIMISTIC layer
 * on top of it, and it is self-healing:
 *
 *   · `localSources` holds an upload that is still in flight (or one that
 *     failed and therefore never reached the server). mergeSourceEntries drops
 *     each one the moment the server reports the same file names back.
 *   · `overrides` holds an explicit local mark/unmark (the Reconfigure and
 *     Reprocess flows). Each override is pruned as soon as the server agrees
 *     with it, so a stale local flag can never outlive the truth it was
 *     anticipating.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useConnectorsState, useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';
import { useFlowFiles } from '@/src/components/admin/_queries/useFlowFiles';
import { mergeSourceEntries, clearRetiredStorage } from '@/src/components/admin/connectorState';

const EMPTY_SET = new Set();
const EMPTY_LIFECYCLE = {
    processedSources: EMPTY_SET, validatedSources: EMPTY_SET, committedSources: EMPTY_SET,
    configuredTypes: EMPTY_SET, processedAt: {}, committedAt: {}, countsByType: {},
};

/**
 * Apply local marks on top of a server-derived Set.
 *
 * Each mark is `{ value, base }`: what the user asked for, and what the server
 * said at the moment they asked. A mark stays live only while the server still
 * reports `base` — the instant the server moves, the mark has been answered (or
 * overtaken) and is ignored.
 *
 * That comparison is what makes the optimistic layer self-expiring WITHOUT a
 * pruning effect. Storing a bare boolean instead would be a real bug, not just
 * a style issue: an "unmark processed" would keep suppressing the Processed
 * badge forever, including after a later re-upload legitimately processed the
 * source again.
 */
function applyOverrides(serverSet, marks) {
    const types = Object.keys(marks);
    if (types.length === 0) return serverSet;
    let resolved = null;
    for (const type of types) {
        const mark = marks[type];
        const onServer = serverSet.has(type);
        if (onServer !== mark.base) continue;   // server moved on — mark is spent
        if (onServer === mark.value) continue;  // already agrees — nothing to do
        resolved ??= new Set(serverSet);
        if (mark.value) resolved.add(type); else resolved.delete(type);
    }
    return resolved ?? serverSet;
}

export function useSourceLifecycle({ selectedPlantId }) {
    const plantCode = selectedPlantId?.id ?? null;

    // Every flow's files in ONE request — `flow` is optional on /flow/state, so
    // the lazy per-flow fan-out (and the requestAllFlowFiles() widener screens
    // used to call to opt into it) is gone. There is nothing left to widen: one
    // paged read already carries every flow.
    const { data: server = EMPTY_LIFECYCLE, isLoading: isStateLoading, isError: isStateError } =
        useConnectorsState(plantCode);
    const { entries: serverSources, filesByFlow, isLoading: isFilesLoading } =
        useFlowFiles(plantCode);

    // ── Optimistic local layer ────────────────────────────────────────────────
    const [localSources, setLocalSources] = useState([]);
    const [hiddenIds, setHiddenIds] = useState(EMPTY_SET);
    const [overrides, setOverrides] = useState({ processed: {}, validated: {}, committed: {} });
    const [localProcessedAt, setLocalProcessedAt] = useState({});
    const [localCommittedAt, setLocalCommittedAt] = useState({});

    // ── Purely local UI state (rule 39 — never persisted, never shared) ───────
    const [expandedSourceId, setExpandedSourceId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, title: '', message: '', onConfirm: () => {} });
    const [editingRow, setEditingRow] = useState(null);
    const [editingRowData, setEditingRowData] = useState({});

    // Reset every local layer when the plant changes — a leftover optimistic
    // entry from the previous plant must never render against the new one.
    //
    // Adjusted during render rather than in an effect, which is React's own
    // recommendation for "reset state when a prop changes": an effect would
    // render one frame of the OLD plant's optimistic rows against the NEW
    // plant's server state before correcting itself.
    const [renderedPlant, setRenderedPlant] = useState(plantCode);
    if (renderedPlant !== plantCode) {
        setRenderedPlant(plantCode);
        setLocalSources([]);
        setHiddenIds(EMPTY_SET);
        setOverrides({ processed: {}, validated: {}, committed: {} });
        setLocalProcessedAt({});
        setLocalCommittedAt({});
    }

    // One-time cleanup: the moment the server successfully answers for a plant,
    // erase that plant's retired keys so the two sources of truth can never
    // coexist. Gated on a real response — clearing them while the backend is
    // unreachable would throw away the only copy the user still has.
    const clearedPlants = useRef(new Set());
    useEffect(() => {
        if (!plantCode || isStateLoading || isStateError) return;
        if (clearedPlants.current.has(plantCode)) return;
        clearedPlants.current.add(plantCode);
        clearRetiredStorage(plantCode);
    }, [plantCode, isStateLoading, isStateError]);

    // ── Derived, context-facing values ────────────────────────────────────────
    const configuredSources = useMemo(() => {
        const visible = hiddenIds.size === 0 ? serverSources : serverSources.filter((s) => !hiddenIds.has(s.id));
        return mergeSourceEntries(visible, localSources);
    }, [serverSources, localSources, hiddenIds]);

    const processedSources = useMemo(
        () => applyOverrides(server.processedSources, overrides.processed), [server.processedSources, overrides.processed]);
    const validatedSources = useMemo(
        () => applyOverrides(server.validatedSources, overrides.validated), [server.validatedSources, overrides.validated]);
    const committedSources = useMemo(
        () => applyOverrides(server.committedSources, overrides.committed), [server.committedSources, overrides.committed]);

    const processedAt = useMemo(
        () => ({ ...server.processedAt, ...localProcessedAt }), [server.processedAt, localProcessedAt]);
    const committedAt = useMemo(
        () => ({ ...server.committedAt, ...localCommittedAt }), [server.committedAt, localCommittedAt]);

    // ── Writers (same names/signatures the whole admin tree already calls) ────

    // Latest server values, readable from inside the state updaters below
    // WITHOUT becoming dependencies — a dependency here would give every writer
    // a new identity on each refetch and re-render every consumer of the
    // context (rule 24). Written in an effect rather than during render: the
    // writers only ever run from event handlers and async callbacks, which is
    // strictly after the commit that updated this.
    const serverRef = useRef({ sources: serverSources, sets: null });
    useEffect(() => {
        serverRef.current = {
            sources: serverSources,
            sets: {
                processed: server.processedSources,
                validated: server.validatedSources,
                committed: server.committedSources,
            },
        };
    }, [serverSources, server.processedSources, server.validatedSources, server.committedSources]);

    /**
     * Accepts the same array-or-updater argument useState did. The updater sees
     * the MERGED list so existing `prev.map(...)` / `prev.filter(...)` call
     * sites keep working, but only client-owned entries are written back —
     * server rows are re-derived from the query cache on the next render.
     */
    const setConfiguredSources = useCallback((updater) => {
        setLocalSources((prevLocal) => {
            const merged = mergeSourceEntries(serverRef.current.sources, prevLocal);
            const next = typeof updater === 'function' ? updater(merged) : updater;
            return (next || []).filter((entry) => !entry.fromServer);
        });
    }, []);

    /** Record a local mark together with the server value it was made against. */
    const setOverride = useCallback((kind, type, value) => {
        setOverrides((prev) => ({
            ...prev,
            [kind]: { ...prev[kind], [type]: { value, base: Boolean(serverRef.current.sets?.[kind]?.has(type)) } },
        }));
    }, []);

    const markProcessed   = useCallback((type) => setOverride('processed', type, true),  [setOverride]);
    const markValidated   = useCallback((type) => setOverride('validated', type, true),  [setOverride]);
    const unmarkProcessed = useCallback((type) => setOverride('processed', type, false), [setOverride]);
    const unmarkValidated = useCallback((type) => setOverride('validated', type, false), [setOverride]);
    const unmarkCommitted = useCallback((type) => setOverride('committed', type, false), [setOverride]);

    const markProcessedAt = useCallback((type) => setLocalProcessedAt((prev) => ({ ...prev, [type]: Date.now() })), []);
    const markCommittedAt = useCallback((type) => setLocalCommittedAt((prev) => ({ ...prev, [type]: Date.now() })), []);

    /**
     * The three `set*Sources` setters used to be raw Set setters, and call
     * sites use them as `prev => new Set([...prev, type])` (three commit flows
     * in usePipelineOrchestration do exactly that). Each is re-expressed as an
     * override write — diffing the caller's returned Set against the current
     * one — so those call sites keep working while the server stays
     * authoritative.
     */
    const makeSetSources = useCallback((kind) => (updater) => {
        setOverrides((prev) => {
            const serverSet = serverRef.current.sets?.[kind] ?? EMPTY_SET;
            const current = applyOverrides(serverSet, prev[kind]);
            const next = typeof updater === 'function' ? updater(current) : updater;
            const marks = { ...prev[kind] };
            next.forEach((type) => { marks[type] = { value: true, base: serverSet.has(type) }; });
            current.forEach((type) => {
                if (!next.has(type)) marks[type] = { value: false, base: serverSet.has(type) };
            });
            return { ...prev, [kind]: marks };
        });
    }, []);

    const setProcessedSources = useMemo(() => makeSetSources('processed'), [makeSetSources]);
    const setValidatedSources = useMemo(() => makeSetSources('validated'), [makeSetSources]);
    const setCommittedSources = useMemo(() => makeSetSources('committed'), [makeSetSources]);

    const markSourceFailed = useCallback((sourceId, message = 'Upload failed — backend unreachable') => {
        setLocalSources((prev) => prev.map((s) => s.id === sourceId ? {
            ...s,
            status: 'failed',
            logs: [...(s.logs || []), message],
            errors: [...(s.errors || []), message],
        } : s));
    }, []);

    /**
     * Removes the row from view. There is no backend delete for a staged file
     * yet, so a server-backed row is hidden for the session rather than
     * destroyed — the file itself still exists upstream and will return on the
     * next plant switch. Wire this to a real DELETE the moment one exists.
     */
    const handleDeleteSource = useCallback((id) => {
        setDeleteConfirm({
            open: true,
            title: 'Delete Source',
            message: 'Are you sure you want to remove this configured source? This action cannot be undone.',
            onConfirm: () => {
                setLocalSources((prev) => prev.filter((s) => s.id !== id));
                setHiddenIds((prev) => new Set(prev).add(id));
                setDeleteConfirm((prev) => ({ ...prev, open: false }));
            },
        });
    }, []);

    const invalidateConnectorState = useInvalidateConnectorState(plantCode);

    return {
        configuredSources, setConfiguredSources,
        processedSources, setProcessedSources,
        validatedSources, setValidatedSources,
        committedSources, setCommittedSources,
        committedAt, processedAt,
        expandedSourceId, setExpandedSourceId,
        deleteConfirm, setDeleteConfirm,
        editingRow, setEditingRow,
        editingRowData, setEditingRowData,
        markProcessed, markProcessedAt, markValidated, unmarkProcessed, unmarkValidated, unmarkCommitted, markCommittedAt,
        markSourceFailed, handleDeleteSource, invalidateConnectorState,

        // ── Server-backed additions ──────────────────────────────────────────
        /** Real per-connector file counts — replaces the client-side timestamp guess. */
        countsByType: server.countsByType,
        /** Types the backend has any file for, regardless of lifecycle stage. */
        configuredTypes: server.configuredTypes,
        /** Raw per-flow file rows, for duplicate-name checks and per-subtype lists. */
        flowFilesByFlow: filesByFlow,
        isLifecycleLoading: isStateLoading || isFilesLoading,
        isLifecycleError: isStateError,
    };
}
