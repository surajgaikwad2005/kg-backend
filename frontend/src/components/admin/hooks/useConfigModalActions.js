'use client';
import * as common from '@/src/services/domain-configuration/common';
import { updateUserConfig } from '@/src/services/domain-configuration/common';
import { generateId } from '@/src/lib/utils';
import { usePollConnectorJob } from '@/src/components/admin/_queries/useConnectorJob';
import { useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';
import { useAdminNav, useAdminEntities, usePnidForm, useSapForm, useTsForm } from '@/src/components/admin/AdminPanelContext';

export function useConfigModalActions() {
    const { setIsConfigModalOpen, setConfigStep, selectedPlantId: _navPlantId } = useAdminNav();
    const { setConfiguredSources, markSourceFailed, performPnidUpload, selectedPlantId } = useAdminEntities();
    const pollConnectorJob = usePollConnectorJob(selectedPlantId?.id);
    const invalidateConnectorState = useInvalidateConnectorState(selectedPlantId?.id);

    const {
        pnidTab, pnidFiles, setPnidFiles, setPnidUploading, setPnidUploadProgress,
        pnidCloudType, pnidCloudConfig, setPnidDuplicateDialog,
    } = usePnidForm();

    const {
        sapTab, sapTables, sapFiles, setSapFiles, setSapStep,
        sapCloudType, sapCloudConfig, sapDetectedTables, sapFileLabels, setSapFileLabels,
        feedFiles, setFeedFiles, feedFileLabels, setFeedFileLabels,
    } = useSapForm();

    const {
        tsTab, tsMetadataFiles, setTsMetadataFiles, tsValuesFiles, setTsValuesFiles,
        setTsValidationErrors, setTsStep, tsCloudType, tsCloudConfig, tsRetention, tsFileLabels, setTsFileLabels,
    } = useTsForm();

    const handleSapSubmit = async () => {
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const sourceId = generateId();
        const selectedTableNames = sapTables.filter(t => t.selected).map(t => t.name);
        const subtypeLabel = selectedTableNames.length === 0 ? undefined
            : selectedTableNames.length <= 2 ? selectedTableNames.join(', ')
                : `${selectedTableNames.length} tables`;
        const sourceName = sapTab === 'device'
            ? `SAP (${sapFiles.length} file(s))`
            : sapTab === 'source'
                ? `SAP Direct (${selectedTableNames.length} tables)`
                : `SAP Cloud (${sapCloudType.toUpperCase()})`;
        const newSource = {
            id: sourceId, type: 'SAP', name: sourceName, timestamp,
            method: sapTab === 'device' ? 'source' : sapTab,
            cloudProvider: sapTab === 'cloud' ? sapCloudType : undefined,
            status: 'running', progress: 0,
            logs: [`Starting SAP ${sapTab === 'device' ? 'upload' : 'connection'}...`, `${selectedTableNames.length} table(s) configured`],
            errors: [],
            subtype: subtypeLabel,
            filesMeta: sapTab === 'device'
                ? sapFiles.map(f => ({
                    name: f.name, size: f.size, mimeType: f.type,
                    subtype: sapDetectedTables.find(d => d.fileName === f.name)?.name,
                }))
                : [],
        };
        setConfiguredSources(prev => [newSource, ...prev]);
        setIsConfigModalOpen(false);
        setConfigStep(1);
        setSapStep('config');
        setSapFiles([]);
        try {
            let jobId = '';
            if (sapTab === 'device') {
                if (sapFiles.length === 0) return;
                const formData = new FormData();
                sapFiles.forEach(f => formData.append('files', f));
                formData.append('file_type', 'SAP');
                if (selectedPlantId?.id) formData.append('plant_code_id', selectedPlantId.id);
                const sapLabelFields = common.buildUploadLabelFields(sapFiles, sapFileLabels);
                if (sapLabelFields) {
                    formData.append('labels', sapLabelFields.labels);
                    formData.append('files_meta', sapLabelFields.files_meta);
                }
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 0, logs: [...s.logs, 'Uploading SAP table files...'] } : s));
                const data = await common.uploadConnectorFileWithProgress('sap', formData, {
                    onProgress: (pct) => {
                        setConfiguredSources(prev => prev.map(s => s.id === sourceId
                            ? { ...s, progress: Math.round(pct * 0.55) }
                            : s));
                    },
                    plantCode: selectedPlantId?.id,
                });
                jobId = data.job_id;
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 60, logs: [...s.logs, 'Files uploaded, processing...'] } : s));
            } else if (sapTab === 'cloud') {
                const body = { cloud_type: sapCloudType, ...sapCloudConfig, ...(selectedPlantId?.id ? { plant_code: selectedPlantId.id } : {}) };
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 30, logs: [...s.logs, `Connecting to ${sapCloudType.toUpperCase()}...`] } : s));
                const data = await common.connectConnectorCloud('sap', body, undefined, selectedPlantId?.id);
                jobId = data.job_id;
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 60, logs: [...s.logs, 'Connected, syncing files...'] } : s));
            }
            if (jobId) {
                (async () => {
                    try {
                        const jd = await pollConnectorJob({ connector: 'sap', jobId });
                        setConfiguredSources(prev => prev.map(s => s.id === sourceId ? {
                            ...s, status: jd.status,
                            progress: jd.status === 'completed' ? 100 : s.progress,
                            logs: [...s.logs, jd.status === 'completed' ? 'SAP data synced successfully' : 'Processing failed'],
                            errors: jd.status === 'failed' ? [...s.errors, jd.error || 'Job failed — check logs'] : s.errors,
                        } : s));
                        invalidateConnectorState();
                    } catch {
                        markSourceFailed(sourceId, 'SAP job status check failed — check logs');
                    }
                })();
            }
        } catch {
            markSourceFailed(sourceId, 'SAP upload failed — backend unreachable');
        }
    };

    // AIF / GLOC / LOPC — SAP-linked feeds, uploaded with their own native
    // connector value (connector='aif'|'gloc'|'lopc', lowercased from `type`
    // here — 2026-08-17: moved off connector='sap'+file_type=<type> since the
    // backend's connector enum now lists these natively). Device-only, no
    // cloud tab, no review screen (see ConfigModalSimpleUpload +
    // useSourceTabs' FEED_TYPES). Job polling still goes through
    // connector='sap' below — polling is connector-agnostic on the backend
    // and there is no dedicated aif/gloc/lopc jobs/[...path] route locally.
    const handleFeedSubmit = async (type) => {
        const files = feedFiles?.[type] || [];
        if (files.length === 0) return;
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const sourceId = generateId();
        const newSource = {
            id: sourceId, type, name: `${type} (${files.length} file(s))`, timestamp,
            method: 'device', status: 'running', progress: 0,
            logs: [`Starting ${type} upload...`, `${files.length} file(s) queued`],
            errors: [],
            filesMeta: files.map(f => ({ name: f.name, size: f.size, mimeType: f.type })),
        };
        setConfiguredSources(prev => [newSource, ...prev]);
        setIsConfigModalOpen(false);
        setConfigStep(1);
        setFeedFiles(prev => ({ ...prev, [type]: [] }));
        try {
            const formData = new FormData();
            files.forEach(f => formData.append('files', f));
            if (selectedPlantId?.id) formData.append('plant_code_id', selectedPlantId.id);
            const feedLabelFields = common.buildUploadLabelFields(files, feedFileLabels);
            if (feedLabelFields) {
                formData.append('labels', feedLabelFields.labels);
                formData.append('files_meta', feedLabelFields.files_meta);
            }
            setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 0, logs: [...s.logs, `Uploading ${type} files...`] } : s));
            const data = await common.uploadConnectorFileWithProgress(type.toLowerCase(), formData, {
                onProgress: (pct) => {
                    setConfiguredSources(prev => prev.map(s => s.id === sourceId
                        ? { ...s, progress: Math.round(pct * 0.55) }
                        : s));
                },
                plantCode: selectedPlantId?.id,
            });
            const jobId = data.job_id;
            setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 60, logs: [...s.logs, 'Files uploaded, processing...'] } : s));
            if (jobId) {
                (async () => {
                    try {
                        const jd = await pollConnectorJob({ connector: 'sap', jobId });
                        setConfiguredSources(prev => prev.map(s => s.id === sourceId ? {
                            ...s, status: jd.status,
                            progress: jd.status === 'completed' ? 100 : s.progress,
                            logs: [...s.logs, jd.status === 'completed' ? `${type} data synced successfully` : 'Processing failed'],
                            errors: jd.status === 'failed' ? [...s.errors, jd.error || 'Job failed — check logs'] : s.errors,
                        } : s));
                        invalidateConnectorState();
                    } catch {
                        markSourceFailed(sourceId, `${type} job status check failed — check logs`);
                    }
                })();
            }
        } catch {
            markSourceFailed(sourceId, `${type} upload failed — backend unreachable`);
        }
    };

    const handlePnidCloudSubmit = async () => {
        if (pnidTab === 'cloud') {
            const cloudUri = `${pnidCloudType}://${pnidCloudConfig.bucket || pnidCloudConfig.account_name || pnidCloudConfig.project_id || ''}/${pnidCloudConfig.prefix || ''}`;
            const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
            const sourceId = generateId();
            const newSource = {
                id: sourceId, type: 'P&ID', name: `Cloud (${pnidCloudType.toUpperCase()})`, timestamp,
                method: 'cloud', cloudProvider: pnidCloudType, status: 'running', progress: 0,
                logs: ['Connecting...', cloudUri], errors: [],
            };
            setConfiguredSources(prev => [newSource, ...prev]);
            setIsConfigModalOpen(false);
            setConfigStep(1);
            try {
                const body = { cloud_type: pnidCloudType, ...pnidCloudConfig, ...(selectedPlantId?.id ? { plant_code: selectedPlantId.id } : {}) };
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 30, logs: [...s.logs, `Connecting to ${pnidCloudType.toUpperCase()}...`] } : s));
                const data = await common.connectConnectorCloud('pnid', body, undefined, selectedPlantId?.id);
                const jobId = data.job_id;
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 60, logs: [...s.logs, 'Connected, syncing files...'] } : s));
                (async () => {
                    try {
                        const jd = await pollConnectorJob({ connector: 'pnid', jobId });
                        setConfiguredSources(prev => prev.map(s => s.id === sourceId ? {
                            ...s, status: jd.status,
                            progress: jd.status === 'completed' ? 100 : s.progress,
                            logs: [...s.logs, jd.status === 'completed' ? 'Processing completed successfully' : 'Processing failed'],
                            errors: jd.status === 'failed' ? [...s.errors, 'Job failed — check logs'] : s.errors,
                        } : s));
                        invalidateConnectorState();
                    } catch {
                        markSourceFailed(sourceId, 'P&ID job status check failed — check logs');
                    }
                })();
            } catch {
                markSourceFailed(sourceId, 'P&ID cloud connection failed — check logs');
            }
            return;
        }
        if (pnidFiles.length === 0) return;
        try {
            const existData = await common.getExistingPnid(selectedPlantId?.id);
            const existingNames = existData.files || [];
            const dupes = pnidFiles.filter(f => existingNames.includes(f.name)).map(f => f.name);
            if (dupes.length > 0) {
                const capturedFiles = [...pnidFiles];
                setPnidDuplicateDialog({
                    open: true,
                    duplicates: dupes,
                    onReprocess: () => {
                        setPnidDuplicateDialog(prev => ({ ...prev, open: false }));
                        performPnidUpload(capturedFiles);
                    },
                    onSkip: () => {
                        setPnidDuplicateDialog(prev => ({ ...prev, open: false }));
                        const newOnly = capturedFiles.filter(f => !dupes.includes(f.name));
                        if (newOnly.length > 0) {
                            performPnidUpload(newOnly);
                        } else {
                            setPnidFiles([]);
                            setPnidUploading(false);
                            setPnidUploadProgress([]);
                        }
                    },
                });
                return;
            }
        } catch { /* endpoint unreachable — proceed with upload */ }
        performPnidUpload(pnidFiles);
    };

    const handleTsSubmit = async () => {
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const sourceId = generateId();
        const fileCount = tsMetadataFiles.length + tsValuesFiles.length;
        const sourceName = tsTab === 'device' ? `Timeseries (${fileCount} file(s))` : `Timeseries (${tsCloudType.toUpperCase()})`;
        const subtypeLabel = tsTab === 'device'
            ? [tsMetadataFiles.length > 0 && 'Metadata', tsValuesFiles.length > 0 && 'Values'].filter(Boolean).join(' + ')
            : undefined;
        const newSource = {
            id: sourceId, type: 'Historian/Timeseries', name: sourceName, timestamp,
            method: tsTab,
            cloudProvider: tsTab === 'cloud' ? tsCloudType : undefined,
            status: 'running', progress: 0,
            logs: [`Starting timeseries ${tsTab === 'device' ? 'upload' : 'connection'}...`, `${tsMetadataFiles.length} metadata + ${tsValuesFiles.length} values file(s)`],
            errors: [],
            subtype: subtypeLabel || undefined,
            filesMeta: tsTab === 'device'
                ? [
                    ...tsMetadataFiles.map(f => ({ name: f.name, size: f.size, mimeType: f.type, role: 'metadata', subtype: 'Metadata' })),
                    ...tsValuesFiles.map(f => ({ name: f.name, size: f.size, mimeType: f.type, role: 'values', subtype: 'Values' })),
                  ]
                : [],
        };
        setConfiguredSources(prev => [newSource, ...prev]);
        setIsConfigModalOpen(false);
        setConfigStep(1);
        setTsStep('config');
        setTsMetadataFiles([]);
        setTsValuesFiles([]);
        setTsValidationErrors([]);
        try {
            await updateUserConfig({ timeseries: { retention: tsRetention } }, selectedPlantId?.id);
        } catch (e) {
        }
        try {
            let jobId = '';
            if (tsTab === 'device') {
                if (tsMetadataFiles.length === 0 && tsValuesFiles.length === 0) return;
                const hasMetadata = tsMetadataFiles.length > 0;
                const hasValues = tsValuesFiles.length > 0;
                if (hasMetadata) {
                    const formData = new FormData();
                    tsMetadataFiles.forEach(f => formData.append('files', f));
                    formData.append('file_type', 'metadata');
                    if (selectedPlantId?.id) formData.append('plant_code_id', selectedPlantId.id);
                    const metaLabelFields = common.buildUploadLabelFields(tsMetadataFiles, tsFileLabels);
                    if (metaLabelFields) {
                        formData.append('labels', metaLabelFields.labels);
                        formData.append('files_meta', metaLabelFields.files_meta);
                    }
                    setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 0, logs: [...s.logs, 'Uploading metadata files...'] } : s));
                    // metadata gets 0-30% of overall progress (or 0-55% when no values file)
                    const metaMax = hasValues ? 30 : 55;
                    const data = await common.uploadConnectorFileWithProgress('timeseries', formData, {
                        onProgress: (pct) => {
                            setConfiguredSources(prev => prev.map(s => s.id === sourceId
                                ? { ...s, progress: Math.round(pct * (metaMax / 100)) }
                                : s));
                        },
                        plantCode: selectedPlantId?.id,
                    });
                    jobId = data.job_id;
                }
                if (hasValues) {
                    const formData = new FormData();
                    tsValuesFiles.forEach(f => formData.append('files', f));
                    formData.append('file_type', 'values');
                    if (selectedPlantId?.id) formData.append('plant_code_id', selectedPlantId.id);
                    const valLabelFields = common.buildUploadLabelFields(tsValuesFiles, tsFileLabels);
                    if (valLabelFields) {
                        formData.append('labels', valLabelFields.labels);
                        formData.append('files_meta', valLabelFields.files_meta);
                    }
                    const valStart = hasMetadata ? 30 : 0;
                    setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: valStart, logs: [...s.logs, 'Uploading values files...'] } : s));
                    // values gets 30-55% (or 0-55% when no metadata file)
                    const valSpan = 55 - valStart;
                    const data = await common.uploadConnectorFileWithProgress('timeseries', formData, {
                        onProgress: (pct) => {
                            setConfiguredSources(prev => prev.map(s => s.id === sourceId
                                ? { ...s, progress: valStart + Math.round(pct * (valSpan / 100)) }
                                : s));
                        },
                        plantCode: selectedPlantId?.id,
                    });
                    jobId = data.job_id;
                }
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 60, logs: [...s.logs, 'Files uploaded, processing...'] } : s));
            } else if (tsTab === 'cloud') {
                const body = { cloud_type: tsCloudType, ...tsCloudConfig, ...(selectedPlantId?.id ? { plant_code: selectedPlantId.id } : {}) };
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 30, logs: [...s.logs, `Connecting to ${tsCloudType.toUpperCase()}...`] } : s));
                const data = await common.connectConnectorCloud('timeseries', body, undefined, selectedPlantId?.id);
                jobId = data.job_id;
                setConfiguredSources(prev => prev.map(s => s.id === sourceId ? { ...s, progress: 60, logs: [...s.logs, 'Connected, syncing files...'] } : s));
            }
            if (jobId) {
                (async () => {
                    try {
                        const jd = await pollConnectorJob({ connector: 'timeseries', jobId });
                        setConfiguredSources(prev => prev.map(s => s.id === sourceId ? {
                            ...s, status: jd.status,
                            progress: jd.status === 'completed' ? 100 : s.progress,
                            logs: [...s.logs, jd.status === 'completed' ? 'Timeseries data synced successfully' : 'Processing failed'],
                            errors: jd.status === 'failed' ? [...s.errors, jd.error || 'Job failed — check logs'] : s.errors,
                        } : s));
                        invalidateConnectorState();
                    } catch {
                        markSourceFailed(sourceId, 'Timeseries job status check failed — check logs');
                    }
                })();
            }
        } catch {
            markSourceFailed(sourceId, 'Timeseries upload failed — backend unreachable');
        }
    };

    return { handleSapSubmit, handlePnidCloudSubmit, handleTsSubmit, handleFeedSubmit };
}
