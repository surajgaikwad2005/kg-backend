'use client';
import React from 'react';
import { X, Plus, ChevronRight, CheckCircle2, Trash2, FileText, Layers } from 'lucide-react';
import { useDocsForm } from '@/src/components/admin/AdminPanelContext';

export function ConfigModalDocuments() {
    const {
        docActiveCategory, setDocActiveCategory,
        docCustomCategories, setDocCustomCategories,
        docNewTypeName, setDocNewTypeName,
        docAddingType, setDocAddingType,
        setDocSelectedType, setDocSourceModal, setDocTab, docFiles, setDocFiles,
        setDocUploading, setDocUploadProgress, setDocJobStatus, setDocExtraFields,
        docCategorySubtypes, setDocCategorySubtypes,
        docAddingSubtype, setDocAddingSubtype,
        docNewSubtypeName, setDocNewSubtypeName,
        allDocCategories, effectiveDocCategories, uploadedDocSubtypes,
    } = useDocsForm();
    const allCategories = allDocCategories;

    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border-strong pb-4">
        
        {/* Sleek Segmented Categories */}
        <div className="p-1.5 bg-surface-2/50 backdrop-blur-md border border-border/50 rounded-2xl flex flex-wrap gap-1 shadow-inner relative">
          {allCategories.map((catName, ci) => {
            const isActive = docActiveCategory === ci;
            return (
              <button key={ci} onClick={() => setDocActiveCategory(ci)} 
                className={`relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 z-10 cursor-pointer
                  ${isActive ? 'text-white shadow-md shadow-brand/20' : 'text-text-muted hover:text-text-primary hover:bg-surface/50'}`}>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-hover rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-200" />
                )}
                {catName}
              </button>
            );
          })}
          
          {docAddingType ? (
            <div className="flex items-center gap-2 px-2 py-1 bg-surface border border-brand/50 rounded-xl shadow-sm animate-in slide-in-from-left-4">
              <input type="text" autoFocus placeholder="Category name..." value={docNewTypeName} 
                onChange={e => setDocNewTypeName(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === 'Enter' && docNewTypeName.trim()) {
                      setDocCustomCategories(prev => [...prev, docNewTypeName.trim()]);
                      setDocActiveCategory(allCategories.length);
                      setDocNewTypeName('');
                      setDocAddingType(false);
                  } else if (e.key === 'Escape') {
                      setDocNewTypeName('');
                      setDocAddingType(false);
                  }
                }} 
                className="bg-transparent px-2 py-1 text-xs text-text-primary focus:outline-none w-32 placeholder-text-muted/50"
              />
              <button onClick={() => {
                  if (docNewTypeName.trim()) {
                      setDocCustomCategories(prev => [...prev, docNewTypeName.trim()]);
                      setDocActiveCategory(allCategories.length);
                  }
                  setDocNewTypeName('');
                  setDocAddingType(false);
              }} className="cursor-pointer px-3 py-1 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand-hover transition-colors shadow-sm">Add</button>
              <button onClick={() => { setDocNewTypeName(''); setDocAddingType(false); }} className="cursor-pointer p-1 text-text-muted hover:text-danger rounded-md transition-colors"><X size={14}/></button>
            </div>
          ) : (
            <button onClick={() => setDocAddingType(true)} 
              className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-transparent text-text-muted border border-dashed border-border hover:border-brand hover:text-brand transition-all flex items-center gap-1.5 hover:bg-brand/5">
              <Plus size={12}/> Add Type
            </button>
          )}
        </div>

        {/* Glassmorphic Subtype Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(() => {
            const catName = allCategories[docActiveCategory] || '';
            const builtinCat = effectiveDocCategories.find(c => c.category === catName);
            const builtinTypes = builtinCat ? [...builtinCat.types] : [];
            const customSubs = docCategorySubtypes[catName] || [];
            
            return [...builtinTypes, ...customSubs].map(dt => {
              const isUploaded = uploadedDocSubtypes.some(s => s.key === dt.key);
              const pendingFiles = docFiles ? docFiles.filter(f => f.docType === dt.key) : [];
              
              return (
                <div key={dt.key} className="space-y-1.5 flex flex-col">
                  <button onClick={() => {
                      setDocSelectedType(dt.key);
                      setDocSourceModal(true);
                      setDocTab('device');
                      setDocUploading(false);
                      setDocUploadProgress([]);
                      setDocJobStatus('');
                  }} 
                  className={`w-full p-4 rounded-2xl text-left transition-all duration-300 group cursor-pointer relative overflow-hidden backdrop-blur-sm border shadow-sm hover:shadow-md hover:-translate-y-0.5
                    ${isUploaded 
                      ? 'bg-gradient-to-br from-success/5 to-success/10 border-success/30 hover:border-success/60' 
                      : 'bg-gradient-to-br from-surface to-surface-2/50 border-border hover:border-brand/50'}`}>
                    
                    {/* Decorative glow background */}
                    <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40 
                      ${isUploaded ? 'bg-success' : 'bg-brand'}`} />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg flex items-center justify-center transition-colors
                          ${isUploaded ? 'bg-success/20 text-success' : 'bg-brand/10 text-brand group-hover:bg-brand/20'}`}>
                          <Layers size={14} />
                        </div>
                        <span className={`text-sm font-bold transition-colors 
                          ${isUploaded ? 'text-success group-hover:text-success-hover' : 'text-text-primary group-hover:text-brand'}`}>
                          {dt.label}
                        </span>
                      </div>

                      {isUploaded ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success text-[10px] font-bold shadow-sm border border-success/20">
                              <CheckCircle2 size={12} className="animate-in zoom-in duration-300" />
                              Uploaded
                          </div>
                      ) : (
                          <div className="flex items-center gap-2">
                              {pendingFiles.length > 0 && (
                                <span className="text-brand text-[10px] font-bold px-2 py-0.5 bg-brand/10 border border-brand/20 rounded-full animate-in fade-in slide-in-from-right-2">
                                  {pendingFiles.length} pending
                                </span>
                              )}
                              <div className="p-1 rounded-full bg-surface-2 group-hover:bg-brand group-hover:text-white transition-colors text-text-secondary">
                                <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5"/>
                              </div>
                          </div>
                      )}
                    </div>
                  </button>

                  {/* Sleek Pending Files Queue */}
                  {pendingFiles.length > 0 && (
                      <div className="space-y-1.5 pl-3 border-l-2 border-brand/30 ml-3 mt-1 relative before:absolute before:left-[-2px] before:top-0 before:w-0.5 before:h-0 before:bg-brand before:transition-all before:duration-500 hover:before:h-full">
                          {pendingFiles.map((f, idx) => (
                              <div key={`${f.name}-${idx}`} className="flex items-center justify-between p-2.5 bg-surface border border-border/60 hover:border-brand/40 rounded-xl group transition-all hover:shadow-sm">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-6 h-6 rounded-md bg-brand/5 flex items-center justify-center shrink-0 border border-brand/10">
                                        <FileText size={12} className="text-brand" />
                                      </div>
                                      <span className="text-xs text-text-primary truncate font-medium group-hover:text-brand transition-colors">{f.name}</span>
                                  </div>
                                  <button onClick={(e) => {
                                      e.stopPropagation();
                                      setDocFiles(prev => prev.filter(df => df !== f));
                                  }} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-white hover:bg-danger p-1.5 rounded-lg transition-all cursor-pointer shadow-sm" aria-label="Remove pending file">
                                      <Trash2 size={12} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
                </div>
              );
            });
          })()}
          
          {docAddingSubtype ? (
            <div className="p-4 bg-surface-2/50 backdrop-blur-sm border-2 border-dashed border-brand/50 rounded-2xl flex items-center gap-2 animate-in fade-in zoom-in-95">
              <input type="text" autoFocus placeholder="Subtype name..." value={docNewSubtypeName} 
                onChange={e => setDocNewSubtypeName(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === 'Enter' && docNewSubtypeName.trim()) {
                      const catName = allCategories[docActiveCategory] || '';
                      const normalizedKey = docNewSubtypeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
                      const existing = [...(effectiveDocCategories.find(c => c.category === catName)?.types || []), ...(docCategorySubtypes[catName] || [])];
                      if (!existing.some(t => t.key === normalizedKey || t.label.toLowerCase().trim() === docNewSubtypeName.trim().toLowerCase())) {
                          setDocCategorySubtypes(prev => ({ ...prev, [catName]: [...(prev[catName] || []), { key: normalizedKey, label: docNewSubtypeName.trim(), fields: [] }] }));
                      }
                      setDocNewSubtypeName('');
                      setDocAddingSubtype(false);
                  } else if (e.key === 'Escape') {
                      setDocNewSubtypeName('');
                      setDocAddingSubtype(false);
                  }
                }} 
                className="flex-1 bg-surface border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all placeholder-text-muted/50"
              />
              <button onClick={() => {
                  if (docNewSubtypeName.trim()) {
                      const catName = allCategories[docActiveCategory] || '';
                      const normalizedKey = docNewSubtypeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
                      const existing = [...(effectiveDocCategories.find(c => c.category === catName)?.types || []), ...(docCategorySubtypes[catName] || [])];
                      if (!existing.some(t => t.key === normalizedKey || t.label.toLowerCase().trim() === docNewSubtypeName.trim().toLowerCase())) {
                          setDocCategorySubtypes(prev => ({ ...prev, [catName]: [...(prev[catName] || []), { key: normalizedKey, label: docNewSubtypeName.trim(), fields: [] }] }));
                      }
                  }
                  setDocNewSubtypeName('');
                  setDocAddingSubtype(false);
              }} className="cursor-pointer px-3 py-1.5 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-hover transition-colors shadow-md shadow-brand/20 shrink-0">Add</button>
              <button onClick={() => { setDocNewSubtypeName(''); setDocAddingSubtype(false); }} className="cursor-pointer text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors shrink-0"><X size={14}/></button>
            </div>
          ) : (
            <button onClick={() => setDocAddingSubtype(true)} 
              className="cursor-pointer p-4 bg-surface-2/30 backdrop-blur-sm border-2 border-dashed border-border rounded-2xl text-left hover:border-brand hover:bg-brand/5 transition-all duration-300 group flex flex-col items-center justify-center gap-2 min-h-[80px]">
              <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-brand/30 group-hover:bg-brand/10 shadow-sm">
                <Plus size={14} className="text-text-muted group-hover:text-brand transition-colors"/>
              </div>
              <span className="text-xs font-bold text-text-muted group-hover:text-brand transition-colors">Add New Subtype</span>
            </button>
          )}
        </div>
      </div>
    );
}
