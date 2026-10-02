'use client';

/**
 * DomainConfigContext — plant-scoped P&ID workspace state for the pnid/* routes.
 *
 * The server half (clientFiles) is now a TanStack Query cache entry keyed on
 * plantCode; this provider only re-exposes it so existing consumers keep their
 * current shape. What used to live here — a `clientFiles` useState, an
 * `isLoadingFiles` flag, a `fetchClientFiles` callback, a plant-change effect,
 * and a `fetchTokenRef` that dropped stale responses by hand — is all replaced
 * by the query key containing plantCode. A late response for the previous plant
 * now belongs to a different cache entry and structurally cannot render.
 *
 * What remains here is genuine client state: `pipelineSession` tracks which
 * OCR/extract job this browser tab is following, which no endpoint returns.
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useClientFiles } from '@/src/app/(admin)/admin/domain-configuration/pnid/_queries/usePnidWorkspace';

const DomainConfigContext = createContext(null);

const EMPTY_SESSION = { jobId: null, step: null, resumedFromBackend: false };

export function DomainConfigProvider({ children }) {
  const { plantCode } = useApp();

  const {
    data: clientFiles,
    // isFetching, NOT isLoading. isLoading is only true while there is no data
    // yet, so a manual Refresh over already-loaded files would leave it false —
    // the refresh button would never disable or spin (CLAUDE.md rule 31) and the
    // user could queue duplicate requests by clicking repeatedly. The flag this
    // replaces was set true on every fetch, including refetches; isFetching is
    // the exact equivalent.
    isFetching: isLoadingFiles,
    isError: isFilesError,
    error: filesError,
    refetch,
  } = useClientFiles(plantCode);

  const [pipelineSession, setPipelineSession] = useState(EMPTY_SESSION);

  // The plant guard is load-bearing: refetch() bypasses `enabled` entirely, so
  // without it a refresh with no plant selected would call the service with
  // null, trip apiClient's PLANT_CODE_REQUIRED preflight, and fire a spurious
  // "Plant code required" toast.
  const refreshFiles = useCallback(() => {
    if (plantCode) refetch();
  }, [plantCode, refetch]);

  const storePipelineSession = useCallback((jobId, step) => {
    setPipelineSession({ jobId, step, resumedFromBackend: false });
  }, []);

  const clearPipelineSession = useCallback(() => {
    setPipelineSession(EMPTY_SESSION);
  }, []);

  const markResumedFromBackend = useCallback((jobId, step) => {
    setPipelineSession({ jobId, step, resumedFromBackend: true });
  }, []);

  const value = useMemo(() => ({
    plantCode,
    // `?? null` preserves the previous contract: consumers check `!!clientFiles`,
    // and useQuery reports `undefined` before the first fetch resolves.
    clientFiles: clientFiles ?? null,
    isLoadingFiles,
    // Exposed so consumers can tell "this plant genuinely has no files" apart
    // from "the request failed" — without these, a 500 renders the same
    // "Initialize Session" empty state as a fresh plant and invites the user to
    // re-upload files that already exist (CLAUDE.md rules 7 and 52).
    isFilesError,
    filesError,
    pipelineSession,
    refreshFiles,
    storePipelineSession,
    clearPipelineSession,
    markResumedFromBackend,
  }), [
    plantCode, clientFiles, isLoadingFiles, isFilesError, filesError, pipelineSession,
    refreshFiles, storePipelineSession, clearPipelineSession, markResumedFromBackend,
  ]);

  return (
    <DomainConfigContext.Provider value={value}>
      {children}
    </DomainConfigContext.Provider>
  );
}

export function useDomainConfig() {
  const ctx = useContext(DomainConfigContext);
  if (!ctx) throw new Error('useDomainConfig must be used within DomainConfigProvider');
  return ctx;
}
