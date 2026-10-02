'use client';

/**
 * FileUploadQuadrant — reusable upload bucket: icon header, browse button, and a
 * selected-files list with per-file removal. Driven entirely by props so all
 * four buckets (P&ID, PFD, Line List, Other) share one implementation.
 */
import React from 'react';
import { X, FileText } from 'lucide-react';
import { formatBytes } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/domainConfigUtils';

export default function FileUploadQuadrant({
    icon: Icon, title, hint, accept, multiple = true, accent,
    files, onAdd, onRemove, emptyLabel,
}) {
    return (
        <div className="bg-surface rounded-3xl border border-border p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-300 group/card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current to-transparent opacity-[0.02] -m-8 rounded-full pointer-events-none" />
            <div className="flex flex-col gap-5 mb-6 relative z-10">
                <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center border shadow-sm ${accent} transition-transform duration-300 group-hover/card:scale-105`}>
                        <Icon size={24} />
                    </div>
                    <label className="bg-surface hover:bg-surface-2 border border-border shadow-sm cursor-pointer rounded-xl text-xs font-black uppercase tracking-wider px-4 py-2.5 transition-all text-text-secondary group-hover/card:border-brand/30 group-hover/card:text-brand hover:shadow flex items-center gap-2">
                        Browse
                        <input
                            type="file"
                            multiple={multiple}
                            accept={accept}
                            onChange={(e) => onAdd(e.target.files)}
                            className="hidden"
                        />
                    </label>
                </div>
                <div>
                    <h4 className="text-lg font-black text-text-primary uppercase tracking-tight">{title}</h4>
                    <p className="text-xs text-text-subtle font-bold mt-1 tracking-wide">{hint}</p>
                </div>
            </div>

            <div className="flex-1 min-h-[160px] flex flex-col bg-canvas/50 rounded-2xl border border-border/50 p-2 relative z-10 overflow-hidden">
                {files.length > 0 ? (
                    <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 thin-scrollbar">
                        {files.map((f, i) => (
                            <div key={f.name ?? i} className="flex items-center gap-3 bg-surface border border-border p-3 rounded-xl shadow-sm animate-in fade-in zoom-in-95 duration-200 group/file">
                                <FileText className="w-4 h-4 text-text-subtle shrink-0 group-hover/file:text-brand transition-colors" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-text-secondary group-hover/file:text-text-primary truncate" title={f.name}>{f.name}</p>
                                    <p className="text-[10px] text-text-subtle font-bold uppercase tracking-wider mt-0.5">{f.size !== undefined ? formatBytes(f.size) : 'Unknown Size'}</p>
                                </div>
                                <button type="button" onClick={() => onRemove(i)} aria-label={`Remove ${f.name || 'file'}`} className="p-1.5 rounded-lg text-text-subtle hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer shrink-0">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-subtle/50">
                        <Icon size={32} className="mb-3 opacity-20 transition-opacity duration-300 group-hover/card:opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{emptyLabel}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
