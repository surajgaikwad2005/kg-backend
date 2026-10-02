'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileCode, FileStack, History, Server,
    ClipboardList, Wrench, ShieldAlert, FileQuestion, FileText, Database,
} from 'lucide-react';
import { useAdminNav, useAdminEntities, usePnidForm, useDocsForm, useTsForm, useSapForm } from '@/src/components/admin/AdminPanelContext';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { getDomainSourceConfig, getSourceStatus, getUnprocessedTypes, hasActiveDocSubtype, splitSourceEntries, SOURCE_STATUS } from '@/src/components/admin/domainSources';
import { hasActiveDocType, deriveDocTypeLifecycle } from '@/src/components/admin/connectorState';
import { FEED_TYPES } from '@/src/components/admin/admin.constants';

const SOURCE_ICONS = {
    'P&ID':                 FileCode,
    'Documents':            FileStack,
    'Historian/Timeseries': History,
    'SAP':                  Server,
    'AIF':                  Database,
    'GLOC':                 Database,
    'LOPC':                 Database,
};

const VIEW_BY_TYPE = {
    'P&ID':                                     'pid-review',
    'Equipment Datasheets':                     'docs-review',
    'Inspection Reports':                       'docs-review',
    'Cause & Effect Matrix':                    'docs-review',
    'SOP (Standard Operating Procedures)':      'docs-review',
    'Start-up/Shutdown Procedures':             'docs-review',
    'Operating Manuals':                        'docs-review',
    'Log Sheets':                               'docs-review',
    'Batch Reports (Cement / Blending)':        'docs-review',
    'Maintenance Manuals':                      'docs-review',
    'RCA Reports':                              'docs-review',
    'HAZOP (Hazard and Operability Study)':     'docs-review',
    'JSA / JHA (Job Safety / Hazard Analysis)': 'docs-review',
    'MSDS / SDS (Material Safety Data Sheet)':  'docs-review',
    'Incident / Accident Reports':              'docs-review',
    'Emergency Response Plan (ERP)':            'docs-review',
    'Permit to Work (PTW)':                     'docs-review',
    'Historian/Timeseries':                     'ts-review',
    'SAP':                                       'sap-joins',
    'AIF':                                       'aif-review',
    'GLOC':                                      'gloc-review',
    'LOPC':                                      'lopc-review',
};

const CONTEXT_VIEWS = ['pid-review', 'docs-review', 'ts-review', 'sap-joins', 'sap-tables', 'sap-mapping', 'aif-review', 'gloc-review', 'lopc-review', 'integrated-review'];

const VIEW_LABELS = {
    'data-config':       'Data Configuration',
    'pid-review':        'P&ID Review',
    'docs-review':       'Documents Review',
    'ts-review':         'Timeseries Review',
    'sap-joins':         'SAP Column Join Mapping',
    'sap-tables':        'SAP Table Preview',
    'sap-mapping':       'SAP Asset Mapping',
    'aif-review':        'AIF Review',
    'gloc-review':       'GLOC Review',
    'lopc-review':       'LOPC Review',
    'integrated-review': 'Integrated Domain Intelligence Review',
};

const DOC_ROW_KEYS = [
    'equipment_datasheets', 'inspection_reports', 'cause_effect_matrix', 'sop',
    'startup_shutdown', 'operating_manuals', 'log_sheets', 'batch_reports', 'maintenance_manuals',
    'rca_reports', 'hazop', 'jsa_jha', 'msds_sds', 'incident_reports', 'erp_plan', 'ptw',
];

const STANDALONE_ROW_KEYS = ['other_files'];

/** Stable identity so a missing docs slice doesn't remint an array each render (rule 22). */
const EMPTY_FILES = [];

const DOC_ICON_BY_CATEGORY = {
    'Design Documents':              FileCode,
    'Operations Documents':          ClipboardList,
    'Maintenance Documents':         Wrench,
    'Safety & Compliance Documents': ShieldAlert,
    'Other Documents':               FileQuestion,
};

