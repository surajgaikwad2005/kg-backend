'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Cpu, FileStack, LayoutGrid } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAdminNav, useAdminEntities, usePnidForm, useDocsForm } from '@/src/components/admin/AdminPanelContext';
import { useDomainOntology } from '@/src/context/domain-config/DomainOntologyContext';
import { SharedSourceHeader } from '@/src/components/admin/views/_SharedSourceHeader';
import { splitSourceEntries, getUnprocessedTypes, SOURCE_META } from '@/src/components/admin/domainSources';
import { LockedState } from './components/source/LockedState';
import { SourceCard } from './components/source/SourceCard';
import { DataConfigEmptyState } from './components/source/DataConfigEmptyState';
import { useRunPipeline } from './hooks/useRunPipeline';
import { PageFooter } from '@/src/components/admin/views/components/PageFooter';
import { PipelineRunDock } from '@/src/components/admin/pipeline/PipelineRunDock';
import { FlowFilesPanel } from '@/src/components/admin/views/components/flowFiles/FlowFilesPanel';
import { SegmentedControl } from '@/src/components/ui/SegmentedControl';

const REQUIRED_SOURCES = ['P&ID', 'Documents', 'Historian/Timeseries', 'SAP'];

// Two views over the same plant: the batch-grouped source cards, and the
// row-per-file grid. `sources` is the default because it is the orchestration
// surface this screen exists for; `files` is the drill-down.
const TAB_SOURCES = 'sources';
const TAB_FILES = 'files';
const VIEW_TABS = [
    { value: TAB_SOURCES, label: 'Sources', icon: <LayoutGrid size={12} aria-hidden="true" /> },
    { value: TAB_FILES, label: 'Files', icon: <FileStack size={12} aria-hidden="true" /> },
];

const REVIEW_VIEW_BY_TYPE = Object.fromEntries(SOURCE_META.map(s => [s.type, s.view]));

