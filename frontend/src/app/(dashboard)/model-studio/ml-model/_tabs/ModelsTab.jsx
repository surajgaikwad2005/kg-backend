'use client';
import React from 'react';
import { Plus, Search, ChevronDown, Settings, Archive, Box, Eye, X } from 'lucide-react';
import { Modal, ModalBody } from '@/src/components/ui/Modal';
import { Select } from '@/src/components/ui/Select';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Spinner } from '@/src/components/ui/Spinner';
import { DataTable } from '@/src/components/ui/DataTable';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';
import { useModelsTab } from '../_hooks/useModelsTab';

/**
 * Models tab — model registry table + Register/Delete modals.
 *
 * @param {{
 *   modelsList: object[],
 *   modelsLoading: boolean,
 *   modelsError: string | null,
 *   assetList: string[],
 *   modelOptions: object[],
 *   modelOptionsLoading: boolean,
 *   onRefresh: () => void,
 * }} props
 */
export function ModelsTab({ modelsList, modelsLoading, modelsError, assetList, modelOptions, modelOptionsLoading, onRefresh }) {
  const m = useModelsTab({ modelsList, modelOptions, onRefresh });
  const optionLabel = (value) => modelOptions.find(o => o.value === value)?.label || value;

  const columns = [
    { key: 'model_id', label: 'Model ID', render: r => <span className="font-bold text-text-primary">{r.model_id}</span> },
    { key: 'model_name', label: 'Model Name', render: r => (
      <div>
        <div className="font-bold text-text-primary">{r.model_name}</div>
        {r.description && <div className="text-body text-text-muted mt-1 truncate max-w-xs">{r.description}</div>}
      </div>
    ) },
    { key: 'model_selection', label: 'Model Selection', render: r => (
      <span className="text-text-muted">
        {optionLabel(r.model_selection)}
        {r.model_type && <span className="ml-2 text-caption text-text-subtle">· {r.model_type}</span>}
      </span>
    ) },
    { key: 'assets', label: 'Assets', render: r => <span className="text-text-muted">{Array.isArray(r.assets) ? r.assets.join(', ') : r.assets}</span> },
    { key: 'tags', label: 'Tags ID', render: r => <span className="text-text-muted text-body">{Array.isArray(r.tags) ? r.tags.slice(0, 3).join(', ') + (r.tags.length > 3 ? ` +${r.tags.length - 3}` : '') : r.tags}</span> },
    { key: 'created_at', label: 'Created At', render: r => <span className="text-text-muted text-body">{r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}</span> },
    { key: 'updated_at', label: 'Updated At', render: r => <span className="text-text-muted text-body">{r.updated_at ? new Date(r.updated_at).toLocaleString() : 'N/A'}</span> },
    { key: 'actions', label: 'Actions', cellClassName: 'text-right', render: r => (
      <ActionsMenuButton actions={[
        { label: 'View Details', icon: <Eye className="w-4 h-4 text-text-subtle" />, onClick: () => m.openDetailModal(r) },
        { label: 'Modify', icon: <Settings className="w-4 h-4 text-text-subtle" />, onClick: () => m.openEditModal(r) },
        { label: 'Delete', icon: <Archive className="w-4 h-4 text-danger" />, danger: true, onClick: () => m.openDeleteModal(r) }
      ]} />
    ) }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[26px] font-bold text-text-primary">Model Registry</h2>
          <p className="text-[16px] text-text-muted mt-1">Manage, version, and track all machine learning models in your organization.</p>
        </div>
        <button onClick={m.openNewModal} className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover font-medium text-[16px] transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Register Model
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-2 rounded-lg border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input type="text" value={m.searchQuery} onChange={(e) => m.setSearchQuery(e.target.value)} placeholder="Search models or tags..." className="w-full pl-9 pr-4 py-2 text-[16px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent" />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-between w-full sm:w-40 px-3 py-2 text-[16px] border border-border rounded-md text-text-muted hover:bg-canvas cursor-pointer">All Status<ChevronDown className="w-4 h-4 text-text-subtle" /></button>
          <button className="flex items-center justify-between w-full sm:w-40 px-3 py-2 text-[16px] border border-border rounded-md text-text-muted hover:bg-canvas cursor-pointer">All Frameworks<ChevronDown className="w-4 h-4 text-text-subtle" /></button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        {modelsError ? (
          <div className="flex flex-col items-center justify-center py-16 text-danger">
            <p className="font-semibold">Failed to load models</p>
            <p className="text-body mt-1 text-text-muted">{modelsError}</p>
            <button onClick={onRefresh} className="mt-4 px-4 py-2 bg-brand text-white rounded-lg text-body hover:bg-brand-hover cursor-pointer">Retry</button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={m.filteredModels}
            loading={modelsLoading}
            emptyIcon={<Box className="w-12 h-12 text-border-strong" />}
            emptyTitle="No models registered yet"
            emptyDescription="Click &ldquo;Register Model&rdquo; to get started."
            onRowClick={m.openDetailModal}
          />
        )}
      </div>

      <Modal open={m.isRegisterModalOpen} onClose={m.closeRegisterModal} size="lg" className="overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border/40 flex justify-between items-start">
              <div>
                <h3 id="register-model-title" className="text-[22px] font-bold text-text-primary">{m.isModifyMode ? 'Modify Model' : 'Register New Model'}</h3>
                <p className="text-base text-text-muted mt-1">Add a new ML model version to the registry.</p>
              </div>
              <button onClick={m.closeRegisterModal} aria-label="Close" className="text-text-subtle hover:text-text-secondary p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label htmlFor="model-name" className="block text-base font-medium text-text-primary mb-1">Model Name <span className="text-danger">*</span></label>
                <input id="model-name" type="text" value={m.newModelForm.name} onChange={e => m.setNewModelForm({ ...m.newModelForm, name: e.target.value })} placeholder="e.g., fraud-detector-v4" disabled={m.isModifyMode} className="w-full px-3 py-2 border-2 border-brand rounded-lg focus:outline-none focus:ring-0 focus:border-brand-hover text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-2" />
                {m.isModifyMode && <p className="text-caption text-text-subtle mt-1">Name can&rsquo;t be changed after a model is registered.</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="model-type" className="block text-base font-medium text-text-primary mb-1">Model Selection <span className="text-danger">*</span></label>
                  <Select
                    id="model-type"
                    value={m.newModelForm.modelType}
                    onChange={m.handleModelTypeChange}
                    disabled={modelOptionsLoading}
                    placeholder={modelOptionsLoading ? 'Loading...' : 'Select model type'}
                    emptyMessage="No options"
                    options={modelOptions}
                  />
                </div>
                <div>
                  <label htmlFor="model-equipment" className="block text-base font-medium text-text-primary mb-1">Equipment / Asset <span className="text-danger">*</span></label>
                  <Select
                    id="model-equipment"
                    value={m.newModelForm.equipment}
                    onChange={(v) => m.setNewModelForm({ ...m.newModelForm, equipment: v })}
                    placeholder="Select Asset"
                    options={assetList}
                  />
                </div>
              </div>
              {m.newModelForm.equipment && (
                <div className="relative">
                  <label className="block text-base font-medium text-text-primary mb-1">Select Tags{m.tagsLoading && <span className="text-body-sm text-brand ml-2">Loading...</span>}</label>
                  <div className="w-full px-3 py-2 border border-border rounded-lg text-text-muted text-base cursor-pointer flex justify-between items-center bg-surface" onClick={() => m.setIsTagsDropdownOpen(!m.isTagsDropdownOpen)}>
                    <span>{m.selectedTags.length > 0 ? `${m.selectedTags.length} tags selected` : 'Select tags...'}</span>
                    <ChevronDown className="w-4 h-4 text-text-subtle pointer-events-none" />
                  </div>
                  {m.isTagsDropdownOpen && (
                    <div className="absolute top-18 left-0 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 py-1 max-h-48 overflow-y-auto">
                      {m.availableTagsForAsset.length === 0
                        ? <p className="px-4 py-3 text-body text-text-subtle">{m.tagsLoading ? 'Loading tags...' : 'No tags found for this asset.'}</p>
                        : m.availableTagsForAsset.map(tag => (
                            <label key={tag.iotdb_tag_id} className="flex items-center px-3 py-2 hover:bg-canvas cursor-pointer">
                              <input type="checkbox" className="rounded border-border-strong text-brand focus:ring-brand mr-3 w-4 h-4" checked={m.selectedTags.includes(tag.iotdb_tag_id)} onChange={e => { if (e.target.checked) m.setSelectedTags([...m.selectedTags, tag.iotdb_tag_id]); else m.setSelectedTags(m.selectedTags.filter(t => t !== tag.iotdb_tag_id)); }} />
                              <span className="text-body text-text-secondary">{tag.description || tag.path}</span>
                            </label>
                          ))}
                    </div>
                  )}
                </div>
              )}
              {m.showTargetTag && (
                <div>
                  <label htmlFor="model-target-tag" className="block text-base font-medium text-text-primary mb-1">Target Tag <span className="text-danger">*</span></label>
                  <Select
                    id="model-target-tag"
                    value={m.newModelForm.targetTag}
                    onChange={(v) => m.setNewModelForm({ ...m.newModelForm, targetTag: v })}
                    placeholder="Select target tag"
                    searchable
                    searchPlaceholder="Search tags..."
                    options={m.availableTagsForAsset.map(tag => ({ value: tag.iotdb_tag_id, label: tag.description || tag.path }))}
                  />
                  <p className="text-caption text-text-subtle mt-1">Required for {m.newModelForm.modelTypeCategory} models — the tag this model predicts.</p>
                </div>
              )}
              <div>
                <label htmlFor="model-desc" className="block text-base font-medium text-text-primary mb-1">Description</label>
                <textarea id="model-desc" value={m.newModelForm.description} onChange={e => m.setNewModelForm({ ...m.newModelForm, description: e.target.value })} placeholder="Describe the model's purpose, architecture, and use case..." rows={3} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-base resize-y" />
              </div>
            </div>
            <div className="p-4 border-t border-border/40 flex flex-col gap-2 bg-canvas">
              {m.saveError && <p className="text-danger text-body text-center">{m.saveError}</p>}
              <div className="flex justify-end gap-3">
                <button onClick={m.closeRegisterModal} className="px-4 py-2 border border-border text-text-secondary bg-surface rounded-lg hover:bg-canvas font-medium text-base transition-colors cursor-pointer" disabled={m.isSaving}>Cancel</button>
                <button onClick={m.handleRegisterSubmit} disabled={!m.newModelForm.name || !m.newModelForm.equipment || !m.newModelForm.modelType || (m.showTargetTag && !m.newModelForm.targetTag) || m.isSaving} aria-busy={m.isSaving} className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium text-base transition-colors cursor-pointer ${!m.newModelForm.name || !m.newModelForm.equipment || !m.newModelForm.modelType || (m.showTargetTag && !m.newModelForm.targetTag) || m.isSaving ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover'}`}>
                  {m.isSaving && <Spinner size="xs" />}
                  {m.isModifyMode ? 'Update Model' : 'Register Model'}
                </button>
              </div>
            </div>
      </Modal>

      <Modal open={m.isDeleteModalOpen} onClose={m.closeDeleteModal} size="md" className="overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4"><Archive className="w-8 h-8" /></div>
              <h3 id="delete-model-title" className="text-[22px] font-bold text-text-primary mb-2">Are you sure?</h3>
              <p className="text-text-muted">You are about to delete <span className="font-bold text-text-primary">{m.modelToDelete?.model_name}</span>. This action cannot be undone.</p>
            </div>
            <div className="p-4 bg-canvas flex justify-center gap-3 border-t border-border/40">
              <button onClick={m.closeDeleteModal} className="px-6 py-2 border border-border text-text-secondary bg-surface rounded-lg hover:bg-canvas font-medium text-base transition-colors cursor-pointer">Cancel</button>
              <button onClick={m.handleDeleteModel} disabled={m.isDeleting} aria-busy={m.isDeleting} className="flex items-center gap-2 px-6 py-2 bg-danger text-white rounded-lg hover:bg-danger/80 font-medium text-base transition-colors disabled:opacity-60 cursor-pointer">
                {m.isDeleting && <Spinner size="xs" />} Yes, Delete
              </button>
            </div>
      </Modal>

      <Modal open={m.isDetailModalOpen} onClose={m.closeDetailModal} title={m.detailModel?.model_name || 'Model Details'} size="lg" className="overflow-hidden flex flex-col max-h-[85vh]">
        <ModalBody className="overflow-y-auto space-y-4">
          {m.detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : m.detailError ? (
            <p className="text-danger text-body">{m.detailError}</p>
          ) : m.detailModel ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-base">
              <div><dt className="text-caption font-semibold text-text-subtle uppercase tracking-wider">Model ID</dt><dd className="text-text-primary mt-0.5">{m.detailModel.model_id}</dd></div>
              <div><dt className="text-caption font-semibold text-text-subtle uppercase tracking-wider">Model Selection</dt><dd className="text-text-primary mt-0.5">{optionLabel(m.detailModel.model_selection)}</dd></div>
              <div><dt className="text-caption font-semibold text-text-subtle uppercase tracking-wider">Model Type</dt><dd className="text-text-primary mt-0.5">{m.detailModel.model_type || 'N/A'}</dd></div>
              <div><dt className="text-caption font-semibold text-text-subtle uppercase tracking-wider">Target Tag</dt><dd className="text-text-primary mt-0.5">{m.detailModel.target_tag || 'N/A'}</dd></div>
              <div className="col-span-2"><dt className="text-caption font-semibold text-text-subtle uppercase tracking-wider">Description</dt><dd className="text-text-primary mt-0.5">{m.detailModel.description || 'N/A'}</dd></div>
              <div className="col-span-2"><dt className="text-caption font-semibold text-text-subtle uppercase tracking-wider">Assets</dt><dd className="text-text-primary mt-0.5">{Array.isArray(m.detailModel.assets) ? m.detailModel.assets.join(', ') : m.detailModel.assets || 'N/A'}</dd></div>
              <div className="col-span-2"><dt className="text-caption font-semibold text-text-subtle uppercase tracking-wider">Tags</dt><dd className="text-text-primary mt-0.5 font-mono text-body-sm">{Array.isArray(m.detailModel.tags) && m.detailModel.tags.length > 0 ? m.detailModel.tags.join(', ') : 'N/A'}</dd></div>
              <div><dt className="text-caption font-semibold text-text-subtle uppercase tracking-wider">Created At</dt><dd className="text-text-primary mt-0.5">{m.detailModel.created_at ? new Date(m.detailModel.created_at).toLocaleString() : 'N/A'}</dd></div>
              <div><dt className="text-caption font-semibold text-text-subtle uppercase tracking-wider">Updated At</dt><dd className="text-text-primary mt-0.5">{m.detailModel.updated_at ? new Date(m.detailModel.updated_at).toLocaleString() : 'N/A'}</dd></div>
            </dl>
          ) : null}
        </ModalBody>
      </Modal>

    </div>
  );
}
