'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Database, Settings, Trash2, MoreVertical, X, ChevronDown, CheckCircle2, Box } from 'lucide-react';
import { Spinner } from '@/src/components/ui/Spinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { updateArtifact, uploadArtifactFile, createArtifact, deleteArtifact } from '@/src/services/model-studio/ml-model/artifactService';
import { getAssetTags } from '@/src/services/model-studio/ml-model/modelRegistryService';
import { useApp } from '@/src/context/AppContext';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { Modal } from '@/src/components/ui/Modal';
/**
 * Artifacts tab — table + Upload/Edit modal (self-contained).
 *
 * @param {{
 *   artifactsList: object[],
 *   artifactsLoading: boolean,
 *   artifactsError: string | null,
 *   assetList: string[],
 *   onRefresh: () => void,
 * }} props
 */
export function ArtifactsTab({ artifactsList, artifactsLoading, artifactsError, assetList, onRefresh }) {
  const { openConfirm } = useConfirm();
  const { plantCode } = useApp();
  /* ── Modal state ── */
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [isEditingArtifact, setIsEditingArtifact] = useState(false);
  const [artifactToEditId, setArtifactToEditId] = useState(null);
  const [selectedArtifactModel, setSelectedArtifactModel] = useState('');
  const [selectedArtifactAssets, setSelectedArtifactAssets] = useState([]);
  const [selectedArtifactTags, setSelectedArtifactTags] = useState([]);
  const [selectedArtifactFile, setSelectedArtifactFile] = useState(null);
  const [isConfiguringArtifact, setIsConfiguringArtifact] = useState(false);
  const [artifactSubmitError, setArtifactSubmitError] = useState(null);
  const [availableTagsForArtifact, setAvailableTagsForArtifact] = useState([]);
  const [isArtifactTagsLoading, setIsArtifactTagsLoading] = useState(false);
  const [isArtifactAssetDropdownOpen, setIsArtifactAssetDropdownOpen] = useState(false);
  const [isArtifactTagDropdownOpen, setIsArtifactTagDropdownOpen] = useState(false);
  const [openArtifactMenuId, setOpenArtifactMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  /* Fetch tags when selected assets change */
  useEffect(() => {
    if (selectedArtifactAssets.length === 0) { setAvailableTagsForArtifact([]); setSelectedArtifactTags([]); return; }
    const fetchAllTags = async () => {
      setIsArtifactTagsLoading(true);
      try {
        const results = await Promise.all(
          selectedArtifactAssets.map(assetId => getAssetTags(plantCode, assetId))
        );
        const merged = new Map();
        results.forEach(tags => { if (Array.isArray(tags)) tags.forEach(t => merged.set(t.iotdb_tag_id, t)); });
        setAvailableTagsForArtifact(Array.from(merged.values()));
      } catch { setAvailableTagsForArtifact([]); }
      finally { setIsArtifactTagsLoading(false); }
    };
    fetchAllTags();
  }, [selectedArtifactAssets, plantCode]);

  const resetArtifactForm = () => {
    setSelectedArtifactModel('');
    setSelectedArtifactAssets([]);
    setSelectedArtifactTags([]);
    setSelectedArtifactFile(null);
    setIsEditingArtifact(false);
    setArtifactToEditId(null);
    setArtifactSubmitError(null);
  };

  const handleArtifactSubmit = async () => {
    if (!selectedArtifactModel || selectedArtifactAssets.length === 0 || (!selectedArtifactFile && !isEditingArtifact)) return;
    setIsConfiguringArtifact(true);
    setArtifactSubmitError(null);
    try {
      if (isEditingArtifact && artifactToEditId) {
        await updateArtifact(plantCode, artifactToEditId, { artifactName: selectedArtifactModel, createdBy: 'Ankur M.', assetIds: selectedArtifactAssets, tagIds: selectedArtifactTags });
      } else {
        const modelPath = await uploadArtifactFile(plantCode, selectedArtifactFile);
        await createArtifact(plantCode, { artifactName: selectedArtifactModel, createdBy: 'Ankur M.', assetIds: selectedArtifactAssets, tagIds: selectedArtifactTags, modelPath });
      }
      onRefresh();
      setIsArtifactModalOpen(false);
      resetArtifactForm();
    } catch (error) {
      setArtifactSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsConfiguringArtifact(false);
    }
  };

  const handleDeleteArtifact = async (id) => {
    const ok = await openConfirm('This artifact will be permanently deleted.', { title: 'Delete artifact?', confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await deleteArtifact(plantCode, id);
      onRefresh();
    } catch { }
  };

  const handleEditArtifact = (artifact) => {
    setIsEditingArtifact(true);
    setArtifactToEditId(artifact.artifact_id);
    setSelectedArtifactModel(artifact.artifact_name);
    setSelectedArtifactAssets(artifact.asset_ids || []);
    setSelectedArtifactTags(artifact.tag_ids || []);
    setSelectedArtifactFile(null);
    setIsArtifactModalOpen(true);
    setOpenArtifactMenuId(null);
  };

  const canSubmit = selectedArtifactModel && selectedArtifactAssets.length > 0 && (selectedArtifactFile || isEditingArtifact) && !isConfiguringArtifact;

  const columns = [
    { key: 'artifact_id', label: 'Artifact ID', render: r => <span className="font-bold text-text-primary tabular-nums">{r.artifact_id}</span> },
    { key: 'artifact_name', label: 'Artifact Name', render: r => <div className="font-bold text-text-primary">{r.artifact_name}</div> },
    { key: 'created_at', label: 'Created At', render: r => <span className="tabular-nums text-text-secondary">{r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}</span> },
    { key: 'updated_at', label: 'Updated At', render: r => <span className="tabular-nums text-text-secondary">{r.updated_at ? new Date(r.updated_at).toLocaleString() : 'N/A'}</span> },
    {
      key: 'actions', label: 'Actions', cellClassName: 'text-right', render: r => (
        <ActionsMenuButton actions={[
          { label: 'Modify', icon: <Settings className="w-4 h-4 text-text-subtle" />, onClick: () => handleEditArtifact(r) },
          { label: 'Delete', icon: <Trash2 className="w-4 h-4 text-danger" />, danger: true, onClick: () => handleDeleteArtifact(r.artifact_id) }
        ]} />
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary">Artifacts</h2>
          <p className="text-[14px] text-text-muted mt-1">Manage intelligence artifacts, check version history, and configure model assets.</p>
        </div>
        <button onClick={() => { resetArtifactForm(); setIsArtifactModalOpen(true); }} className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand-hover font-medium text-[15px] transition-all shadow-sm active:scale-95 cursor-pointer">
          <Plus className="w-4 h-4" /> Upload Artifact
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          rows={artifactsList}
          loading={artifactsLoading}
          emptyIcon={<Database className="w-12 h-12 text-border-strong" />}
          emptyTitle="No Artifacts Found"
          emptyDescription="Get started by uploading your first artifact."
          onRowClick={handleEditArtifact}
        />
      </div>

      {/* Artifact Modal */}
      <Modal open={isArtifactModalOpen} onClose={() => { setIsArtifactModalOpen(false); resetArtifactForm(); }} size="xl" className="overflow-hidden flex flex-col border border-border">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-canvas/50">
          <div>
            <h3 id="artifact-modal-title" className="text-[20px] font-bold text-text-primary">{isEditingArtifact ? 'Edit Artifact' : 'Configure Artifact'}</h3>
            <p className="text-[14px] text-text-muted mt-1 font-medium">Link a model, asset, and version identifier to your intelligence artifact.</p>
          </div>
          <button onClick={() => { setIsArtifactModalOpen(false); resetArtifactForm(); }} aria-label="Close" className="text-text-subtle hover:text-text-secondary p-2 hover:bg-surface rounded-full transition-all cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Artifact Name */}
          <div className="space-y-2">
            <label htmlFor="artifact-name-input" className="block text-[14px] font-bold text-text-secondary">Artifact Name <span className="text-danger">*</span></label>
            <input id="artifact-name-input" type="text" value={selectedArtifactModel} onChange={e => setSelectedArtifactModel(e.target.value)} placeholder="Enter Artifact Name" className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-secondary text-[15px] focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Asset Selection */}
            <div className="space-y-2 relative">
              <label className="block text-[14px] font-bold text-text-secondary">Associate Asset <span className="text-danger">*</span></label>
              <div className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-secondary text-[15px] cursor-pointer flex justify-between items-center font-medium" onClick={() => setIsArtifactAssetDropdownOpen(!isArtifactAssetDropdownOpen)}>
                <span className="truncate">{selectedArtifactAssets.length > 0 ? `${selectedArtifactAssets.length} Assets selected` : 'Select Assets'}</span>
                <ChevronDown className="w-5 h-5 text-text-subtle pointer-events-none" />
              </div>
              {isArtifactAssetDropdownOpen && (
                <div className="absolute top-[100%] left-0 w-full mt-1 bg-surface border border-border rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                  {assetList.map(asset => (
                    <label key={asset} className="flex items-center px-4 py-2 hover:bg-canvas cursor-pointer">
                      <input type="checkbox" className="rounded border-border-strong text-brand focus:ring-brand mr-3 w-4 h-4" checked={selectedArtifactAssets.includes(asset)} onChange={e => { if (e.target.checked) setSelectedArtifactAssets([...selectedArtifactAssets, asset]); else setSelectedArtifactAssets(selectedArtifactAssets.filter(a => a !== asset)); }} />
                      <span className="text-[14px] text-text-secondary font-medium">{asset}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Tag Selection */}
            <div className="space-y-2 relative">
              <label className="block text-[14px] font-bold text-text-secondary">Version Tag</label>
              <div className={`w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-secondary text-[15px] cursor-pointer flex justify-between items-center transition-all font-medium ${selectedArtifactAssets.length === 0 ? 'bg-canvas cursor-not-allowed' : ''}`} onClick={() => selectedArtifactAssets.length > 0 && setIsArtifactTagDropdownOpen(!isArtifactTagDropdownOpen)}>
                <span className="truncate">{isArtifactTagsLoading ? 'Loading...' : selectedArtifactTags.length > 0 ? `${selectedArtifactTags.length} Tags selected` : 'Select Tags'}</span>
                <ChevronDown className="w-5 h-5 text-text-subtle pointer-events-none" />
              </div>
              {isArtifactTagDropdownOpen && selectedArtifactAssets.length > 0 && (
                <div className="absolute top-[100%] left-0 w-full mt-1 bg-surface border border-border rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                  {availableTagsForArtifact.length === 0
                    ? <p className="px-4 py-3 text-[13px] text-text-subtle">No tags found for selected assets.</p>
                    : availableTagsForArtifact.map(tag => (
                      <label key={tag.iotdb_tag_id} className="flex items-center px-4 py-2 hover:bg-canvas cursor-pointer">
                        <input type="checkbox" className="rounded border-border-strong text-brand focus:ring-brand mr-3 w-4 h-4" checked={selectedArtifactTags.includes(tag.iotdb_tag_id)} onChange={e => { if (e.target.checked) setSelectedArtifactTags([...selectedArtifactTags, tag.iotdb_tag_id]); else setSelectedArtifactTags(selectedArtifactTags.filter(t => t !== tag.iotdb_tag_id)); }} />
                        <span className="text-[14px] text-text-secondary font-medium">{tag.description || tag.path}</span>
                      </label>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* File Upload (create mode only) */}
          {!isEditingArtifact && (
            <div className="space-y-2">
              <label className="block text-[14px] font-bold text-text-secondary">Upload Logic File / weight <span className="text-danger">*</span></label>
              <div
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${selectedArtifactFile ? 'border-success/30 bg-success/5' : 'border-border bg-canvas/50 hover:bg-canvas hover:border-brand/40'}`}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) setSelectedArtifactFile(e.dataTransfer.files[0]); }}
                onClick={() => document.getElementById('artifact-file-upload')?.click()}
              >
                <input id="artifact-file-upload" type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setSelectedArtifactFile(e.target.files[0]); }} />
                {selectedArtifactFile ? (
                  <div className="flex flex-col items-center animate-in zoom-in-95">
                    <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mb-3"><CheckCircle2 className="w-7 h-7 text-success" /></div>
                    <span className="text-[15px] font-bold text-text-primary mb-1">{selectedArtifactFile.name}</span>
                    <span className="text-[12px] text-text-muted font-medium">{(selectedArtifactFile.size / 1024).toFixed(1)} KB · Ready to commit</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-brand-muted rounded-full flex items-center justify-center mb-4"><Box className="w-7 h-7 text-brand" /></div>
                    <span className="text-[15px] font-bold text-text-primary mb-1">Click to browse or drag & drop</span>
                    <span className="text-[13px] text-text-muted font-medium">Supports .zip, .pkl, .h5, .pt (Max 50MB)</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {artifactSubmitError && (
          <div className="mx-6 mb-2 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3">
            <span className="text-danger mt-0.5 shrink-0">⚠</span>
            <p className="text-[13px] text-danger font-medium leading-snug">{artifactSubmitError}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-canvas/30">
          <button onClick={() => { setIsArtifactModalOpen(false); resetArtifactForm(); }} className="px-6 py-2.5 border border-border text-text-secondary bg-surface rounded-xl hover:bg-canvas font-bold text-[14px] transition-all cursor-pointer">Cancel</button>
          <button onClick={handleArtifactSubmit} disabled={!canSubmit} aria-busy={isConfiguringArtifact} className={`flex items-center gap-2.5 px-8 py-2.5 rounded-xl font-bold text-[14px] transition-all shadow-lg active:scale-95 cursor-pointer ${canSubmit ? 'bg-brand text-white hover:bg-brand-hover shadow-brand/20' : 'bg-surface-2 text-text-subtle cursor-not-allowed border border-border'}`}>
            {isConfiguringArtifact ? <><Spinner size="xs" />{isEditingArtifact ? 'Updating Artifact...' : 'Committing Artifact...'}</> : <><Database className="w-4 h-4" />{isEditingArtifact ? 'Update Artifact' : 'Configure Artifact'}</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
