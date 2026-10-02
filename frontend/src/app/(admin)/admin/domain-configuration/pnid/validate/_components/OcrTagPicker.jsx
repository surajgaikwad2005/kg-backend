'use client';

/**
 * OcrTagPicker — table-based FROM/TO tag selector for the OCR fallback path
 * (no structured connections available, only flat OCR-recognized tags).
 * Mirrors the structured connections table's look (searchable, clickable
 * rows) instead of raw dropdowns, so both states feel like one system.
 */
import React from 'react';
import { useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';
import { Play, ArrowLeftRight, XCircle, Loader2 } from 'lucide-react';

export default function OcrTagPicker() {
    const {
        filteredFallbackTags, selectedFromTag, setSelectedFromTag, selectedToTag, setSelectedToTag,
        pageNoInput, setPageNoInput, handleManualVerify, isHighlightLoading, isValidationLoading,
    } = useValidateContext();
    const isVerifying = isHighlightLoading || isValidationLoading;

    const handleRowClick = (tag) => {
        if (selectedFromTag === tag) { setSelectedFromTag(''); return; }
        if (selectedToTag === tag) { setSelectedToTag(''); return; }
        if (!selectedFromTag) { setSelectedFromTag(tag); return; }
        if (!selectedToTag) { setSelectedToTag(tag); return; }
        // Both slots already filled — start a new pair with this tag as FROM.
        setSelectedFromTag(tag);
        setSelectedToTag('');
    };

    const handleSwap = () => {
        const from = selectedFromTag, to = selectedToTag;
        setSelectedFromTag(to);
        setSelectedToTag(from);
    };

    return (
        <div className="flex flex-col h-full">
            <p className="px-4 pt-4 text-label font-bold text-text-subtle leading-relaxed uppercase">
                Only flat OCR tags available. Click a tag below for FROM, then another for TO.
            </p>

            <div className="flex items-center gap-2 px-4 py-3">
                <div className="flex-1 min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface-2">
                    <span className="text-2xs font-black text-text-subtle uppercase shrink-0">From</span>
                    <span className={`truncate text-2xs font-black uppercase ${selectedFromTag ? 'text-brand' : 'text-text-muted italic normal-case font-medium'}`}>
                        {selectedFromTag || 'none'}
                    </span>
                    {selectedFromTag && (
                        <button onClick={() => setSelectedFromTag('')} className="ml-auto text-text-subtle hover:text-danger cursor-pointer shrink-0" aria-label="Clear From tag">
                            <XCircle size={12} />
                        </button>
                    )}
                </div>
                <button
                    onClick={handleSwap}
                    disabled={!selectedFromTag && !selectedToTag}
                    className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text-subtle hover:text-brand disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 transition-colors"
                    title="Swap From/To"
                    aria-label="Swap From and To tags"
                >
                    <ArrowLeftRight size={13} />
                </button>
                <div className="flex-1 min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface-2">
                    <span className="text-2xs font-black text-text-subtle uppercase shrink-0">To</span>
                    <span className={`truncate text-2xs font-black uppercase ${selectedToTag ? 'text-brand' : 'text-text-muted italic normal-case font-medium'}`}>
                        {selectedToTag || 'none'}
                    </span>
                    {selectedToTag && (
                        <button onClick={() => setSelectedToTag('')} className="ml-auto text-text-subtle hover:text-danger cursor-pointer shrink-0" aria-label="Clear To tag">
                            <XCircle size={12} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredFallbackTags.length > 0 ? (
                    <div className="border-x border-b border-border">
                        <table className="w-full border-collapse text-left text-caption table-fixed">
                            <thead className="bg-surface-2 sticky top-0 border-b border-border z-10 select-none">
                                <tr className="divide-x divide-border">
                                    <th className="w-[70%] px-3 py-2 text-label font-black text-text-muted uppercase tracking-wider">Tag</th>
                                    <th className="w-[30%] px-3 py-2 text-center text-label font-black text-text-muted uppercase tracking-wider">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredFallbackTags.map((tag) => {
                                    const role = selectedFromTag === tag ? 'from' : selectedToTag === tag ? 'to' : null;
                                    return (
                                        <tr
                                            key={tag}
                                            onClick={() => handleRowClick(tag)}
                                            className={`divide-x divide-border transition-colors cursor-pointer text-xs font-mono ${role ? 'bg-brand-muted/70 text-brand font-black' : 'bg-surface text-text-secondary hover:bg-surface-2'}`}
                                        >
                                            <td className="px-3 py-2.5 truncate uppercase">{tag}</td>
                                            <td className="px-1 py-2.5 text-center">
                                                {role === 'from' && (
                                                    <span className="px-2 py-0.5 text-2xs font-black uppercase rounded-full bg-brand text-white">From</span>
                                                )}
                                                {role === 'to' && (
                                                    <span className="px-2 py-0.5 text-2xs font-black uppercase rounded-full bg-highlight text-white">To</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-text-subtle text-xs italic font-bold">No tags matched search.</div>
                )}
            </div>

            <div className="p-4 border-t border-border space-y-2.5 bg-surface-2/50">
                <div className="space-y-1.5">
                    <label htmlFor="ocr-page-no" className="text-2xs font-black text-text-subtle uppercase">Page No (Optional)</label>
                    <input
                        id="ocr-page-no"
                        type="text"
                        value={pageNoInput}
                        onChange={(e) => setPageNoInput(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full px-3 py-2.5 border border-border rounded-xl text-xs font-bold bg-surface text-text-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                    />
                </div>
                <button
                    disabled={!selectedFromTag || !selectedToTag || isVerifying}
                    onClick={handleManualVerify}
                    aria-busy={isVerifying}
                    className="w-full py-3 bg-text-primary hover:bg-brand disabled:opacity-50 disabled:cursor-not-allowed text-surface hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                    {isVerifying ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                    {isVerifying ? 'Verifying…' : 'Verify Connection'}
                </button>
            </div>
        </div>
    );
}
