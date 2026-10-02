'use client';

/**
 * Symbol Template Matching (Ontology Generator) — crop/upload a symbol, configure
 * its tag pattern, and locate every instance across the drawings. Layout + tab
 * switching only; all logic comes from TemplateMatchingProvider.
 */
import React from 'react';

import PageHeader from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/ui/PageHeader';
import LoadingState from '@/src/app/(admin)/admin/domain-configuration/pnid/_components/ui/LoadingState';
import { PNID_ROUTES } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/routes';
import { TemplateMatchingProvider, useTemplateMatchingContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_context/TemplateMatchingContext';
import TemplateSetupPanel from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_components/TemplateSetupPanel';
import MatchResultsPanel from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_components/MatchResultsPanel';
import DrawingViewer from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_components/DrawingViewer';
import { Settings, Layers, AlertTriangle } from 'lucide-react';

function TemplateMatchingContent() {
    const { router, plantCode, isLoading, preprocessedFiles, sidebarTab, setSidebarTab, libraryMatches } = useTemplateMatchingContext();

    const totalMatches = Object.values(libraryMatches).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    const hasLibraryMatches = totalMatches > 0;

    const tabCls = (active) => `flex-1 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${active ? 'border-brand text-brand' : 'border-transparent text-text-subtle hover:text-text-secondary'}`;

    return (
        <div className="flex h-full w-full bg-canvas text-text-secondary overflow-hidden">
            <main className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-canvas">
                <PageHeader
                    title="SYMBOL TEMPLATE MATCHING"
                    subtitle={plantCode ? `Active Plant: ${plantCode}` : 'No plant selected'}
                    onBack={() => router.push(PNID_ROUTES.validate)}
                >
                    <button onClick={router.onComplete} className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer">
                        Complete Configuration
                    </button>
                </PageHeader>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center"><LoadingState label="Loading Workspace Assets…" /></div>
                ) : preprocessedFiles.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="bg-surface rounded-[32px] border border-border p-12 text-center text-text-subtle max-w-lg shadow-card">
                            <AlertTriangle size={48} className="mx-auto text-warning mb-4 animate-bounce" />
                            <h3 className="text-base font-black text-text-primary uppercase tracking-tight mb-2">No Drawings Available</h3>
                            <p className="text-sm font-medium text-text-muted mb-6">Upload P&ID drawings and run the OCR preprocessing pipeline before using the Template Matching Console.</p>
                            <button onClick={() => router.push(PNID_ROUTES.manageFiles)} className="px-6 py-3 bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer">
                                Go to Manage Files
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex min-h-0 min-w-0 bg-canvas">
                        {/* Left controls */}
                        <div className="w-[380px] shrink-0 border-r border-border bg-surface flex flex-col h-full">
                            <div className="flex border-b border-border shrink-0 bg-surface select-none">
                                <button onClick={() => setSidebarTab('setup')} className={tabCls(sidebarTab === 'setup')}>
                                    <Settings size={13} /> Template Setup
                                </button>
                                <button onClick={() => setSidebarTab('results')} className={tabCls(sidebarTab === 'results')}>
                                    <Layers size={13} /> Match Results
                                    {hasLibraryMatches && <span className="px-1.5 py-0.5 bg-brand-muted text-brand text-2xs font-extrabold rounded-full">{totalMatches}</span>}
                                </button>
                            </div>
                            {sidebarTab === 'setup' ? <TemplateSetupPanel /> : <MatchResultsPanel />}
                        </div>

                        {/* Right viewer */}
                        <DrawingViewer />
                    </div>
                )}
            </main>
        </div>
    );
}

export default function TemplateMatchingPage() {
    return (
        <TemplateMatchingProvider>
            <TemplateMatchingContent />
        </TemplateMatchingProvider>
    );
}
