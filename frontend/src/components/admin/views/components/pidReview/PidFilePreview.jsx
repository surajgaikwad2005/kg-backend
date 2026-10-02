'use client';
import React from 'react';
import { ExternalLink } from 'lucide-react';

export function PidFilePreview({ pid, previewBlobUrl }) {
    const isPdf = pid?.name?.toLowerCase().endsWith('.pdf');
    const targetUrl = previewBlobUrl || pid?.image;

    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-canvas">
                <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-4 h-4 text-danger shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-semibold text-text-secondary truncate">{pid?.name}</span>
                </div>
                {targetUrl && (
                    <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center shrink-0 ml-3 bg-surface-2 hover:bg-brand-muted text-text-secondary hover:text-brand p-1.5 rounded-lg transition-all duration-300 overflow-hidden cursor-pointer" title="Open in new tab">
                        <ExternalLink size={16} className="shrink-0" />
                        <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[120px] group-hover:ml-1.5 opacity-0 group-hover:opacity-100 text-xs font-bold">
                            Open in new tab
                        </span>
                    </a>
                )}
            </div>
            {targetUrl ? (
                isPdf ? (
                    <iframe
                        src={`${targetUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                        title={pid?.name}
                        className="w-full border-0"
                        style={{ height: '520px' }}
                    />
                ) : (
                    <img src={targetUrl} alt="P&ID Preview" className="w-full object-cover opacity-80" style={{ height: '520px' }} referrerPolicy="no-referrer" />
                )
            ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted bg-surface-2/30" style={{ minHeight: '220px' }}>
                    <p className="text-xs font-semibold text-text-secondary">Document preview not rendered for this file.</p>
                    <p className="text-[11px] text-text-subtle mt-1">Review the extracted connectivity and equipment tables below.</p>
                </div>
            )}
        </div>
    );
}
