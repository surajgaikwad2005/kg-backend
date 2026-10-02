'use client';

/**
 * useDsiQueries — Data Source Integration reads and the pipeline job poll
 * (Phase 1e).
 *
 * SCOPE IS DELIBERATELY CONSERVATIVE. AdminPanelContext's four nested contexts
 * and ~180 exposed keys keep their exact public shape; ~30 consumer files under
 * components/admin/views/** are untouched. Only the data source changes.
 * Decomposing that context is a separate, post-migration job — doing both at
 * once would mean rewriting data flow and context topology in one diff.
 *
 * The anti-pattern this replaces, repeated in all four form hooks:
 *
 *     if (view !== 'pid-review' || !plantId || data.length > 0 || loading) return;
 *
 * That is a hand-rolled cache with no expiry: once `data.length > 0` it never
 * refetched, so committing and returning to the tab showed pre-commit data until
 * a full remount. `enabled` replaces the view/plant gate and `staleTime`
 * replaces the length check.
 *
 * NOTE: commits are NOT wrapped in useMutation here. usePipelineOrchestration.js
 * calls domain-configuration/common's commitContext(connector, body) directly
 * and invalidates nothing in this cache — a pre-existing gap (see
 * docs/tanstackquery/code-review-findings.md #6) this file doesn't fix. A set
 * of useCommit*Context mutation wrappers used to live here but had zero
 * consumers and were removed (2026-08-13) when the four per-connector commit
 * endpoints they wrapped were replaced by the unified commitContext().
 */
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import * as cdm from '@/src/services/domain-configuration/common';
import * as docs from '@/src/services/domain-configuration/documents';
import { deriveConnectorLifecycle } from '@/src/components/admin/connectorState';

// ── Review contexts ──────────────────────────────────────────────────────────
// `params` is part of each key: these payloads are scoped by batch/job, so two
// different batches are genuinely different data, not a refetch of the same.
// All four read through the single unified cdm.getContext(connector, ...) —
// see domain-configuration/common/contextService.js.

/**
 * Group a flat rows[] array (each row tagged with a `category` field) by
 * category for the Docs Review UI. VIEW-level derivation (rule 54) — lives
 * in `select` so it's memoized against the cached data instead of
 * re-grouping on every render. Module-scope so its identity is stable.
 */
function selectDocsContext(data) {
    const rows_by_category = {};
    for (const row of data?.rows || []) {
        const cat = row.category || 'uncategorized';
        (rows_by_category[cat] ||= []).push(row);
    }
    return { ...data, rows_by_category };
}

export function usePnidContext(plantCode, params, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.domainConfig.context.pnid(plantCode, params),
        queryFn: () => cdm.getContext({ connector: 'pnid', plantCode, ...params }),
        enabled: enabled && !!plantCode,
    });
}

/**
 * Imperative, cached fetch of the P&ID review context.
 *
 * usePnidFormState derives its request parameters from several localStorage
 * reads (batch → file-name lists → configured-source fallbacks) that have to run
 * at fetch time, so a declarative query would need those inputs lifted into
 * render state first — which is the god-context decomposition this phase
 * deliberately defers. `fetchQuery` keeps the existing imperative flow while
 * still reading and writing the same cache entry `usePnidContext` above uses
 * — though nothing currently invalidates it on commit (see file header).
 */
export function useFetchPnidContext(plantCode) {
    const queryClient = useQueryClient();
    return (params) =>
        queryClient.fetchQuery({
            queryKey: queryKeys.domainConfig.context.pnid(plantCode, params),
            queryFn: () => cdm.getContext({ connector: 'pnid', plantCode, ...params }),
        });
}

export function useDocsContext(plantCode, params, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.domainConfig.context.docs(plantCode, params),
        queryFn: () => cdm.getContext({ connector: 'documents', plantCode, ...params }),
        select: selectDocsContext,
        enabled: enabled && !!plantCode,
    });
}

export function useTsContext(plantCode, params, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.domainConfig.context.ts(plantCode, params),
        queryFn: () => cdm.getContext({ connector: 'timeseries', plantCode, ...params }),
        enabled: enabled && !!plantCode,
    });
}

export function useSapContext(plantCode, params, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.domainConfig.context.sap(plantCode, params),
        queryFn: () => cdm.getContext({ connector: 'sap', plantCode, ...params }),
        enabled: enabled && !!plantCode && !!params?.table,
    });
}

/**
 * SAP-linked findings feeds (aif | gloc | lopc, added 2026-08-17) — same
 * unified getContext() router as pnid/docs/ts/sap above, one hook covering
 * all three since they share an identical param/response shape (no batchId/
 * files, just pagination + the new `unmatchedOnly` filter — see
 * contextService.js's getContext doc comment).
 */
export function useFeedContext(connector, plantCode, params, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.domainConfig.context.feed(plantCode, connector, params),
        queryFn: () => cdm.getContext({ connector, plantCode, ...params }),
        enabled: enabled && !!plantCode && !!connector,
    });
}

