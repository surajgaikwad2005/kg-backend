'use client';
import React, { useState } from 'react';
import { Plus, Search, Settings, Archive, FileCode, Zap, X } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { Select } from '@/src/components/ui/Select';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { getPipeline } from '@/src/services/model-studio/ml-model/pipelineService';
import { useApp } from '@/src/context/AppContext';

/**
 * Pipelines tab — table + New Pipeline modal.
 * Opens visual/code builders via callbacks (they live as full-page overlays in page.jsx).
 *
 * @param {{
 *   pipelinesList: object[],
 *   isPipelinesLoading: boolean,
 *   availableTools: object[],
 *   reconstructFlowchartFromSteps: (steps, name, tools) => { nodes, edges },
 *   onDeletePipeline: (pipelineId: number) => void,
 *   onOpenVisualBuilder: (pipelineId: number | null, nodes: object[], edges: object[]) => void,
 *   onOpenCodeBuilder: (pipelineId: number | null, config: object, code: string) => void,
 * }} props
 */
export function PipelinesTab({
  pipelinesList,
  isPipelinesLoading,
  availableTools,
  reconstructFlowchartFromSteps,
  onDeletePipeline,
  onOpenVisualBuilder,
  onOpenCodeBuilder,
}) {
  const { plantCode } = useApp();

  /* ── Local state ── */
  const [activePipeFilter, setActivePipeFilter] = useState('All');
  const [openPipelineMenuIdx, setOpenPipelineMenuIdx] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [isNewPipelineModalOpen, setIsNewPipelineModalOpen] = useState(false);
  const [newPipelineType, setNewPipelineType] = useState('custom');
  const [newPipelineName, setNewPipelineName] = useState('');

  /* ── Filter counts ── */
  const pipeStatusCounts = {};
  pipelinesList.forEach(pipe => {
    const s = (pipe.status || 'unknown').toLowerCase();
    pipeStatusCounts[s] = (pipeStatusCounts[s] || 0) + 1;
  });
  const pipeFilters = [
    { label: 'All', count: pipelinesList.length },
    { label: 'Running', count: pipeStatusCounts['running'] || 0 },
    { label: 'Completed', count: pipeStatusCounts['completed'] || 0 },
    { label: 'Failed', count: pipeStatusCounts['failed'] || 0 },
  ];

  const filteredPipelines = pipelinesList.filter(pipe =>
    activePipeFilter === 'All' || (pipe.status || '').toLowerCase() === activePipeFilter.toLowerCase()
  );

  /* ── Modify handler — fetches pipeline details then delegates to builder ── */
  const handleModifyPipeline = async (pipe) => {
    setOpenPipelineMenuIdx(null);
    try {
      const details = await getPipeline(plantCode, pipe.pipeline_id);
      const effectiveType = details.type || details.data?.type || pipe.type;

      if (effectiveType?.toLowerCase() !== 'code') {
        let nodes = details.nodes || details.data?.nodes || [];
        let edges = details.edges || details.data?.edges || [];
        const steps = details.steps || details.data?.steps || [];
        if (nodes.length === 0 && steps.length > 0) {
          const result = reconstructFlowchartFromSteps(steps, details.pipeline_name, availableTools);
          nodes = result.nodes;
          edges = result.edges;
        }
        onOpenVisualBuilder(pipe.pipeline_id, nodes, edges);
      } else {
        const config = {
          pipelineName: details.pipeline_name || details.data?.pipeline_name || pipe.pipeline_name || '',
          description: details.description || details.data?.description || pipe.description || '',
          modelId: '',
          assetIds: [],
          tagIds: Array.isArray(details.tags) ? details.tags : Array.isArray(details.data?.tags) ? details.data.tags : Array.isArray(pipe.tags) ? pipe.tags : [],
          startDate: details.start || details.data?.start || pipe.start || '',
          endDate: details.end || details.data?.end || pipe.end || '',
        };
        const code = details.code || details.data?.code || pipe.code || '';
        onOpenCodeBuilder(pipe.pipeline_id, config, code);
      }
    } catch {
      // Fallback to list data
      if (pipe.type?.toLowerCase() !== 'code') {
        onOpenVisualBuilder(pipe.pipeline_id, pipe.nodes || pipe.data?.nodes || [], pipe.edges || pipe.data?.edges || []);
      } else {
        const config = {
          pipelineName: pipe.pipeline_name || '',
          description: pipe.description || '',
          modelId: '',
          assetIds: [],
          tagIds: Array.isArray(pipe.tags) ? pipe.tags : [],
          startDate: pipe.start || '',
          endDate: pipe.end || '',
        };
        onOpenCodeBuilder(pipe.pipeline_id, config, pipe.code || pipe.data?.code || '');
      }
    }
  };

  const handleConfirmNewPipeline = () => {
    if (newPipelineType === 'custom') {
      onOpenVisualBuilder(null, [], []);
    } else {
      onOpenCodeBuilder(null, { pipelineName: newPipelineName, description: '', modelId: '', assetIds: [], tagIds: [], startDate: '', endDate: '' }, '');
    }
    setIsNewPipelineModalOpen(false);
    setNewPipelineName('');
  };

  const columns = [
    { key: 'pipeline_id', label: 'Pipeline ID', render: r => <span className="font-bold text-text-primary">{r.pipeline_id}</span> },
    { key: 'pipeline_name', label: 'Pipeline Name', render: r => <span className="text-text-secondary font-medium whitespace-nowrap">{r.pipeline_name || 'N/A'}</span> },
    { key: 'description', label: 'Description', render: r => <span className="text-text-muted max-w-xs truncate" title={r.description}>{r.description || '-'}</span> },
    { key: 'type', label: 'Pipeline Type', render: r => <span className="px-2.5 py-1 text-[13px] font-semibold rounded-md text-brand bg-brand-muted border border-brand/20 capitalize">{r.type || 'Custom'}</span> },
    { key: 'status', label: 'Status', render: r => <span className={`px-2.5 py-1 text-[13px] font-semibold rounded-full capitalize ${r.status === 'created' ? 'text-brand bg-brand-muted' : 'text-success bg-success/10'}`}>{r.status || 'Active'}</span> },
    { key: 'latency', label: 'Latency', render: r => (
      <div className="flex items-center gap-1.5 text-text-secondary">
        <Zap className="w-4 h-4 text-warning" />
        <span className="font-medium">{r.latency ? `${r.latency}ms` : 'N/A'}</span>
      </div>
    ) },
    { key: 'created_at', label: 'Created At', render: r => <span className="text-text-muted">{new Date(r.created_at).toLocaleString()}</span> },
    { key: 'updated_at', label: 'Updated At', render: r => <span className="text-text-muted">{new Date(r.updated_at || r.created_at).toLocaleString()}</span> },
    { key: 'actions', label: '', cellClassName: 'text-right', render: r => (
      <ActionsMenuButton actions={[
        { label: 'Modify', icon: <Settings className="w-4 h-4 text-text-subtle" />, onClick: () => handleModifyPipeline(r) },
        { label: 'Delete', icon: <Archive className="w-4 h-4 text-danger" />, danger: true, onClick: () => onDeletePipeline(r.pipeline_id) }
      ]} />
    ) }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[26px] font-bold text-text-primary">Pipelines</h2>
          <p className="text-[16px] text-text-muted mt-1">Create, manage, and monitor data processing and ML pipelines.</p>
        </div>
        <button
          onClick={() => { setNewPipelineType('custom'); setNewPipelineName(''); setIsNewPipelineModalOpen(true); }}
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover font-medium text-[16px] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Pipeline
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
        <input type="text" placeholder="Search pipelines..." className="w-full pl-9 pr-4 py-2.5 text-[16px] border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-surface shadow-sm" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-surface-2 p-1 rounded-lg w-max">
        {pipeFilters.map(f => (
          <button key={f.label} onClick={() => setActivePipeFilter(f.label)} className={`px-4 py-1.5 text-[16px] font-medium rounded-md transition-colors cursor-pointer ${activePipeFilter === f.label ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          rows={filteredPipelines}
          loading={isPipelinesLoading}
          emptyIcon={<FileCode className="w-12 h-12 text-border-strong" />}
          emptyTitle="No pipelines registered yet"
          emptyDescription='Click "New Pipeline" to get started.'
        />
      </div>

      {/* New Pipeline Modal */}
      <Modal open={isNewPipelineModalOpen} onClose={() => setIsNewPipelineModalOpen(false)} size="lg" className="overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div>
                <h3 id="new-pipeline-modal-title" className="text-[22px] font-bold text-text-primary">New Pipeline</h3>
                <p className="text-[16px] text-text-muted mt-1">Create and configure a new automated data or ML pipeline.</p>
              </div>
              <button onClick={() => setIsNewPipelineModalOpen(false)} aria-label="Close" className="text-text-subtle hover:text-text-secondary p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <label htmlFor="new-pipeline-name-input" className="block text-[16px] font-medium text-text-primary mb-1">Pipeline Name <span className="text-danger">*</span></label>
                <input id="new-pipeline-name-input" type="text" value={newPipelineName} onChange={e => setNewPipelineName(e.target.value)} placeholder="e.g., daily-feature-extraction" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-[16px] text-text-secondary" />
              </div>
              <div>
                <label htmlFor="new-pipeline-type-select" className="block text-[16px] font-medium text-text-primary mb-1">Pipeline Type <span className="text-danger">*</span></label>
                <div className="w-1/2">
                  <Select
                    id="new-pipeline-type-select"
                    value={newPipelineType}
                    onChange={setNewPipelineType}
                    options={[{ value: 'custom', label: 'Custom (Flowchart)' }, { value: 'code', label: 'Code Builder' }]}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-canvas">
              <button onClick={() => setIsNewPipelineModalOpen(false)} className="px-4 py-2 border border-border text-text-secondary bg-surface rounded-lg hover:bg-canvas font-medium text-[16px] transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleConfirmNewPipeline} className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover font-medium text-[16px] transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
                {newPipelineType === 'custom' ? 'Open Flowchart Builder' : 'Open Code Builder'}
              </button>
            </div>
      </Modal>
    </div>
  );
}
