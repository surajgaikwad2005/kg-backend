'use client';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from '@/src/components/ui/Modal';
import { X, Plus, Upload, Server, FileText, Trash2, Info, ChevronRight, ChevronDown, Pencil, Check, Cloud, MonitorSmartphone, Settings2 } from 'lucide-react';
import { useDocsForm, useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { useDocSourceModal } from './useDocSourceModal';
import { FileLabelSelect } from '@/src/components/admin/FileLabelSelect';
import { useConnectorLabels } from '@/src/components/admin/_queries/useConnectorLabels';
import { areAllFilesLabeled } from '@/src/services/domain-configuration/common';

function FieldRow({ field, isEditing, draft, setDraft, onStartEdit, onSave, onCancel, onDelete, bg = 'bg-surface-2/60 border-border' }) {
  if (isEditing) {
    return (
      <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-3 bg-brand/5 border border-brand/30 rounded-xl space-y-2 shadow-sm">
        <input autoFocus value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
          className="w-full text-xs font-bold bg-surface border border-border/50 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all placeholder-text-muted/50" placeholder="Field name" />
        <input value={draft.desc} onChange={e => setDraft(p => ({ ...p, desc: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
          className="w-full text-xs bg-surface border border-border/50 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all placeholder-text-muted/50" placeholder="Description" />
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onCancel} className="text-xs font-bold text-text-muted hover:text-text-primary cursor-pointer px-2 py-1 transition-colors">Cancel</button>
          <button onClick={onSave} className="text-xs bg-brand text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer flex items-center gap-1 hover:bg-brand-hover shadow-sm transition-all"><Check size={12} />Save</button>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 p-3 border rounded-xl group transition-all hover:shadow-sm hover:border-brand/30 ${bg}`}>
      <div className="w-2 h-2 rounded-full bg-gradient-to-br from-brand to-brand-hover mt-1.5 shrink-0 shadow-sm" />
      <div className="min-w-0 flex-1">
        <span className="text-xs font-bold text-text-primary">{field.name}</span>
        {field.desc && <p className="text-xs text-text-muted mt-0.5 leading-snug">{field.desc}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onStartEdit} aria-label="Edit field" className="p-1.5 text-text-muted hover:text-brand transition-colors cursor-pointer rounded-lg hover:bg-brand/10"><Pencil size={12} /></button>
        <button onClick={onDelete} aria-label="Delete field" className="p-1.5 text-text-muted hover:text-danger transition-colors cursor-pointer rounded-lg hover:bg-danger/10"><Trash2 size={12} /></button>
      </div>
    </motion.div>
  );
}

function CloudConfigForm({ docCloudType, docCloudConfig, setDocCloudConfig, setDocCloudType }) {
  const inp = (label, type, ph, key) => (
    <div key={key} className="relative group">
      <label className="absolute -top-2 left-3 bg-surface px-1 text-[10px] font-bold text-text-muted uppercase tracking-wider z-10 group-focus-within:text-brand transition-colors">{label}</label>
      <input type={type} placeholder={ph} value={docCloudConfig[key] || ''} onChange={e => setDocCloudConfig({ ...docCloudConfig, [key]: e.target.value })}
        className="w-full bg-transparent border-2 border-border rounded-xl px-4 py-3 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder-text-muted/30" />
    </div>
  );
  return (
    <div className="space-y-5">
      <div className="flex gap-2 p-1 bg-surface-2/50 rounded-xl border border-border/50 shadow-inner">
        {['s3', 'adls', 'gcs'].map(ct => (
          <button key={ct} onClick={() => { setDocCloudType(ct); setDocCloudConfig({}); }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer 
              ${docCloudType === ct ? 'bg-surface shadow-sm text-brand border border-brand/20' : 'text-text-muted hover:text-text-primary hover:bg-surface/50'}`}>
            {ct === 's3' ? 'Amazon S3' : ct === 'adls' ? 'Azure Data Lake' : 'Google Cloud'}
          </button>
        ))}
      </div>
      
      <div className="p-5 bg-surface-2/30 rounded-2xl border border-border/50 space-y-4">
        {docCloudType === 's3' && (
          <div className="space-y-4">
            {inp('Bucket Name', 'text', 'my-docs-bucket', 'bucket')}
            {inp('Prefix', 'text', 'raw/documents', 'prefix')}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inp('Region', 'text', 'us-east-1', 'region')}
              {inp('Access Key', 'password', 'AKIA...', 'access_key')}
              {inp('Secret Key', 'password', '••••', 'secret_key')}
            </div>
          </div>
        )}
        {docCloudType === 'adls' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inp('Account Name', 'text', 'mystorageaccount', 'account_name')}
              {inp('Container', 'text', 'documents', 'container')}
            </div>
            {inp('Account Key', 'password', 'Account key', 'account_key')}
            <div className="p-4 bg-surface-2 border border-border/50 rounded-xl relative mt-2">
              <p className="absolute -top-2.5 left-4 bg-surface px-2 text-[10px] text-text-muted uppercase tracking-wider font-bold">Service Principal (optional)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {[['Tenant ID', 'text', 'tenant_id'], ['Client ID', 'text', 'client_id'], ['Secret', 'password', 'client_secret']].map(([ph, type, key]) => (
                  <input key={key} type={type} placeholder={ph} value={docCloudConfig[key] || ''} onChange={e => setDocCloudConfig({ ...docCloudConfig, [key]: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" />
                ))}
              </div>
            </div>
          </div>
        )}
        {docCloudType === 'gcs' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inp('Bucket Name', 'text', 'my-gcs-bucket', 'bucket')}
              {inp('Project ID', 'text', 'my-gcp-project', 'project_id')}
            </div>
            {inp('Prefix', 'text', 'raw/documents', 'prefix')}
            {inp('Service Account JSON Path', 'text', '/path/to/service-account.json', 'service_account_json')}
          </div>
        )}
      </div>
    </div>
  );
}

