'use client';
import { useAdminNav, useAdminEntities, usePnidForm, useDocsForm } from '@/src/components/admin/AdminPanelContext';
import { useApp } from '@/src/context/AppContext';
import { getUnprocessedTypes, splitSourceEntries } from '@/src/components/admin/domainSources';
import { useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';

export function useRunPipeline() {
    const { setMultiPipelineTargetView, setMultiPipelineOpen, setMultiPipelineMinimized } = useAdminNav();
    const {
        selectedPlantId, configuredSources,
        triggerPipeline, markProcessed, markProcessedAt, processedSources, committedSources,
        setIsDataSourcesDone, setPipelineStatuses, processedAt, committedAt,
    } = useAdminEntities();
    const {
        setPnidPipelineRunning,
        setPidData, setEquipmentPidData, setEquipmentConnectivityData,
        setPnidImages, setConnectivityByFile, setPids, setPidStep,
        uploadedPnidFileNames,
    } = usePnidForm();
    const {
        setDocDataByCategory, uploadedDocSubtypes, uploadedDocFileNames,
    } = useDocsForm();
    const { industryCode } = useApp();
    const invalidateConnectorState = useInvalidateConnectorState(selectedPlantId?.id);

    const runPipeline = async (selectedTypes = null, forceAll = false) => {
        if (!selectedPlantId?.id) return;
        const plantCode = selectedPlantId.id;
        const configuredTypes = configuredSources.map(s => s.type);
        const pendingTypes = getUnprocessedTypes(configuredSources, { processedAt, committedAt });
        const { unprocessedEntries } = splitSourceEntries(configuredSources, { processedAt, committedAt });

        const isForceAllForType = (type) => {
            if (typeof forceAll === 'boolean') return forceAll;
            if (Array.isArray(forceAll)) return forceAll.includes(type);
            if (forceAll && typeof forceAll === 'object') return !!forceAll[type];
            return false;
        };

        const needsRun = (type) => {
            if (selectedTypes && !selectedTypes.includes(type)) return false;
            if (isForceAllForType(type)) return configuredTypes.includes(type);
            return configuredTypes.includes(type) && (!processedSources.has(type) || pendingTypes.includes(type));
        };
        const hasPnid = needsRun('P&ID');
        const hasDocs = needsRun('Documents');
        const hasTs   = needsRun('Historian/Timeseries');
        const hasSap  = needsRun('SAP');

        setIsDataSourcesDone(true);
        const targetView = hasPnid ? 'pid-review' : hasDocs ? 'docs-review' : hasTs ? 'ts-review' : 'data-config';
        setMultiPipelineTargetView(targetView);
        // No seeded `progress` here any more: progress is read from the server per
        // stage (see pipelineRun.utils.js#derivePipelineProgress), and a stage with
        // nothing to report renders an indeterminate bar rather than a fake number.
        setPipelineStatuses({
            pnid: { status: hasPnid ? 'queued' : 'idle' },
            docs: { status: hasDocs ? 'queued' : 'idle' },
            ts:   { status: hasTs   ? 'queued' : 'idle' },
            sap:  { status: hasSap  ? 'queued' : 'idle' },
        });
        // A new batch always opens expanded, even if the previous one was left minimized.
        setMultiPipelineMinimized(false);
        setMultiPipelineOpen(true);
        setPnidPipelineRunning(true);
        if (hasPnid) {
            setPidData([]);
            setEquipmentPidData([]);
            setEquipmentConnectivityData([]);
            setPnidImages([]);
            setConnectivityByFile({});
            setPids([]);
            setPidStep(0);
        }
        if (hasDocs) {
            setDocDataByCategory({});
        }

        if (hasPnid) {
            let allPnidFiles = Array.isArray(uploadedPnidFileNames) ? uploadedPnidFileNames : [];
            if (allPnidFiles.length === 0) {
                const pnidEntries = configuredSources.filter(s => s.type === 'P&ID');
                allPnidFiles = pnidEntries.flatMap(s => (s.filesMeta || []).map(f => f.name)).filter(Boolean);
            }

            let pnidFilesToProcess = allPnidFiles;
            if (!isForceAllForType('P&ID')) {
                const unprocessedPnidEntries = unprocessedEntries.filter(s => s.type === 'P&ID');
                if (unprocessedPnidEntries.length > 0) {
                    const unprocessedFilesFromEntries = unprocessedPnidEntries
                        .flatMap(s => (s.filesMeta || []).map(f => f.name))
                        .filter(Boolean);
                    if (unprocessedFilesFromEntries.length > 0) {
                        pnidFilesToProcess = unprocessedFilesFromEntries;
                    }
                }
            }

            const result = await triggerPipeline('pnid', {
                stage: 'pnid', plant_code_id: plantCode,
                ...(industryCode && { industry: industryCode }),
                ...(pnidFilesToProcess.length > 0 ? { file_names: pnidFilesToProcess } : {}),
            });
            if (result === 'completed') {
                markProcessed('P&ID');
                markProcessedAt('P&ID');
                invalidateConnectorState();
                if (hasDocs) setPipelineStatuses(prev => ({ ...prev, docs: { status: 'queued', progress: 0 } }));
                if (hasTs)   setPipelineStatuses(prev => ({ ...prev, ts:   { status: 'queued', progress: 0 } }));
            }
        }

        const parallel = [];
        if (hasDocs) {
            let docTypeKeys = uploadedDocSubtypes.map(s => s.key);
            if (docTypeKeys.length === 0) {
                const docEntries = configuredSources.filter(s => s.type === 'Documents');
                docTypeKeys = [...new Set(docEntries.map(s => s.subtype).filter(Boolean))];
            }
            let allFiles = Array.isArray(uploadedDocFileNames) ? uploadedDocFileNames : Object.values(uploadedDocFileNames).flat();
            if (allFiles.length === 0) {
                const docEntries = configuredSources.filter(s => s.type === 'Documents');
                allFiles = docEntries.flatMap(s => (s.filesMeta || []).map(f => f.name)).filter(Boolean);
            }

            let docFilesToProcess = allFiles;
            if (!isForceAllForType('Documents')) {
                const unprocessedDocEntries = unprocessedEntries.filter(s => s.type === 'Documents');
                if (unprocessedDocEntries.length > 0) {
                    const unprocessedFilesFromEntries = unprocessedDocEntries
                        .flatMap(s => (s.filesMeta || []).map(f => f.name))
                        .filter(Boolean);
                    if (unprocessedFilesFromEntries.length > 0) {
                        docFilesToProcess = unprocessedFilesFromEntries;
                    }
                }
            }

            const docsPayload = {
                stage: 'docs',
                plant_code_id: plantCode,
                ...(industryCode && { industry: industryCode }),
                ...(docTypeKeys.length > 0 && { doc_types: docTypeKeys }),
                ...(docFilesToProcess.length > 0 && { doc_files: docFilesToProcess }),
            };

            parallel.push(triggerPipeline('docs', docsPayload).then(r => {
                if (r === 'completed') {
                    markProcessed('Documents');
                    markProcessedAt('Documents');
                    invalidateConnectorState();
                }
                return r;
            }));
        }
        if (hasTs) {
            parallel.push(
                triggerPipeline('ts', { stage: 'ts', plant_code_id: plantCode, ...(industryCode && { industry: industryCode }) }).then((r) => {
                    if (r === 'completed') {
                        markProcessed('Historian/Timeseries');
                        markProcessedAt('Historian/Timeseries');
                    }
                    invalidateConnectorState();
                    return r;
                })
            );
        }
        if (hasSap) {
            parallel.push(
                triggerPipeline('sap', { stage: 'sap', plant_code_id: plantCode, ...(industryCode && { industry: industryCode }) }).then((r) => {
                    if (r === 'completed') {
                        markProcessed('SAP');
                        markProcessedAt('SAP');
                    }
                    invalidateConnectorState();
                    return r;
                })
            );
        }
        if (parallel.length > 0) await Promise.all(parallel);

        // Final automatic refetch of connectors/state and flow/state
        invalidateConnectorState();
        setPnidPipelineRunning(false);
    };

    return { runPipeline };
}
