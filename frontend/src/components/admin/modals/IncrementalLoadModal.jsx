'use client';
import React, { useCallback } from 'react';
import { RotateCcw, CheckCircle2, AlertTriangle, Play, Server, FileStack, History, FileCode, Layers } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { runPipeline } from '@/src/services/domain-configuration/common';
import { useToast } from '@/src/components/ui/Toast';

const STAGES = [
  { id: 'sap', label: 'SAP Extract', icon: <Server size={18} /> },
  { id: 'docs', label: 'Documents', icon: <FileStack size={18} /> },
  { id: 'ts', label: 'Timeseries', icon: <History size={18} /> },
  { id: 'pnid', label: 'P&ID', icon: <FileCode size={18} /> },
  { id: 'full', label: 'Full Pipeline', icon: <Layers size={18} /> },
];

export default function IncrementalLoadModal() {
  const { isIncrementalModalOpen, setIsIncrementalModalOpen, incrementalStage, setIncrementalStage, incrementalStatus, setIncrementalStatus, selectedPlantId } = useAdminEntities();
  const { error } = useToast();

  const handleRun = useCallback(async () => {
    if (!incrementalStage || incrementalStatus === 'running') return;
    setIncrementalStatus('running');
    try {
      await runPipeline({ stage: incrementalStage, plant_code_id: selectedPlantId?.id });
      setIncrementalStatus('done');
    } catch {
      setIncrementalStatus('error');
      error('Pipeline Failed', 'Could not start the pipeline stage. Please check logs.');
    }
  }, [incrementalStage, incrementalStatus, setIncrementalStatus, selectedPlantId, error]);

  const handleClose = useCallback(() => {
    // Never dismiss while a pipeline run is in flight.
    if (incrementalStatus === 'running') return;
    setIsIncrementalModalOpen(false);
    setIncrementalStatus('idle');
    setIncrementalStage(null);
  }, [incrementalStatus, setIsIncrementalModalOpen, setIncrementalStatus, setIncrementalStage]);

  return (
    <Modal open={isIncrementalModalOpen} onClose={handleClose} size="md" title="Incremental Data Load">
      <ModalBody className="space-y-4">
        <p className="text-xs text-text-muted -mt-2">Run a pipeline stage to sync latest data</p>
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Select Pipeline Stage</label>
          <div className="grid grid-cols-2 gap-3">
            {STAGES.map((stage) => (
              <button key={stage.id} onClick={() => setIncrementalStage(stage.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${incrementalStage === stage.id ? 'bg-brand/10 border-brand text-text-primary' : 'bg-surface-2/40 border-border text-text-muted hover:border-border-strong'}`}>
                {stage.icon}
                <span className="text-xs font-bold">{stage.label}</span>
              </button>
            ))}
          </div>
        </div>

        {incrementalStatus === 'running' && (
          <div className="bg-brand/10 border border-brand/20 rounded-xl p-4 flex items-center gap-3">
            <RotateCcw size={16} className="text-brand animate-spin" />
            <span className="text-sm text-brand font-medium">Pipeline running...</span>
          </div>
        )}
        {incrementalStatus === 'done' && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 size={16} className="text-success" />
            <span className="text-sm text-success font-medium">Pipeline completed successfully</span>
          </div>
        )}
        {incrementalStatus === 'error' && (
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={16} className="text-danger" />
            <span className="text-sm text-danger font-medium">Pipeline failed — check logs</span>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>Close</Button>
        <button
          disabled={!incrementalStage || incrementalStatus === 'running'}
          aria-busy={incrementalStatus === 'running'}
          onClick={handleRun}
          className="bg-brand hover:bg-brand-hover text-white font-bold py-2 px-8 rounded-lg shadow-lg shadow-brand/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <Play size={16} /><span>Run</span>
        </button>
      </ModalFooter>
    </Modal>
  );
}
