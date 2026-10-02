'use client';
import React, { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { PageFooter } from '@/src/components/admin/views/components/PageFooter';
import { CommittedCta } from '@/src/components/admin/views/_CommittedCta';
import {
    useIntegratedLabels,
    useIntegratedColumns,
    useIntegratedView,
    useRecomputeIntegrated,
} from './hooks/useIntegratedQueries';
import { IntegratedViewHeader } from './IntegratedViewHeader';
import { IntegratedLabelTabs } from './IntegratedLabelTabs';
import { IntegratedLayerSummary } from './IntegratedLayerSummary';
import { IntegratedContextTable } from './IntegratedContextTable';
import { IntegratedEmptyState } from './IntegratedEmptyState';

export function IntegratedViewContainer({ onToggleView, canToggle = true }) {
    const { plantCode } = useApp();
    const {
        selectedPlantId,
        committedSources,
        countsByType,
        commitTsContext,
        commitPidContext,
        commitDocsContext,
        commitSapContext,
    } = useAdminEntities();
    const effectivePlant = plantCode || selectedPlantId?.id || 'Plant_1';

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activeLabel = searchParams.get('integrated_label') || 'integrity';
    const previousView = searchParams.get('source_view') || 'ts-review';

    const sourceName = previousView === 'pid-review'
        ? 'P&ID'
        : previousView === 'docs-review'
            ? 'Documents'
            : previousView.startsWith('sap')
                ? 'SAP'
                : 'Historian/Timeseries';

    const sourceCounts = countsByType?.[sourceName];
    const hasUnprocessedFiles = Boolean(sourceCounts?.hasUnprocessed || (sourceCounts?.unprocessed ?? 0) > 0);
    const isCommitted = committedSources?.has(sourceName) && !hasUnprocessedFiles;

    const handleSelectLabel = useCallback((nextLabel) => {
        const params = new URLSearchParams(searchParams);
        params.set('integrated_label', nextLabel);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [router, pathname, searchParams]);

    // TanStack Queries & Mutations
    const { data: labelsData, isLoading: isLoadingLabels } = useIntegratedLabels(effectivePlant);
    const { data: columnsData, isLoading: isLoadingCols } = useIntegratedColumns(activeLabel);
    const { data: viewData, isLoading: isLoadingView } = useIntegratedView({
        plantCode: effectivePlant,
        label: activeLabel,
    });
    const recomputeMutation = useRecomputeIntegrated();

    const [pendingEdits, setPendingEdits] = useState({});
    const unsavedCount = Object.keys(pendingEdits).length;
    const hasUnsavedEdits = unsavedCount > 0;
    const isSaving = recomputeMutation.isPending;

    const handleSaveRow = (idx, updatedRow) => {
        setPendingEdits((prev) => ({ ...prev, [idx]: updatedRow }));
    };

    const handleDiscardAll = () => {
        setPendingEdits({});
    };

    const handleRecompute = async () => {
        if (!hasUnsavedEdits) return;
        // Merge pending edits across the entire dataset so all rows (edited + non-edited) are sent
        const allRows = rows.map((r, idx) => {
            const edit = pendingEdits[idx];
            const merged = edit ? { ...r, ...edit } : { ...r };
            merged.plant_code_id = effectivePlant;
            merged.plant_code = effectivePlant;
            return merged;
        });

        await recomputeMutation.mutateAsync({
            plantCode: effectivePlant,
            payload: {
                plant_code: effectivePlant,
                plant_code_id: effectivePlant,
                rows: allRows,
            },
        });
        setPendingEdits({});
    };

    const handleCommit = async () => {
        if (hasUnsavedEdits) {
            const allRows = rows.map((r, idx) => {
                const edit = pendingEdits[idx];
                const merged = edit ? { ...r, ...edit } : { ...r };
                merged.plant_code_id = effectivePlant;
                merged.plant_code = effectivePlant;
                return merged;
            });

            await recomputeMutation.mutateAsync({
                plantCode: effectivePlant,
                payload: {
                    plant_code: effectivePlant,
                    plant_code_id: effectivePlant,
                    rows: allRows,
                },
            });
            setPendingEdits({});
        }

        if (previousView === 'pid-review' && commitPidContext) {
            commitPidContext();
        } else if (previousView === 'docs-review' && commitDocsContext) {
            commitDocsContext();
        } else if (previousView.startsWith('sap') && commitSapContext) {
            commitSapContext();
        } else if (commitTsContext) {
            commitTsContext();
        }
    };

    const rows = React.useMemo(() => {
        if (!viewData) return [];
        if (Array.isArray(viewData)) return viewData;
        if (Array.isArray(viewData.rows)) return viewData.rows;
        if (Array.isArray(viewData.data)) return viewData.data;
        if (Array.isArray(viewData.items)) return viewData.items;
        if (Array.isArray(viewData.records)) return viewData.records;
        return [];
    }, [viewData]);

    const isEmpty = rows.length === 0;

    const handleToggle = useCallback((toIntegrated) => {
        if (onToggleView) {
            onToggleView(toIntegrated);
        } else if (!toIntegrated) {
            router.push(`/admin/domain-configuration/data-source-integration/review?view=${previousView}`);
        }
    }, [onToggleView, router, previousView]);

    return (
        <div className="space-y-4 pb-12">
            <IntegratedViewHeader
                isIntegrated={true}
                onToggleView={handleToggle}
                canToggle={canToggle}
            />

            <IntegratedLabelTabs
                labels={labelsData?.labels}
                activeLabel={activeLabel}
                onSelectLabel={handleSelectLabel}
                isLoading={isLoadingLabels}
            />

            <IntegratedLayerSummary
                columnsData={columnsData}
                isLoading={isLoadingCols}
            />

            {isLoadingView ? (
                <div className="p-8 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted text-xs">
                    Loading integrated intelligence matrix…
                </div>
            ) : isEmpty ? (
                <IntegratedEmptyState
                    message={viewData?.message || 'No integrated records found for this plant domain.'}
                    onBackToSource={() => handleToggle(false)}
                />
            ) : (
                <IntegratedContextTable
                    columns={columnsData?.columns || viewData?.columns}
                    rows={rows}
                    onSaveRow={handleSaveRow}
                    onSaveAll={handleRecompute}
                    hasUnsavedEdits={hasUnsavedEdits}
                    isSaving={isSaving}
                />
            )}

            {/* Fixed Bottom Bar - unified with Source Review */}
            <PageFooter>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {hasUnsavedEdits ? (
                        <div className="flex items-center gap-2 text-warning text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                            <span>{unsavedCount} edited row(s) pending save</span>
                        </div>
                    ) : <div />}

                    <div className="flex items-center gap-3">
                        {hasUnsavedEdits && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleDiscardAll}
                                    disabled={isSaving}
                                    className="px-4 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text-primary text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <RotateCcw size={14} />
                                    <span>Discard Changes</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRecompute}
                                    disabled={isSaving}
                                    aria-busy={isSaving}
                                    className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-brand/20 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    <span>Save Changes</span>
                                </button>
                            </>
                        )}

                        {isCommitted ? (
                            <CommittedCta />
                        ) : (
                            <button
                                type="button"
                                onClick={handleCommit}
                                disabled={isSaving}
                                className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all cursor-pointer"
                            >
                                Configure Context
                            </button>
                        )}
                    </div>
                </div>
            </PageFooter>
        </div>
    );
}
