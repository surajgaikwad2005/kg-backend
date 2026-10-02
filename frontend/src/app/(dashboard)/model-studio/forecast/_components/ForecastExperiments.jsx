'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Archive, FlaskConical, Loader2, Pencil } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { Select } from '@/src/components/ui/Select';
import { useToast } from '@/src/components/ui/Toast';
import {
    getForecastModelParams, getForecastExperimentDetails,
    createForecastExperiment, updateForecastExperiment, deleteForecastExperiment,
} from '@/src/services/model-studio/forecast/forecastExperimentService';

const STATUS_OPTIONS = ['created', 'running', 'completed', 'failed'];

export function ForecastExperiments({ plantCode, experimentsList, isExperimentsLoading, modelsList, pipelinesList, onRefresh }) {
    const { error: toastError } = useToast();
    const [isNewExpModalOpen, setIsNewExpModalOpen] = useState(false);
    const [isExpModifyMode, setIsExpModifyMode] = useState(false);
    const [editingExpId, setEditingExpId] = useState(null);
    const [editingExperiment, setEditingExperiment] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [newExpForm, setNewExpForm] = useState({ name: '', modelName: '', pipelineName: '', startTime: '', endTime: '' });
    const [editForm, setEditForm] = useState({ status: '', metricName: '', metricValue: '' });
    const [paramValues, setParamValues] = useState({});
    const [fetchedParams, setFetchedParams] = useState([]);
    const [paramsLoading, setParamsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchModelParams = useCallback(async (modelId) => {
        setParamsLoading(true);
        try {
            const params = await getForecastModelParams(plantCode, modelId);
            setFetchedParams(params);
            const defaults = {};
            params.forEach(p => {
                if (p.default !== undefined) defaults[p.name] = p.default;
                else if (p.type === 'boolean') defaults[p.name] = false;
                else if (p.type === 'select' && p.options?.length > 0) defaults[p.name] = p.options[0];
            });
            setParamValues(defaults);
        } catch { setFetchedParams([]); }
        finally { setParamsLoading(false); }
    }, [plantCode]);

    useEffect(() => {
        if (isExpModifyMode) return;
        if (newExpForm.modelName) {
            const model = modelsList.find(m => m.model_name === newExpForm.modelName);
            if (model) fetchModelParams(model.model_id);
            else setFetchedParams([]);
        } else {
            setFetchedParams([]);
            setParamValues({});
        }
    }, [newExpForm.modelName, modelsList, fetchModelParams, isExpModifyMode]);

    const handleNewExperiment = () => {
        setNewExpForm({ name: '', modelName: '', pipelineName: '', startTime: '', endTime: '' });
        setParamValues({});
        setFetchedParams([]);
        setIsExpModifyMode(false);
        setEditingExpId(null);
        setEditingExperiment(null);
        setIsNewExpModalOpen(true);
    };

    const handleEditExperiment = async (expId) => {
        setIsDetailsLoading(true);
        try {
            const details = await getForecastExperimentDetails(plantCode, expId);
            const metricName = details?.performance?.primary_metric || '';
            setEditingExperiment(details);
            setEditForm({
                status: details?.status || '',
                metricName,
                metricValue: metricName && details?.performance?.[metricName] !== undefined ? details.performance[metricName] : '',
            });
            setIsExpModifyMode(true);
            setEditingExpId(expId);
            setIsNewExpModalOpen(true);
        } catch (e) {
            toastError('Failed to load experiment', e.message);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handleDeleteExperiment = async (expId) => {
        setIsDeleting(true);
        try {
            await deleteForecastExperiment(plantCode, expId);
            await onRefresh();
        } catch (e) { toastError('Delete failed', e.message); }
        finally { setIsDeleting(false); }
    };

    const handleLaunchExperiment = async () => {
        setIsSaving(true);
        try {
            if (isExpModifyMode && editingExpId !== null) {
                const performance = editForm.metricName
                    ? { primary_metric: editForm.metricName, [editForm.metricName]: editForm.metricValue === '' ? null : Number(editForm.metricValue) }
                    : undefined;
                await updateForecastExperiment(plantCode, editingExpId, { status: editForm.status || undefined, performance });
            } else {
                const model = modelsList.find(m => m.model_name === newExpForm.modelName);
                const pipeline = pipelinesList.find(p => p.pipeline_name === newExpForm.pipelineName);
                const payload = {
                    experiment_name: newExpForm.name,
                    model_id: model?.model_id,
                    pipeline_id: pipeline?.pipeline_id,
                    parameters: paramValues,
                    start_time: newExpForm.startTime,
                    end_time: newExpForm.endTime,
                };
                await createForecastExperiment(plantCode, payload);
            }
            setIsNewExpModalOpen(false);
            setIsExpModifyMode(false);
            setEditingExpId(null);
            setEditingExperiment(null);
            await onRefresh();
        } catch (e) { toastError(isExpModifyMode ? 'Update failed' : 'Create failed', e.message); }
        finally { setIsSaving(false); }
    };

    const statusBadge = (status) => {
        const s = (status || 'unknown').toLowerCase();
        const map = { completed: 'bg-success/10 text-success', running: 'bg-brand-muted text-brand', failed: 'bg-danger/10 text-danger' };
        return <span className={`px-2.5 py-1 text-[12px] font-bold rounded-full capitalize ${map[s] || 'bg-surface-2 text-text-muted'}`}>{status || 'Unknown'}</span>;
    };

    const isSubmitDisabled = isSaving || (isExpModifyMode ? !editForm.status : (!newExpForm.name || !newExpForm.modelName || !newExpForm.pipelineName));
    const editingModelName = editingExperiment ? (modelsList.find(m => m.model_id === editingExperiment.model_id)?.model_name || editingExperiment.model_id) : '-';
    const editingPipelineName = editingExperiment ? (pipelinesList.find(p => p.pipeline_id === editingExperiment.pipeline_id)?.pipeline_name || editingExperiment.pipeline_id) : '-';

    const columns = [
        { key: 'experiment_name', label: 'Name', render: r => <span className="font-bold text-text-primary">{r.experiment_name || '-'}</span> },
        { key: 'model_name', label: 'Model', render: r => <span className="text-text-muted">{r.model_name || r.model_id || '-'}</span> },
        { key: 'pipeline_name', label: 'Pipeline', render: r => <span className="text-text-muted">{r.pipeline_name || r.pipeline_id || '-'}</span> },
        { key: 'status', label: 'Status', render: r => statusBadge(r.status) },
        { key: 'created_at', label: 'Created', render: r => <span className="text-text-muted text-[13px]">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</span> },
        { key: 'actions', label: '', cellClassName: 'text-right', render: r => (
            <ActionsMenuButton actions={[
                { label: 'Edit', icon: <Pencil className="w-4 h-4 text-text-subtle" />, onClick: () => handleEditExperiment(r.experiment_id) },
                { label: 'Delete', icon: <Archive className="w-4 h-4 text-danger" />, danger: true, onClick: () => handleDeleteExperiment(r.experiment_id) }
            ]} />
        ) }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-[20px] font-bold text-text-primary">Forecast Experiments</h2>
                    <p className="text-[14px] text-text-muted">Track and manage forecasting experiment runs.</p>
                </div>
                <button onClick={handleNewExperiment} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover text-[14px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer">
                    <Plus className="w-4 h-4" /> New Experiment
                </button>
            </div>

            <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    rows={experimentsList}
                    loading={isExperimentsLoading}
                    emptyIcon={<FlaskConical className="w-12 h-12 text-border-strong" />}
                    emptyTitle="No experiments yet"
                    emptyDescription="Create an experiment to evaluate your forecasting models."
                />
            </div>

            <Modal open={isNewExpModalOpen} onClose={() => setIsNewExpModalOpen(false)} size="lg" className="flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-border/40 flex justify-between items-center shrink-0">
                            <h2 id="forecast-exp-modal-title" className="text-[18px] font-bold text-text-primary">{isExpModifyMode ? 'Update Experiment' : 'New Experiment'}</h2>
                            <button onClick={() => setIsNewExpModalOpen(false)} aria-label="Close" className="p-2 text-text-subtle hover:bg-surface-2 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {isExpModifyMode ? (
                                <>
                                    <div className="rounded-xl border border-border bg-canvas p-4 space-y-2">
                                        <p className="text-[14px] font-bold text-text-primary">{editingExperiment?.experiment_name || '-'}</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] text-text-muted">
                                            <p>Model: <span className="text-text-secondary font-medium">{editingModelName}</span></p>
                                            <p>Pipeline: <span className="text-text-secondary font-medium">{editingPipelineName}</span></p>
                                            {editingExperiment?.compute?.timerange && (
                                                <p className="col-span-2">Window: <span className="text-text-secondary font-medium">{editingExperiment.compute.timerange[0]} → {editingExperiment.compute.timerange[1]}</span></p>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-text-subtle">Name, model, pipeline, parameters, and time window are set at creation and cannot be edited.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="forecast-exp-status" className="text-[13px] font-bold text-text-secondary">Status</label>
                                        <Select
                                            id="forecast-exp-status"
                                            value={editForm.status}
                                            onChange={(v) => setEditForm(p => ({ ...p, status: v }))}
                                            placeholder="Select status..."
                                            options={STATUS_OPTIONS}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label htmlFor="forecast-exp-metric-name" className="text-[13px] font-bold text-text-secondary">Primary Metric</label>
                                            <input id="forecast-exp-metric-name" type="text" className="w-full px-3 py-2 border border-border rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" value={editForm.metricName} onChange={e => setEditForm(p => ({ ...p, metricName: e.target.value }))} placeholder="e.g. accuracy" />
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="forecast-exp-metric-value" className="text-[13px] font-bold text-text-secondary">Metric Value</label>
                                            <input id="forecast-exp-metric-value" type="number" step="any" className="w-full px-3 py-2 border border-border rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" value={editForm.metricValue} onChange={e => setEditForm(p => ({ ...p, metricValue: e.target.value }))} placeholder="e.g. 0.95" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <label htmlFor="forecast-exp-name" className="text-[13px] font-bold text-text-secondary">Experiment Name <span className="text-danger">*</span></label>
                                        <input id="forecast-exp-name" type="text" className="w-full px-3 py-2 border border-border rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" value={newExpForm.name} onChange={e => setNewExpForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Experiment_v1" />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="forecast-exp-model" className="text-[13px] font-bold text-text-secondary">Model <span className="text-danger">*</span></label>
                                        <Select
                                            id="forecast-exp-model"
                                            value={newExpForm.modelName}
                                            onChange={(v) => setNewExpForm(p => ({ ...p, modelName: v }))}
                                            placeholder="Select model..."
                                            searchable
                                            searchPlaceholder="Search models..."
                                            options={modelsList.map(m => m.model_name)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="forecast-exp-pipeline" className="text-[13px] font-bold text-text-secondary">Pipeline <span className="text-danger">*</span></label>
                                        <Select
                                            id="forecast-exp-pipeline"
                                            value={newExpForm.pipelineName}
                                            onChange={(v) => setNewExpForm(p => ({ ...p, pipelineName: v }))}
                                            placeholder="Select pipeline..."
                                            searchable
                                            searchPlaceholder="Search pipelines..."
                                            options={pipelinesList.map(p => p.pipeline_name)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label htmlFor="forecast-exp-start" className="text-[13px] font-bold text-text-secondary">Start Time</label>
                                            <input id="forecast-exp-start" type="datetime-local" className="w-full px-3 py-2 border border-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" value={newExpForm.startTime} onChange={e => setNewExpForm(p => ({ ...p, startTime: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="forecast-exp-end" className="text-[13px] font-bold text-text-secondary">End Time</label>
                                            <input id="forecast-exp-end" type="datetime-local" className="w-full px-3 py-2 border border-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" value={newExpForm.endTime} onChange={e => setNewExpForm(p => ({ ...p, endTime: e.target.value }))} />
                                        </div>
                                    </div>
                                    {paramsLoading && <p className="text-[13px] text-text-subtle flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading parameters...</p>}
                                    {fetchedParams.length > 0 && (
                                        <div className="space-y-3">
                                            <label className="text-[13px] font-bold text-text-secondary">Model Parameters</label>
                                            {fetchedParams.map(p => (
                                                <div key={p.name} className="space-y-1">
                                                    <label htmlFor={`forecast-exp-param-${p.name}`} className="text-[12px] font-medium text-text-muted">{p.label || p.name}</label>
                                                    {p.type === 'boolean' ? (
                                                        <input id={`forecast-exp-param-${p.name}`} type="checkbox" checked={!!paramValues[p.name]} onChange={e => setParamValues(prev => ({ ...prev, [p.name]: e.target.checked }))} className="ml-2" />
                                                    ) : p.type === 'select' ? (
                                                        <Select
                                                            id={`forecast-exp-param-${p.name}`}
                                                            value={paramValues[p.name] ?? ''}
                                                            onChange={(v) => setParamValues(prev => ({ ...prev, [p.name]: v }))}
                                                            options={p.options || []}
                                                        />
                                                    ) : (
                                                        <input id={`forecast-exp-param-${p.name}`} type={p.type === 'int' || p.type === 'float' ? 'number' : 'text'} className="w-full px-3 py-2 border border-border rounded-xl text-[13px]" placeholder={p.placeholder || p.name} value={paramValues[p.name] ?? ''} onChange={e => setParamValues(prev => ({ ...prev, [p.name]: p.type === 'int' ? parseInt(e.target.value) : p.type === 'float' ? parseFloat(e.target.value) : e.target.value }))} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-border/40 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsNewExpModalOpen(false)} className="px-4 py-2 border border-border text-text-muted rounded-xl text-[14px] font-bold hover:bg-canvas cursor-pointer">Cancel</button>
                            <button onClick={handleLaunchExperiment} disabled={isSubmitDisabled} aria-busy={isSaving} className="px-5 py-2 bg-brand text-white rounded-xl text-[14px] font-bold hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isExpModifyMode ? 'Update' : 'Launch'}
                            </button>
                        </div>
            </Modal>
        </div>
    );
}
