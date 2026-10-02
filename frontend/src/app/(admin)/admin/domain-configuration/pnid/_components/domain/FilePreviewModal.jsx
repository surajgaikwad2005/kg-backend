'use client';

/**
 * FilePreviewModal — full-screen previewer for PDF (paged), spreadsheet (table),
 * image, and unsupported (download) file types. Pure presentation; all state is
 * supplied by useFilePreview. The PDF/image viewer chrome stays dark in both
 * themes by design (consistent drawing contrast).
 */
import React, { useState } from 'react';
import { FileText, X, Database, Folder, Download, Trash2 } from 'lucide-react';
import PdfPageThumbnail from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/domain/PdfPageThumbnail';
import PdfCanvasViewer from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/domain/PdfCanvasViewer';
import LoadingState from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/ui/LoadingState';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';

const matches = (name, re) => re.test(name);

export default function FilePreviewModal({
    plantCode, previewFile, onClose,
    previewData, isPreviewLoading,
    pdfDoc, pdfPageCount, pdfVersion,
    selectedPageIndex, setSelectedPageIndex,
    isDeletingPage, onDeletePage,
    blobUrl,
    selectedPages = [],
    onTogglePageSelection,
    onDeleteSelectedPages,
}) {
    const isExcel = matches(previewFile.name, /\.(csv|xlsx|xls)$/i);
    const isPdf = matches(previewFile.name, /\.pdf$/i);
    const isImage = matches(previewFile.name, /\.(png|jpe?g|gif|svg)$/i);
    const colCount = previewData?.length ? Math.max(...previewData.map((r) => r.length)) : 0;

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // 'selected' | number (pageIndex)

    const handleDeleteClick = (target) => {
        console.log('[FilePreviewModal] handleDeleteClick triggered. target:', target, 'selectedPages:', selectedPages, 'selectedPageIndex:', selectedPageIndex);
        setDeleteTarget(target);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        console.log('[FilePreviewModal] handleConfirmDelete triggered. deleteTarget:', deleteTarget, 'selectedPages:', selectedPages);
        if (deleteTarget === 'selected') {
            await onDeleteSelectedPages?.(selectedPages);
        } else if (typeof deleteTarget === 'number') {
            await onDeletePage?.(deleteTarget);
        }
        setIsDeleteModalOpen(false);
    };

    return (
        <div role="dialog" aria-modal="true" aria-label={previewFile.name} className="fixed inset-0 bg-surface z-[100] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="h-16 border-b border-border px-6 flex items-center justify-between shrink-0 bg-surface-2">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-(--do-radius) bg-brand-muted flex items-center justify-center text-brand border border-brand/20 shrink-0">
                        <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-black text-text-primary truncate uppercase tracking-tight" title={previewFile.name}>
                            {previewFile.name}
                        </h3>
                        <p className="text-2xs text-text-subtle font-bold uppercase tracking-wider truncate max-w-lg">
                            {previewFile.path}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="p-2 text-text-subtle hover:text-text-primary border border-transparent hover:border-border hover:bg-surface rounded-(--do-radius) transition-all cursor-pointer"
                        aria-label="Close preview"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 bg-canvas">
                {isPreviewLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <LoadingState label="Parsing File Data…" />
                    </div>
                ) : isPdf ? (
                    <div className="w-full h-full flex overflow-hidden bg-canvas">
                        {/* Page rail */}
                        <div className="w-72 bg-surface-2 border-r border-border flex flex-col shrink-0 min-h-0">
                            <div className="p-4 border-b border-border bg-surface flex flex-col gap-3 shrink-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">Document Pages</h4>
                                        <p className="text-2xs text-text-subtle font-bold">
                                            {pdfPageCount} {pdfPageCount === 1 ? 'Page' : 'Pages'} total
                                        </p>
                                    </div>
                                    {pdfPageCount > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const target = selectedPages.length > 0 ? 'selected' : selectedPageIndex;
                                                console.log('[FilePreviewModal] Delete button clicked in header rail. target:', target, 'selectedPages:', selectedPages);
                                                handleDeleteClick(target);
                                            }}
                                            disabled={isDeletingPage || pdfPageCount <= 1}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-(--do-radius) bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/30 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                            aria-label="Delete page"
                                            title={pdfPageCount <= 1 ? "At least 1 page must remain in document" : undefined}
                                        >
                                            <Trash2 size={13} />
                                            <span>
                                                {selectedPages.length > 0
                                                    ? `Delete (${selectedPages.length})`
                                                    : `Delete Page ${selectedPageIndex + 1}`}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-canvas">
                                {Array.from({ length: pdfPageCount }).map((_, idx) => {
                                    const isSelected = selectedPageIndex === idx;
                                    const isChecked = selectedPages?.includes(idx);
                                    const isCheckDisabled = !isChecked && selectedPages?.length >= pdfPageCount - 1;
                                    return (
                                        <div key={`page-${idx + 1}`} onClick={() => setSelectedPageIndex(idx)} className="group cursor-pointer flex flex-col gap-2">
                                            <div className={`relative aspect-[16/11] bg-surface border rounded-(--do-radius) overflow-hidden flex items-center justify-center shadow-md transition-all duration-200 ${
                                                isChecked
                                                    ? 'border-brand ring-2 ring-brand/60 scale-[1.02]'
                                                    : isSelected
                                                    ? 'border-brand/60 ring-1 ring-brand/30 scale-[1.01]'
                                                    : 'border-border hover:border-brand/40 hover:scale-[1.01]'
                                            }`}>
                                                {pdfPageCount > 1 && (
                                                    <div className="absolute top-2 left-2 z-10 flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            disabled={isCheckDisabled}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                console.log('[FilePreviewModal] Checkbox clicked for page idx:', idx, 'current selectedPages:', selectedPages);
                                                                onTogglePageSelection?.(idx);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-4 h-4 rounded-(--do-radius-sm) border-border bg-surface text-brand focus:ring-brand/40 cursor-pointer accent-brand disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                                                            title={isCheckDisabled ? "At least 1 page must remain in the document" : isChecked ? "Deselect page" : "Select page"}
                                                            aria-label={`Select page ${idx + 1}`}
                                                        />
                                                    </div>
                                                )}
                                                {pdfDoc ? (
                                                    <PdfPageThumbnail pdfDoc={pdfDoc} pageNumber={idx + 1} isSelected={isSelected} />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-surface-2">
                                                        <div className="w-5 h-5 rounded-full border-2 border-brand/20 border-t-brand animate-spin" />
                                                    </div>
                                                )}
                                                {pdfPageCount > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(idx);
                                                        }}
                                                        disabled={isDeletingPage || pdfPageCount <= 1}
                                                        className="absolute top-2 right-2 p-1.5 rounded-(--do-radius-sm) bg-surface/90 hover:bg-danger text-text-secondary hover:text-white backdrop-blur-md border border-border hover:border-danger opacity-0 group-hover:opacity-100 transition-all shadow-md disabled:opacity-0 disabled:pointer-events-none cursor-pointer z-10"
                                                        title="Delete this page"
                                                        aria-label={`Delete page ${idx + 1}`}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                                {isSelected && !isChecked && (
                                                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-(--do-radius-sm) bg-brand text-white text-[8px] font-black uppercase tracking-wider shadow-xs pointer-events-none">
                                                        Active
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`text-center text-caption font-black tracking-wider uppercase transition-colors ${
                                                isChecked ? 'text-brand' : isSelected ? 'text-text-primary' : 'text-text-subtle group-hover:text-text-secondary'
                                            }`}>
                                                Page {idx + 1} {isChecked ? '(Selected)' : ''}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Viewer */}
                        <div className="flex-1 min-w-0 min-h-0 relative flex flex-col bg-canvas">
                            <PdfCanvasViewer
                                key={`${previewFile.path}-${pdfVersion}-${selectedPageIndex}`}
                                pdfDoc={pdfDoc}
                                pageNumber={selectedPageIndex + 1}
                                pdfPageCount={pdfPageCount}
                                onPageChange={(newIndex) => setSelectedPageIndex(newIndex)}
                                previewFile={previewFile}
                                plantCode={plantCode}
                                blobUrl={blobUrl}
                            />
                            {isDeletingPage && (
                                <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-20">
                                    <LoadingState label="Deleting Page…" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : isExcel ? (
                    previewData && previewData.length > 0 ? (
                        <div className="w-full h-full overflow-auto bg-surface">
                            <table className="w-full border-collapse text-left text-xs table-auto">
                                <thead className="bg-surface-2/80 sticky top-0 border-b border-border z-10">
                                    <tr>
                                        {Array.from({ length: colCount }).map((_, c) => (
                                            <th key={c} className="px-4 py-3.5 font-black text-text-secondary border-r border-border last:border-r-0 uppercase tracking-wider text-label">
                                                {previewData[0]?.[c] !== undefined ? String(previewData[0][c]) : `Col ${c + 1}`}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {previewData.slice(1).map((row, r) => (
                                        <tr key={r} className="hover:bg-surface-2/60 transition-colors">
                                            {Array.from({ length: colCount }).map((_, c) => (
                                                <td key={c} className="px-4 py-3.5 text-text-muted border-r border-border/60 last:border-r-0 font-medium whitespace-nowrap max-w-[250px] truncate" title={row[c] !== undefined ? String(row[c]) : ''}>
                                                    {row[c] !== undefined ? String(row[c]) : ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-surface p-10 text-center">
                            <Database size={40} className="text-text-subtle mb-3 animate-bounce" />
                            <p className="text-sm font-bold text-text-muted">Empty worksheet context</p>
                        </div>
                    )
                ) : isImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-surface p-6 overflow-auto">
                        <img
                            src={blobUrl || pnidService.fileUrl(plantCode, previewFile.path)}
                            alt={previewFile.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-border"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface p-10 text-center">
                        <Folder size={48} className="text-text-subtle mb-4 animate-pulse" />
                        <h3 className="text-base font-black text-text-secondary uppercase tracking-wider mb-2">No Preview Available</h3>
                        <p className="text-xs text-text-subtle font-bold max-w-sm mb-6">
                            This file format does not support inline rendering. Download the file to view it locally.
                        </p>
                        <a
                            href={blobUrl || pnidService.fileUrl(plantCode, previewFile.path)}
                            download={previewFile.name}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-text-primary hover:bg-brand text-surface hover:text-white font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-xl transition-all shadow-md cursor-pointer"
                        >
                            <Download size={14} /> Download File
                        </a>
                    </div>
                )}
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmDialog
                open={isDeleteModalOpen}
                title={deleteTarget === 'selected' ? `Delete ${selectedPages.length} ${selectedPages.length === 1 ? 'Page' : 'Pages'}` : `Delete Page ${typeof deleteTarget === 'number' ? deleteTarget + 1 : ''}`}
                intent="danger"
                confirmLabel="Delete"
                isPending={isDeletingPage}
                onClose={() => { if (!isDeletingPage) setIsDeleteModalOpen(false); }}
                onConfirm={handleConfirmDelete}
                description={
                    deleteTarget === 'selected'
                        ? `Are you sure you want to delete ${selectedPages.length} selected page(s) from "${previewFile.name}"? At least 1 page will remain in the document. This action cannot be undone.`
                        : `Are you sure you want to delete Page ${typeof deleteTarget === 'number' ? deleteTarget + 1 : ''} from "${previewFile.name}"? This action cannot be undone.`
                }
            />
        </div>
    );
}

