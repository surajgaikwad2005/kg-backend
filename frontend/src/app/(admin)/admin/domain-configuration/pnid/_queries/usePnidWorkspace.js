'use client';

/**
 * usePnidWorkspace — TanStack Query hooks for the P&ID workspace (Phase 1a).
 *
 * These wrap `pnidService` unchanged; the service layer is already the correct
 * queryFn boundary (pure async functions taking plantCode as an argument, never
 * reading context). Nothing below this file moved.
 *
 * Every read is keyed on plantCode, which is what makes switching plants correct
 * for free: a different plant is a different cache entry, so a late response for
 * the previous plant can never render against the new one. The hand-rolled
 * `fetchTokenRef` stale-response guard this replaces existed only to paper over
 * that missing property.
 */
import { useMemo, useCallback } from 'react';
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';
import {
    getCategoryFiles,
    FILE_CATEGORY_KEYS,
    isPdfFile,
} from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/domainConfigUtils';
import { countPdfPages } from '@/src/app/(admin)/admin/domain-configuration/pnid/_hooks/usePdfjs';

// ── Reads ────────────────────────────────────────────────────────────────────

/**
 * The plant's uploaded P&ID workspace files.
 *
 * Shared by every consumer that mounts, so one key means one request no matter
 * how many components ask. Note that `useTemplateMatching.js:62` still calls
 * `pnidService.getClientFiles` directly, so that duplicate request survives
 * until Phase 1c migrates it onto this hook.
 */
export function useClientFiles(plantCode) {
    return useQuery({
        queryKey: queryKeys.domainConfig.pnidWs.clientFiles(plantCode),
        queryFn: ({ signal }) => pnidService.getClientFiles(plantCode, { signal }),
        enabled: !!plantCode,
    });
}

/**
 * Files that have been through extraction, with their status.
 *
 * Three call sites today (useManageFiles, usePipeline.checkDirectValidation,
 * useValidateData) each hold their own copy; `opts` is part of the key so the
 * default and extractedOnly variants cache separately.
 */
export function useExtractionFiles(plantCode, opts) {
    return useQuery({
        queryKey: queryKeys.domainConfig.pnidWs.extractionFiles(plantCode, opts),
        queryFn: ({ signal }) => pnidService.checkExtractionFiles(plantCode, { ...opts, signal }),
        enabled: !!plantCode,
    });
}

/**
 * Folds the per-PDF query results into one `path → count` map.
 *
 * Module scope, so its identity is stable across renders — `combine` runs on
 * every result change and TanStack memoizes against it. Defining it inline would
 * make it a new function each render and defeat that memoization (CLAUDE.md
 * rule 22: no non-reactive values redefined in a component body). Each queryFn
 * returns `{ path, count }` rather than a bare number precisely so this can stay
 * self-contained and out of the closure.
 */
const combinePageCounts = (results) => {
    const counts = {};
    results.forEach(({ data }) => {
        if (data) counts[data.path] = data.count;
    });
    return counts;
};

/**
 * Page counts for every PDF in the workspace, fetched in parallel.
 *
 * Replaces a hand-rolled prefetch loop that tracked in-flight paths in a
 * `useRef(new Set())` and reset that Set on every plant change. Deduping, retry,
 * cancellation and per-plant isolation all come from the query key instead.
 *
 * The queryFn counts and DISCARDS the ArrayBuffer — only the small result is
 * cached, so a workspace listing 30 PDFs holds 30 numbers rather than 30
 * multi-MB buffers. `staleTime: Infinity` because a file's page count cannot
 * change without a mutation, and the page-delete flow writes the new count in
 * directly via useSetPdfPageCount.
 *
 * @returns {Record<string, number>} path → page count, for the paths resolved so far.
 */
export function usePdfPageCounts(plantCode, clientFiles) {
    const pdfPaths = useMemo(() => {
        if (!clientFiles) return [];
        return FILE_CATEGORY_KEYS
            .flatMap((key) => getCategoryFiles(clientFiles, key))
            .filter((file) => isPdfFile(file.name))
            .map((file) => file.path);
    }, [clientFiles]);

    return useQueries({
        queries: pdfPaths.map((path) => ({
            queryKey: queryKeys.domainConfig.pnidWs.pdfPageCount(plantCode, path),
            queryFn: async ({ signal }) => {
                const buffer = await pnidService.getFileArrayBuffer(plantCode, path, { signal });
                return { path, count: countPdfPages(buffer) };
            },
            enabled: !!plantCode && !!path,
            staleTime: Infinity,
        })),
        combine: combinePageCounts,
    });
}

