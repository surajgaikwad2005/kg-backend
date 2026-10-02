'use client';
import React, { useMemo, useCallback } from 'react';
import {
    FileCode, FileStack, History, Server,
    CheckCircle2, X, ArrowRight, Zap, FileText,
    Activity, Database, Layers
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Modal } from '@/src/components/ui/Modal';
import { DOC_TYPE_CATEGORIES } from '@/src/components/admin/admin.constants';

const SOURCE_META_MAP = {
    'P&ID': {
        name: 'P&ID Diagrams',
        icon: FileCode,
        colorCls: 'bg-brand/10 text-brand border-brand/20',
        defaultDesc: 'Process piping & instrumentation diagrams',
    },
    'Documents': {
        name: 'Technical Documents',
        icon: FileStack,
        colorCls: 'bg-info/10 text-info border-info/20',
        defaultDesc: 'Engineering manuals, datasheets & procedures',
    },
    'Historian/Timeseries': {
        name: 'Historian / Timeseries',
        icon: History,
        colorCls: 'bg-warning/10 text-warning border-warning/20',
        defaultDesc: 'Continuous process sensor data & trends',
    },
    'SAP': {
        name: 'SAP ERP Data',
        icon: Server,
        colorCls: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
        defaultDesc: 'Equipment master hierarchy & maintenance logs',
    },
};

const ALL_SOURCE_KEYS = ['P&ID', 'Documents', 'Historian/Timeseries', 'SAP'];

