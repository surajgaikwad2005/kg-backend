'use client';

/**
 * usePnidPipeline — the OCR → (AI Extract) → Compare-and-Clean pipeline (Phase 1b).
 *
 * This replaces a 265-line hook that carried ~20 useState calls, two poll refs,
 * two stop functions, an unmount-cleanup effect, a `cfgRef` that existed only so
 * polling callbacks would not read stale closures, and two
 * `new Promise(resolve => ...)` wrappers so the orchestration could `await` a
 * setInterval. It also swallowed every poll error in an empty `catch {}`, so a
 * failing backend polled forever with nothing shown.
 *
 * The control flow is deliberately inverted: polling is declarative
 * (useJobPolling), so sequencing becomes an effect reacting to job status rather
 * than an awaited promise chain. What is preserved exactly:
 *
 *   - OCR always runs; Extract runs only in LLM mode with no line list;
 *     Compare always runs last.
 *   - A hard Extract failure BLOCKS Compare rather than cascading bad data.
 *   - The backend's 400 "...line list..." response is a SKIP, not an error.
 *   - job_id is read from `.results.job_id` (the envelope nests it).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useJobPolling, queryKeys } from '@/src/lib/query';
import { useExtractionFiles } from '@/src/app/(admin)/admin/domain-configuration/pnid/_queries/usePnidWorkspace';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';
import { PROVIDER_MAP, POLL_INTERVAL } from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_lib/constants';

const isTerminal = (d) => d?.status === 'done' || d?.status === 'error';

/** 'idle' → 'ocr' → 'extract' → 'compare' → 'done' | 'error' */
const STAGE = {
    IDLE: 'idle',
    OCR: 'ocr',
    EXTRACT: 'extract',
    COMPARE: 'compare',
    DONE: 'done',
};

/** Does this plant already have extracted files, i.e. can the user skip straight to Validate? */
function hasExtractedFiles(data) {
    const items = Array.isArray(data) ? data : (data?.data ?? []);
    if (Array.isArray(items) && items.length > 0) {
        return items.some((item) => item.status === 'extracted' || !!item.extraction_file);
    }
    return !!data?.exists;
}

