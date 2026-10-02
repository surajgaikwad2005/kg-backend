'use client';

/**
 * useAdminPersistence — restores files the user had STAGED but not yet
 * uploaded, so picking five P&IDs and accidentally reloading doesn't mean
 * picking them again.
 *
 * 2026-08-17: the `admin_domain_config` sessionStorage blob this also used to
 * write (uploadedPnidFileNames / uploadedDocFileNames) is gone. Those are names
 * of files that already reached the backend, so they are read back from
 * GET /flow/state now — see usePnidFormState and useDocsFormState. Only genuinely
 * pre-upload, browser-local state is left here, which is the one thing no
 * server endpoint can restore.
 */
import { useEffect } from 'react';
import { loadPersistedFiles } from '@/src/lib/fileStorage';

export function useAdminPersistence({
    _persistReady,
    setPnidFiles,
    setDocFiles,
    setTsMetadataFiles,
    setTsValuesFiles,
    setSapFiles,
}) {
    // Initial load — sets _persistReady so domain persist effects don't fire before client hydration
    useEffect(() => {
        const pnid   = loadPersistedFiles('pnid_files');
        const doc    = loadPersistedFiles('doc_files');
        const tsMeta = loadPersistedFiles('ts_metadata_files');
        const tsVal  = loadPersistedFiles('ts_values_files');
        const sap    = loadPersistedFiles('sap_files');

        _persistReady.current = true;

        if (pnid.length)   setPnidFiles(pnid);
        if (doc.length)    setDocFiles(doc);
        if (tsMeta.length) setTsMetadataFiles(tsMeta);
        if (tsVal.length)  setTsValuesFiles(tsVal);
        if (sap.length)    setSapFiles(sap);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