export function useSourceTabs() {
    const { view, handleSourceClick, setIsProcessModalOpen } = useAdminNav();
    const {
        selectedPlantId, configuredSources, processedSources, validatedSources, committedSources,
        processedAt, committedAt, unmarkProcessed, unmarkValidated, setDeleteConfirm,
        countsByType, configuredTypes: serverConfiguredTypes, flowFilesByFlow,
    } = useAdminEntities();
    const { pnidFiles } = usePnidForm();
    const {
        docFiles, allDocTypes, effectiveDocCategories, uploadedDocSubtypes, docCategories,
        setDocSelectedType, setDocSourceModal, setDocTab, setDocActiveCategory,
        selectedDocCategory, setSelectedDocCategory, setDocCategoryStep,
    } = useDocsForm();
    const { tsMetadataFiles, tsValuesFiles } = useTsForm();
    const { sapFiles, feedFiles } = useSapForm();
    const { userConfig, industry } = useApp();
    const { warning } = useToast();
    const router = useRouter();

    const showTabs = Boolean(selectedPlantId) && view !== 'users' && view !== 'groups';
    const viewLabel = VIEW_LABELS[view] ?? 'Data Configuration';

    const { processedEntries, unprocessedEntries } = useMemo(
        () => splitSourceEntries(configuredSources, { processedAt, committedAt }),
        [configuredSources, processedAt, committedAt]
    );

    const tabs = useMemo(() => {
        if (!showTabs) return [];

        const config = getDomainSourceConfig({ userConfig, industry });
        // Union of the two layers: the backend knows every type that has files,
        // the local list additionally knows about an upload still in flight.
        const pendingTypes = [...new Set([
            ...Object.keys(countsByType || {}).filter(t => (countsByType[t]?.unprocessed ?? 0) > 0),
            ...getUnprocessedTypes(configuredSources, { processedAt, committedAt }),
        ])];
        const requiredFirst = view === 'data-config' ? config.requiredFirst : null;
        const configuredTypes = [...new Set([
            ...(serverConfiguredTypes || []),
            ...configuredSources.filter(s => s.status !== 'failed').map(s => s.type),
        ])];
        const processedTypes  = [...processedSources];
        const validatedTypes  = [...validatedSources];
        const committedTypes  = [...committedSources];
        const isContextView   = CONTEXT_VIEWS.includes(view);

        const buildPipelineTab = (type, group) => {
            const icon = SOURCE_ICONS[type];
            const tabView = VIEW_BY_TYPE[type];
            const status = getSourceStatus(type, { configuredTypes, processedTypes, validatedTypes, committedTypes, requiredFirst });
            const isActive = type === 'SAP'
                ? ['sap-joins', 'sap-tables', 'sap-mapping'].includes(view)
                : view === tabView;

            const isPending = (() => {
                if (type === 'SAP') return sapFiles && sapFiles.length > 0;
                if (type === 'P&ID') return pnidFiles && pnidFiles.length > 0;
                if (type === 'Historian/Timeseries') return (tsMetadataFiles && tsMetadataFiles.length > 0) || (tsValuesFiles && tsValuesFiles.length > 0);
                if (FEED_TYPES.includes(type)) return feedFiles?.[type] && feedFiles[type].length > 0;
                return false;
            })();

            // Real per-file counts straight from the backend rollup. These used
            // to be derived by bucketing upload ENTRIES against a client-side
            // timestamp cutoff — which both counted the wrong unit (the label
            // says "Files") and mis-bucketed every fresh upload whenever the
            // naive-UTC parse shifted the epoch by the viewer's offset. The
            // entry-based split stays as the fallback for a plant whose state
            // hasn't loaded yet, and for uploads still only known locally.
            const serverCounts = countsByType?.[type];
            const processedCount = serverCounts
                ? serverCounts.processed
                : processedEntries.filter(s => s.type === type && s.status !== 'failed').length;
            const unprocessedCount = serverCounts
                ? serverCounts.unprocessed
                : unprocessedEntries.filter(s => s.type === type && s.status !== 'failed').length;

            let tag = null;
            if (processedCount > 0 || unprocessedCount > 0) {
                if (unprocessedCount === 0) {
                    tag = committedTypes.includes(type) ? 'Committed' : 'Processed';
                } else if (processedCount === 0) {
                    tag = `Unprocessed Files - ${unprocessedCount}`;
                } else {
                    tag = `Processed Files - ${processedCount} | Unprocessed Files - ${unprocessedCount}`;
                }
            } else if (committedTypes.includes(type)) {
                tag = 'Committed';
            } else if (processedTypes.includes(type)) {
                tag = 'Processed';
            } else if (validatedTypes.includes(type)) {
                tag = 'Validated';
            } else if (configuredTypes.includes(type)) {
                tag = 'Uploaded';
            } else if (isPending) {
                tag = 'Selected';
            }

            // FEED_TYPES (AIF/GLOC/LOPC) skip the PROCESSED stage entirely — see
            // the comment above FEED_TYPES import — so Review must unlock at
            // UPLOADED for them instead of waiting for a PROCESSED that will
            // never come. Every other type keeps the original PROCESSED/COMMITTED
            // gate. `Boolean(tabView)` still guards against wiring Review to
            // `?view=undefined` for any future type that has no VIEW_BY_TYPE entry.
            const isFeedType = FEED_TYPES.includes(type);
            const hasProcessedFiles = processedCount > 0
                || status === SOURCE_STATUS.PROCESSED
                || status === SOURCE_STATUS.COMMITTED
                || processedTypes.includes(type)
                || committedTypes.includes(type)
                || (isFeedType && (status === SOURCE_STATUS.UPLOADED || configuredTypes.includes(type)));

            // Show Review button whenever the tab has processed files (both on data-config and review page)
            const canReview = Boolean(tabView) && hasProcessedFiles;

            // Show Add More Files button to all committed, processed, and unprocessed/configured tabs
            const canAddFiles = status === SOURCE_STATUS.COMMITTED
                || status === SOURCE_STATUS.PROCESSED
                || status === SOURCE_STATUS.UPLOADED
                || status === SOURCE_STATUS.VALIDATED
                || configuredTypes.includes(type)
                || processedCount > 0
                || unprocessedCount > 0
                || (countsByType?.[type]?.filesTotal ?? 0) > 0
                || isPending;

            const canProcessNewFiles = (status === SOURCE_STATUS.PROCESSED || status === SOURCE_STATUS.COMMITTED || status === SOURCE_STATUS.UPLOADED)
                && (unprocessedCount > 0 || pendingTypes.includes(type));

            return {
                type, icon, group, view: tabView, status, tag, isActive,
                onReview: canReview ? () => router.push(`/admin/domain-configuration/data-source-integration/review?view=${tabView}`) : undefined,
                onAddFiles: canAddFiles ? () => handleSourceClick(type) : undefined,
                onProcess: canProcessNewFiles ? () => setIsProcessModalOpen(true) : undefined,
                onClick: () => {
                    if (status === SOURCE_STATUS.LOCKED) {
                        warning(
                            `Complete ${requiredFirst} first`,
                            `Set up and validate ${requiredFirst} before configuring the other sources.`,
                        );
                        return;
                    }
                    if (isContextView && tabView) {
                        if (canReview) {
                            router.push(`/admin/domain-configuration/data-source-integration/review?view=${tabView}`);
                        } else {
                            handleSourceClick(type);
                        }
                        return;
                    }
                    if (status === SOURCE_STATUS.COMMITTED) return;
                    if (view === 'data-config') {
                        if (status === SOURCE_STATUS.EMPTY) {
                            handleSourceClick(type);
                        } else if (status !== SOURCE_STATUS.LOCKED) {
                            if (status === SOURCE_STATUS.PROCESSED || status === SOURCE_STATUS.VALIDATED) {
                                setDeleteConfirm({
                                    open: true,
                                    title: 'Reconfigure Source',
                                    message: `${type} has already been processed. Reconfiguring will clear its current state and require re-processing. Continue?`,
                                    onConfirm: () => {
                                        if (status === SOURCE_STATUS.VALIDATED) unmarkValidated(type);
                                        unmarkProcessed(type);
                                        setDeleteConfirm(prev => ({ ...prev, open: false }));
                                        handleSourceClick(type);
                                    },
                                });
                                return;
                            }
                            handleSourceClick(type);
                        }
                    } else if (isContextView && tabView) {
                        router.push(`/admin/domain-configuration/data-source-integration/review?view=${tabView}`);
                    }
                },
            };
        };

        // One shared slice for all 17 doc rows — each row filters it for its own
        // subtype rather than re-reading the context per row.
        const docFlowFiles = flowFilesByFlow?.docs || EMPTY_FILES;

        const hasDocuments = config.sources.includes('Documents');
        const documentsStatus = hasDocuments
            ? getSourceStatus('Documents', { configuredTypes, processedTypes, validatedTypes, committedTypes, requiredFirst })
            : null;
        const isDocsLocked = documentsStatus === SOURCE_STATUS.LOCKED;

        const buildDocTab = (docKey, group = 'documents') => {
            const def = allDocTypes.find(t => t.key === docKey);
            const label = def?.label || docKey;
            const category = effectiveDocCategories.find(c => c.types.some(t => t.key === docKey))?.category;
            const Icon = DOC_ICON_BY_CATEGORY[category] || FileText;

            if (isDocsLocked) {
                return {
                    type: label, icon: Icon, group, view: 'docs-review', status: SOURCE_STATUS.LOCKED, tag: null, isActive: false,
                    onClick: () => warning(
                        `Complete ${requiredFirst} first`,
                        `Set up and validate ${requiredFirst} before configuring the other sources.`,
                    ),
                };
            }

            // Two matchers, because the two layers identify a subtype
            // differently: server rows carry the document-type KEY (flow/state's
            // `category`), while a local optimistic row only ever had the
            // display LABEL to go on. Checking both keeps an in-flight upload
            // visible without waiting for the server to confirm it.
            const hasUploadedFiles = hasActiveDocType(configuredSources, docKey)
                || hasActiveDocSubtype(configuredSources, label);
            const isUploaded = hasUploadedFiles || uploadedDocSubtypes.some(s => s.key === docKey);
            const hasPendingFiles = Boolean(docFiles && docFiles.some(f => f.docType === docKey));

            // Each document subtype is its OWN type: its lifecycle is a function
            // of its own files and nothing else. The connector-level Documents
            // state is never consulted here.
            //
            // It used to be. /connectors/state has only connector granularity —
            // all 17 subtypes share one monotonic `committed_at` — so reading a
            // subtype's state off it answered "has anything in Documents ever
            // been committed", which marked every subtype Committed as soon as
            // any one of them was, including subtypes holding unprocessed or
            // failed files. There is no version of that inheritance that is
            // correct, so there is no fallback to it either: a subtype the
            // server has no rows for is UPLOADED when something was just
            // uploaded locally, and EMPTY otherwise.
            const docLife = deriveDocTypeLifecycle(docFlowFiles, docKey);

            let status = SOURCE_STATUS.EMPTY;
            if (docLife.hasFiles) {
                if (docLife.allCommitted) status = SOURCE_STATUS.COMMITTED;
                else if (docLife.unprocessed > 0) status = SOURCE_STATUS.UPLOADED;
                else if (docLife.processed > 0) status = SOURCE_STATUS.PROCESSED;
                else status = SOURCE_STATUS.UPLOADED;   // failed-only
            } else if (isUploaded) {
                // Uploaded locally, server rows not in yet. UPLOADED is the only
                // thing that can honestly be claimed — the pipeline has not run.
                status = SOURCE_STATUS.UPLOADED;
            }

            // Same counts treatment buildPipelineTab gets. Without this a doc
            // row could only ever say Committed/Processed/Uploaded, with no way
            // to see that N files still need a run — the sidebar's whole job.
            let tag = null;
            if (hasPendingFiles) {
                tag = 'Pending Upload';
            } else if (docLife.hasFiles && (docLife.processed > 0 || docLife.unprocessed > 0)) {
                if (docLife.unprocessed === 0) {
                    tag = docLife.allCommitted ? 'Committed' : 'Processed';
                } else if (docLife.processed === 0) {
                    tag = `Unprocessed Files - ${docLife.unprocessed}`;
                } else {
                    tag = `Processed Files - ${docLife.processed} | Unprocessed Files - ${docLife.unprocessed}`;
                }
            } else if (status === SOURCE_STATUS.COMMITTED) tag = 'Committed';
            else if (status === SOURCE_STATUS.PROCESSED) tag = 'Processed';
            else if (status === SOURCE_STATUS.VALIDATED) tag = 'Validated';
            else if (status === SOURCE_STATUS.UPLOADED) tag = 'Uploaded';

            // Failures are invisible in the counts above (a failed file is
            // neither processed nor unprocessed), so they get their own suffix.
            if (docLife.hasFailures) {
                tag = tag ? `${tag} | Failed - ${docLife.failed}` : `Failed - ${docLife.failed}`;
            }

            const isActive = view === 'docs-review' && selectedDocCategory === docKey;

            const openUploadModal = () => {
                const categoryIdx = effectiveDocCategories.findIndex(c => c.types.some(t => t.key === docKey));
                if (categoryIdx !== -1) setDocActiveCategory(categoryIdx);
                setDocSelectedType(docKey);
                setDocTab('device');
                setDocSourceModal(true);
            };

            const goToReview = () => {
                setSelectedDocCategory(docKey);
                const stepIdx = docCategories.findIndex(c => c.id === docKey);
                setDocCategoryStep(stepIdx >= 0 ? stepIdx : 0);
                router.push('/admin/domain-configuration/data-source-integration/review?view=docs-review');
            };

            // Show Review button whenever this doc subtype has processed files (on data-config and review page)
            const canReview = Boolean(docLife.processed > 0 || docLife.allCommitted || status === SOURCE_STATUS.PROCESSED || status === SOURCE_STATUS.COMMITTED);

            // Show Add More Files button to all committed, processed, and unprocessed doc tabs
            const canAddFiles = status === SOURCE_STATUS.COMMITTED
                || status === SOURCE_STATUS.PROCESSED
                || status === SOURCE_STATUS.UPLOADED
                || docLife.hasFiles
                || isUploaded
                || hasPendingFiles;

            // Matches buildPipelineTab's canProcessNewFiles: a subtype holding
            // unprocessed files needs a way to run them.
            const canProcessNewFiles = docLife.unprocessed > 0;

            return {
                type: label, icon: Icon, group, view: 'docs-review', status, tag, isActive,
                onReview: canReview ? goToReview : undefined,
                onAddFiles: canAddFiles ? openUploadModal : undefined,
                onProcess: canProcessNewFiles ? () => setIsProcessModalOpen(true) : undefined,
                onClick: () => {
                    // Only a FULLY committed subtype is inert. Previously any
                    // subtype inheriting the connector's Committed flag became
                    // unclickable, so a row with pending files could not be
                    // opened at all.
                    if (status === SOURCE_STATUS.COMMITTED) return;
                    if (view === 'data-config') {
                        openUploadModal();
                        return;
                    }
                    if (isContextView) {
                        if (!isUploaded && !docLife.hasFiles) {
                            openUploadModal();
                            return;
                        }
                        goToReview();
                    }
                },
            };
        };

        const rows = [];

        if (config.sources.includes('P&ID')) rows.push(buildPipelineTab('P&ID', 'pnid'));
        if (hasDocuments) DOC_ROW_KEYS.forEach(key => rows.push(buildDocTab(key)));
        if (config.sources.includes('Historian/Timeseries')) rows.push(buildPipelineTab('Historian/Timeseries', 'historian'));
        if (config.sources.includes('SAP')) rows.push(buildPipelineTab('SAP', 'sap'));

        if (hasDocuments) FEED_TYPES.forEach(type => rows.push(buildPipelineTab(type, 'other')));

        // Always last — its own group, so the rail draws a divider above it and
        // it never reads as one of the Documents subtypes. Still gated on
        // hasDocuments because it uploads through the documents connector.
        if (hasDocuments) STANDALONE_ROW_KEYS.forEach(key => rows.push(buildDocTab(key, 'standalone')));

        return rows;
    }, [
        showTabs, userConfig, industry, view, configuredSources, processedSources, validatedSources, committedSources,
        countsByType, serverConfiguredTypes, flowFilesByFlow,
        processedAt, committedAt, processedEntries, unprocessedEntries, docFiles, sapFiles, pnidFiles,
        tsMetadataFiles, tsValuesFiles, feedFiles, router, handleSourceClick, setIsProcessModalOpen, warning, setDeleteConfirm,
        unmarkProcessed, unmarkValidated, allDocTypes, effectiveDocCategories, uploadedDocSubtypes, docCategories,
        setDocSelectedType, setDocSourceModal, setDocTab, setDocActiveCategory,
        selectedDocCategory, setSelectedDocCategory, setDocCategoryStep,
    ]);

    return { tabs, showTabs, view, viewLabel };
}
