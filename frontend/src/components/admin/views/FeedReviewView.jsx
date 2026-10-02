'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Filter } from 'lucide-react';
import { useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { useFeedContext, useCommitFeedContext } from '@/src/components/admin/_queries/useDsiQueries';
import { SharedSourceHeader } from '@/src/components/admin/views/_SharedSourceHeader';
import { CommittedCta } from '@/src/components/admin/views/_CommittedCta';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { PageFooter } from '@/src/components/admin/views/components/PageFooter';

const SKELETON_COLS = ['col-1', 'col-2', 'col-3', 'col-4', 'col-5'];

/**
 * Review + commit screen for the SAP-linked findings feeds (AIF/GLOC/LOPC,
 * added 2026-08-17) — one component parameterized by `connector`/`label`
 * instead of three near-identical files, since all three share the exact
 * same param/response shape (see contextService.js's getContext/commitContext
 * doc comments).
 *
 * Unlike P&ID/Documents/Historian/SAP, these connectors have no separate
 * pipeline-run stage: upload IS the extraction, so rows staged during upload
 * are immediately reviewable here. Commit is correspondingly simpler — POST
 * /context/commit with just { connector, plant_code_id } and no row payload,
 * per the 2026-08-17 "omit rows" contract change (see
 * api-data/domain-configuration-context.json).
 */
export function FeedReviewView({ connector, label, standalone = false }) {
    const {
        selectedPlantId, committedSources, setCommittedSources, markCommittedAt,
    } = useAdminEntities();
    const router = useRouter();
    const [unmatchedOnly, setUnmatchedOnly] = useState(false);

    const plantCode = selectedPlantId?.id;
    const isCommitted = committedSources.has(label);

    const { data, isLoading, isFetching, isError, refetch } = useFeedContext(
        connector, plantCode, { unmatchedOnly, pageSize: 500 },
    );
    const commitMutation = useCommitFeedContext(plantCode);

    const rows = data?.rows;
    const cols = useMemo(
        () => (rows && rows.length > 0 ? Object.keys(rows[0]).filter(k => k !== '_id') : []),
        [rows],
    );
    const displayRows = rows || [];

    if (!plantCode) {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                {!standalone && <SharedSourceHeader />}
                <div className="bg-surface border border-border rounded-2xl p-10 text-center">
                    <p className="text-text-muted mb-4">Select a plant to review {label} data.</p>
                </div>
            </motion.div>
        );
    }

    const handleCommit = () => {
        if (commitMutation.isPending || isCommitted) return;
        commitMutation.mutate(connector, {
            onSuccess: () => {
                setCommittedSources(prev => new Set([...prev, label]));
                markCommittedAt(label);
                router.push('/admin/domain-configuration/data-source-integration');
            },
        });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            {!standalone && <SharedSourceHeader />}
            <div className="space-y-8">
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-border bg-surface-2 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h4 className="text-sm font-bold text-text-primary">{label} Findings</h4>
                            <p className="text-label text-text-muted">
                                {isLoading ? '' : `${displayRows.length} row(s)${isFetching ? ' · refreshing…' : ''}`}
                            </p>
                        </div>
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={unmatchedOnly}
                                onChange={(e) => setUnmatchedOnly(e.target.checked)}
                                className="w-4 h-4 rounded border-border text-brand focus:ring-brand cursor-pointer"
                            />
                            <Filter size={12} className="text-text-muted" aria-hidden="true" />
                            Show unmatched only
                        </label>
                    </div>
                    <div className="overflow-auto max-h-[600px] custom-scrollbar">
                        <table className="w-full text-left text-sm relative">
                            <thead className="sticky top-0 z-20 bg-surface-2 shadow-sm ring-1 ring-border">
                                <tr className="text-text-muted">
                                    {(isLoading ? SKELETON_COLS : cols).map((col) => (
                                        <th key={col} className="px-6 py-4 font-bold tracking-wider uppercase whitespace-nowrap text-[10px]">
                                            {isLoading ? <Skeleton className="h-3 w-16" /> : col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-text-secondary divide-y divide-border/50">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={`skel-${i}`} className="border-b border-border/50">
                                            {SKELETON_COLS.map((col, j) => (
                                                <td key={col} className="px-6 py-3">
                                                    <Skeleton className={`h-4 w-full ${j === 0 ? 'max-w-[140px]' : 'max-w-[100px]'}`} delay={j * 0.1} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : isError ? (
                                    <tr>
                                        <td colSpan={cols.length || 1} className="px-6 py-10 text-center text-danger">
                                            Could not load {label} data.
                                            <button onClick={() => refetch()} className="ml-2 underline cursor-pointer">Retry</button>
                                        </td>
                                    </tr>
                                ) : displayRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={cols.length || 1} className="px-6 py-10 text-center text-text-muted">
                                            {unmatchedOnly ? `No unmatched ${label} rows.` : `No ${label} rows staged for review.`}
                                        </td>
                                    </tr>
                                ) : displayRows.map((row, i) => (
                                    <tr key={row._id || row[cols[0]] || i} className="hover:bg-surface-2/80 transition-colors">
                                        {cols.map((col, j) => (
                                            <td key={col} className={`px-6 py-3 whitespace-nowrap text-xs ${j === 0 ? 'font-mono text-brand font-medium' : ''}`}>
                                                {row[col] ?? '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <PageFooter>
                    <div className="flex justify-end items-center gap-4">
                        {isCommitted ? (
                            <CommittedCta />
                        ) : (
                            <button
                                onClick={handleCommit}
                                disabled={commitMutation.isPending || isLoading || displayRows.length === 0}
                                aria-busy={commitMutation.isPending}
                                className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                {commitMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                <span>Commit to Database</span>
                            </button>
                        )}
                    </div>
                </PageFooter>
            </div>
        </motion.div>
    );
}
