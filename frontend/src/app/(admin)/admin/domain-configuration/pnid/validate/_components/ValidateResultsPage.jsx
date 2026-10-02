'use client';

/**
 * Validate Mapping Results (Ontology Generator) — connection list + diagram
 * viewer + verification metadata, with the knowledge-graph overlay. All logic
 * is provided by ValidateProvider; this file is layout + header actions.
 * Fullscreen hides the app chrome for an unobstructed viewer.
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import PageHeader from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/ui/PageHeader';
import { PNID_ROUTES } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/routes';
import { ValidateProvider, useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';
import { useCdmCommit } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_hooks/useCdmCommit';
import ConnectionSidebar from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/ConnectionSidebar';
import ActiveConnectionHeader from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/ActiveConnectionHeader';
import PageSelector from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/PageSelector';
import CanvasArea from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/CanvasArea';
import VerificationMetadata from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/VerificationMetadata';
import KGOverlay from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_components/KGOverlay';
import { ShieldCheck, Download, Layers, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';

function ValidatePageContent({ standalone = false }) {
    const { router, plantCode, pnidUploads, connections, isFullScreen, handleDownloadExcel, errorMessage, setErrorMessage } = useValidateContext();
    const { success: successToast, error: errorToast } = useToast();

    // errorMessage is set by every hook in this feature (file/highlight fetch,
    // image load, save, validate...) but was never rendered anywhere — failures
    // were silently invisible. Surface each one as a toast, then clear it so a
    // repeat of the same failure can fire again.
    useEffect(() => {
        if (errorMessage) {
            errorToast('Validate P&ID', errorMessage);
            setErrorMessage(null);
        }
    }, [errorMessage, errorToast, setErrorMessage]);

    // All connections verified check
    const allVerified = connections.length > 0 && connections.every((c) => c.verified);

    const invalidateConnectorState = useInvalidateConnectorState(plantCode);

    const fileNames = useMemo(() => (pnidUploads || []).map((f) => f.name).filter(Boolean), [pnidUploads]);
    const { phase, error: cdmError, job, runAndCommit, commit } = useCdmCommit({ plantCode, fileNames });

    const handleComplete = useCallback(() => {
        runAndCommit();
    }, [runAndCommit]);

    // Once the P0 CDM pipeline job finishes, either commit (success) or
    // surface the failure — replaces the old "always succeeds" toast with the
    // actual pipeline outcome.
    const committedForJobRef = useRef(null);
    useEffect(() => {
        if (!job || job.pipeline_job_id === committedForJobRef.current) return;
        if (job.status === 'completed') {
            committedForJobRef.current = job.pipeline_job_id;
            commit();
        } else if (job.status === 'failed' || job.status === 'cancelled' || job.status === 'partial' || job.status === 'interrupted') {
            committedForJobRef.current = job.pipeline_job_id;
            errorToast('P&ID Processing Failed', job.error || `Pipeline ended with status "${job.status}".`);
        }
    }, [job, commit, errorToast]);

    useEffect(() => {
        if (phase === 'done') {
            invalidateConnectorState();
            router.onValidated?.();
            successToast('Validation Complete', 'P&ID data committed to the database successfully.');
        } else if (phase === 'error' && cdmError) {
            errorToast('Validate P&ID', cdmError);
        }
    }, [phase, cdmError, invalidateConnectorState, router, successToast, errorToast]);

    const isCompleting = phase === 'running' || phase === 'committing';
    const completeLabel = phase === 'running' ? 'Processing…' : phase === 'committing' ? 'Committing…' : 'Complete';

    return (
        <div className="flex h-full w-full bg-canvas text-text-secondary overflow-hidden">

            <main className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-canvas">
                {!isFullScreen && !standalone && (
                    <PageHeader
                        title="Validate Mapping Results"
                        subtitle={plantCode ? `Active Plant: ${plantCode}` : 'No plant selected'}
                        onBack={standalone ? undefined : () => router.push(PNID_ROUTES.manageFiles)}
                    >
                        {plantCode && (
                            <>
                                {allVerified && (
                                    <span className="px-3.5 py-2.5 bg-success/10 border border-success/30 text-success text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2" title="All connections verified — P&ID is validated">
                                        <ShieldCheck size={14} /> P&ID Verified
                                    </span>
                                )}
                                {allVerified && (
                                    <button
                                        onClick={handleComplete}
                                        disabled={isCompleting}
                                        aria-busy={isCompleting}
                                        title="Run the P0 CDM pipeline and commit this P&ID's data to the database"
                                        className="px-4 py-2.5 bg-success hover:bg-success/90 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                    >
                                        {isCompleting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                        {completeLabel}
                                    </button>
                                )}
                                <button onClick={handleDownloadExcel} className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer" title="Download Final Excel Workbook">
                                    <Download size={14} /> Download Excel
                                </button>
                                {!standalone && (
                                    <button onClick={() => router.push(PNID_ROUTES.templateMatching)} className="px-4 py-2.5 bg-brand-muted border border-brand/30 hover:bg-brand/10 text-brand text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer" title="Go to Template Matching">
                                        <Layers size={14} /> Template Matching
                                    </button>
                                )}
                            </>
                        )}
                    </PageHeader>
                )}

                <div
                    className={
                        isFullScreen
                            ? 'fixed inset-0 z-100 flex min-w-0 min-h-0 bg-canvas animate-in fade-in duration-200'
                            : 'flex-1 flex min-w-0 min-h-0 relative'
                    }
                >
                    <ConnectionSidebar />

                    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-canvas overflow-y-auto p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6">
                        <PageSelector />
                        <ActiveConnectionHeader />
                        <CanvasArea />
                        <VerificationMetadata />
                    </div>

                    <KGOverlay />
                </div>
            </main>

            {/* Floating Aivee assistant — available on the validate step itself.
                Ask about the P&ID/graph; once the KG is open, double-click any
                message to jump to the node/connection being discussed. */}
           {/* {isAiveeRequired && <PnidKgAiveeChatbot />} */}
        </div>
    );
}

export default function ValidateResultsPage({ standalone = false, isAiveeRequired = true }) {
    return (
        <ValidateProvider>
            <ValidatePageContent standalone={standalone} isAiveeRequired={isAiveeRequired} />
        </ValidateProvider>
    );
}
