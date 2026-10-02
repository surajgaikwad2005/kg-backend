'use client';
import { useState } from 'react';
import * as cdm from '@/src/services/domain-configuration/common';
import { updateColumnRenames } from '@/src/services/domain-configuration/common';
import * as pipelineCommon from '@/src/services/domain-configuration/common';
import { useRouter } from 'next/navigation';
import { SAP_TABLE_COLUMNS } from '@/src/components/admin/admin.constants';
import { usePipelineRuns } from './usePipelineRuns';
import { saveCtxParams, extractCtxParams } from './pipelineCtxParams';
import { useInvalidateConnectorState } from '@/src/components/admin/_queries/useDsiQueries';

// commitDataRef.current is updated every render by the provider with the latest
// form-state values, so commit functions always read fresh data without needing
// form hooks to be called before this hook.

export function usePipelineOrchestration({
    selectedPlantId,
    industryCode,
    configuredSources,
    committedSources,
    setCommittedSources,
    markCommittedAt,
    markSourceFailed,
    setView,
    simulateContextProgress,
    setIsProgressModalOpen,
    setProgress,
    setProgressModalTitle,
    setProgressModalSubtitle,
    commitDataRef,
}) {
    const router = useRouter();
    // A commit moves files to the `committed` stage server-side, which changes
    // both the connector rollup and every affected flow row (rule 50).
    const invalidateConnectorState = useInvalidateConnectorState(selectedPlantId?.id);
    const runs = usePipelineRuns({ selectedPlantId });
    const { pipelineStatuses, setPipelineStatuses, registerRun, failRun } = runs;
    const [isCommitting, setIsCommitting] = useState(false);
    const [pnidPipelineJobId, setPnidPipelineJobId] = useState(null);
    const [pnidPipelineRunning, setPnidPipelineRunning] = useState(false);

    /**
     * Start one stage and resolve with its terminal status.
     *
     * The await-until-terminal contract is unchanged for callers, but the waiting
     * is now done by usePipelineRuns' poller rather than a local setInterval —
     * which is what lets the run carry on when the modal is minimized or the user
     * navigates away, and lets a reload rejoin a run already in flight.
     */
    const triggerPipeline = (stage, body) => {
        setPipelineStatuses(prev => ({ ...prev, [stage]: { ...prev[stage], status: 'queued', error: undefined } }));

        return pipelineCommon.runPipeline(body).then(data => {
            const jobId   = data?.pipeline_job_id || data?.job_id   || data?.jobId   || data?.id;
            const batchId = data?.upload_batch_id || data?.batch_id || data?.batchId;
            if (!jobId) {
                failRun(stage, 'No job ID returned by backend');
                return 'failed';
            }

            // Extract all context-API-relevant params from the pipeline body
            const ctxParams = extractCtxParams(stage, body, jobId, batchId);

            // Persist immediately on pipeline start (so hard reload survives)
            if (selectedPlantId?.id) saveCtxParams(selectedPlantId.id, stage, ctxParams);

            // The `admin_pnid_files_by_batch::<batchId>` mirror that used to be
            // written here is gone: every flow/state row carries both
            // `file_name` and `upload_batch_id`, so the batch → file-names
            // lookup is a filter over server data now (see usePnidFormState)
            // and survives a reload instead of dying with the browser profile.

            return registerRun(stage, { jobId, batchId, ctxParams, runResponse: data });
        }).catch(() => {
            failRun(stage, 'Failed to start pipeline');
            return 'failed';
        });
    };

    const commitPidContext = async () => {
        if (!selectedPlantId?.id || isCommitting || committedSources.has('P&ID')) return;
        setIsCommitting(true);
        const plantCode = selectedPlantId.id;
        const { equipmentPidData = [], equipmentConnectivityData = [], pidData = [] } = commitDataRef.current;
        setProgress(0);
        setProgressModalTitle('Configuring Context');
        setProgressModalSubtitle('Writing equipment_pid to database...');
        setIsProgressModalOpen(true);
        const commitBody = { plant_code: plantCode, batch_id: pipelineStatuses.pnid?.batchId };
        if (equipmentPidData.length > 0) commitBody.equipment_pid = equipmentPidData;
        if (equipmentConnectivityData.length > 0) commitBody.equipment_connectivity = equipmentConnectivityData;
        if (!commitBody.equipment_pid && !commitBody.equipment_connectivity) {
            commitBody.equipment_connectivity = pidData.map(r => ({
                from_equipment_ref: r.source, to_equipment_ref: r.destination,
                connection_type: 'FLOW', plant_code: plantCode, source_system: 'PID',
            }));
        }
        setProgress(20);
        setProgressModalSubtitle('Dumping equipment_pid table to database...');
        try {
            const result = await cdm.commitContext('pnid', commitBody);
            setProgress(70);
            setProgressModalSubtitle('Writing equipment_connectivity table to database...');
            setProgress(95);
            const totalRows = result.total_rows_written || 0;
            const tables = (result.tables || []).map(t => `${t.table}: ${t.rows_written} rows`).join(', ');
            setProgressModalSubtitle(`Committed ${totalRows} rows — ${tables}`);
            setProgress(100);
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (e) {
            setProgressModalSubtitle(`Error: ${e.message || 'Failed to commit'}`);
            setProgress(100);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        setIsProgressModalOpen(false);
        setCommittedSources(prev => new Set([...prev, 'P&ID']));
        markCommittedAt('P&ID');
        const hasDocs = configuredSources.some(s => s.type === 'Documents');
        const hasTs   = configuredSources.some(s => s.type === 'Historian/Timeseries');
        const hasSap  = configuredSources.some(s => s.type === 'SAP');
        const nextView = hasDocs ? 'docs-review' : hasTs ? 'ts-review' : hasSap ? 'sap-tables' : 'data-config';
        if (nextView === 'data-config') {
            router.push('/admin/domain-configuration/data-source-integration');
        } else {
            router.push(`/admin/domain-configuration/data-source-integration/review?view=${nextView}`);
        }
        setIsCommitting(false);
        invalidateConnectorState();
    };

    const commitDocsContext = async () => {
        if (!selectedPlantId?.id || isCommitting || committedSources.has('Documents')) return;
        setIsCommitting(true);
        const plantCode = selectedPlantId.id;
        const { docDataByCategory = {}, setDocDataByCategory, uploadedDocSubtypes = [], uploadedDocFileNames = [] } = commitDataRef.current;
        setCommittedSources(prev => new Set([...prev, 'Documents']));
        markCommittedAt('Documents');
        const hasTs  = configuredSources.some(s => s.type === 'Historian/Timeseries');
        const hasSap = configuredSources.some(s => s.type === 'SAP');
        simulateContextProgress(hasTs ? 'ts-review' : hasSap ? 'sap-tables' : 'data-config');
        const allDocs = Object.values(docDataByCategory).flat();
        setDocDataByCategory?.({});
        try {
            await cdm.commitContext('documents', { plant_code_id: plantCode, batch_id: pipelineStatuses.docs?.batchId, rows: allDocs });
            const docTypeKeys = uploadedDocSubtypes.map(s => s.key);
            await pipelineCommon.runPipeline({ stage: 'docs', plant_code_id: plantCode, ...(industryCode && { industry: industryCode }), ...(docTypeKeys.length > 0 && { doc_types: docTypeKeys, doc_files: uploadedDocFileNames }) });
        } catch { /* ignore */ }
        finally { setIsCommitting(false); invalidateConnectorState(); }
    };

    const commitTsContext = async () => {
        if (!selectedPlantId?.id || isCommitting || committedSources.has('Historian/Timeseries')) return;
        setIsCommitting(true);
        const plantCode = selectedPlantId.id;
        const { tsData = [] } = commitDataRef.current;
        setCommittedSources(prev => new Set([...prev, 'Historian/Timeseries']));
        markCommittedAt('Historian/Timeseries');
        const hasSap = configuredSources.some(s => s.type === 'SAP');
        simulateContextProgress(hasSap ? 'sap-tables' : 'data-config');
        try {
            await cdm.commitContext('timeseries', { plant_code_id: plantCode, batch_id: pipelineStatuses.ts?.batchId, rows: tsData });
            await pipelineCommon.runPipeline({ stage: 'ts', plant_code_id: plantCode, ...(industryCode && { industry: industryCode }) });
        } catch { /* ignore */ }
        finally { setIsCommitting(false); invalidateConnectorState(); }
    };

    const commitSapContext = async () => {
        if (!selectedPlantId?.id || isCommitting || committedSources.has('SAP')) return;
        setIsCommitting(true);
        const plantCode = selectedPlantId.id;
        const { sapData = [], sapTables = [], sapColumnMappings = {} } = commitDataRef.current;
        simulateContextProgress('welcome', true);
        const tables = {};
        const selectedTablesList = sapTables.filter(t => t.selected);
        for (const t of selectedTablesList) tables[t.name.toLowerCase()] = sapData;
        for (const t of selectedTablesList) {
            const renames = {};
            (SAP_TABLE_COLUMNS[t.name] || []).forEach(col => {
                const val = sapColumnMappings[t.name]?.[col];
                if (val?.trim()) renames[col] = val.trim();
            });
            if (Object.keys(renames).length > 0) updateColumnRenames(t.name.toLowerCase(), renames, plantCode).catch(() => {});
        }
        try {
            await cdm.commitContext('sap', { plant_code: plantCode, batch_id: pipelineStatuses.sap?.batchId, tables });
            await pipelineCommon.runPipeline({ stage: 'sap',  plant_code_id: plantCode, ...(industryCode && { industry: industryCode }) });
            await pipelineCommon.runPipeline({ stage: 'full', plant_code_id: plantCode, ...(industryCode && { industry: industryCode }) });
            await cdm.populateOntology({ plant_code: plantCode });
        } catch { /* ignore */ }
        finally { setIsCommitting(false); invalidateConnectorState(); }
    };

    return {
        pipelineStatuses, setPipelineStatuses,
        isCommitting,
        triggerPipeline,
        // Cancel / retry / their pending flags come straight from the run registry.
        cancelRun: runs.cancelRun,
        retryRun: runs.retryRun,
        isCancelling: runs.isCancelling,
        isRetrying: runs.isRetrying,
        commitPidContext, commitDocsContext, commitTsContext, commitSapContext,
        pnidPipelineJobId, setPnidPipelineJobId,
        pnidPipelineRunning, setPnidPipelineRunning,
    };
}