// ── Mutations ────────────────────────────────────────────────────────────────

/**
 * Clears this plant's entire P&ID workspace on the backend.
 *
 * Note what is invalidated versus removed. Blanket-invalidating the whole
 * pnidWs subtree would mark every cached pdf-page-count stale and refetch them
 * immediately — one full multi-MB GET per PDF, for files the backend just
 * deleted — before clientFiles resolves empty and unmounts them. Page counts are
 * dropped outright instead; there is nothing left to re-read.
 *
 * `void` on the invalidation is also deliberate: returning the promise from
 * onSuccess makes mutateAsync wait for every refetch to finish, which would keep
 * the confirm dialog open and delay the success toast for the whole round trip.
 */
export function useDeleteClient(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Delete Error' },
        mutationFn: () => pnidService.deleteClient(plantCode),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.domainConfig.pnidWs.clientFiles(plantCode),
            });
            void queryClient.invalidateQueries({
                queryKey: queryKeys.domainConfig.pnidWs.extractionFilesAll(plantCode),
            });
            queryClient.removeQueries({
                queryKey: queryKeys.domainConfig.pnidWs.pdfPageCountAll(plantCode),
            });
        },
    });
}

/** Deletes one file by its backend-relative path. */
export function useDeleteWorkspaceFile(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Delete Error' },
        mutationFn: (file) => pnidService.deleteFile(plantCode, file.path),
        onSuccess: (_data, file) => {
            // `void`: not returning the promise keeps mutateAsync resolving as
            // soon as the DELETE lands, so the dialog closes immediately instead
            // of waiting on the refetch.
            void queryClient.invalidateQueries({
                queryKey: queryKeys.domainConfig.pnidWs.clientFiles(plantCode),
            });
            // The file is gone — drop its cached page count rather than leaving
            // a count for a path that no longer resolves.
            queryClient.removeQueries({
                queryKey: queryKeys.domainConfig.pnidWs.pdfPageCount(plantCode, file.path),
            });
        },
    });
}

/**
 * Uploads the four file buckets. `formData` already carries the bucket fields.
 *
 * @param {object}  [options]
 * @param {boolean} [options.silent] Suppress the global mutation-error toast when
 *   the caller renders its own failure UI. Used by useWorkspaceUpload, whose
 *   failure path is currently (and knowingly) indistinguishable from success —
 *   adding a toast there would put two contradictory signals on screen.
 */
export function useUploadWorkspaceFiles(plantCode, { silent = false } = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: silent ? { silent: true } : { errorTitle: 'Upload Failed' },
        mutationFn: (formData) => pnidService.uploadWorkspaceFiles(plantCode, formData),
        onSuccess: () => {
            // Only the file list and extraction state change on upload. Cached
            // page counts for files that were ALREADY there cannot have changed,
            // and invalidating them would re-download every existing PDF —
            // defeating the `staleTime: Infinity` that exists to prevent exactly
            // that. New files simply have no cache entry yet and fetch on mount.
            void queryClient.invalidateQueries({
                queryKey: queryKeys.domainConfig.pnidWs.clientFiles(plantCode),
            });
            void queryClient.invalidateQueries({
                queryKey: queryKeys.domainConfig.pnidWs.extractionFilesAll(plantCode),
            });
        },
    });
}

/**
 * Writes a freshly-computed page count into the cache.
 *
 * The preview modal re-reads a PDF's bytes with `bust: true` after deleting a
 * page, so it already knows the new count — pushing it in is cheaper and more
 * immediate than invalidating and refetching the whole file again.
 */
export function useSetPdfPageCount(plantCode) {
    const queryClient = useQueryClient();
    return useCallback(
        (path, count) => {
            if (!plantCode || !path || typeof count !== 'number') return;
            queryClient.setQueryData(
                queryKeys.domainConfig.pnidWs.pdfPageCount(plantCode, path),
                // Same { path, count } shape the queryFn produces — combinePageCounts
                // reads data.path/data.count, so a bare number would be dropped.
                { path, count },
            );
        },
        [queryClient, plantCode],
    );
}