export function usePnidPipeline(plantCode) {
    const queryClient = useQueryClient();

    // Shared with useManageFiles and useValidateData via one cache key. This was
    // the third of three independent checkExtractionFiles call sites; the other
    // two now read the same entry, so a page that used to issue three identical
    // requests issues one. Compare invalidates it below, which is what used to
    // require a manual checkDirectValidation() call after every run.
    const extractionFilesQuery = useExtractionFiles(plantCode);
    const canValidateDirectly = hasExtractedFiles(extractionFilesQuery.data);

    const [stage, setStage] = useState(STAGE.IDLE);
    const [ocrJobId, setOcrJobId] = useState(null);
    const [extractJobId, setExtractJobId] = useState(null);
    // Extract/Compare outcomes that are not a job status: 'idle' | 'running' |
    // 'done' | 'error' | 'skipped' | 'blocked'.
    const [extractOutcome, setExtractOutcome] = useState({ status: 'idle', result: null, error: null });
    const [compareOutcome, setCompareOutcome] = useState({ status: 'idle', result: null, error: null });

    // Run configuration. Still a ref, but now only because the sequencing effect
    // needs the values chosen at start() — not to dodge stale closures inside a
    // setInterval, which is what the old cfgRef was working around.
    const cfgRef = useRef({
        processMode: null, selectedLlm: '', hasLineList: false,
        documentPath: null, linelistFilename: null, ocrExcelPath: null,
    });
    const lastConfigRef = useRef(null);

    // ── Step 1: OCR ──────────────────────────────────────────────────────────
    const startOcr = useMutation({
        meta: { errorTitle: 'Could not queue the OCR job' },
        mutationFn: (cfg) => pnidService.startOcr(plantCode, {
            pnidSelectedFiles: cfg.pnidFiles.map((f) => f.name),
            pfdSelectedFiles: cfg.pfdFiles.map((f) => f.name),
            usableArea: cfg.usableArea,
        }),
        onSuccess: (res) => {
            setOcrJobId(res?.results?.job_id ?? null);
            setStage(STAGE.OCR);
        },
    });

    const ocrJob = useJobPolling({
        queryKey: queryKeys.domainConfig.pnidWs.ocrStatus(plantCode, ocrJobId),
        queryFn: () => pnidService.getOcrStatus(plantCode, ocrJobId),
        jobId: ocrJobId,
        isTerminal,
        interval: POLL_INTERVAL,
        enabled: stage === STAGE.OCR,
    });

    // ── Step 2: Extract ──────────────────────────────────────────────────────
    const startExtract = useMutation({
        meta: { silent: true }, // handled below — a 400 "line list" is a skip, not a failure
        mutationFn: () => {
            const provider = PROVIDER_MAP[cfgRef.current.selectedLlm] ?? 'google-gemini';
            return pnidService.startExtract(plantCode, provider);
        },
    });

    const extractJob = useJobPolling({
        queryKey: queryKeys.domainConfig.pnidWs.extractStatus(plantCode, extractJobId),
        queryFn: () => pnidService.getExtractStatus(plantCode, extractJobId),
        jobId: extractJobId,
        isTerminal,
        interval: POLL_INTERVAL,
        enabled: stage === STAGE.EXTRACT,
    });

    // ── Step 3: Compare ──────────────────────────────────────────────────────
    const compare = useMutation({
        meta: { silent: true }, // surfaced through compareOutcome so the panel owns the message
        mutationFn: () => pnidService.compareAndClean(plantCode, {
            ocrExcelFilename: cfgRef.current.ocrExcelPath
                ? cfgRef.current.ocrExcelPath.split('/').pop()
                : undefined,
            linelistFilename: cfgRef.current.linelistFilename,
            documentPath: cfgRef.current.documentPath,
        }),
    });

    const { mutateAsync: runCompareAsync } = compare;
    const runCompare = useCallback(async () => {
        setCompareOutcome({ status: 'running', result: null, error: null });
        setStage(STAGE.COMPARE);
        try {
            const data = await runCompareAsync();
            setCompareOutcome({ status: 'done', result: data, error: null });
            // Compare rewrites the extraction files this plant exposes.
            void queryClient.invalidateQueries({
                queryKey: queryKeys.domainConfig.pnidWs.extractionFilesAll(plantCode),
            });
        } catch (err) {
            setCompareOutcome({
                status: 'error',
                result: null,
                error: err?.data?.detail ?? err?.message ?? 'Compare-and-clean failed.',
            });
        } finally {
            setStage(STAGE.DONE);
        }
    }, [runCompareAsync, queryClient, plantCode]);

    const { mutateAsync: startExtractAsync } = startExtract;
    const runExtract = useCallback(async () => {
        const { processMode, selectedLlm, hasLineList } = cfgRef.current;

        // Skip conditions, unchanged from the pre-migration logic.
        if (processMode !== 'llm' || !selectedLlm) {
            setExtractOutcome({ status: 'skipped', result: null, error: null });
            return 'skipped';
        }
        if (hasLineList) {
            setExtractOutcome({
                status: 'skipped',
                result: { message: 'Line list uploaded — extraction not required.', skipped: true },
                error: null,
            });
            return 'skipped';
        }

        setExtractOutcome({ status: 'running', result: null, error: null });
        try {
            const res = await startExtractAsync();
            setExtractJobId(res?.results?.job_id ?? null);
            setStage(STAGE.EXTRACT);
            return 'polling';
        } catch (err) {
            const detail = err?.data?.detail ?? err?.message ?? 'Extraction failed.';
            // The backend reports "already has a line list" as a 400. That is a
            // skip, not a failure — Compare must still run.
            if (err?.status === 400 && String(detail).toLowerCase().includes('line list')) {
                setExtractOutcome({ status: 'skipped', result: { message: detail, skipped: true }, error: null });
                return 'skipped';
            }
            setExtractOutcome({ status: 'error', result: null, error: detail });
            return 'error';
        }
    }, [startExtractAsync]);

    // ── Sequencing ───────────────────────────────────────────────────────────
    // OCR reached a terminal state → capture its output and move on.
    useEffect(() => {
        if (stage !== STAGE.OCR || !isTerminal(ocrJob.data)) return;

        if (ocrJob.data.status === 'error') {
            setStage(STAGE.DONE);
            return;
        }
        cfgRef.current.ocrExcelPath = ocrJob.data.result?.ocr_excel_path ?? null;

        (async () => {
            const outcome = await runExtract();
            // 'polling' means the extract effect below takes over from here.
            if (outcome === 'polling') return;
            if (outcome === 'error') {
                setCompareOutcome({
                    status: 'blocked',
                    result: null,
                    error: 'Blocked: AI Extraction failed. Fix the extract step first, then retry compare.',
                });
                setStage(STAGE.DONE);
                return;
            }
            await runCompare();
        })();
    }, [stage, ocrJob.data, runExtract, runCompare]);

    // Extract reached a terminal state → record it, then compare or block.
    useEffect(() => {
        if (stage !== STAGE.EXTRACT || !isTerminal(extractJob.data)) return;

        if (extractJob.data.status === 'error') {
            setExtractOutcome({
                status: 'error',
                result: null,
                error: extractJob.data.error ?? 'Extraction failed.',
            });
            setCompareOutcome({
                status: 'blocked',
                result: null,
                error: 'Blocked: AI Extraction failed. Fix the extract step first, then retry compare.',
            });
            setStage(STAGE.DONE);
            return;
        }

        setExtractOutcome({ status: 'done', result: extractJob.data.result, error: null });
        runCompare();
    }, [stage, extractJob.data, runCompare]);

    // ── Public API ───────────────────────────────────────────────────────────
    const reset = useCallback(() => {
        setStage(STAGE.IDLE);
        setOcrJobId(null);
        setExtractJobId(null);
        setExtractOutcome({ status: 'idle', result: null, error: null });
        setCompareOutcome({ status: 'idle', result: null, error: null });
    }, []);

    const { mutateAsync: startOcrAsync } = startOcr;
    const start = useCallback(async (cfg) => {
        if (!cfg) return;
        lastConfigRef.current = cfg;
        const pnidFiles = cfg.pnidFiles ?? [];
        const pfdFiles = cfg.pfdFiles ?? [];
        cfgRef.current = {
            processMode: cfg.processMode,
            selectedLlm: cfg.selectedLlm,
            hasLineList: cfg.hasLineList,
            documentPath: pnidFiles[0]?.path ?? pfdFiles[0]?.path ?? null,
            linelistFilename: cfg.lineListFile?.name ?? null,
            ocrExcelPath: null,
        };
        reset();

        let usableArea;
        if (cfg.cropBoxCoordinates) {
            const { x1, y1, x2, y2 } = cfg.cropBoxCoordinates;
            usableArea = [x1, y1, x2, y2];
        }
        try {
            await startOcrAsync({ pnidFiles, pfdFiles, usableArea });
        } catch {
            // Toasted by the global mutation-error handler.
            setStage(STAGE.DONE);
        }
    }, [reset, startOcrAsync]);

    const retry = useCallback(async () => {
        if (lastConfigRef.current) {
            await start(lastConfigRef.current);
        }
    }, [start]);

    const retryExtract = useCallback(async () => {
        const outcome = await runExtract();
        if (outcome === 'polling') return;
        if (outcome !== 'error') await runCompare();
    }, [runExtract, runCompare]);

    return {
        // OCR
        jobId: ocrJobId,
        jobStatus: ocrJob.data?.status ?? (stage === STAGE.OCR ? 'queued' : null),
        jobProgress: ocrJob.data?.progress ?? [],
        currentFile: ocrJob.data?.current_file ?? null,
        jobResult: ocrJob.data?.status === 'done' ? ocrJob.data.result : null,
        jobError: ocrJob.data?.status === 'error' ? (ocrJob.data.error ?? 'Unknown error') : null,
        isSubmitting: startOcr.isPending,
        // Extract
        extractStatus: extractOutcome.status,
        extractResult: extractOutcome.result,
        extractError: extractOutcome.error,
        extractProgress: extractJob.data?.progress ?? [],
        extractCurrentFile: extractJob.data?.current_file ?? null,
        // Compare
        compareStatus: compareOutcome.status,
        compareResult: compareOutcome.result,
        compareError: compareOutcome.error,
        // Derived from the shared extraction-files query rather than a private
        // fetch. `checkDirectValidation` is kept for call-site compatibility but
        // is now just a refetch — Compare already invalidates this key.
        canValidateDirectly,
        checkDirectValidation: () => extractionFilesQuery.refetch(),
        // actions
        start,
        retry,
        retryExtract,
        retryCompare: runCompare,
        resetPipeline: reset,
        providerLabel: () => PROVIDER_MAP[cfgRef.current.selectedLlm] ?? 'google-gemini',
    };
}