export function DataConfigView() {
    const { setSelectedSource, setIsConfigModalOpen, setIsProcessModalOpen } = useAdminNav();
    const {
        selectedPlantId,
        configuredSources, expandedSourceId, setExpandedSourceId,
        handleDeleteSource, processedSources, committedSources,
        processedAt, committedAt,
    } = useAdminEntities();
    const { pnidPipelineRunning } = usePnidForm();
    const {
        allDocTypes, docCategories, effectiveDocCategories,
        setDocActiveCategory, setDocSelectedType, setDocTab, setDocSourceModal,
        setSelectedDocCategory, setDocCategoryStep,
    } = useDocsForm();
    const { mergeOntology } = useDomainOntology();
    const { runPipeline } = useRunPipeline();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // The URL owns which tab is showing, so a view is linkable and survives a
    // reload (rule 38). An unknown ?tab= value degrades to Sources rather than
    // rendering nothing.
    const activeTab = searchParams.get('tab') === TAB_FILES ? TAB_FILES : TAB_SOURCES;

    const handleTabChange = useCallback((next) => {
        const params = new URLSearchParams(searchParams);
        // Sources is the default, so it stays out of the query string entirely
        // rather than leaving ?tab=sources on every share of this page.
        if (next === TAB_SOURCES) params.delete('tab');
        else params.set('tab', next);
        const qs = params.toString();
        // replace, not push: switching tabs should not stack history entries
        // the Back button then has to walk through.
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [router, pathname, searchParams]);

    useEffect(() => {
        mergeOntology({
            plant: selectedPlantId ?? null,
            sources: configuredSources.map(s => ({ type: s.type, status: s.status, name: s.name })),
        });
    }, [selectedPlantId, configuredSources, mergeOntology]);

    const configuredTypes = useMemo(() => configuredSources.map(s => s.type), [configuredSources]);

    const allConfigured = useMemo(
        () => REQUIRED_SOURCES.every(t => configuredTypes.includes(t)),
        [configuredTypes]
    );

    const missingCount = useMemo(
        () => REQUIRED_SOURCES.filter(t => !configuredTypes.includes(t)).length,
        [configuredTypes]
    );

    const processedTypesArray = useMemo(
        () => configuredTypes.filter(t => processedSources.has(t) || committedSources.has(t)),
        [configuredTypes, processedSources, committedSources]
    );

    const { processedEntries, unprocessedEntries } = useMemo(
        () => splitSourceEntries(configuredSources, { processedAt, committedAt }),
        [configuredSources, processedAt, committedAt]
    );

    const unprocessedTypes = useMemo(
        () => getUnprocessedTypes(configuredSources, { processedAt, committedAt }),
        [configuredSources, processedAt, committedAt]
    );

    // Every type has run AND no newer batch is waiting. The second half matters: "Add
    // Files" on a processed source keeps the type in processedSources, so without it
    // the view claims completion while a fresh batch sits unprocessed.
    const allProcessed = useMemo(
        () => configuredTypes.length > 0
            && configuredTypes.every(t => processedSources.has(t) || committedSources.has(t))
            && unprocessedEntries.length === 0
            && !pnidPipelineRunning,
        [configuredTypes, processedSources, committedSources, unprocessedEntries, pnidPipelineRunning]
    );

    const isAnySourceUploading = useMemo(
        () => configuredSources.some(s => s.status === 'running'),
        [configuredSources]
    );

    // Is there anything worth running RIGHT NOW — at least one batch that is
    // neither failed (no usable data) nor still uploading (no data yet)?
    //
    // This replaces a blanket `hasFailedSource` block. That rule disabled
    // Process Data whenever ANY batch anywhere in the plant had failed, so a
    // single failed Documents batch also blocked P&ID, Timeseries and SAP —
    // and blocked the perfectly good uploaded file sitting right beside it in
    // the same section. A failed batch is a reason to skip that batch, not a
    // reason to freeze the whole plant; the run itself already targets only
    // usable entries (see getUnprocessedTypes, which drops failed/running).
    const hasUsableSource = useMemo(
        () => configuredSources.some(s => s.status !== 'failed' && s.status !== 'running'),
        [configuredSources]
    );

    const isProcessDisabled = !selectedPlantId || configuredSources.length === 0
        || pnidPipelineRunning || isAnySourceUploading || !hasUsableSource;

    const isUnprocessedProcessDisabled = pnidPipelineRunning || unprocessedTypes.length === 0;

    const handleProcessDataClick = useCallback(() => {
        setIsProcessModalOpen(true);
    }, [setIsProcessModalOpen]);

    const handleProcessUnprocessed = useCallback(() => {
        setIsProcessModalOpen(true);
    }, [setIsProcessModalOpen]);

    // Resolves a doc source's subtype LABEL (e.g. "Equipment Datasheets", stored
    // on source.subtype at upload time — see ConfigModal.jsx's handleGlobalDocSubmit)
    // back to its docKey, so Review/Add File can target the exact subtype instead
    // of the generic all-categories doc picker.
    const findDocDef = useCallback(
        (source) => (source.type === 'Documents' && source.subtype)
            ? allDocTypes.find(t => t.label === source.subtype)
            : null,
        [allDocTypes]
    );

    const handleReviewSource = useCallback((source) => {
        const view = REVIEW_VIEW_BY_TYPE[source.type];
        if (!view) return;
        const docDef = findDocDef(source);
        if (docDef) {
            setSelectedDocCategory(docDef.key);
            const stepIdx = docCategories.findIndex(c => c.id === docDef.key);
            setDocCategoryStep(stepIdx >= 0 ? stepIdx : 0);
        }
        router.push(`/admin/domain-configuration/data-source-integration/review?view=${view}`);
    }, [findDocDef, docCategories, setSelectedDocCategory, setDocCategoryStep, router]);

    // Opens the generic ConfigModal for any source type (P&ID, Documents,
    // Historian, SAP) — all types share the same add-file flow.
    const handleAddFileToSource = useCallback((source) => {
        setSelectedSource(source.type);
        setIsConfigModalOpen(true);
    }, [setSelectedSource, setIsConfigModalOpen]);

    const handleSelectSourceType = useCallback((type) => {
        setSelectedSource(type);
        setIsConfigModalOpen(true);
    }, [setSelectedSource, setIsConfigModalOpen]);

    const handleSelectDocType = useCallback((docKey) => {
        const categoryIdx = effectiveDocCategories?.findIndex(c => c.types.some(t => t.key === docKey)) ?? -1;
        if (categoryIdx !== -1) setDocActiveCategory(categoryIdx);
        setDocSelectedType(docKey);
        setDocTab('device');
        setDocSourceModal(true);
    }, [effectiveDocCategories, setDocActiveCategory, setDocSelectedType, setDocTab, setDocSourceModal]);

    const renderSourceCard = (source, isUnprocessed = false) => {
        // Review button is shown for processed sources; Plus, Edit, and Delete icons are removed from processed cards.
        const canReview = !isUnprocessed && (processedSources.has(source.type) || committedSources.has(source.type));
        return (
            <SourceCard
                key={source.id}
                source={source}
                isUnprocessed={isUnprocessed}
                isExpanded={expandedSourceId === source.id}
                onToggle={() => setExpandedSourceId(expandedSourceId === source.id ? null : source.id)}
                onEdit={isUnprocessed ? () => handleAddFileToSource(source) : undefined}
                onDelete={isUnprocessed ? () => handleDeleteSource(source.id) : undefined}
                onReview={canReview && REVIEW_VIEW_BY_TYPE[source.type] ? () => handleReviewSource(source) : undefined}
                onAddFile={undefined}
            />
        );
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {!selectedPlantId ? (
                <LockedState />
            ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-8">
                    <SharedSourceHeader
                        actions={
                            <SegmentedControl
                                ariaLabel="Switch between source cards and the file list"
                                options={VIEW_TABS}
                                value={activeTab}
                                onChange={handleTabChange}
                            />
                        }
                    />

                    {/* Minimized pipeline run docks here, directly under the heading —
                        it renders itself only while a run is minimized. A run is
                        global to the plant, so it stays visible on both tabs. */}
                    <PipelineRunDock />

                    {activeTab === TAB_SOURCES && (
                        configuredSources.length > 0 ? (
                            <div className="space-y-6">
                                {unprocessedEntries.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="text-label font-bold text-warning uppercase tracking-widest">Unprocessed</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-caption text-text-subtle">
                                                    {unprocessedEntries.length} source{unprocessedEntries.length !== 1 ? 's' : ''} pending processing
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={isUnprocessedProcessDisabled}
                                                    onClick={handleProcessUnprocessed}
                                                    aria-busy={pnidPipelineRunning}
                                                    className={cn(
                                                        'flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-label font-bold',
                                                        'bg-brand/10 text-brand border border-brand/20',
                                                        'hover:bg-brand/15 hover:border-brand/30 transition-all cursor-pointer',
                                                        isUnprocessedProcessDisabled && 'opacity-50 cursor-not-allowed grayscale',
                                                    )}
                                                >
                                                    <Cpu size={12} />
                                                    Process New Files
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            {unprocessedEntries.map(s => renderSourceCard(s, true))}
                                        </div>
                                    </div>
                                )}

                                {processedEntries.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="text-label font-bold text-text-muted uppercase tracking-widest">Processed</h3>
                                            <span className="text-caption text-text-subtle">
                                                {processedEntries.length} source{processedEntries.length !== 1 ? 's' : ''} added
                                            </span>
                                        </div>
                                        <div className="space-y-2.5">
                                            {processedEntries.map(s => renderSourceCard(s, false))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <DataConfigEmptyState
                                onSelectSource={handleSelectSourceType}
                                onSelectDocType={handleSelectDocType}
                                plantCode={selectedPlantId?.name || selectedPlantId?.id || selectedPlantId}
                            />
                        )
                    )}

                    {/* Row-level view of the same data the Sources tab groups by
                        batch — one line per file, with the per-file reprocess and
                        delete actions. Reads the SAME cached /flow/state payload
                        the cards do, so switching tabs costs no extra request. */}
                    {activeTab === TAB_FILES && <FlowFilesPanel plantCode={selectedPlantId?.id} />}

                    <PageFooter>
                        <div className="flex justify-end items-center gap-4">
                            {!allProcessed && !allConfigured && configuredSources.length > 0 && !pnidPipelineRunning && (
                                <p className="text-caption text-text-muted">
                                    {missingCount} source{missingCount !== 1 ? 's' : ''} not configured
                                </p>
                            )}
                            {allProcessed ? (
                                <div className={cn(
                                    'flex items-center gap-2.5 py-3 px-8 rounded-xl font-bold text-body-sm cursor-default',
                                    'bg-success/10 text-success border border-success/30',
                                )}>
                                    <CheckCircle2 size={16} />
                                    Data Processed — Completed
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    disabled={isProcessDisabled}
                                    onClick={handleProcessDataClick}
                                    aria-busy={pnidPipelineRunning}
                                    className={cn(
                                        'flex items-center gap-2.5 py-3 px-8 rounded-xl font-bold text-body-sm',
                                        'bg-brand text-white shadow-md shadow-brand/25',
                                        'hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/30',
                                        'transition-all duration-200 cursor-pointer',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
                                        isProcessDisabled && 'opacity-50 cursor-not-allowed grayscale',
                                    )}
                                >
                                    <Cpu size={15} />
                                    Process Data
                                </button>
                            )}
                        </div>
                    </PageFooter>
                </motion.div>
            )}
        </motion.div>
    );
}
