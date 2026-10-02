'use client';

/**
 * ActiveConnectionHeader — shows the active FROM → TO pair, validation badge,
 * and verify / mark-incorrect / unverify actions, plus a jump to template matching.
 */
import React from 'react';
import { useValidateContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_context/ValidateContext';
import { CheckCircle2, XCircle, Loader2, Filter, Layers, RefreshCw } from 'lucide-react';
import { PNID_ROUTES } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/routes';

export default function ActiveConnectionHeader() {
    const {
        router, activeConnection, highlightData, validationResult, isValidationLoading, filterBox,
        connections, setConnections, setActiveConnection, saveConnectionsToBackend,
        markActiveConnectionAsVerified, markActiveConnectionAsWrong, getValidationIconAndCls,
    } = useValidateContext();

    if (!activeConnection) {
        return (
            <div className="bg-surface rounded-3xl border border-border shadow-card p-6 text-center text-text-subtle italic font-bold">
                Select a connection from the list or select tags manually to begin validation.
            </div>
        );
    }

    const handleUnverify = async () => {
        const next = connections.map((c) => (c.from === activeConnection.from && c.to === activeConnection.to ? { ...c, verified: false, wrong: false } : c));
        setConnections(next);
        setActiveConnection((prev) => (prev ? { ...prev, verified: false, wrong: false } : null));
        await saveConnectionsToBackend(next);
    };

    return (
        <div className="bg-surface rounded-3xl border border-border shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-2xs font-black bg-surface-2 text-text-muted border border-border rounded-full uppercase">FROM</span>
                        <h2 className="text-lg font-black text-text-primary tracking-tight">{activeConnection.from}</h2>
                        <span className="text-text-subtle">➔</span>
                        <span className="px-2.5 py-0.5 text-2xs font-black bg-surface-2 text-text-muted border border-border rounded-full uppercase">TO</span>
                        <h2 className="text-lg font-black text-text-primary tracking-tight">{activeConnection.to}</h2>
                    </div>
                    {filterBox && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-2xs font-black bg-warning/10 text-warning border border-warning/30 rounded-full uppercase tracking-wider animate-pulse">
                            <Filter size={8} /> Region Filter Active
                        </span>
                    )}
                </div>
                {highlightData && (
                    <p className="text-label text-text-subtle font-bold uppercase tracking-wider">
                        Target Page: Sheet {highlightData.page_no} · Dimensions: {highlightData.image_size.width}x{highlightData.image_size.height}px
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                {isValidationLoading ? (
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-text-subtle bg-surface-2 border border-border px-3 py-2 rounded-full">
                        <Loader2 size={12} className="animate-spin" /> Verifying...
                    </div>
                ) : validationResult ? (
                    (() => {
                        const st = getValidationIconAndCls(validationResult.valid);
                        return <div className={`inline-flex items-center gap-2 px-3 py-2 border rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${st.badge}`}>{st.icon} <span className="hidden sm:inline">{st.label}</span></div>;
                    })()
                ) : null}

                {activeConnection.verified ? (
                    <div className="inline-flex items-center gap-1.5 px-3 lg:px-5 py-2.5 bg-success/10 border border-success/30 text-success text-xs font-black uppercase tracking-wider rounded-xl shadow-sm">
                        <CheckCircle2 size={13} /> Verified
                    </div>
                ) : (
                    <button onClick={markActiveConnectionAsVerified} className="px-3 lg:px-5 py-2.5 bg-success hover:bg-success/90 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                        <CheckCircle2 size={13} /> Verify
                    </button>
                )}
                {activeConnection.wrong ? (
                    <div className="inline-flex items-center gap-1.5 px-3 lg:px-5 py-2.5 bg-danger/10 border border-danger/30 text-danger text-xs font-black uppercase tracking-wider rounded-xl shadow-sm">
                        <XCircle size={13} /> Incorrect
                    </div>
                ) : (
                    <button onClick={markActiveConnectionAsWrong} className="px-3 lg:px-5 py-2.5 bg-danger hover:bg-danger/90 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                        <XCircle size={13} /> <span className="hidden lg:inline">Mark Incorrect</span><span className="lg:hidden">Incorrect</span>
                    </button>
                )}
                {(activeConnection.verified || activeConnection.wrong) && (
                    <button onClick={handleUnverify} className="px-3 lg:px-5 py-2.5 bg-surface-2 hover:bg-surface border border-border-strong text-text-muted text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm" title="Reset to pending">
                        <RefreshCw size={13} /> <span className="hidden sm:inline">Unverify</span>
                    </button>
                )}
                <button onClick={() => router.push(PNID_ROUTES.templateMatching)} className="px-3 lg:px-5 py-2.5 bg-brand-muted border border-brand/30 hover:bg-brand/10 text-brand font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <Layers size={13} /> <span className="hidden xl:inline">Template </span>Matching
                </button>
            </div>
        </div>
    );
}
