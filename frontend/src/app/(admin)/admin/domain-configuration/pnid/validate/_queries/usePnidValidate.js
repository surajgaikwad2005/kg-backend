'use client';

/**
 * usePnidValidate — queries for the P&ID Validate and Template Matching screens
 * (Phase 1c).
 *
 * This phase exists mostly to collapse duplicate reads. Before it:
 *   - `getHighlightOptions` was fetched independently by useValidateData AND by
 *     PidValidateView, in unrelated subtrees, for the same payload.
 *   - `getClientFiles` was fetched by DomainConfigContext AND again by
 *     useTemplateMatching.
 *   - `checkExtractionFiles` had three separate call sites.
 * Each is now one key, so mounting any combination of those screens issues one
 * request rather than several.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';

// ── Validate ─────────────────────────────────────────────────────────────────

/**
 * Saved highlight/connection options for one PDF.
 *
 * `pdfName` is part of the key and may legitimately be undefined (the
 * PidValidateView call omits it, which the backend treats as "all"), so the key
 * factory normalises that to null rather than dropping the segment.
 */
export function useHighlightOptions(plantCode, pdfName) {
    return useQuery({
        queryKey: queryKeys.domainConfig.pnidWs.highlightOptions(plantCode, pdfName),
        queryFn: () => pnidService.getHighlightOptions(plantCode, pdfName),
        enabled: !!plantCode,
    });
}

/** Preprocessed page images for a doc type. */
export function useImagesList(plantCode, docType = 'pnid') {
    return useQuery({
        queryKey: queryKeys.domainConfig.pnidWs.imagesList(plantCode, docType),
        queryFn: () => pnidService.getImagesList(plantCode, docType),
        enabled: !!plantCode,
    });
}

/** Whether the final validated workbook exists for this plant. */
export function useExcelExists(plantCode) {
    return useQuery({
        queryKey: queryKeys.domainConfig.pnidWs.excelExists(plantCode),
        queryFn: () => pnidService.checkExcelExists(plantCode),
        enabled: !!plantCode,
    });
}

/**
 * Persist the verified connection set.
 *
 * Note this endpoint does NOT use the {success, message, data} envelope — the
 * service deliberately leaves it unwrapped, so callers still read
 * `{status, source, message}`.
 */
export function useSaveHighlightOptions(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not save connections' },
        mutationFn: ({ connections, pdfName }) =>
            pnidService.saveHighlightOptions(plantCode, connections, pdfName),
        onSuccess: (_res, { pdfName }) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.domainConfig.pnidWs.highlightOptions(plantCode, pdfName),
            });
        },
    });
}

/**
 * Compute-only endpoints — they derive highlights/validity from a posted payload
 * and persist nothing, so per CLAUDE.md rule 50 they intentionally declare no
 * invalidation.
 */
export function useHighlightComponents(plantCode) {
    return useMutation({
        meta: { errorTitle: 'Could not highlight components' },
        mutationFn: (payload) => pnidService.highlightComponents(plantCode, payload),
    });
}

export function useValidateConnection(plantCode) {
    return useMutation({
        meta: { silent: true }, // the sidebar renders per-connection validity itself
        mutationFn: (payload) => pnidService.validateConnection(plantCode, payload),
    });
}

// ── Template Matching ────────────────────────────────────────────────────────

export function useTemplateLibrary(plantCode) {
    return useQuery({
        queryKey: queryKeys.domainConfig.pnidWs.templateLibrary(plantCode),
        queryFn: () => pnidService.getTemplateMatchLibrary(plantCode),
        enabled: !!plantCode,
    });
}

export function useRunTemplateMatch(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Template match failed' },
        mutationFn: (formData) => pnidService.runTemplateMatch(plantCode, formData),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.domainConfig.pnidWs.templateLibrary(plantCode),
            });
        },
    });
}

export function useSaveTemplateLibrary(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not save the template library' },
        mutationFn: (library) => pnidService.saveTemplateMatchLibrary(plantCode, library),
        // The new library is exactly what we just sent, so write it in rather
        // than spending a round trip re-reading it.
        onSuccess: (_res, library) => {
            queryClient.setQueryData(
                queryKeys.domainConfig.pnidWs.templateLibrary(plantCode),
                library,
            );
        },
    });
}

export function useExtractTextByBox(plantCode) {
    return useMutation({
        meta: { errorTitle: 'Could not read text from the selection' },
        mutationFn: (params) => pnidService.extractTextByBox(plantCode, params),
    });
}
