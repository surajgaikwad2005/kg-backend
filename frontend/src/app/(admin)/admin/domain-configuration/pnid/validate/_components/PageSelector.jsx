'use client';

/**
 * PageSelector — active page/sheet picker plus the usable-region filter status
 * and its draw/clear controls.
 */
import React from 'react';
import { useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';
import { Crop, Trash2 } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';

export default function PageSelector() {
    const {
        preprocessedFiles, selectedPageFile, pdfName, setPdfName, pnidUploads,
        filterBox, isFilterMode, setIsFilterMode, handlePageChange, handleClearFilter,
        setActiveConnection, setHighlightData, setValidationResult,
    } = useValidateContext();

    // Switching the source PDF changes which connection list applies — clear the
    // stale active-connection/highlight state, same as handlePageChange does for
    // a page switch within one document.
    const handlePdfSourceChange = (name) => {
        setPdfName(name);
        setActiveConnection(null);
        setHighlightData(null);
        setValidationResult(null);
    };

    return (
        <div className="bg-surface rounded-3xl border border-border shadow-card p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4 flex-1">
                {/* Only shown when a plant has more than one uploaded P&ID PDF —
                    pdf_name scopes highlightOptions/validateConnection to a single
                    source document, so multi-PDF plants need to pick which one. */}
                {pnidUploads.length > 1 && (
                    <>
                        <div className="min-w-0 sm:min-w-45 lg:min-w-55">
                            <Select
                                label="P&ID Source Document"
                                value={pdfName || ''}
                                onChange={handlePdfSourceChange}
                                options={pnidUploads.map((file) => ({ value: file.name, label: file.name }))}
                            />
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-border" />
                    </>
                )}

                <div className="min-w-0 sm:min-w-45 lg:min-w-55">
                    <Select
                        label="Active P&ID Page / Sheet"
                        placeholder="Select page/sheet..."
                        value={selectedPageFile?.name || ''}
                        onChange={handlePageChange}
                        options={preprocessedFiles.filter((f) => f.is_image).map((file) => ({ value: file.name, label: file.name.replace(/\.[^/.]+$/, '') }))}
                    />
                </div>

                <div className="hidden sm:block w-px h-10 bg-border" />

                <div className="flex flex-col gap-1.5">
                    <span className="text-2xs font-black text-text-subtle uppercase tracking-wider">Usable Region Filter</span>
                    <div className="flex items-center gap-2">
                        {filterBox ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label font-bold bg-success/10 text-success border border-success/30 rounded-full select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Region Defined
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label font-bold bg-surface-2 text-text-muted border border-border rounded-full select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-border-strong" /> Entire Page Active
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2.5">
                <button
                    onClick={() => setIsFilterMode(!isFilterMode)}
                    className={`px-3 lg:px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer border shadow-sm ${isFilterMode ? 'bg-brand border-brand text-white hover:bg-brand-hover' : 'bg-surface border-border hover:bg-surface-2 text-text-secondary'}`}
                    title="Draw a box to exclude title block/margins"
                >
                    <Crop size={14} />
                    <span className="hidden lg:inline">{isFilterMode ? 'Drawing Mode...' : 'Define Usable Region'}</span>
                    <span className="lg:hidden">{isFilterMode ? 'Drawing...' : 'Region'}</span>
                </button>
                {filterBox && (
                    <button onClick={handleClearFilter} className="px-3 py-2.5 bg-surface border border-danger/30 hover:bg-danger/10 text-danger text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm animate-in fade-in zoom-in-95 duration-150">
                        <Trash2 size={13} /> Clear Region
                    </button>
                )}
            </div>
        </div>
    );
}
