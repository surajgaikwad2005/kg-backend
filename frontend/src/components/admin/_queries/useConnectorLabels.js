'use client';

/**
 * useConnectorLabels — the use-case label vocabulary every connector upload
 * modal renders (GET /connectors/labels).
 *
 * This list used to be a hardcoded FILE_LABEL_OPTIONS array in
 * admin.constants.js, duplicated into four modals. The backend now owns it —
 * both the vocabulary AND the rule for which connectors require a label — so
 * there is deliberately NO local fallback: if this query fails the pickers
 * render an error + retry and the submit buttons stay disabled, rather than
 * letting an upload go out with a label set the backend would reject.
 *
 * `suggested` comes back on the payload but is intentionally not applied:
 * per product decision the user picks labels themselves for every data
 * source, so nothing is pre-ticked.
 */
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import * as common from '@/src/services/domain-configuration/common';

// Stable identities for the not-yet-loaded case — a fresh [] every render
// would defeat memoization in every consumer that lists these as deps.
const EMPTY_OPTIONS = [];
const EMPTY_LIST = [];

/**
 * The backend's `colour` names mapped onto semantic tokens (rule 26) so the
 * dot beside each option follows the active theme and accent instead of a
 * hardcoded palette. Unknown colours degrade to a neutral dot rather than
 * rendering nothing.
 */
const LABEL_DOT_CLASS = {
    green: 'bg-success',
    blue: 'bg-info',
    amber: 'bg-warning',
    purple: 'bg-brand',
    red: 'bg-danger',
};

/**
 * VIEW-level derivation (rule 54): wire shape → Select options, sorted by the
 * backend's own `sort_order` so the chip order is the backend's decision too.
 * Module scope keeps its identity stable across renders.
 */
function selectLabels(data) {
    const labels = [...(data?.labels || [])].sort(
        (a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0),
    );
    return {
        options: labels.map((l) => ({
            value: l.key,
            label: l.label,
            dotClassName: LABEL_DOT_CLASS[l.colour] || 'bg-text-subtle',
        })),
        requiredFor: data?.required_for || EMPTY_LIST,
        notRequiredFor: data?.not_required_for || EMPTY_LIST,
    };
}

/**
 * @param {string} plantCode
 * @returns {{
 *   options: Array<{ value: string, label: string, dotClassName: string }>,
 *   isLoading: boolean,
 *   isError: boolean,
 *   refetch: () => void,
 *   requiresLabels: (connector: string) => boolean,
 * }}
 */
export function useConnectorLabels(plantCode) {
    const { data, isPending, isError, refetch } = useQuery({
        queryKey: queryKeys.domainConfig.connector.labels(plantCode),
        queryFn: ({ signal }) => common.getConnectorLabels(plantCode, { signal }),
        select: selectLabels,
        enabled: !!plantCode,
        // Reference data — a fixed vocabulary that changes on backend deploys,
        // not during a session.
        staleTime: 5 * 60_000,
    });

    const requiredFor = data?.requiredFor ?? EMPTY_LIST;
    const notRequiredFor = data?.notRequiredFor ?? EMPTY_LIST;

    /**
     * Whether a submit for `connector` must have every file labelled.
     * While the vocabulary is unknown (loading, error, or no plant selected)
     * this answers TRUE for anything not explicitly exempt: the picker cannot
     * offer options in that state, so allowing the upload through would just
     * trade a disabled button for a backend 422.
     */
    const requiresLabels = useCallback((connector) => {
        if (notRequiredFor.includes(connector)) return false;
        if (requiredFor.includes(connector)) return true;
        return isPending || isError;
    }, [requiredFor, notRequiredFor, isPending, isError]);

    return {
        options: data?.options ?? EMPTY_OPTIONS,
        isLoading: !!plantCode && isPending,
        isError,
        refetch,
        requiresLabels,
    };
}
