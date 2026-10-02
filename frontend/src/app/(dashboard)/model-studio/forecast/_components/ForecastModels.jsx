'use client';
import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, Archive, Box, Loader2 } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { Select } from '@/src/components/ui/Select';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { getForecastAssetTags, createForecastModel, modifyForecastModel, deleteForecastModel } from '@/src/services/model-studio/forecast/forecastService';

export function ForecastModels({ plantCode, modelsList, modelsLoading, modelsError, assetList, modelOptions, modelOptionsLoading, onRefresh }) {
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isModifyMode, setIsModifyMode] = useState(false);
    const [editingModelIdx, setEditingModelIdx] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modelToDeleteIdx, setModelToDeleteIdx] = useState(null);

    const [newModelForm, setNewModelForm] = useState({ name: '', modelType: '', equipment: '', description: '' });
    const [selectedTags, setSelectedTags] = useState([]);
    const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
    const [availableTagsForAsset, setAvailableTagsForAsset] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const resetForm = () => {
        setNewModelForm({ name: '', modelType: '', equipment: '', description: '' });
        setSelectedTags([]);
        setAvailableTagsForAsset([]);
        setSaveError(null);
    };

    useEffect(() => {
        if (!newModelForm.equipment) { setAvailableTagsForAsset([]); setSelectedTags([]); return; }
        setTagsLoading(true);
        setSelectedTags([]);
        getForecastAssetTags(plantCode, newModelForm.equipment)
            .then(json => { if (json.statusCode === 200 && Array.isArray(json.data)) setAvailableTagsForAsset(json.data); else setAvailableTagsForAsset([]); })
            .catch(() => setAvailableTagsForAsset([]))
            .finally(() => setTagsLoading(false));
    }, [newModelForm.equipment]);

    const handleRegisterSubmit = async () => {
        if (!newModelForm.name || !newModelForm.equipment || !newModelForm.modelType) return;
        setIsSaving(true);
        setSaveError(null);
        try {
            if (isModifyMode && editingModelIdx !== null) {
                const modelId = modelsList[editingModelIdx]?.model_id;
                const json = await modifyForecastModel(plantCode, { model_id: modelId, model_selection: newModelForm.modelType, description: newModelForm.description, assets: [newModelForm.equipment], tags: selectedTags });
                if (json.statusCode !== 200) { setSaveError(json.message || 'Failed to update model'); return; }
            } else {
                const json = await createForecastModel(plantCode, { model_name: newModelForm.name, model_selection: newModelForm.modelType, description: newModelForm.description, assets: [newModelForm.equipment], tags: selectedTags });
                if (json.statusCode !== 200) { setSaveError(json.message || 'Failed to create model'); return; }
            }
            await onRefresh();
            setIsRegisterModalOpen(false);
            setIsModifyMode(false);
            setIsRegisterModalOpen(false);
            setIsModifyMode(false);
            setEditingModelIdx(null);
            resetForm();
        } catch (e) {
            setSaveError(e.message || 'Network error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteModel = async () => {
        if (modelToDeleteIdx === null) return;
        setIsDeleting(true);
        try {
            const modelId = modelsList[modelToDeleteIdx]?.model_id;
            const json = await deleteForecastModel(plantCode, modelId);
            if (json.statusCode === 200) {
                await onRefresh();
                setIsDeleteModalOpen(false);
                setModelToDeleteIdx(null);
            }
        } catch (e) {
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        { key: 'model_id', label: 'ID', render: r => <span className="text-text-muted tabular-nums">{r.model_id}</span> },
        { key: 'model_name', label: 'Model Name', render: r => <span className="font-bold text-text-primary">{r.model_name}</span> },
        { key: 'model_selection', label: 'Model Type', render: r => <span className="text-text-muted">{r.model_selection}</span> },
        { key: 'assets', label: 'Assets', render: r => <span className="text-text-muted">{Array.isArray(r.assets) ? r.assets.join(', ') : r.assets || '-'}</span> },
        { key: 'tags', label: 'Tags', render: r => <span className="text-text-muted max-w-[160px] truncate" title={Array.isArray(r.tags) ? r.tags.join(', ') : ''}>{Array.isArray(r.tags) ? r.tags.slice(0, 2).join(', ') + (r.tags.length > 2 ? ` +${r.tags.length - 2}` : '') : '-'}</span> },
        { key: 'created_at', label: 'Created', render: r => <span className="text-text-muted text-[13px]">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</span> },
        { key: 'actions', label: '', cellClassName: 'text-right', render: (r, idx) => (
            <ActionsMenuButton actions={[
                { label: 'Modify', icon: <Settings className="w-4 h-4 text-text-subtle" />, onClick: () => {
                    setNewModelForm({ name: r.model_name, modelType: r.model_selection || '', equipment: (Array.isArray(r.assets) ? r.assets[0] : r.assets) || '', description: r.description || '' });
                    setSelectedTags(Array.isArray(r.tags) ? r.tags : []);
                    setIsModifyMode(true);
                    setEditingModelIdx(idx);
                    setIsRegisterModalOpen(true);
                } },
                { label: 'Delete', icon: <Archive className="w-4 h-4 text-danger" />, danger: true, onClick: () => {
                    setModelToDeleteIdx(idx);
                    setIsDeleteModalOpen(true);
                } }
            ]} />
        ) }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-[20px] font-bold text-text-primary">Forecast Models</h2>
                    <p className="text-[14px] text-text-muted">Register and manage forecasting model configurations.</p>
                </div>
                <button onClick={() => { resetForm(); setIsModifyMode(false); setIsRegisterModalOpen(true); }} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover text-[14px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer">
                    <Plus className="w-4 h-4" /> Register Model
                </button>
            </div>

            <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    rows={modelsList}
                    loading={modelsLoading}
                    emptyIcon={<Box className="w-12 h-12 text-border-strong" />}
                    emptyTitle="No models registered"
                    emptyDescription="Register your first forecasting model to get started."
                />
            </div>

            <Modal open={isRegisterModalOpen} onClose={() => { setIsRegisterModalOpen(false); resetForm(); }} size="lg" className="flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-border/40 flex justify-between items-center shrink-0">
                            <h2 id="forecast-model-modal-title" className="text-[18px] font-bold text-text-primary">{isModifyMode ? 'Modify Model' : 'Register Model'}</h2>
                            <button onClick={() => { setIsRegisterModalOpen(false); resetForm(); }} aria-label="Close" className="p-2 text-text-subtle hover:bg-surface-2 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {!isModifyMode && (
                                <div className="space-y-1">
                                    <label className="text-[13px] font-bold text-text-secondary">Model Name <span className="text-danger">*</span></label>
                                    <input type="text" placeholder="e.g. Cement_LSTM_v1" className="w-full px-3 py-2 border border-border rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" value={newModelForm.name} onChange={e => setNewModelForm(p => ({ ...p, name: e.target.value }))} />
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-text-secondary">Model Type <span className="text-danger">*</span></label>
                                <Select
                                    value={newModelForm.modelType}
                                    onChange={(v) => setNewModelForm(p => ({ ...p, modelType: v }))}
                                    placeholder="Select model type..."
                                    options={modelOptions.map(opt => ({ value: opt.value || opt.label, label: opt.label }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-text-secondary">Equipment / Asset <span className="text-danger">*</span></label>
                                <Select
                                    value={newModelForm.equipment}
                                    onChange={(v) => setNewModelForm(p => ({ ...p, equipment: v }))}
                                    placeholder="Select asset..."
                                    options={assetList}
                                />
                            </div>
                            {newModelForm.equipment && (
                                <div className="space-y-1">
                                    <label className="text-[13px] font-bold text-text-secondary">Tags</label>
                                    {tagsLoading ? <p className="text-[13px] text-text-subtle flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading tags...</p> : (
                                        <div className="flex flex-wrap gap-2 p-2 border border-border rounded-xl max-h-28 overflow-y-auto">
                                            {availableTagsForAsset.map(tag => (
                                                <button key={tag} type="button" onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} className={`px-2.5 py-1 rounded-full text-[12px] font-bold border transition-all cursor-pointer ${selectedTags.includes(tag) ? 'bg-brand text-white border-brand' : 'bg-canvas text-text-muted border-border hover:border-brand'}`}>
                                                    {tag}
                                                </button>
                                            ))}
                                            {availableTagsForAsset.length === 0 && <p className="text-[12px] text-text-subtle">No tags available for this asset.</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-text-secondary">Description</label>
                                <textarea rows={2} placeholder="Optional description..." className="w-full px-3 py-2 border border-border rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none" value={newModelForm.description} onChange={e => setNewModelForm(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            {saveError && <p className="text-danger text-[13px] font-medium">{saveError}</p>}
                        </div>
                        <div className="px-6 py-4 border-t border-border/40 flex justify-end gap-3 shrink-0">
                            <button onClick={() => { setIsRegisterModalOpen(false); resetForm(); }} className="px-4 py-2 border border-border text-text-muted rounded-xl text-[14px] font-bold hover:bg-canvas cursor-pointer">Cancel</button>
                            <button onClick={handleRegisterSubmit} disabled={isSaving || !newModelForm.name || !newModelForm.equipment || !newModelForm.modelType} className="px-5 py-2 bg-brand text-white rounded-xl text-[14px] font-bold hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isModifyMode ? 'Save Changes' : 'Register'}
                            </button>
                        </div>
            </Modal>

            <ConfirmDialog
                open={isDeleteModalOpen && modelToDeleteIdx !== null}
                onClose={() => { setIsDeleteModalOpen(false); setModelToDeleteIdx(null); }}
                onConfirm={handleDeleteModel}
                title="Delete Model"
                description={<>Delete <strong>{modelsList[modelToDeleteIdx]?.model_name}</strong>? This cannot be undone.</>}
                confirmLabel="Delete"
                intent="danger"
                isPending={isDeleting}
            />
        </div>
    );
}