/**
 * Commit a findings feed batch — POST /context/commit with just
 * { connector, plant_code_id }. Per the 2026-08-17 contract update, `rows` is
 * deliberately omitted: the backend commits whatever was already staged for
 * this connector/plant at upload time, so unlike commitPidContext/
 * commitDocsContext/commitTsContext/commitSapContext in
 * usePipelineOrchestration.js there is no client-side row payload to
 * assemble. `connector` is passed as the mutate variable (not baked into the
 * hook) so one instance can serve whichever of aif/gloc/lopc the caller needs.
 */
export function useCommitFeedContext(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Commit failed' },
        mutationFn: (connector) => cdm.commitContext(connector, { plant_code_id: plantCode }),
        onSuccess: (_data, connector) => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.context.feed(plantCode, connector) });
            // Also invalidate the server-driven lifecycle rollup (see
            // useConnectorsState/useFlowState below) so the sidebar's
            // Committed badge — once useSourceTabs consumes it for feed
            // types too — reflects this commit without a manual refresh.
            void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.connector.state(plantCode) });
            // The whole flow-state prefix, not one flow: the per-file list is a
            // single plant-wide payload now, so there is no per-flow entry to
            // target (and `flowState`'s second argument is the lifecycle
            // filter, not a flow name).
            void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.connector.flowStateAll(plantCode) });
        },
    });
}

// ── Other DSI reads ──────────────────────────────────────────────────────────

/** Document-type catalog for the upload modal. Reference data. */
export function useDocumentTypes(plantCode) {
    return useQuery({
        queryKey: queryKeys.domainConfig.docs.types(plantCode),
        queryFn: () => docs.getDocumentTypes(plantCode),
        enabled: !!plantCode,
        staleTime: 5 * 60_000,
    });
}

export function useDocsKnowledgeGraph(plantCode) {
    return useQuery({
        queryKey: queryKeys.domainConfig.docs.knowledgeGraph(plantCode),
        queryFn: () => docs.getDocsKnowledgeGraph(plantCode),
        enabled: !!plantCode,
    });
}

export function useDataQuality(plantCode, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.domainConfig.dataQuality(plantCode),
        queryFn: () => cdm.analyzeDataQuality(plantCode),
        enabled: enabled && !!plantCode,
    });
}

export function useExistingPnid(plantCode) {
    return useQuery({
        queryKey: queryKeys.domainConfig.connector.existingPnid(plantCode),
        queryFn: () => cdm.getExistingPnid(plantCode),
        enabled: !!plantCode,
    });
}

// ── Server-side lifecycle state (2026-08-17) ─────────────────────────────────
// The pair of reads that let Data Source Integration survive a hard refresh
// without localStorage. See src/components/admin/connectorState.js for the
// derivations and api-data/cdm-{connectors,flow}-state.json for the contracts.

/**
 * VIEW-level derivation (rule 54): the raw connectors[] array is never what a
 * consumer wants — every one of them wants the lifecycle Sets. Defined at
 * module scope so its identity is stable and `select` actually memoizes.
 */
function selectConnectorLifecycle(data) {
    return deriveConnectorLifecycle(data?.connectors);
}

/**
 * Per-connector lifecycle rollup for the whole plant — ONE request that backs
 * the entire tab strip (status badge + "Processed Files - X | Unprocessed
 * Files - Y" counts) for all seven connectors.
 *
 * Kept deliberately fresh: an upload or pipeline run in another tab (or by
 * another admin) changes this, and the whole point of the migration is that two
 * admins see the same state. `staleTime: 0` plus invalidation from the
 * mutations means a remount always re-reads.
 */
export function useConnectorsState(plantCode) {
    return useQuery({
        queryKey: queryKeys.domainConfig.connector.state(plantCode),
        queryFn: ({ signal }) => cdm.getConnectorsState(plantCode, { signal }),
        select: selectConnectorLifecycle,
        enabled: !!plantCode,
    });
}

/**
 * Per-file list for ONE flow, shaped as `{ files }` like it always was.
 *
 * No longer its own request: `flow` is optional on /flow/state, so the whole
 * plant is read once (useFlowFilesQuery) and sliced per flow client-side. This
 * re-export keeps the call sites in useDocsFormState / usePnidFormState working
 * unchanged while they now share one payload with the rest of the screen.
 *
 * @param {string} plantCode
 * @param {string} flow  'pnid' | 'docs' | 'ts' | 'ts_values' | 'sap' | 'aif' | 'gloc' | 'lopc'
 */
export { useFlowStateForFlow as useFlowState } from './useFlowFiles';

/**
 * ONE file's full row (GET /flow/state/{flowUid}). `data` is the row itself —
 * the endpoint does NOT wrap it in `files[]` the way the list does.
 *
 * Retries are off: the two ways this fails are a 404 (unknown flow_uid) and a
 * 400 (flowUid <= 0), neither of which a retry can fix (rule 51).
 *
 * @param {string} plantCode
 * @param {number|string} flowUid
 */
