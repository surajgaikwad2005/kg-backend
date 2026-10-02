'use client';

/**
 * WorkspaceSetup — file ingestion console for the current globally-selected
 * plant. Four file buckets, then ingest. Heavy lifting (selection + upload
 * progress) lives in useWorkspaceUpload; the four buckets reuse
 * FileUploadQuadrant.
 */
import React from 'react';
import { FileText, Upload, ArrowRight, Layers, Database } from 'lucide-react';
import FileUploadQuadrant from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/domain/setup/FileUploadQuadrant';
import IngestionLoader from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/domain/setup/IngestionLoader';
import { useWorkspaceUpload } from '@/src/app/(admin)/admin/domain-configuration/pnid/_hooks/useWorkspaceUpload';

const QUADRANTS = [
    { bucket: 'pnid', icon: FileText, title: 'P&ID Files', hint: 'PDF Format · multiple allowed', accept: '.pdf', accent: 'bg-brand-muted dark:bg-brand/10 text-brand dark:text-brand border-brand/20 dark:border-brand/30', emptyLabel: 'No P&ID PDFs Selected', multiple: true },
    { bucket: 'pfd', icon: Layers, title: 'PFD Files', hint: 'PDF Format only', accept: '.pdf', accent: 'bg-highlight/10 text-highlight border-highlight/30', emptyLabel: 'No PFD PDFs Selected', multiple: false },
    { bucket: 'linelist', icon: Database, title: 'Line List Files', hint: 'CSV or Excel Format', accept: '.csv,.xlsx,.xls', accent: 'bg-success/10 dark:bg-success/10 text-success dark:text-success border-success/20 dark:border-success/30', emptyLabel: 'No spreadsheet files selected', multiple: false },
    { bucket: 'other', icon: Upload, title: 'Other Files', hint: 'Any configuration format', accept: undefined, accent: 'bg-surface-2 text-text-muted border-border', emptyLabel: 'No other files selected', multiple: true },
];

export default function WorkspaceSetup({
    plantCode, hasExistingFiles = false,
    onUploadSuccess,
    initialFiles
}) {
    const { files, isUploading, progress, step, addFiles, removeFile, upload } = useWorkspaceUpload({ plantCode, onUploadSuccess, initialFiles });

    // Gate the action: at least one file (any bucket) must be selected.
    const hasFiles = Object.values(files).some((arr) => arr.length > 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!hasFiles) return;
        upload();
    };

    if (isUploading) {
        return (
            <div className="flex-1 overflow-y-auto p-12 flex items-center justify-center bg-canvas">
                <IngestionLoader plantCode={plantCode} progress={progress} step={step} />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 flex flex-col bg-canvas">
            <div className="flex-1 flex flex-col w-full space-y-5 animate-in slide-in-from-bottom-8 duration-700">
                
                {/* Header Section */}
                <div className="space-y-2">
                    {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-muted border border-brand/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                        <span className="text-label font-black uppercase tracking-wider text-brand">Client Ingestion Console</span>
                    </div> */}
                    <h2 className="text-3xl font-black text-text-primary uppercase tracking-tight">
                        Initialize Workspace
                    </h2>
                    <p className="text-sm text-text-subtle font-bold">
                        Set up your working context by uploading the corresponding industrial assets, logs, or line sheets for <strong className="text-text-primary font-black">{plantCode}</strong>.
                    </p>
                </div>

                {/* Upload buckets */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 min-h-[400px]">
                    {QUADRANTS.map((q) => (
                        <FileUploadQuadrant
                            key={q.bucket}
                            icon={q.icon}
                            title={q.title}
                            hint={q.hint}
                            accept={q.accept}
                            accent={q.accent}
                            emptyLabel={q.emptyLabel}
                            multiple={q.multiple}
                            files={files[q.bucket]}
                            onAdd={(list) => addFiles(q.bucket, list)}
                            onRemove={(i) => removeFile(q.bucket, i)}
                        />
                    ))}
                </div>

                {/* Submit Action */}
                <div className="flex flex-col items-end gap-2 pt-2">
                    {!hasFiles && (
                        <p className="text-xs text-text-subtle font-bold">
                            Add at least one file to continue.
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!hasFiles}
                        title={!hasFiles ? 'Add at least one file to continue' : undefined}
                        className={`w-full md:w-auto px-10 py-4 group overflow-hidden text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-brand transition-all duration-300 flex items-center justify-center gap-3 ${
                            hasFiles
                                ? 'bg-brand hover:bg-brand-hover active:scale-[0.98] cursor-pointer'
                                : 'bg-brand/40 opacity-60 cursor-not-allowed'
                        }`}
                    >
                        {hasExistingFiles ? 'Add Files to Workspace' : 'Initialize Session'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </div>
    );
}
