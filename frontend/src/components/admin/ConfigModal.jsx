'use client';
import React, { useMemo, useRef } from 'react';
import { Info, Upload } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import * as cdm from '@/src/services/domain-configuration/common';
import * as common from '@/src/services/domain-configuration/common';
import { useAdminNav, useDocsForm, usePnidForm, useSapForm, useTsForm } from '@/src/components/admin/AdminPanelContext';
import { ConfigModalDocuments } from '@/src/components/admin/ConfigModalDocuments';
import { ConfigModalSap } from '@/src/components/admin/ConfigModalSap';
import { ConfigModalTimeseries } from '@/src/components/admin/ConfigModalTimeseries';
import { ConfigModalSimpleUpload } from '@/src/components/admin/ConfigModalSimpleUpload';
import { PnidFlowModal } from '@/src/components/admin/PnidFlowModal';
import { useConfigModalActions } from '@/src/components/admin/hooks/useConfigModalActions';
import { generateId } from '@/src/lib/utils';
import { FEED_TYPES } from '@/src/components/admin/admin.constants';
import { useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { usePollConnectorJob } from '@/src/components/admin/_queries/useConnectorJob';
import { useConnectorLabels } from '@/src/components/admin/_queries/useConnectorLabels';
import { useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';
import { hasActiveDocSubtype } from '@/src/components/admin/domainSources';

export function ConfigModal() {
    const pnidInputRef      = useRef(null);
    const tsMetadataInputRef = useRef(null);
    const tsValuesInputRef  = useRef(null);
    const sapInputRef       = useRef(null);

    const { isConfigModalOpen, setIsConfigModalOpen, configStep, setConfigStep, selectedSource } = useAdminNav();
    const { setConfiguredSources, configuredSources, markSourceFailed, selectedPlantId } = useAdminEntities();
    const pollConnectorJob = usePollConnectorJob(selectedPlantId?.id);
    const invalidateConnectorState = useInvalidateConnectorState(selectedPlantId?.id);

    const {
        setPnidUploading, setPnidUploadProgress, setPnidJobId, setPnidJobStatus,
    } = usePnidForm();

    const {
        docFiles, setDocFiles, setUploadedDocFileNames, setUploadedDocSubtypes,
        effectiveDocCategories, docCategorySubtypes, docExtraFields,
        docFileLabels, setDocFileLabels,
    } = useDocsForm();

    const {
        sapStep, setSapStep, sapTab, sapFiles, sapFileLabels, feedFiles, feedFileLabels,
    } = useSapForm();

    const {
        tsStep, setTsStep, setTsValidationErrors, tsTab, tsMetadataFiles, tsValuesFiles, tsFileLabels,
    } = useTsForm();
    const { handleSapSubmit, handlePnidCloudSubmit, handleTsSubmit, handleFeedSubmit } = useConfigModalActions();
    const isFeedSource = FEED_TYPES.includes(selectedSource);
    // Which connectors require a label comes from the backend (required_for on
    // GET /connectors/labels) — the footer buttons below gate on it so a batch
    // can never be submitted into a 422. `requiresLabels` is a stable callback,
    // so it can safely be a dependency of the memos below.
    const { requiresLabels, isError: labelsError } = useConnectorLabels(selectedPlantId?.id);

    // ── Label gate, one rule per connector ───────────────────────────────────
    // A device upload can only go out once every queued file carries a label,
    // for connectors the backend lists in `required_for`. Cloud/source tabs
    // upload no files from here, so they are never gated.
    const docsMissingLabels = useMemo(
        () => docFiles.length > 0
            && requiresLabels('documents') && !common.areAllFilesLabeled(docFiles, docFileLabels),
        [requiresLabels, docFiles, docFileLabels],
    );
    const sapMissingLabels = useMemo(
        () => sapTab === 'device' && sapFiles.length > 0
            && requiresLabels('sap') && !common.areAllFilesLabeled(sapFiles, sapFileLabels),
        [requiresLabels, sapTab, sapFiles, sapFileLabels],
    );
    const tsDeviceFiles = useMemo(
        () => [...tsMetadataFiles, ...tsValuesFiles],
        [tsMetadataFiles, tsValuesFiles],
    );
    const tsMissingLabels = useMemo(
        () => tsTab === 'device' && tsDeviceFiles.length > 0
            && requiresLabels('timeseries') && !common.areAllFilesLabeled(tsDeviceFiles, tsFileLabels),
        [requiresLabels, tsTab, tsDeviceFiles, tsFileLabels],
    );
    const feedMissingLabels = useMemo(() => {
        if (!isFeedSource) return false;
        const files = feedFiles?.[selectedSource] || [];
        // The feed's own connector value — 'AIF' → 'aif' (see handleFeedSubmit).
        return files.length > 0
            && requiresLabels(selectedSource.toLowerCase())
            && !common.areAllFilesLabeled(files, feedFileLabels);
    }, [requiresLabels, isFeedSource, feedFiles, selectedSource, feedFileLabels]);

    // Only the source actually on screen may explain itself — a queued, unlabelled
    // doc batch must not put a warning under the SAP footer.
    const currentSourceMissingLabels =
        selectedSource === 'Documents' ? docsMissingLabels
        : selectedSource === 'SAP' ? sapMissingLabels
        : selectedSource === 'Historian/Timeseries' ? tsMissingLabels
        : isFeedSource ? feedMissingLabels
        : false;

    const labelHint = currentSourceMissingLabels
        ? (labelsError
            ? 'Labels could not be loaded — retry on any file to continue.'
            : 'Assign at least one label to every file to continue.')
        : null;

    const renderConfigFields = () => {
        if (!selectedSource) return null;
        if (selectedSource === 'Documents') return <ConfigModalDocuments />;
        if (selectedSource === 'SAP') return <ConfigModalSap sapInputRef={sapInputRef} />;
        if (isFeedSource) return <ConfigModalSimpleUpload type={selectedSource} />;
        return (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border-strong">
                {selectedSource === 'Historian/Timeseries'
                    ? <ConfigModalTimeseries tsMetadataInputRef={tsMetadataInputRef} tsValuesInputRef={tsValuesInputRef} />
                    : null}
            </div>
        );
    };

    const handleCancel = () => {
        setIsConfigModalOpen(false);
        setConfigStep(1);
        setPnidUploading(false);
        setPnidUploadProgress([]);
        setPnidJobId(null);
        setPnidJobStatus('');
        setTsStep('config');
        setTsValidationErrors([]);
        setSapStep('config');
    };

    // Mirrors useDocSourceModal.js's reconcileUploadedDocSubtype — this modal
    // runs its own parallel doc-submit flow (handleGlobalDocSubmit below) with
    // the same optimistic setUploadedDocSubtypes call, so it needs the same
    // failure cleanup to avoid a failed-only subtype reading as COMMITTED.
    const reconcileUploadedDocSubtype = (sources, docType, docLabel, excludeId) => {
        if (!hasActiveDocSubtype(sources, docLabel, excludeId)) {
            setUploadedDocSubtypes(prev => prev.filter(sub => sub.key !== docType));
        }
    };

    const handleGlobalDocSubmit = async () => {
        if (!docFiles || docFiles.length === 0) return;

        const filesByType = docFiles.reduce((acc, file) => {
            acc[file.docType] = acc[file.docType] || [];
            acc[file.docType].push(file);
            return acc;
        }, {});

        setIsConfigModalOpen(false);
        setConfigStep(1);

        for (const [docType, files] of Object.entries(filesByType)) {
            let docLabel = docType;
            const allBuiltin = effectiveDocCategories ? effectiveDocCategories.flatMap(c => c.types) : [];
            const allCustom = docCategorySubtypes ? Object.values(docCategorySubtypes).flat() : [];
            const found = [...allBuiltin, ...allCustom].find(t => t.key === docType);
            if (found) docLabel = found.label;

            const builtinCategory = effectiveDocCategories?.find(c => c.types.some(t => t.key === docType))?.category;
            const customCategory = Object.entries(docCategorySubtypes || {}).find(([, types]) => types.some(t => t.key === docType))?.[0];
            const categoryLabel = builtinCategory || customCategory || '';

            const fieldsForSave = files.flatMap(f => (docExtraFields && docExtraFields[f.name]) || []);
            if (fieldsForSave.length > 0) {
                try {
                    await cdm.updateUserConfig({
                        document_processing: {
                            document_types: {
                                [docType]: { document_type: docLabel, source_columns: [...new Set(fieldsForSave.map(f => f.name))] },
                            },
                        },
                    }, selectedPlantId?.id);
                } catch (e) {}
            }

            const fileNames = files.map(f => f.name);
            setUploadedDocFileNames(prev => ({
                ...prev,
                [docType]: Array.from(new Set([...(prev[docType] || []), ...fileNames]))
            }));

            const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
            const sourceId = generateId();
            const sourceName = `${files.length} ${docLabel} file(s)`;
            const newSource = {
                id: sourceId, type: 'Documents', name: sourceName, timestamp: ts,
                method: 'device', status: 'running', progress: 0,
                logs: [`Starting upload for ${docLabel}...`, `${fileNames.length} file(s) queued`],
                errors: [],
                category: categoryLabel || undefined,
                subtype: docLabel,
                filesMeta: files.map(f => ({ name: f.name, size: f.size, mimeType: f.type, subtype: docLabel })),
            };

            setConfiguredSources(prev => [newSource, ...prev]);
            setUploadedDocSubtypes(prev => prev.some(s => s.key === docType) ? prev : [...prev, { key: docType, label: docLabel }]);

            try {
                const formData = new FormData();
                formData.append('document_type', docType);
                files.forEach(f => formData.append('files', f));
                if (selectedPlantId?.id) formData.append('plant_code_id', selectedPlantId.id);
                // Labels are collected per file in DocSourceModal and now live in
                // shared form state, so this batch path can send them too — it
                // previously sent none, which the backend rejects for documents.
                const labelFields = common.buildUploadLabelFields(files, docFileLabels);
                if (labelFields) {
                    formData.append('labels', labelFields.labels);
                    formData.append('files_meta', labelFields.files_meta);
                }

                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 30, logs: [...s.logs, 'Uploading files...'] } : s));
                const data = await common.uploadConnectorFile('documents', formData, selectedPlantId?.id);
                const jobId = data.job_id;
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 60, logs: [...s.logs, 'Files uploaded, processing...'] } : s));

                if (jobId) {
                    // Shared poller — see components/admin/_queries/useConnectorJob.js.
                    (async () => {
                        try {
                            const jd = await pollConnectorJob({ connector: 'documents', jobId });
                            setConfiguredSources(prev => {
                                const updated = prev.map(s => s.id === sourceId ? {
                                    ...s, status: jd.status,
                                    progress: jd.status === 'completed' ? 100 : s.progress,
                                    logs: [...s.logs, jd.status === 'completed' ? 'Processing completed successfully' : 'Processing failed'],
                                    errors: jd.status === 'failed' ? [...s.errors, 'Job failed — check logs'] : s.errors,
                                } : s);
                                if (jd.status === 'failed') reconcileUploadedDocSubtype(updated, docType, docLabel, null);
                                return updated;
                            });
                            invalidateConnectorState();
                        } catch {
                            markSourceFailed(sourceId, 'Document job status check failed — check logs');
                            reconcileUploadedDocSubtype(configuredSources, docType, docLabel, sourceId);
                        }
                    })();
                }
            } catch {
                markSourceFailed(sourceId, 'Document upload failed — backend unreachable');
                reconcileUploadedDocSubtype(configuredSources, docType, docLabel, sourceId);
            }
        }

        setDocFiles([]);
        // Every queued file has left the queue, so its label entry is dead —
        // clearing the whole map here is safe (and keeps a re-added file from
        // silently inheriting an old selection).
        setDocFileLabels({});
    };

    if (selectedSource === 'P&ID') {
        const upsertPnidSource = (fileNames = []) => {
            setConfiguredSources(prev => {
                const filesMeta = (fileNames || []).filter(Boolean).map(name => ({ name }));
                const idx = prev.findIndex(s => s.type === 'P&ID');
                if (idx !== -1) {
                    return prev.map((s, i) => i === idx
                        ? { ...s, status: 'completed', progress: 100, ...(filesMeta.length ? { filesMeta } : {}) }
                        : s);
                }
                const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
                return [{
                    id: generateId(), type: 'P&ID', name: 'P&ID Diagram Extractor', timestamp: ts,
                    method: 'pipeline', status: 'completed', progress: 100,
                    logs: ['Processed via Domain Configuration'], errors: [],
                    ...(filesMeta.length ? { filesMeta } : {}),
                }, ...prev];
            });
        };
        const handlePnidProcessed = (payload) => { upsertPnidSource(payload?.files); };
        const handlePnidValidated = () => { upsertPnidSource(); };
        const handlePnidComplete  = () => { upsertPnidSource(); setIsConfigModalOpen(false); setConfigStep(1); };
        return (
            <PnidFlowModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                onComplete={handlePnidComplete}
                onProcessed={handlePnidProcessed}
                onValidated={handlePnidValidated}
            />
        );
    }

    const renderFooterButton = () => {
        if (selectedSource === 'Documents') {
            const hasPendingFiles = docFiles && docFiles.length > 0;
            return (
                <div className="flex gap-3">
                    {hasPendingFiles && (
                        <button
                            onClick={handleGlobalDocSubmit}
                            disabled={docsMissingLabels}
                            aria-disabled={docsMissingLabels}
                            className="bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                        >
                            <Upload size={14} /> Upload & Sync All
                        </button>
                    )}
                    <button onClick={() => { setIsConfigModalOpen(false); setConfigStep(1); }} className="bg-surface-2 hover:bg-surface text-text-primary border border-border font-bold py-2 px-8 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer">
                        Done
                    </button>
                </div>
            );
        }
        if (selectedSource === 'SAP') {
            return sapStep === 'config'
                ? <button onClick={() => setSapStep('file-review')} className="bg-brand hover:bg-brand-hover text-white font-bold py-2 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer">Next</button>
                : <button
                    onClick={handleSapSubmit}
                    disabled={sapMissingLabels}
                    aria-disabled={sapMissingLabels}
                    className="bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
                  >{sapTab === 'device' ? 'Upload & Sync' : 'Connect & Sync'}</button>;
        }
        if (selectedSource === 'Historian/Timeseries') {
            return tsStep === 'config'
                ? <button onClick={() => setTsStep('retention')} className="bg-brand hover:bg-brand-hover text-white font-bold py-2 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer">Next</button>
                : <button
                    onClick={handleTsSubmit}
                    disabled={tsMissingLabels}
                    aria-disabled={tsMissingLabels}
                    className="bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
                  >{tsStep === 'device' ? 'Upload & Sync' : 'Connect & Sync'}</button>;
        }
        if (isFeedSource) {
            const hasPendingFeedFiles = (feedFiles?.[selectedSource] || []).length > 0;
            const feedDisabled = !hasPendingFeedFiles || feedMissingLabels;
            return (
                <button
                    onClick={() => handleFeedSubmit(selectedSource)}
                    disabled={feedDisabled}
                    aria-disabled={feedDisabled}
                    className="bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                    <Upload size={14} /> Upload & Sync
                </button>
            );
        }
        return (
            <button onClick={() => { setIsConfigModalOpen(false); setConfigStep(1); }} className="bg-brand hover:bg-brand-hover text-white font-bold py-2 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer">
                Done
            </button>
        );
    };

    return (
        <Modal
            open={isConfigModalOpen}
            onClose={() => setIsConfigModalOpen(false)}
            size="xl"
            title={`${selectedSource} Configuration`}
            className="max-h-[90vh] flex flex-col overflow-hidden"
        >
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {renderConfigFields()}
            </div>

            <div className="p-4 sm:p-6 bg-canvas border-t border-border flex flex-wrap items-center justify-end gap-3 shrink-0">
                {labelHint && (
                    <p className="text-[11px] font-semibold text-text-muted mr-auto flex items-center gap-1.5 animate-in fade-in duration-300">
                        <Info size={12} className="text-warning shrink-0" />
                        {labelHint}
                    </p>
                )}
                <button onClick={handleCancel} className="px-4 sm:px-6 py-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                    Cancel
                </button>
                {renderFooterButton()}
            </div>
        </Modal>
    );
}
