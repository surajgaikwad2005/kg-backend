'use client';

/**
 * MatchResultsPanel — the Results tab: category tabs, the match occurrences list
 * (click to focus on the drawing), manual marking toggle, and Excel export.
 */
import React from 'react';
import { Crop, Download, Layers, AlertTriangle, ChevronRight } from 'lucide-react';
import { useTemplateMatchingContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_context/TemplateMatchingContext';
import { cleanPdfName, isSameMatch } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_lib/utils';
import Alerts from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_components/Alerts';

export default function MatchResultsPanel() {
    const {
        selectedTab, setSelectedTab, libraryMatches, activeMatchHighlight, setActiveMatchHighlight,
        isManualMatchMode, setIsManualMatchMode, setIsCropMode, setSuccessMessage, setErrorMessage,
        handleSelectMatch, handleDownloadExcel, setSidebarTab,
    } = useTemplateMatchingContext();

    const categories = Object.keys(libraryMatches);
    const hasLibraryMatches = Object.values(libraryMatches).some((arr) => arr && arr.length > 0);
    const activeMatches = libraryMatches[selectedTab] || [];

    const toggleManual = () => {
        const next = !isManualMatchMode;
        setIsManualMatchMode(next);
        setIsCropMode(false);
        setSuccessMessage(next ? 'Manual Marking Mode Active — Click and drag a box on the drawing' : null);
        if (next) setErrorMessage(null);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-canvas">
            <Alerts />

            <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-surface">
                <div>
                    <h4 className="text-label font-black text-text-subtle uppercase tracking-widest">Match Occurrences</h4>
                    <p className="text-caption font-bold text-text-muted mt-0.5">
                        {selectedTab ? `${activeMatches.length} active instances in ${selectedTab}` : 'No active category'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleManual} className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${isManualMatchMode ? 'bg-brand border-brand text-white shadow-md' : 'bg-surface border-border hover:bg-surface-2 text-text-muted hover:text-text-primary'}`} title="Manually Mark Symbol">
                        <Crop size={14} />
                        <span className="text-label font-black uppercase tracking-wider">{isManualMatchMode ? 'Drawing...' : 'Manual Mark'}</span>
                    </button>
                    <button onClick={handleDownloadExcel} className="p-2 text-success border border-success/30 hover:bg-success/10 rounded-lg transition-colors cursor-pointer" title="Export Matches to Excel">
                        <Download size={14} />
                    </button>
                </div>
            </div>

            {/* Category tabs */}
            <div className="flex border-b border-border bg-surface p-1 gap-1 shrink-0 overflow-x-auto select-none">
                {categories.length === 0 ? (
                    <div className="px-4 py-2 text-2xs text-text-subtle font-medium italic">No categories yet — run a search to add tabs</div>
                ) : (
                    categories.map((tab) => {
                        const count = libraryMatches[tab]?.length || 0;
                        const isActive = selectedTab === tab;
                        return (
                            <button key={tab} onClick={() => { setSelectedTab(tab); setActiveMatchHighlight(null); }} className={`px-3 py-2 text-label font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${isActive ? 'bg-brand-muted text-brand border border-brand/20 shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>
                                <span>{tab}</span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-full ${isActive ? 'bg-brand text-white' : 'bg-surface-2 text-text-subtle'}`}>{count}</span>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Body */}
            {!hasLibraryMatches ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-subtle">
                    <div className="w-16 h-16 bg-brand-muted text-brand border border-brand/20 rounded-2xl flex items-center justify-center mb-4"><Layers size={24} /></div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-text-secondary mb-1">No Results Yet</h4>
                    <p className="text-label text-text-subtle max-w-[240px] leading-relaxed mb-6">Configure a template, enter a tag category, and run a search — or use Manual Mark above.</p>
                    <button onClick={() => setSidebarTab('setup')} className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white font-bold text-label uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md">Go to Setup</button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {activeMatches.length === 0 ? (
                        <div className="py-12 text-center text-text-subtle flex flex-col items-center">
                            <AlertTriangle className="w-8 h-8 text-warning/80 mb-2" />
                            <p className="text-label font-black uppercase tracking-wider">No matching symbols found</p>
                            <p className="text-2xs text-text-subtle mt-1 max-w-[200px] mx-auto">Try a different tab or run a search for {selectedTab}.</p>
                        </div>
                    ) : (
                        activeMatches.map((match, idx) => {
                            const isActive = isSameMatch(activeMatchHighlight, match);
                            return (
                                <div key={idx} onClick={() => handleSelectMatch(match)} className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden bg-surface ${isActive ? 'border-danger shadow-md ring-1 ring-danger/20' : 'border-border hover:border-brand/60'}`}>
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${isActive ? 'bg-danger' : 'bg-success'}`} />
                                    <div className="min-w-0 pl-1.5 space-y-1.5 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-bold text-text-secondary truncate flex-1" title={cleanPdfName(match.pdf)}>{cleanPdfName(match.pdf)}</p>
                                            {match.extracted_text && (
                                                <span className="px-2 py-0.5 bg-brand-muted text-brand font-extrabold text-[8px] uppercase tracking-wider rounded-md border border-brand/20 shrink-0">{match.extracted_text}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-2xs font-black uppercase tracking-wider text-text-subtle">
                                            <span>Sheet: Page {match.page_no}</span>
                                            <span>•</span>
                                            <span className={match.score > 0.85 ? 'text-success' : 'text-warning'}>{Math.round(match.score * 100)}% Match</span>
                                            {match.rotation !== undefined && (<><span>•</span><span className="text-brand">Rot: {match.rotation}°</span></>)}
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-text-subtle group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
