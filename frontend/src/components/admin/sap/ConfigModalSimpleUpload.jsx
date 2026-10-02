'use client';
import React, { useRef } from 'react';
import { Upload, FileSpreadsheet, Trash2 } from 'lucide-react';
import { useSapForm, useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { FileLabelSelect } from '@/src/components/admin/FileLabelSelect';
import { useConnectorLabels } from '@/src/components/admin/_queries/useConnectorLabels';

const FEED_DESCRIPTIONS = {
    AIF:  'Notification AIF — SAP integrity notification feed.',
    GLOC: 'Work Order GLOC — SAP work order integrity feed.',
    LOPC: 'Loss of Containment — SAP integrity incident feed.',
};

export function ConfigModalSimpleUpload({ type }) {
    const inputRef = useRef(null);
    const { feedFiles, setFeedFiles, feedFileLabels, setFeedFileLabels } = useSapForm();
    const { selectedPlantId } = useAdminEntities();
    const labels = useConnectorLabels(selectedPlantId?.id);
    const files = feedFiles?.[type] || [];

    const addFiles = (newFiles) => {
        if (!newFiles.length) return;
        setFeedFiles(prev => ({ ...prev, [type]: [...(prev[type] || []), ...newFiles] }));
    };
    const removeFile = (idx) => {
        const removedFile = files[idx];
        setFeedFiles(prev => ({ ...prev, [type]: (prev[type] || []).filter((_, i) => i !== idx) }));
        if (removedFile) {
            setFeedFileLabels(prev => { const n = { ...prev }; delete n[removedFile.name]; return n; });
        }
    };

    return (
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border pb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="text-xs text-text-muted leading-relaxed">{FEED_DESCRIPTIONS[type] || `Upload ${type} files.`}</p>

            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); addFiles(Array.from(e.dataTransfer.files)); }}
                className="relative overflow-hidden border-2 border-dashed border-brand/30 rounded-[20px] p-8 flex flex-col items-center justify-center gap-3 hover:border-brand bg-gradient-to-br from-surface to-brand/5 hover:from-brand/5 hover:to-brand/10 transition-all duration-300 cursor-pointer group"
            >
                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 group-hover:bg-brand/20 transition-all duration-500 shadow-inner relative">
                    <Upload size={28} className="relative z-10" />
                    <div className="absolute inset-0 rounded-full border border-brand/30 animate-ping opacity-20 [animation-duration:3s]" />
                </div>
                <div className="text-center relative z-10">
                    <p className="text-sm font-bold text-text-primary mb-1">Click to upload or drag and drop {type} files</p>
                    <p className="text-xs text-text-muted">CSV, XLSX, JSON, XML, Parquet</p>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".csv,.xlsx,.xls,.json,.xml,.parquet"
                    className="hidden"
                    onChange={e => {
                        const newFiles = Array.from(e.target.files || []);
                        e.target.value = '';
                        addFiles(newFiles);
                    }}
                />
            </div>

            {files.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
                    {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl group transition-all border bg-surface border-border/60 hover:border-brand/40 gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-brand/10 border-brand/20 text-brand">
                                    <FileSpreadsheet size={14} className="shrink-0" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-text-primary truncate">{f.name}</p>
                                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{(f.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-44 sm:w-52">
                                    <FileLabelSelect
                                        value={feedFileLabels[f.name]}
                                        onChange={(val) => setFeedFileLabels(prev => ({ ...prev, [f.name]: val }))}
                                        options={labels.options}
                                        isLoading={labels.isLoading}
                                        isError={labels.isError}
                                        onRetry={labels.refetch}
                                        fileName={f.name}
                                    />
                                </div>
                                <button
                                    type="button"
                                    aria-label={`Remove ${f.name}`}
                                    onClick={() => removeFile(i)}
                                    className="opacity-0 group-hover:opacity-100 bg-surface border border-border text-text-muted hover:text-white hover:bg-danger hover:border-danger p-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
