'use client';

/**
 * useFlowFiles — the per-FILE half of the localStorage migration.
 *
 * ONE request, not eight. `flow` on GET /flow/state is optional (confirmed
 * 2026-08-18): omitting it returns every flow for the plant in a single
 * response with `data.flow === null`. This file used to fan out across the
 * eight flow names with `useQueries` and a lazy `requestAllFlowFiles()` widener
 * to keep that fan-out off the critical path; both are gone, because a single
 * paged read is cheaper than the cheapest version of the fan-out.
 *
 * The per-flow slices consumers still want are cut client-side by
 * groupFilesByFlow, off the one cached payload — never by re-requesting a
 * single flow, which would refetch rows already in hand.
 *
 * Rule 49 note: no polling here. These entries are invalidated by the upload /
 * pipeline / commit / reset / delete mutations that change them.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import * as cdm from '@/src/services/domain-configuration/common';
import { flowFilesToSourceEntries, groupFilesByFlow } from '@/src/components/admin/connectorState';

// Stable empty identities — a fresh [] / {} per render would defeat every
// downstream useMemo that lists these as a dependency (rule 22).
const EMPTY_FILES = [];
const EMPTY_ENTRIES = [];
const EMPTY_BY_FLOW = {};

/**
 * VIEW-level derivation (rule 54): fold the flat file list into per-flow
 * buckets plus the configuredSources-shaped entries the screen renders.
 * Module scope so `select` actually memoizes against the cached payload
 * instead of re-folding on every render.
 */
function selectFlowFiles(data) {
    const filesByFlow = groupFilesByFlow(data?.files);
    const entries = [];
    for (const flow of Object.keys(filesByFlow)) {
        const files = filesByFlow[flow];
        if (files.length > 0) entries.push(...flowFilesToSourceEntries(files, flow));
    }
    // Newest first — matches the client's `[newSource, ...prev]` ordering.
    entries.sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0));
    return {
        entries,
        filesByFlow,
        files: data?.files ?? EMPTY_FILES,
        total: data?.total ?? 0,
        // True only if the plant blew past the paging loop's hard stop — a
        // signal the list on screen is incomplete, not merely long.
        truncated: Boolean(data?.truncated),
    };
}

/**
 * The single cached read every per-file consumer shares.
 *
 * `lifecycle` is a SERVER-side filter, so it is part of the key: a filtered
 * response is a different payload, not a subset the client could derive from
 * the unfiltered one (the backend applies it before pagination).
 *
 * @param {string} plantCode
 * @param {{ lifecycle?: string, enabled?: boolean }} [opts]
 */
export function useFlowFilesQuery(plantCode, { lifecycle, enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.domainConfig.connector.flowState(plantCode, lifecycle),
        queryFn: ({ signal }) => cdm.getAllFlowFiles(plantCode, { lifecycle, signal }),
        select: selectFlowFiles,
        enabled: enabled && !!plantCode,
    });
}

/**
 * Every flow's files, folded into one configuredSources-shaped array.
 *
 * @param {string} plantCode
 * @returns {{ entries: Array, filesByFlow: Record<string, Array>, isLoading: boolean, isError: boolean }}
 */
export function useFlowFiles(plantCode) {
    const { data, isLoading, isError } = useFlowFilesQuery(plantCode);
    return {
        entries: data?.entries ?? EMPTY_ENTRIES,
        filesByFlow: data?.filesByFlow ?? EMPTY_BY_FLOW,
        isLoading,
        isError,
    };
}

/**
 * ONE flow's slice of the shared payload, shaped like the old per-flow query
 * (`data.files`) so its consumers did not have to change.
 *
 * `enabled: false` only opts THIS observer out — the query is shared, so when
 * another mounted consumer wants it the data is here anyway, already fetched.
 * That is the point: gating no longer saves a request, it just expresses that
 * this particular screen does not need one.
 *
 * @param {string} plantCode
 * @param {string} flow  'pnid' | 'docs' | 'ts' | 'ts_values' | 'sap' | 'aif' | 'gloc' | 'lopc'
 */
export function useFlowStateForFlow(plantCode, flow, { enabled = true } = {}) {
    const query = useFlowFilesQuery(plantCode, { enabled: enabled && !!flow });
    // filesByFlow[flow] is already a stable identity (it comes out of the
    // memoized `select`), so this wrapper only has to avoid minting a new
    // envelope object each render.
    const data = useMemo(
        () => (query.data ? { files: query.data.filesByFlow[flow] ?? EMPTY_FILES } : undefined),
        [query.data, flow],
    );
    return { ...query, data };
}