export function DocSourceModal() {
  const {
    docSourceModal, setDocSourceModal, selectedDocDef, docTab, setDocTab,
    docFiles, setDocFiles, docCloudType, setDocCloudType, docCloudConfig, setDocCloudConfig, docExtraFields,
    uploadedDocFileNames, setUploadedDocFileNames, setUploadedDocSubtypes,
    docFileLabels, setDocFileLabels,
  } = useDocsForm();

  const { setConfiguredSources, selectedPlantId } = useAdminEntities();
  const labels = useConnectorLabels(selectedPlantId?.id);

  const currentSubtypeFiles = docFiles.filter(f => f.docType === selectedDocDef?.key);

  const {
    expandedFiles, newFieldInputs, setNewFieldInputs,
    cloudExtraFields, setCloudExtraFields, cloudNewFieldName, setCloudNewFieldName,
    cloudNewFieldDesc, setCloudNewFieldDesc, editableFields, setEditableFields,
    editingFieldIdx, setEditingFieldIdx, editFieldDraft, setEditFieldDraft,
    editingCloudIdx, setEditingCloudIdx, editCloudDraft, setEditCloudDraft,
    resetDocModalState, toggleFile, addFieldToFile, removeFieldFromFile,
    saveFieldEdit, saveCloudEdit, handleDocSubmit,
  } = useDocSourceModal();

  const labelsRequired = labels.requiresLabels('documents');
  const missingLabels = labelsRequired && !areAllFilesLabeled(currentSubtypeFiles, docFileLabels);
  const isSubmitDisabled = docTab === 'device' && (currentSubtypeFiles.length === 0 || missingLabels);

  const close = () => { setDocSourceModal(false); setTimeout(resetDocModalState, 300); };

  return (
    <Modal
      open={Boolean(docSourceModal && selectedDocDef)}
      onClose={close}
      size="2xl"
      className="border border-border/50 overflow-hidden max-h-[85vh] flex flex-col"
    >
      {docSourceModal && selectedDocDef && (
        <>
            {/* Header */}
            <div className="relative p-6 pb-5 flex items-start justify-between shrink-0 overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-60" />
          
          <div className="flex items-center gap-4 relative z-10">
            <button onClick={close} aria-label="Go back" className="p-2 bg-surface hover:bg-surface-2 border border-border hover:border-brand/30 rounded-xl transition-all cursor-pointer shadow-sm group">
              <ChevronRight size={18} className="rotate-180 text-text-secondary group-hover:text-brand transition-colors" />
            </button>
            <div>
              <h3 id="doc-source-modal-title" className="text-xl font-black text-text-primary tracking-tight">{selectedDocDef.label}</h3>
              <p className="text-xs font-medium text-text-muted mt-0.5 flex items-center gap-1.5">
                <Settings2 size={12} className="text-brand" /> Configure source and extraction settings
              </p>
            </div>
          </div>
          <button onClick={close} aria-label="Close" className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all cursor-pointer relative z-10"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-border-strong bg-gradient-to-b from-surface to-surface-2/30">
          
          <div className="relative flex p-1 bg-surface-2/60 backdrop-blur-md border border-border/50 rounded-xl shadow-inner mb-2">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-surface shadow-md rounded-lg transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${docTab === 'cloud' ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`} />
            
            <button onClick={() => setDocTab('device')}
              className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer ${docTab === 'device' ? 'text-brand' : 'text-text-muted hover:text-text-primary'}`}>
              <MonitorSmartphone size={16} /> Local Device
            </button>
            <button onClick={() => setDocTab('cloud')}
              className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer ${docTab === 'cloud' ? 'text-brand' : 'text-text-muted hover:text-text-primary'}`}>
              <Cloud size={16} /> Cloud Storage
            </button>
          </div>

          {docTab === 'device' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
              <motion.label htmlFor="doc-file-input-portal"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); const raw = Array.from(e.dataTransfer.files); raw.forEach(file => file.docType = selectedDocDef.key); if (raw.length) setDocFiles(prev => [...prev, ...raw]); }}
                className="relative overflow-hidden border-2 border-dashed border-brand/30 rounded-[20px] p-8 flex flex-col items-center justify-center gap-3 hover:border-brand bg-gradient-to-br from-surface to-brand/5 hover:from-brand/5 hover:to-brand/10 transition-all duration-300 cursor-pointer group shadow-sm">
                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <motion.div 
                  className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand/20 transition-colors shadow-inner relative"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Upload size={28} className="relative z-10" />
                  <div className="absolute inset-0 rounded-full border border-brand/30 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                </motion.div>
                <div className="text-center relative z-10">
                  <p className="text-sm font-bold text-text-primary mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-text-muted">PDF, DOCX, XLSX, images</p>
                </div>
              </motion.label>
              <input id="doc-file-input-portal" type="file" multiple accept=".pdf,.docx,.xlsx,.doc,.xls,.pptx,.png,.jpg,.jpeg,.tif,.tiff,.svg" className="sr-only" tabIndex={-1}
                onChange={e => { const raw = Array.from(e.target.files || []); e.target.value = ''; raw.forEach(file => file.docType = selectedDocDef.key); if (raw.length) setDocFiles(prev => [...prev, ...raw]); }} />

              <AnimatePresence>
                {editableFields.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 pt-3 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-1 bg-brand rounded-full" />
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest">Global Fields to Extract</h4>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-border-strong pr-1">
                      <AnimatePresence>
                        {editableFields.map((field, fi) => (
                          <FieldRow key={`field-${fi}`} field={field} isEditing={editingFieldIdx === fi} draft={editFieldDraft} setDraft={setEditFieldDraft}
                            onStartEdit={() => { setEditingFieldIdx(fi); setEditFieldDraft({ name: field.name, desc: field.desc || '' }); }}
                            onSave={() => saveFieldEdit(fi)} onCancel={() => setEditingFieldIdx(null)}
                            onDelete={() => setEditableFields(prev => prev.filter((_, i) => i !== fi))} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {currentSubtypeFiles.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 pt-3 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-1 bg-warning rounded-full" />
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest">Selected Files</h4>
                    </div>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {currentSubtypeFiles.map((f) => {
                          const isExpanded = expandedFiles.has(f.name);
                          const fileFields = docExtraFields[f.name] || [];
                          const fileInput = newFieldInputs[f.name] || { name: '', desc: '' };
                          return (
                            <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, height: 0 }} key={f.name} className="border border-border/60 hover:border-brand/30 rounded-xl overflow-hidden bg-surface-2/40 transition-colors">
                              <div className="flex items-center justify-between p-3 gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 border border-brand/20 shadow-sm">
                                    <FileText size={14} className="text-brand" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm text-text-primary truncate font-bold">{f.name}</p>
                                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{(f.size / 1024).toFixed(1)} KB</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="w-48 sm:w-56">
                                    <FileLabelSelect
                                      value={docFileLabels[f.name]}
                                      onChange={(val) => setDocFileLabels(prev => ({ ...prev, [f.name]: val }))}
                                      options={labels.options}
                                      isLoading={labels.isLoading}
                                      isError={labels.isError}
                                      onRetry={labels.refetch}
                                      fileName={f.name}
                                    />
                                  </div>
                                  {fileFields.length > 0 && <span className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full font-bold border border-brand/20">{fileFields.length} custom fields</span>}
                                  <button onClick={() => toggleFile(f.name)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isExpanded ? 'bg-brand/10 text-brand' : 'bg-surface border border-border text-text-muted hover:text-text-primary hover:border-brand/30 shadow-sm'}`}>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} /> Fields
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); setDocFiles(prev => prev.filter(df => df !== f)); setNewFieldInputs(prev => { const n = { ...prev }; delete n[f.name]; return n; }); setDocFileLabels(prev => { const n = { ...prev }; delete n[f.name]; return n; }); if (isExpanded) toggleFile(f.name); }}
                                    aria-label="Remove file" className="bg-surface border border-border text-text-muted hover:text-white hover:bg-danger hover:border-danger p-1.5 rounded-lg cursor-pointer transition-all shadow-sm"><Trash2 size={14} /></button>
                                </div>
                              </div>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="border-t border-border/50 p-4 bg-surface-2/80 space-y-3">
                                      {fileFields.length > 0 ? (
                                        <div className="space-y-2">
                                          <AnimatePresence>
                                            {fileFields.map((field, fi) => (
                                              <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} key={`ff-${fi}`} className="flex items-start justify-between gap-2 p-2 bg-surface border border-border rounded-lg shadow-sm">
                                                <div className="flex items-start gap-2 min-w-0">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0 shadow-sm" />
                                                  <div className="min-w-0">
                                                    <span className="text-xs font-bold text-text-primary">{field.name}</span>
                                                    {field.desc && <p className="text-[10px] text-text-muted leading-tight mt-0.5">{field.desc}</p>}
                                                  </div>
                                                </div>
                                                <button onClick={() => removeFieldFromFile(f.name, fi)} aria-label="Remove field" className="text-text-muted hover:text-white hover:bg-danger shrink-0 p-1 rounded transition-colors cursor-pointer"><X size={12} /></button>
                                              </motion.div>
                                            ))}
                                          </AnimatePresence>
                                        </div>
                                      ) : (
                                        <p className="text-xs text-text-muted italic flex items-center gap-1.5"><Info size={12}/> No custom file-specific fields added.</p>
                                      )}
                                      
                                      <div className="flex gap-2 pt-1">
                                        <input type="text" placeholder="Field name" value={fileInput.name} onChange={e => setNewFieldInputs(prev => ({ ...prev, [f.name]: { ...(prev[f.name] || { name: '', desc: '' }), name: e.target.value } }))} onKeyDown={e => { if (e.key === 'Enter') addFieldToFile(f.name); }} className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all shadow-sm" />
                                        <input type="text" placeholder="Description" value={fileInput.desc} onChange={e => setNewFieldInputs(prev => ({ ...prev, [f.name]: { ...(prev[f.name] || { name: '', desc: '' }), desc: e.target.value } }))} onKeyDown={e => { if (e.key === 'Enter') addFieldToFile(f.name); }} className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all shadow-sm" />
                                        <button onClick={() => addFieldToFile(f.name)} aria-label="Add field" className="px-3 py-2 bg-brand/10 border border-brand/30 text-brand rounded-lg font-bold hover:bg-brand/20 hover:border-brand/50 transition-all shrink-0 cursor-pointer shadow-sm"><Plus size={14} /></button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {uploadedDocFileNames?.[selectedDocDef.key]?.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 pt-4 border-t border-border/60 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-1 bg-success rounded-full" />
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest flex items-center gap-1.5">Previously Uploaded Files</h4>
                    </div>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {uploadedDocFileNames[selectedDocDef.key].map(fname => (
                          <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, height: 0 }} key={fname} className="flex items-center justify-between p-3 bg-gradient-to-r from-success/5 to-success/10 border border-success/30 rounded-xl group hover:shadow-sm transition-all hover:border-success/50">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center shrink-0 border border-success/30 shadow-sm">
                                <Check size={14} className="text-success" />
                              </div>
                              <span className="text-sm text-text-primary truncate font-bold">{fname}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadedDocFileNames(prev => {
                                  const current = prev[selectedDocDef.key] || [];
                                  const updated = current.filter(f => f !== fname);
                                  if (updated.length === 0) {
                                    setUploadedDocSubtypes(subPrev => subPrev.filter(s => s.key !== selectedDocDef.key));
                                  }
                                  return { ...prev, [selectedDocDef.key]: updated };
                                });
                                
                                setConfiguredSources(prev => {
                                  return prev.map(source => {
                                    if (source.type === 'Documents' && source.name.includes(selectedDocDef.label)) {
                                      const updatedFilesMeta = source.filesMeta?.filter(fm => fm.name !== fname) || [];
                                      if (updatedFilesMeta.length === 0) return null;
                                      return {
                                        ...source,
                                        filesMeta: updatedFilesMeta,
                                        name: `${updatedFilesMeta.length} ${selectedDocDef.label} file(s)`
                                      };
                                    }
                                    return source;
                                  }).filter(Boolean);
                                });
                              }}
                              aria-label="Remove previously uploaded file"
                              className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-white hover:bg-danger p-1.5 rounded-lg cursor-pointer transition-all shadow-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {docTab === 'cloud' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <CloudConfigForm docCloudType={docCloudType} docCloudConfig={docCloudConfig} setDocCloudConfig={setDocCloudConfig} setDocCloudType={setDocCloudType} />
              
              <div className="space-y-3 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-brand rounded-full" />
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest">Fields to be Extracted</h4>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-border-strong pr-1">
                  {editableFields.map((field, fi) => (
                    <FieldRow key={`def-${fi}`} field={field} isEditing={editingFieldIdx === fi} draft={editFieldDraft} setDraft={setEditFieldDraft}
                      onStartEdit={() => { setEditingFieldIdx(fi); setEditFieldDraft({ name: field.name, desc: field.desc || '' }); }}
                      onSave={() => saveFieldEdit(fi)} onCancel={() => setEditingFieldIdx(null)}
                      onDelete={() => setEditableFields(prev => prev.filter((_, i) => i !== fi))} />
                  ))}
                  {cloudExtraFields.map((field, fi) => (
                    <FieldRow key={`extra-${fi}`} field={field} isEditing={editingCloudIdx === fi} draft={editCloudDraft} setDraft={setEditCloudDraft}
                      bg="bg-brand/5 border-brand/20"
                      onStartEdit={() => { setEditingCloudIdx(fi); setEditCloudDraft({ name: field.name, desc: field.desc || '' }); }}
                      onSave={() => saveCloudEdit(fi)} onCancel={() => setEditingCloudIdx(null)}
                      onDelete={() => setCloudExtraFields(prev => prev.filter((_, i) => i !== fi))} />
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <input type="text" placeholder="Field name" value={cloudNewFieldName} onChange={e => setCloudNewFieldName(e.target.value)} className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all shadow-sm" />
                  <input type="text" placeholder="Description (optional)" value={cloudNewFieldDesc} onChange={e => setCloudNewFieldDesc(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && cloudNewFieldName.trim()) { setCloudExtraFields(prev => [...prev, { name: cloudNewFieldName.trim(), desc: cloudNewFieldDesc.trim() }]); setCloudNewFieldName(''); setCloudNewFieldDesc(''); } }}
                    className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all shadow-sm" />
                  <button onClick={() => { if (!cloudNewFieldName.trim()) return; setCloudExtraFields(prev => [...prev, { name: cloudNewFieldName.trim(), desc: cloudNewFieldDesc.trim() }]); setCloudNewFieldName(''); setCloudNewFieldDesc(''); }}
                    aria-label="Add field" className="px-4 py-2 bg-brand/10 border border-brand/30 text-brand rounded-lg text-xs font-bold hover:bg-brand/20 hover:border-brand/50 transition-all shrink-0 cursor-pointer shadow-sm"><Plus size={14} /></button>
                </div>
                
                <div className="p-3 mt-4 bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/30 rounded-xl flex items-start gap-3 shadow-sm">
                  <Info size={16} className="text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-warning/90 font-medium leading-relaxed">Make sure the fields mentioned have the respective data available in the document. Missing fields will be skipped during extraction.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-surface-2/80 backdrop-blur-md border-t border-border/50 flex flex-wrap items-center justify-end gap-3 shrink-0">
          {docTab === 'device' && currentSubtypeFiles.length > 0 && missingLabels && (
            <p className="text-[11px] font-semibold text-text-muted mr-auto flex items-center gap-1.5 animate-in fade-in duration-300">
              <Info size={12} className="text-warning shrink-0" />
              {labels.isError
                ? 'Labels could not be loaded — retry on any file to continue.'
                : 'Assign at least one label to every file to continue.'}
            </p>
          )}
          <button onClick={close} className="px-5 py-2.5 text-xs font-bold text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border rounded-xl transition-all cursor-pointer">Cancel</button>
          <button
            onClick={handleDocSubmit}
            disabled={isSubmitDisabled}
            aria-busy={false}
            className={`font-bold py-2.5 px-8 rounded-xl text-xs transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-md
              ${isSubmitDisabled 
                ? 'bg-surface-2 text-text-muted border border-border shadow-none cursor-not-allowed opacity-70' 
                : 'bg-gradient-to-r from-brand to-brand-hover text-white hover:shadow-brand/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'}`}
          >
            {docTab === 'device' ? <><Upload size={14}/> Upload & Sync</> : <><Server size={14}/> Connect & Sync</>}
          </button>
        </div>
        </>
      )}
    </Modal>
  );
}
export default DocSourceModal;
