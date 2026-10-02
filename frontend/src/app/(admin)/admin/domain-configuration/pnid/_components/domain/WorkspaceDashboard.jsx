'use client';

/**
 * WorkspaceDashboard — active plant's P&ID data overview: an action row
 * (clear data / refresh / upload more) above a grid of file categories.
 * Clicking a file opens the preview; the FAB jumps to Manage Files.
 *
 * The plant name is deliberately NOT repeated here — the shared PageHeader's
 * PlantSwitcher already shows the active plant, and this page used to carry a
 * second sticky header duplicating it.
 */
import React from 'react';
import { usePnidRouter } from '@/src/app/(admin)/admin/domain-configuration/pnid/_context/PnidRouterContext';
import { FileText, Upload, RefreshCw, Folder, Layers, Database, Trash2, ListChecks, X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import LoadingState from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/ui/LoadingState';
import { getCategoryFiles, formatBytes } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/domainConfigUtils';
import { PNID_ROUTES } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/routes';

const CATEGORIES = [
    { key: 'pnid', label: 'P&ID Diagrams', description: 'Piping & Instrumentation Diagrams', icon: FileText, accent: 'text-brand dark:text-brand bg-brand-muted dark:bg-brand/10 border-brand/20 dark:border-brand/30', badge: 'bg-brand-muted dark:bg-brand/20 text-brand dark:text-brand' },
    { key: 'pfd', label: 'PFD Diagrams', description: 'Process Flow Diagrams', icon: Layers, accent: 'text-highlight bg-highlight/10 border-highlight/30', badge: 'bg-highlight/20 text-highlight' },
    { key: 'line_list', label: 'Line Lists', description: 'Line sheets and telemetry lists', icon: Database, accent: 'text-success dark:text-success bg-success/10 dark:bg-success/10 border-success/20 dark:border-success/30', badge: 'bg-success/10 dark:bg-success/20 text-success dark:text-success' },
    { key: 'others', label: 'Other Files', description: 'Auxiliary documents & config sheets', icon: Upload, accent: 'text-text-muted bg-surface-2 border-border', badge: 'bg-surface-2 text-text-secondary' },
];

const isPdf = (name) => /\.pdf$/i.test(name);

function FileRow({ file, onFileClick, onDeleteFile, pageCount }) {
    return (
        <div
            onClick={() => onFileClick(file)}
            className="flex items-center gap-3.5 bg-surface-2 hover:bg-surface-2/70 border border-border p-4 rounded-2xl transition-all cursor-pointer group min-w-0"
        >
            <FileText className="w-4 h-4 text-text-subtle group-hover:text-brand transition-colors shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-secondary group-hover:text-text-primary truncate" title={file.name}>
                    {file.name}
                </p>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-label text-text-subtle font-bold uppercase tracking-wider">{formatBytes(file.size)}</span>
                    {isPdf(file.name) && pageCount != null && (
                        <span className="inline-flex items-center gap-1 text-label font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-muted dark:bg-brand/10 text-brand dark:text-brand border border-brand/20 dark:border-brand/20">
                            {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                        </span>
                    )}
                    {isPdf(file.name) && pageCount == null && (
                        <span className="inline-block h-3.5 w-14 rounded-full bg-border animate-pulse" />
                    )}
                </div>
            </div>
            {onDeleteFile && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDeleteFile(file); }}
                    aria-label={`Delete ${file.name}`}
                    className="shrink-0 p-2 rounded-xl text-text-subtle hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

function CategoryCard({ category, files, onFileClick, onDeleteFile, pageCountCache }) {
    const { label, description, icon: Icon, accent, badge } = category;
    return (
        <div className="bg-surface rounded-4xl border border-border shadow-card p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border pb-5">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${accent}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-text-primary uppercase tracking-tight">{label}</h3>
                        <p className="text-caption text-text-subtle font-bold">{description}</p>
                    </div>
                </div>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${badge}`}>
                    {files.length} {files.length === 1 ? 'File' : 'Files'}
                </span>
            </div>

            {files.length > 0 ? (
                <div className="space-y-3 max-h-75 overflow-y-auto pr-2">
                    {files.map((file) => (
                        <FileRow
                            key={file.path}
                            file={file}
                            onFileClick={onFileClick}
                            onDeleteFile={onDeleteFile}
                            pageCount={isPdf(file.name) ? pageCountCache[file.path] : undefined}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl py-12 text-center text-text-subtle">
                    <Icon size={24} className="mb-2 opacity-50" />
                    <p className="text-label font-black uppercase tracking-wider">No Files Loaded</p>
                </div>
            )}
        </div>
    );
}

/**
 * WorkspaceActions — the page's action row. Built on the shared Button so it
 * inherits Settings → Geometry (--do-radius) and motion, instead of the
 * hardcoded rounded-xl the old sticky header used.
 */
function WorkspaceActions({ isLoadingFiles, onRefresh, onUploadMore, onDeleteData, onClose }) {
    return (
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 flex-wrap">
            <Button variant="dangerOutline" size="sm" onClick={onDeleteData}>
                <Trash2 size={14} /> Clear Plant Data
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoadingFiles}
                aria-busy={isLoadingFiles}
            >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={onUploadMore}>
                <Upload size={14} /> Upload More Files
            </Button>

            {onClose && (
                <>
                    <div className="hidden md:block h-8 w-px bg-border mx-1" />
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2.5 text-text-subtle hover:text-text-primary bg-surface-2 hover:bg-surface rounded-(--do-radius) transition-all cursor-pointer border border-border"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </>
            )}
        </div>
    );
}

export default function WorkspaceDashboard({
    clientFiles, isLoadingFiles, pageCountCache = {},
    onRefresh, onUploadMore, onFileClick, onDeleteData, onDeleteFile,
}) {
    const { router } = usePnidRouter();

    return (
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-canvas p-6 lg:p-10 space-y-8">
            <WorkspaceActions
                isLoadingFiles={isLoadingFiles}
                onRefresh={onRefresh}
                onUploadMore={onUploadMore}
                onDeleteData={onDeleteData}
                onClose={router?.onClose}
            />

            {isLoadingFiles ? (
                <LoadingState label="Loading Workspace Assets…" />
            ) : clientFiles ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {CATEGORIES.map((category) => (
                        <CategoryCard
                            key={category.key}
                            category={category}
                            files={getCategoryFiles(clientFiles, category.key)}
                            onFileClick={onFileClick}
                            onDeleteFile={onDeleteFile}
                            pageCountCache={pageCountCache}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-surface rounded-4xl border border-border p-12 text-center text-text-subtle shadow-card">
                    <Folder size={40} className="mx-auto text-text-subtle/50 mb-3" />
                    <p className="text-sm font-bold">Failed to load client workspace details.</p>
                </div>
            )}

            {clientFiles && (
                <div className="fixed bottom-10 right-10 z-40">
                    <button
                        onClick={() => router.push(PNID_ROUTES.manageFilesUrl())}
                        className="px-8 py-4 bg-brand hover:bg-brand-hover text-white font-black text-sm uppercase tracking-widest rounded-full shadow-brand transition-all flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95"
                    >
                        <ListChecks size={18} /> Select Files
                    </button>
                </div>
            )}
        </div>
    );
}
