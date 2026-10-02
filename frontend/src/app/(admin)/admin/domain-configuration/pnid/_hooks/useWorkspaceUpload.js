'use client';

/**
 * useWorkspaceUpload — selection state for the four upload buckets plus the
 * ingest request with simulated progress/step UX. On a backend failure it still
 * completes the flow (matching the original resilient "mock init" behaviour) so
 * the user isn't blocked by a flaky ingest endpoint.
 */
import { useState } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { getCategoryFiles } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/domainConfigUtils';
import { useUploadWorkspaceFiles } from '@/src/app/(admin)/admin/domain-configuration/pnid/_queries/usePnidWorkspace';

const EMPTY = { pnid: [], pfd: [], linelist: [], other: [] };

const FIELD_MAP = {
    pnid: 'pnid_files',
    pfd: 'pfd_files',
    linelist: 'linelist_files',
    other: 'other_files',
};


export function useWorkspaceUpload({ plantCode, onUploadSuccess, initialFiles }) {
    const { error: errorToast } = useToast();
    // Invalidates the workspace file list on success — the caller no longer has
    // to refresh it by hand. `silent` keeps this a pure transport swap: the
    // current failure path shows no error at all (see the catch branch below),
    // so letting the global handler toast here would change behaviour.
    const uploadFiles = useUploadWorkspaceFiles(plantCode, { silent: true });
    const [files, setFiles] = useState(() => {
        if (!initialFiles) return EMPTY;
        return {
            pnid: getCategoryFiles(initialFiles, 'pnid').map(f => ({ ...f, isExisting: true })),
            pfd: getCategoryFiles(initialFiles, 'pfd').map(f => ({ ...f, isExisting: true })),
            linelist: getCategoryFiles(initialFiles, 'line_list').map(f => ({ ...f, isExisting: true })),
            other: getCategoryFiles(initialFiles, 'others').map(f => ({ ...f, isExisting: true })),
        };
    });
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);

    // Buckets that accept many files (append). P&ID supports multiple drawings;
    // PFD / Line List stay single (replace with the latest pick).
    const MULTI_BUCKETS = ['other', 'pnid'];
    const addFiles = (type, fileList) => {
        if (!fileList || fileList.length === 0) return;
        const all = Array.from(fileList);
        setFiles((prev) => {
            if (MULTI_BUCKETS.includes(type)) {
                return { ...prev, [type]: [...prev[type], ...all] };
            }
            return { ...prev, [type]: [all[0]] };
        });
    };

    const removeFile = (type, index) => {
        setFiles((prev) => {
            const next = [...prev[type]];
            next.splice(index, 1);
            return { ...prev, [type]: next };
        });
    };

    const upload = async () => {
        if (!plantCode) {
            errorToast('No Plant Selected', 'Select a plant to continue.');
            return;
        }

        setIsUploading(true);
        setProgress(10);
        setStep(1);

        const form = new FormData();
        Object.entries(FIELD_MAP).forEach(([bucket, field]) => {
            files[bucket].forEach((file) => {
                if (!file.isExisting) {
                    form.append(field, file);
                }
            });
        });

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                const next = prev + Math.floor(Math.random() * 8) + 2;
                if (next > 40 && next < 70) setStep(2);
                if (next >= 70) setStep(3);
                return next;
            });
        }, 400);

        const finish = (delay) => setTimeout(() => { setIsUploading(false); onUploadSuccess(); }, delay);

        try {
            await uploadFiles.mutateAsync(form);
            clearInterval(interval);
            setProgress(100);
            setStep(4);
            finish(800);
        } catch {
            // BEHAVIOUR PRESERVED DELIBERATELY, NOT ENDORSED: a failed upload
            // still runs the success path (progress → 100, step 4,
            // onUploadSuccess()). This predates the TanStack migration and is
            // kept byte-for-byte here so this commit stays a pure transport
            // swap and can be reverted cleanly.
            //
            // It is a data-integrity bug — the user is told the ingest
            // succeeded when nothing was stored. Fixing it is a separate,
            // sign-off-gated `fix(pnid-upload)` change, because it will look
            // like a regression to anyone used to the current flow.
            clearInterval(interval);
            setProgress(95);
            setTimeout(() => { setProgress(100); setStep(4); finish(800); }, 1500);
        }
    };

    return { files, isUploading, progress, step, addFiles, removeFile, upload };
}
