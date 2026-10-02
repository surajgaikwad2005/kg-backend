'use client';
import { useState, useCallback, useEffect } from 'react';
import {
    getExperimentDetails, getMetricOptions,
    updateExperiment, runTrainingContainer,
} from '@/src/services/model-studio/ml-model/experimentService';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import {
    useCreateMLExperimentMutation,
    useDeleteMLExperimentMutation,
    useMLModelParamsQuery,
} from '../_queries/useMLModelQueries';

const EMPTY_FORM = { name: '', modelName: '', pipelineName: '', metric: '', notes: '', startTime: '', endTime: '', createdBy: '' };

export function useExperimentsTab({ experimentsList, modelsList, pipelinesList, onRefresh }) {
    const { error: toastError } = useToast();
    const { openConfirm } = useConfirm();
    const { plantCode, user } = useApp();

    const createMutation = useCreateMLExperimentMutation();
    const deleteMutation = useDeleteMLExperimentMutation();

    const [activeExpFilter, setActiveExpFilter] = useState('All');
    const [openExpMenuIdx, setOpenExpMenuIdx] = useState(null);
    const [menuPosition, setMenuPosition] = useState(null);
    const [isNewExpModalOpen, setIsNewExpModalOpen] = useState(false);
    const [isExpModifyMode, setIsExpModifyMode] = useState(false);
    const [editingExpId, setEditingExpId] = useState(null);
    const [editingExpStatus, setEditingExpStatus] = useState('created');
    const [editingExpDuration, setEditingExpDuration] = useState(0);
    const [activeExpModalTab, setActiveExpModalTab] = useState('Basic');
    const [newExpForm, setNewExpForm] = useState(EMPTY_FORM);
    const [paramValues, setParamValues] = useState({});
    const [metricOptions, setMetricOptions] = useState([]);
    const [metricOptionsLoading, setMetricOptionsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const selectedModelId = modelsList.find(m => m.model_name === newExpForm.modelName)?.model_id;
    const modelParamsQuery = useMLModelParamsQuery(plantCode, selectedModelId);

    const fetchedParams = Array.isArray(modelParamsQuery.data) ? modelParamsQuery.data : [];
    const paramsLoading = modelParamsQuery.isLoading;
    const paramsError = modelParamsQuery.error ? modelParamsQuery.error.message : null;

    useEffect(() => {
        if (fetchedParams.length > 0) {
            const defaults = {};
            fetchedParams.forEach(p => {
                if (p.default !== undefined) { defaults[p.name] = p.default; }
                else if (p.type === 'float' || p.type === 'int') {
                    const numMatch = p.placeholder ? p.placeholder.match(/-?\d+\.?\d*/) : null;
                    const placeholderNum = numMatch ? parseFloat(numMatch[0]) : NaN;
                    if (!isNaN(placeholderNum)) defaults[p.name] = p.type === 'int' ? Math.round(placeholderNum) : placeholderNum;
                    else if (!p.nullable) defaults[p.name] = 0;
                } else if (p.type === 'boolean') { defaults[p.name] = false; }
                else if (p.type === 'select' && p.options?.length > 0) { defaults[p.name] = p.options[0]; }
            });
            setParamValues(defaults);
        }
    }, [fetchedParams]);

    const fetchMetricOptions = useCallback(async (modelId) => {
        setMetricOptionsLoading(true);
        try {
            const options = await getMetricOptions(plantCode, modelId);
            setMetricOptions(options);
            if (options.length > 0) setNewExpForm(prev => ({ ...prev, metric: prev.metric || options[0].value }));
        } catch { setMetricOptions([]); }
        finally { setMetricOptionsLoading(false); }
    }, [plantCode]);

    useEffect(() => {
        if (newExpForm.modelName) {
            const model = modelsList.find(m => m.model_name === newExpForm.modelName);
            if (model) { fetchMetricOptions(model.model_id); }
            else { setParamValues({}); setMetricOptions([]); }
        } else { setParamValues({}); setMetricOptions([]); }
    }, [newExpForm.modelName, modelsList, fetchMetricOptions]);

    const handleNewExperiment = () => {
        setNewExpForm(EMPTY_FORM);
        setParamValues({}); setMetricOptions([]);
        setEditingExpStatus('created'); setEditingExpDuration(0);
        setIsExpModifyMode(false); setEditingExpId(null);
        setActiveExpModalTab('Basic'); setIsNewExpModalOpen(true);
    };

    const handleEditExperiment = async (exp) => {
        setOpenExpMenuIdx(null);
        try {
            const data = await getExperimentDetails(plantCode, exp.experiment_id);
            const modelInfo = modelsList.find(m => m.model_id === data.model_id);
            const pipelineInfo = pipelinesList.find(p => p.pipeline_id === data.pipeline_id);
            setNewExpForm({ name: data.experiment_name || '', modelName: modelInfo?.model_name || '', pipelineName: pipelineInfo?.pipeline_name || '', metric: data.performance?.primary_metric || '', notes: '', startTime: data.compute?.timerange?.[0] || data.start_time || '', endTime: data.compute?.timerange?.[1] || data.end_time || '', createdBy: data.created_by || '' });
            setParamValues(data.parameters || {});
            setEditingExpStatus(data.status || 'created');
            setEditingExpDuration(data.duration ?? 0);
        } catch {
            const modelInfo = modelsList.find(m => m.model_id === exp.model_id);
            const pipelineInfo = pipelinesList.find(p => p.pipeline_id === exp.pipeline_id);
            setNewExpForm({ name: exp.experiment_name || '', modelName: modelInfo?.model_name || '', pipelineName: pipelineInfo?.pipeline_name || '', metric: exp.performance?.primary_metric || '', notes: '', startTime: exp.compute?.timerange?.[0] || exp.start_time || '', endTime: exp.compute?.timerange?.[1] || exp.end_time || '', createdBy: exp.created_by || '' });
            setParamValues(exp.parameters || {});
            setEditingExpStatus(exp.status || 'created');
            setEditingExpDuration(exp.duration ?? 0);
        }
        setIsExpModifyMode(true); setEditingExpId(exp.experiment_id);
        setActiveExpModalTab('Basic'); setIsNewExpModalOpen(true);
    };

    const handleDeleteExperiment = async (expId) => {
        const ok = await openConfirm('This experiment will be permanently deleted.', { title: 'Delete experiment?', confirmLabel: 'Delete' });
        if (!ok) return;
        try {
            await deleteMutation.mutateAsync({ plantCode, expId });
            onRefresh?.();
        } catch (e) { toastError('Delete failed', e.message || 'Unknown error'); }
        finally { setOpenExpMenuIdx(null); }
    };

    const handleLaunchExperiment = async () => {
        setIsSaving(true);
        try {
            const modelId = modelsList.find(m => m.model_name === newExpForm.modelName)?.model_id || 0;
            const pipelineId = pipelinesList.find(p => p.pipeline_name === newExpForm.pipelineName)?.pipeline_id || 0;
            const performance = { primary_metric: newExpForm.metric || metricOptions[0]?.value || '' };
            const createdBy = newExpForm.createdBy || user?.username || 'User';

            if (isExpModifyMode && editingExpId !== null) {
                await updateExperiment(plantCode, editingExpId, {
                    experiment_name: newExpForm.name,
                    parameters: paramValues || {},
                    performance,
                    duration: editingExpDuration,
                    created_by: createdBy,
                    status: editingExpStatus,
                    start_time: newExpForm.startTime,
                    end_time: newExpForm.endTime,
                    compute: { timerange: [newExpForm.startTime, newExpForm.endTime] }
                });
            } else {
                const data = await createMutation.mutateAsync({
                    plantCode,
                    payload: {
                        experiment_name: newExpForm.name,
                        model_id: modelId,
                        pipeline_id: pipelineId,
                        parameters: paramValues || {},
                        performance,
                        duration: 0,
                        created_by: createdBy,
                        start_time: newExpForm.startTime,
                        end_time: newExpForm.endTime,
                        compute: { timerange: [newExpForm.startTime, newExpForm.endTime] }
                    },
                });
                try { await runTrainingContainer(plantCode, data.experiment_id); }
                catch (e) { toastError('Training not started', e.message || 'Experiment was created, but training failed to start.'); }
            }

            onRefresh?.(); setIsNewExpModalOpen(false); setIsExpModifyMode(false); setEditingExpId(null);
            setNewExpForm(EMPTY_FORM);
            setParamValues({}); setMetricOptions([]); setActiveExpModalTab('Basic');
        } catch (e) {
            toastError(isExpModifyMode ? 'Update failed' : 'Launch failed', e.message || 'Unknown error');
        } finally { setIsSaving(false); }
    };

    const closeModal = () => { setIsNewExpModalOpen(false); setIsExpModifyMode(false); setEditingExpId(null); };

    const expStatusCounts = {};
    experimentsList.forEach(exp => { const s = (exp.status || 'unknown').toLowerCase(); expStatusCounts[s] = (expStatusCounts[s] || 0) + 1; });
    const expFilters = [
        { label: 'All', count: experimentsList.length },
        { label: 'Running', count: expStatusCounts['running'] || 0 },
        { label: 'Completed', count: expStatusCounts['completed'] || 0 },
        { label: 'Failed', count: expStatusCounts['failed'] || 0 },
        { label: 'Queued', count: expStatusCounts['queued'] || 0 },
    ];
    const filteredExperiments = experimentsList.filter(exp =>
        activeExpFilter === 'All' || (exp.status || '').toLowerCase() === activeExpFilter.toLowerCase()
    );

    return {
        activeExpFilter, setActiveExpFilter, openExpMenuIdx, setOpenExpMenuIdx, menuPosition, setMenuPosition,
        isNewExpModalOpen, isExpModifyMode, editingExpId, activeExpModalTab, setActiveExpModalTab,
        newExpForm, setNewExpForm, paramValues, setParamValues, fetchedParams, paramsLoading, paramsError,
        metricOptions, metricOptionsLoading,
        isSaving: isSaving || createMutation.isPending, isDeleting: deleteMutation.isPending, expFilters, filteredExperiments,
        handleNewExperiment, handleEditExperiment, handleDeleteExperiment, handleLaunchExperiment, closeModal,
    };
}