export function useFlowStateRow(plantCode, flowUid, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.domainConfig.connector.flowStateRow(plantCode, flowUid),
        queryFn: ({ signal }) => cdm.getFlowStateRow(plantCode, flowUid, { signal }),
        enabled: enabled && !!plantCode && flowUid != null,
        retry: false,
    });
}

/**
 * ONE connector's rollup plus its taxonomy breakdown
 * (GET /connectors/{connector}/state?include_groups=true).
 *
 * `useConnectorsState` above already returns all seven rollups in a single
 * call, so only reach for this when the `groups[]` sub-rows are actually
 * needed — otherwise it is a second request for data already cached.
 *
 * @param {string} plantCode
 * @param {string} connector  a CONNECTOR name (seven values), not a flow name
 */
export function useConnectorState(plantCode, connector, { includeGroups = true, enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.domainConfig.connector.stateOne(plantCode, connector, includeGroups),
        queryFn: ({ signal }) => cdm.getConnectorState(plantCode, connector, { includeGroups, signal }),
        enabled: enabled && !!plantCode && !!connector,
    });
}

/**
 * Reset one file to stage='uploaded' / status='pending' so the pipeline picks
 * it up again — the per-file reprocess action.
 *
 * Invalidates the whole `flow-state` prefix rather than patching the row into
 * the list: a reset also moves the connector rollup's counts (one file leaves
 * `processed`, joins `pending`), and the two reads are derived from the same
 * server-side table, so letting them refetch together is what keeps them
 * agreeing (rule 50).
 */
export function useResetFlowState(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Reprocess failed' },
        mutationFn: (flowUid) => cdm.resetFlowState(plantCode, flowUid),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.connector.flowStateAll(plantCode) });
            void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.connector.state(plantCode) });
        },
    });
}

/**
 * Remove one file from the flow entirely — the grid's row-delete action.
 * Resolves to `{ deleted: <flow_uid> }`, not the row.
 *
 * Same invalidation pair as the reset above, for the same reason: a deleted
 * file changes both the file list and every count rolled up from it.
 */
export function useDeleteFlowState(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Delete failed' },
        mutationFn: (flowUid) => cdm.deleteFlowState(plantCode, flowUid),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.connector.flowStateAll(plantCode) });
            void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.connector.state(plantCode) });
        },
    });
}

/**
 * Re-read the lifecycle after anything that changes it (an upload finishing, a
 * pipeline run, a commit).
 *
 * Rule 50 in spirit: the writes it follows are imperative service calls rather
 * than useMutation instances (uploads report byte-level progress through XHR
 * and the commits orchestrate several calls in sequence), so the invalidation
 * they owe the cache is expressed here and called explicitly instead of living
 * in an onSuccess. Both keys are invalidated together — connectors/state is a
 * rollup OF flow_state, so anything that moves one moves the other.
 */
export function useInvalidateConnectorState(plantCode) {
    const queryClient = useQueryClient();
    return useCallback((overridePlantCode) => {
        const code = overridePlantCode || plantCode;
        if (!code) return;
        void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.connector.all(code) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.connector.state(code) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.connector.flowStateAll(code) });
        void queryClient.invalidateQueries({ queryKey: ['domain-config', code, 'context'] });
    }, [queryClient, plantCode]);
}

// ── Config mutations ─────────────────────────────────────────────────────────

export function useAddSapTable(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not add table' },
        mutationFn: (payload) => cdm.addSapTable(payload, plantCode),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['domain-config', plantCode, 'context', 'sap'] });
        },
    });
}

export function useUpdateColumnRenames(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not save column names' },
        mutationFn: ({ sourceKey, mappings }) => cdm.updateColumnRenames(sourceKey, mappings, plantCode),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['domain-config', plantCode, 'context', 'sap'] });
        },
    });
}

export function useUpdateUserConfig(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not save configuration' },
        mutationFn: (patch) => cdm.updateUserConfig(patch, plantCode),
        // user-config drives both the timeseries retention view and SAP joins.
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['domain-config', plantCode, 'context', 'ts'] });
            void queryClient.invalidateQueries({ queryKey: ['domain-config', plantCode, 'context', 'sap'] });
        },
    });
}

export function usePopulateOntology(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Ontology generation failed' },
        mutationFn: (body) => cdm.populateOntology(body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.domainConfig.all(plantCode) });
        },
    });
}

// ── Pipeline ─────────────────────────────────────────────────────────────────
// The pipeline hooks moved to ./usePipelineQueries.js (2026-08-17) when the full
// 7-endpoint pipeline router was wired up — the two that lived here (a job poll
// whose isTerminal missed `cancelled`, and a run mutation) had no consumers and
// would have needed rewriting anyway.
