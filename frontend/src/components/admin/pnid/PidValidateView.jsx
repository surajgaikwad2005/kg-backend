'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ExternalLink,
    AlertTriangle, RefreshCw, Database, ArrowRight,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAdminNav, useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { useApp } from '@/src/context/AppContext';
import { SharedSourceHeader } from '@/src/components/admin/views/_SharedSourceHeader';
import { useHighlightOptions } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_queries/usePnidValidate';
import { PNID_ROUTES } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/routes';

function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border/60 animate-pulse">
            <div className="h-3 w-3 rounded-full bg-surface-2 shrink-0" />
            <div className="h-3 flex-1 rounded bg-surface-2" />
            <div className="h-3 w-1/3 rounded bg-surface-2" />
            <div className="h-5 w-16 rounded-lg bg-surface-2 shrink-0" />
        </div>
    );
}

function ConnectionRow({ conn, index }) {
    const statusCls = conn.verified
        ? 'bg-success/10 text-success border-success/30'
        : conn.wrong
            ? 'bg-danger/10 text-danger border-danger/30'
            : 'bg-surface-2 text-text-muted border-border';

    const statusLabel = conn.verified ? 'Verified' : conn.wrong ? 'Wrong' : 'Pending';
    const StatusIcon = conn.verified ? CheckCircle2 : conn.wrong ? XCircle : ShieldAlert;

    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: Math.min(index * 0.025, 0.3) }}
            className="flex items-center gap-4 px-5 py-3 border-b border-border/60 last:border-0 hover:bg-surface-2/50 transition-colors group"
        >
            <span className="text-caption font-mono text-text-subtle shrink-0 w-8 text-right">{index + 1}</span>
            <span className="flex-1 text-body-sm font-semibold text-text-primary truncate" title={conn.from}>
                {conn.from}
            </span>
            <ArrowRight size={12} className="text-text-subtle shrink-0" />
            <span className="flex-1 text-body-sm font-semibold text-text-primary truncate" title={conn.to}>
                {conn.to}
            </span>
            <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-label font-bold uppercase tracking-wider border shrink-0',
                statusCls,
            )}>
                <StatusIcon size={10} />
                {statusLabel}
            </span>
        </motion.div>
    );
}

export function PidValidateView() {
    const { setView } = useAdminNav();
    const { committedSources } = useAdminEntities();
    const { plantCode } = useApp();

    const [cdmUploaded] = useState(false);
    const isCommitted = committedSources.has('P&ID');

    const highlightQuery = useHighlightOptions(plantCode);
    const isLoading = highlightQuery.isLoading;
    const error = highlightQuery.isError
        ? 'Failed to load validation results. Try opening the full review.'
        : null;

    const connections = useMemo(
        () => (highlightQuery.data?.connections ?? []).map((c) => ({
            from: c.from,
            to: c.to,
            verified: c.verified ?? false,
            wrong: c.wrong ?? false,
        })),
        [highlightQuery.data],
    );

    const verifiedCount = useMemo(() => connections.filter(c => c.verified).length, [connections]);
    const total = connections.length;
    const allVerified = total > 0 && verifiedCount === total;

    const validateUrl = plantCode ? PNID_ROUTES.validateUrl() : null;

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <SharedSourceHeader />

            {plantCode && (
                <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-surface border border-border rounded-2xl">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                            allVerified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
                        )}>
                            {allVerified ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-body-sm font-bold text-text-primary truncate">{plantCode}</p>
                            <p className="text-caption text-text-muted">
                                {isLoading ? 'Loading…' : `${verifiedCount} / ${total} connections verified`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {cdmUploaded || isCommitted ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-caption font-bold text-success bg-success/10 border border-success/30">
                                <CheckCircle2 size={13} /> Staged to CDM
                            </span>
                        ) : null}
                        {validateUrl && (
                            <a
                                href={validateUrl}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-bold text-brand bg-brand-muted border border-brand/20 hover:bg-brand/10 transition-colors cursor-pointer"
                            >
                                <ExternalLink size={12} /> Full Review
                            </a>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-canvas">
                    <div className="flex items-center gap-2">
                        <Database size={14} className="text-text-muted" />
                        <h3 className="text-label font-bold text-text-muted uppercase tracking-widest">
                            Validated Connections
                        </h3>
                    </div>
                    {!isLoading && total > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-caption text-text-subtle">{total} total</span>
                            <span className={cn(
                                'inline-flex items-center gap-1.5 text-label font-bold px-2.5 py-1 rounded-lg border',
                                allVerified
                                    ? 'bg-success/10 text-success border-success/30'
                                    : 'bg-warning/10 text-warning border-warning/30',
                            )}>
                                <CheckCircle2 size={10} />
                                {verifiedCount}/{total} verified
                            </span>
                        </div>
                    )}
                </div>

                <div className="max-h-[460px] overflow-y-auto">
                    {isLoading ? (
                        <div className="py-2">
                            {Array.from({ length: 6 }, (_, i) => <SkeletonRow key={`skeleton-${i}`} />)}
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <AlertTriangle size={28} className="text-warning mb-3" />
                            <p className="text-body-sm font-bold text-text-muted mb-4">{error}</p>
                            {validateUrl && (
                                <a href={validateUrl} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-caption font-bold cursor-pointer hover:bg-brand-hover transition-colors">
                                    <ExternalLink size={13} /> Open Full Review
                                </a>
                            )}
                        </div>
                    ) : !plantCode ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <RefreshCw size={28} className="text-text-subtle mb-3" />
                            <p className="text-body-sm font-bold text-text-muted">No plant selected.</p>
                            <p className="text-caption text-text-subtle mt-1">Select a plant to view P&ID validation results.</p>
                        </div>
                    ) : total === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <Database size={28} className="text-text-subtle mb-3" />
                            <p className="text-body-sm font-bold text-text-muted">No connections found for this plant.</p>
                        </div>
                    ) : (
                        connections.map((conn, i) => (
                            <ConnectionRow key={`${conn.from}::${conn.to}`} conn={conn} index={i} />
                        ))
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center gap-4 pt-4 pb-16">
                {validateUrl && (
                    <a
                        href={validateUrl}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-body-sm font-bold border border-border bg-surface hover:bg-surface-2 text-text-secondary transition-all cursor-pointer"
                    >
                        <ExternalLink size={15} /> Open Full Validate View
                    </a>
                )}
                <button
                    onClick={() => setView('context-review')}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-body-sm font-bold bg-brand text-white shadow-md shadow-brand/25 hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/30 transition-all cursor-pointer ml-auto"
                >
                    Configure Context
                    <ArrowRight size={15} />
                </button>
            </div>
        </motion.div>
    );
}