function formatSubtypeLabel(val) {
    if (!val) return '';
    for (const cat of DOC_TYPE_CATEGORIES || []) {
        const found = cat.types?.find(t => t.key === val || t.label === val);
        if (found) return found.label;
    }
    if (val.includes('_') || val.includes('-')) {
        return val.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return val;
}

export function ProcessDataConfirmModal({
    isOpen,
    configuredSources = [],
    configuredTypes = [],
    onClose,
    onConfirm,
    onCompleteSetup,
    onProcessAvailable,
}) {
    const handleClose = onClose || onCompleteSetup;
    const handleConfirm = useCallback(() => {
        if (onConfirm) {
            onConfirm();
        } else if (onProcessAvailable) {
            onProcessAvailable(configuredTypes);
        }
    }, [onConfirm, onProcessAvailable, configuredTypes]);

    // Breakdown computations
    const {
        activeSources,
        pnidCount,
        docSubtypes,
        docTotalFiles,
        tsCount,
        sapCount,
        totalFiles,
    } = useMemo(() => {
        const effectiveTypes = configuredTypes.length > 0
            ? configuredTypes
            : [...new Set(configuredSources.map(s => s.type))];

        const pnidEntries = configuredSources.filter(s => s.type === 'P&ID');
        const pnidFiles = pnidEntries.reduce((acc, s) => acc + (s.filesMeta?.length || 1), 0);

        const docEntries = configuredSources.filter(s => s.type === 'Documents');
        const subtypesMap = {};
        let docFiles = 0;

        docEntries.forEach(entry => {
            const rawSubtype = entry.subtype || entry.filesMeta?.[0]?.label || 'General Documents';
            const label = formatSubtypeLabel(rawSubtype);
            const count = Array.isArray(entry.filesMeta) && entry.filesMeta.length > 0 ? entry.filesMeta.length : 1;
            subtypesMap[label] = (subtypesMap[label] || 0) + count;
            docFiles += count;
        });

        const docSubtypesList = Object.entries(subtypesMap).map(([label, count]) => ({ label, count }));

        const tsEntries = configuredSources.filter(s => s.type === 'Historian/Timeseries');
        const tsFiles = tsEntries.reduce((acc, s) => acc + (s.filesMeta?.length || 1), 0);

        const sapEntries = configuredSources.filter(s => s.type === 'SAP');
        const sapTables = sapEntries.reduce((acc, s) => acc + (s.filesMeta?.length || 1), 0);

        // Filter to only display sources that are configured (or all 4 if present)
        const sourcesToShow = ALL_SOURCE_KEYS.filter(type => effectiveTypes.includes(type));
        const total = (pnidFiles || 0) + (docFiles || 0) + (tsFiles || 0) + (sapTables || 0);

        return {
            activeSources: sourcesToShow.length > 0 ? sourcesToShow : effectiveTypes,
            pnidCount: pnidFiles,
            docSubtypes: docSubtypesList,
            docTotalFiles: docFiles,
            tsCount: tsFiles,
            sapCount: sapTables,
            totalFiles: total || effectiveTypes.length,
        };
    }, [configuredSources, configuredTypes]);

    return (
        <Modal open={isOpen} onClose={handleClose} size="lg" className="overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 shadow-xs text-brand">
                        <Zap size={20} className="fill-brand/20" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h3
                                id="process-modal-title"
                                className="text-body font-extrabold text-text-primary tracking-tight"
                            >
                                Process Plant Data Sources
                            </h3>
                            <span className="text-2xs font-extrabold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20 shrink-0">
                                {totalFiles} {totalFiles === 1 ? 'Asset' : 'Total Assets'}
                            </span>
                        </div>
                        <p className="text-caption text-text-muted mt-0.5">
                            Review {activeSources.length} configured data source{activeSources.length !== 1 ? 's' : ''} queued for ingestion & knowledge graph generation
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close"
                    className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="px-6 py-5 space-y-4">
                {/* Metric Strip - only renders non-zero relevant metrics */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-2 border border-border text-caption font-semibold text-text-secondary">
                        <FileText size={13} className="text-brand shrink-0" />
                        <span><strong className="text-text-primary font-bold">{totalFiles}</strong> Total File{totalFiles !== 1 ? 's' : ''}</span>
                    </div>

                    {pnidCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-2 border border-border text-caption font-semibold text-text-secondary">
                            <FileCode size={13} className="text-brand shrink-0" />
                            <span><strong className="text-text-primary font-bold">{pnidCount}</strong> P&ID Drawing{pnidCount !== 1 ? 's' : ''}</span>
                        </div>
                    )}

                    {docTotalFiles > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-2 border border-border text-caption font-semibold text-text-secondary">
                            <FileStack size={13} className="text-info shrink-0" />
                            <span><strong className="text-text-primary font-bold">{docTotalFiles}</strong> Document{docTotalFiles !== 1 ? 's' : ''} ({docSubtypes.length} {docSubtypes.length === 1 ? 'Category' : 'Categories'})</span>
                        </div>
                    )}

                    {tsCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-2 border border-border text-caption font-semibold text-text-secondary">
                            <Activity size={13} className="text-warning shrink-0" />
                            <span><strong className="text-text-primary font-bold">{tsCount}</strong> Timeseries File{tsCount !== 1 ? 's' : ''}</span>
                        </div>
                    )}

                    {sapCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-2 border border-border text-caption font-semibold text-text-secondary">
                            <Database size={13} className="text-chart-4 shrink-0" />
                            <span><strong className="text-text-primary font-bold">{sapCount}</strong> SAP Table{sapCount !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>

                {/* Source Rows */}
                <div className="space-y-2.5">
                    {activeSources.map(type => {
                        const meta = SOURCE_META_MAP[type] || {
                            name: type,
                            icon: Layers,
                            colorCls: 'bg-brand/10 text-brand border-brand/20',
                            defaultDesc: 'Data source asset',
                        };
                        const Icon = meta.icon;

                        return (
                            <div
                                key={type}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 rounded-2xl bg-surface border border-border/80 hover:border-border-strong transition-all shadow-xs"
                            >
                                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border', meta.colorCls)}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-caption font-bold text-text-primary">
                                                {meta.name}
                                            </span>
                                            {type === 'P&ID' && pnidCount > 0 && (
                                                <span className="text-2xs text-text-muted font-medium">
                                                    · {pnidCount} P&ID Drawing{pnidCount !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {type === 'Documents' && (
                                                <span className="text-2xs text-text-muted font-medium">
                                                    · {docSubtypes.length} {docSubtypes.length === 1 ? 'Category' : 'Categories'} · {docTotalFiles} {docTotalFiles === 1 ? 'File' : 'Files'}
                                                </span>
                                            )}
                                            {type === 'Historian/Timeseries' && tsCount > 0 && (
                                                <span className="text-2xs text-text-muted font-medium">
                                                    · {tsCount} Timeseries File{tsCount !== 1 ? 's' : ''} (Excel / Sensor Trends)
                                                </span>
                                            )}
                                            {type === 'SAP' && sapCount > 0 && (
                                                <span className="text-2xs text-text-muted font-medium">
                                                    · {sapCount} Table{sapCount !== 1 ? 's' : ''} (Asset Hierarchy)
                                                </span>
                                            )}
                                        </div>

                                        {/* Multi-category badge pills for Documents */}
                                        {type === 'Documents' && docSubtypes.length > 0 ? (
                                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                                {docSubtypes.map(sub => (
                                                    <span
                                                        key={sub.label}
                                                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-2 text-text-secondary border border-border/80"
                                                    >
                                                        <span>{sub.label}</span>
                                                        <span className="font-bold text-text-primary">({sub.count})</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-caption text-text-subtle truncate">
                                                {meta.defaultDesc}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="shrink-0 flex items-center justify-end">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs font-extrabold bg-success/10 text-success border border-success/20 tracking-wider uppercase">
                                        <CheckCircle2 size={11} />
                                        Ready
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-2/40 border-t border-border/50">
                <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-xl border border-border text-body-sm font-bold text-text-muted hover:text-text-primary hover:bg-surface-2 hover:border-border-strong transition-all cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-body-sm font-bold shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/30 transition-all cursor-pointer"
                >
                    <span>Run Processing Pipeline</span>
                    <ArrowRight size={15} />
                </button>
            </div>
        </Modal>
    );
}
