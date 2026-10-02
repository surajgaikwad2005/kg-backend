'use client';
import React, { useState } from 'react';
import { Plus, X, Settings, Archive, GitBranch, Loader2, FileCode, Zap } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { getForecastPipelineDetails } from '@/src/services/model-studio/forecast/forecastService';

export function ForecastPipelines({
    pipelinesList,
    isPipelinesLoading,
    availableTools,
    reconstructFlowchartFromSteps,
    onDeletePipeline,
    onOpenVisualBuilder,
    onOpenCodeBuilder,
    onRefresh,
}) {
    const [isNewPipelineModalOpen, setIsNewPipelineModalOpen] = useState(false);
    const [newPipelineType, setNewPipelineType] = useState('custom');
    const [newPipelineName, setNewPipelineName] = useState('');

    const handleModifyPipeline = async (pipe) => {
        try {
            const details = await getForecastPipelineDetails(pipe.pipeline_id);
            const effectiveType = details.type || details.data?.type || pipe.type;
            if (effectiveType === 'code' || effectiveType === 'script') {
                const code = details.code || details.data?.code || '';
                const config = details.config || details.data?.config || {};
                onOpenCodeBuilder(pipe.pipeline_id, config, code);
            } else {
                const steps = details.steps || details.data?.steps || [];
                const pipelineName = details.pipeline_name || pipe.pipeline_name || '';
                let nodes = details.data?.nodes || details.nodes || [];
                let edges = details.data?.edges || details.edges || [];
                if (nodes.length === 0 && steps.length > 0) {
                    const rebuilt = reconstructFlowchartFromSteps(steps, pipelineName, availableTools);
                    nodes = rebuilt.nodes;
                    edges = rebuilt.edges;
                }
                onOpenVisualBuilder(pipe.pipeline_id, nodes, edges);
            }
        } catch (e) {
        }
    };

    const handleOpenBuilder = () => {
        setIsNewPipelineModalOpen(false);
        if (newPipelineType === 'code') {
            onOpenCodeBuilder(null, { pipelineName: newPipelineName }, '');
        } else {
            onOpenVisualBuilder(null, [], []);
        }
        setNewPipelineName('');
    };

    const statusBadge = (status) => {
        const s = (status || 'unknown').toLowerCase();
        const map = { completed: 'bg-success/10 text-success', running: 'bg-brand-muted text-brand', failed: 'bg-danger/10 text-danger', active: 'bg-success/10 text-success' };
        return <span className={`px-2.5 py-1 text-[12px] font-bold rounded-full capitalize ${map[s] || 'bg-surface-2 text-text-muted'}`}>{status || 'Unknown'}</span>;
    };

    const columns = [
        { key: 'pipeline_name', label: 'Pipeline Name', render: r => <span className="font-bold text-text-primary">{r.pipeline_name || '-'}</span> },
        { key: 'type', label: 'Type', render: r => (
            <span className="flex items-center gap-1.5 text-text-muted">
                {r.type === 'code' || r.type === 'script' ? <FileCode className="w-4 h-4 text-chart-5" /> : <Zap className="w-4 h-4 text-warning" />}
                {r.type || 'visual'}
            </span>
        ) },
        { key: 'description', label: 'Description', render: r => <span className="text-text-muted max-w-[200px] truncate" title={r.description}>{r.description || '-'}</span> },
        { key: 'status', label: 'Status', render: r => statusBadge(r.status) },
        { key: 'created_at', label: 'Created', render: r => <span className="text-text-muted text-[13px]">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</span> },
        { key: 'actions', label: '', cellClassName: 'text-right', render: r => (
            <ActionsMenuButton actions={[
                { label: 'Modify', icon: <Settings className="w-4 h-4 text-text-subtle" />, onClick: () => handleModifyPipeline(r) },
                { label: 'Delete', icon: <Archive className="w-4 h-4 text-danger" />, danger: true, onClick: () => onDeletePipeline(r.pipeline_id) }
            ]} />
        ) }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-[20px] font-bold text-text-primary">Forecast Pipelines</h2>
                    <p className="text-[14px] text-text-muted">Build and manage forecasting data pipelines.</p>
                </div>
                <button onClick={() => setIsNewPipelineModalOpen(true)} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover text-[14px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer">
                    <Plus className="w-4 h-4" /> New Pipeline
                </button>
            </div>

            <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    rows={pipelinesList}
                    loading={isPipelinesLoading}
                    emptyIcon={<GitBranch className="w-12 h-12 text-border-strong" />}
                    emptyTitle="No pipelines yet"
                    emptyDescription="Create a visual or code-based pipeline to process your data."
                />
            </div>

            <Modal open={isNewPipelineModalOpen} onClose={() => setIsNewPipelineModalOpen(false)} size="sm" className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 id="forecast-pipeline-modal-title" className="text-[18px] font-bold text-text-primary">New Pipeline</h2>
                            <button onClick={() => setIsNewPipelineModalOpen(false)} aria-label="Close" className="p-2 text-text-subtle hover:bg-surface-2 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-text-secondary">Pipeline Name</label>
                                <input type="text" className="w-full px-3 py-2 border border-border rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" placeholder="e.g. Forecast_Pipeline_v1" value={newPipelineName} onChange={e => setNewPipelineName(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setNewPipelineType('custom')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${newPipelineType === 'custom' ? 'border-brand bg-brand-muted' : 'border-border hover:border-border-strong'}`}>
                                    <Zap className={`w-6 h-6 ${newPipelineType === 'custom' ? 'text-brand' : 'text-warning'}`} />
                                    <span className={`text-[13px] font-bold ${newPipelineType === 'custom' ? 'text-brand-hover' : 'text-text-secondary'}`}>Visual</span>
                                </button>
                                <button onClick={() => setNewPipelineType('code')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${newPipelineType === 'code' ? 'border-brand bg-brand-muted' : 'border-border hover:border-border-strong'}`}>
                                    <FileCode className={`w-6 h-6 ${newPipelineType === 'code' ? 'text-brand' : 'text-chart-5'}`} />
                                    <span className={`text-[13px] font-bold ${newPipelineType === 'code' ? 'text-brand-hover' : 'text-text-secondary'}`}>Code</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <button onClick={() => setIsNewPipelineModalOpen(false)} className="px-4 py-2 border border-border text-text-muted rounded-xl text-[14px] font-bold hover:bg-canvas cursor-pointer">Cancel</button>
                            <button onClick={handleOpenBuilder} className="px-5 py-2 bg-brand text-white rounded-xl text-[14px] font-bold hover:bg-brand-hover active:scale-95 cursor-pointer">
                                Open Builder
                            </button>
                        </div>
            </Modal>
        </div>
    );
}
