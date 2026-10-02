'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, AlertTriangle, Upload, Database,
    ExternalLink, Clock, Edit2, Trash2, ChevronDown, Cpu,
    Paperclip, HardDrive, Cloud, GitBranch, Terminal, RefreshCw, Tag,
    Eye, Plus,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { fmtTime } from '@/src/lib/time';
import { formatFileSize, getFileVisual } from '../../utils/sourceUtils';
import { FileRow, LogEntry, ErrorEntry, SectionLabel } from './SourceCardParts';
import { accordionVariants, containerVariants } from '../../utils/dataConfigAnimations';
import { DOC_TYPE_CATEGORIES } from '@/src/components/admin/admin.constants';

function formatSubtypeTag(val) {
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

const statusCfg = {
    uploaded: {
        wrapCls:   'border-warning/30 bg-warning/[0.04]',
        iconBgCls: 'bg-warning/10 text-warning',
        badgeCls:  'bg-warning/10 text-warning',
        Icon: Upload,
    },
    completed: {
        wrapCls:   'border-success/20 bg-success/[0.03]',
        iconBgCls: 'bg-success/10 text-success',
        badgeCls:  'bg-success/10 text-success',
        Icon: CheckCircle2,
    },
    running: {
        wrapCls:   'border-brand/20 bg-brand/[0.03]',
        iconBgCls: 'bg-brand/10 text-brand',
        badgeCls:  'bg-brand/10 text-brand',
        Icon: () => <RefreshCw size={16} className="animate-spin" />,
    },
    failed: {
        wrapCls:   'border-danger/20 bg-danger/[0.03]',
        iconBgCls: 'bg-danger/10 text-danger',
        badgeCls:  'bg-danger/10 text-danger',
        Icon: AlertTriangle,
    },
};

export function SourceCard({ source, isExpanded, onToggle, onEdit, onDelete, onReview, onAddFile, isUnprocessed = false }) {
    const hasFiles = Array.isArray(source.filesMeta) && source.filesMeta.length > 0;
    const firstFile = hasFiles ? source.filesMeta[0] : null;
    const fileVisual = firstFile ? getFileVisual(firstFile.name, firstFile.mimeType) : null;

    const isCloud  = source.method === 'cloud';
    const isDirect = source.method === 'source';
    
    const effectiveStatus = (isUnprocessed && source.status === 'completed') ? 'uploaded' : source.status;
    const cfg = statusCfg[effectiveStatus] ?? statusCfg.failed;
    
    const CardIcon = fileVisual ? fileVisual.Icon : cfg.Icon;
    const cardIconBgCls = fileVisual ? fileVisual.bgCls : cfg.iconBgCls;
    const cardIconCls = fileVisual ? fileVisual.iconCls : '';

    const displayTitle = firstFile
        ? (source.filesMeta.length > 1 ? `${firstFile.name} (+${source.filesMeta.length - 1} more)` : firstFile.name)
        : (source.name || source.type);

    const MethodIcon = source.method === 'device' ? Upload
        : source.method === 'source'   ? Database
        : source.method === 'cloud'    ? Cloud
        : source.method === 'pipeline' ? Cpu
        : ExternalLink;

    const methodLabel = source.method === 'device'   ? 'Device Upload'
        : source.method === 'source'   ? 'Direct Connection'
        : source.method === 'pipeline' ? 'Domain Configuration'
        : `Cloud${source.cloudProvider ? ` · ${source.cloudProvider.toUpperCase()}` : ''}`;

    const formattedTotalSize = hasFiles
        ? formatFileSize(source.filesMeta.reduce((acc, f) => acc + (f.size || 0), 0))
        : null;

    return (
        <div className={cn('relative border rounded-2xl transition-all duration-200 hover:shadow-card', cfg.wrapCls)}>
            <div
                role="button"
                tabIndex={0}
                onClick={onToggle}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
                className="w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left cursor-pointer"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-xs', cardIconBgCls)}>
                        <CardIcon size={20} className={cardIconCls} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className="text-body-sm font-extrabold text-text-primary truncate max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-xl" title={displayTitle}>
                                {displayTitle}
                            </span>
                            {fileVisual && (
                                <span className={cn('text-2xs font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0', fileVisual.bgCls, fileVisual.iconCls)}>
                                    {fileVisual.label}
                                </span>
                            )}
                            <span className={cn('text-2xs font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider shrink-0', cfg.badgeCls)}>
                                {effectiveStatus === 'uploaded' ? 'UPLOADED' : source.status}
                            </span>
                            {effectiveStatus === 'failed' && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    className="group/retry relative inline-flex items-center justify-center w-5 h-5 rounded-md bg-danger/10 text-danger hover:bg-danger/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                                    aria-label="Retry upload"
                                >
                                    <RefreshCw size={11} />
                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover/retry:scale-100 group-hover/retry:opacity-100 transition-all duration-200 bg-overlay text-white text-label px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-md">
                                        Retry Upload
                                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-overlay" />
                                    </span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-caption text-text-muted flex-wrap">
                            <span className="flex items-center gap-1 font-medium"><MethodIcon size={11} />{methodLabel}</span>
                            <span className="text-border-strong">·</span>
                            <span className="flex items-center gap-1 font-medium"><Clock size={11} />{fmtTime(source.timestamp)}</span>
                            {source.category && (
                                <>
                                    <span className="text-border-strong">·</span>
                                    <span className="font-semibold text-text-secondary">{source.category}</span>
                                </>
                            )}
                            {source.subtype && (
                                <>
                                    <span className="text-border-strong">·</span>
                                    <span className="inline-flex items-center gap-1 text-2xs font-bold px-1.5 py-0.5 rounded-md bg-brand/10 text-brand">
                                        <Tag size={9} />
                                        {formatSubtypeTag(source.subtype)}
                                    </span>
                                </>
                            )}
                            {firstFile?.label && (
                                <>
                                    <span className="text-border-strong">·</span>
                                    <span className="inline-flex items-center gap-1 text-2xs font-bold px-1.5 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20">
                                        <Tag size={9} />
                                        {formatSubtypeTag(firstFile.label)}
                                    </span>
                                </>
                            )}
                            {formattedTotalSize && formattedTotalSize !== '—' && (
                                <>
                                    <span className="text-border-strong">·</span>
                                    <span className="font-mono text-caption font-semibold text-text-muted">{formattedTotalSize}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {onReview && (
                        <button type="button" onClick={onReview} className="group/btn relative p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand-muted transition-all cursor-pointer" aria-label="Review source">
                            <Eye size={13} />
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover/btn:scale-100 group-hover/btn:opacity-100 transition-all duration-200 bg-overlay text-white text-label px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-md">
                                Review Source
                                <span className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-overlay" />
                            </span>
                        </button>
                    )}
                    {onAddFile && (
                        <button type="button" onClick={onAddFile} className="group/btn relative p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand-muted transition-all cursor-pointer" aria-label="Add files">
                            <Plus size={13} />
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover/btn:scale-100 group-hover/btn:opacity-100 transition-all duration-200 bg-overlay text-white text-label px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-md">
                                Add Files
                                <span className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-overlay" />
                            </span>
                        </button>
                    )}
                    {onEdit && (
                        <button type="button" onClick={onEdit} className="group/btn relative p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand-muted transition-all cursor-pointer" aria-label="Edit source">
                            <Edit2 size={13} />
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover/btn:scale-100 group-hover/btn:opacity-100 transition-all duration-200 bg-overlay text-white text-label px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-md">
                                Edit Configuration
                                <span className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-overlay" />
                            </span>
                        </button>
                    )}
                    {onDelete && (
                        <button type="button" onClick={onDelete} className="group/btn relative p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all cursor-pointer" aria-label="Delete source">
                            <Trash2 size={13} />
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover/btn:scale-100 group-hover/btn:opacity-100 transition-all duration-200 bg-overlay text-white text-label px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-md">
                                Remove Source
                                <span className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-overlay" />
                            </span>
                        </button>
                    )}
                    <div className="w-px h-4 bg-border mx-1" />
                    <div className="group/btn relative p-1.5 rounded-lg text-text-muted cursor-pointer hover:bg-surface-2 transition-all" onClick={e => { e.stopPropagation(); onToggle(); }}>
                        <ChevronDown size={14} className={cn('transition-transform duration-300', isExpanded && 'rotate-180')} />
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover/btn:scale-100 group-hover/btn:opacity-100 transition-all duration-200 bg-overlay text-white text-label px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-md">
                            {isExpanded ? 'Collapse Details' : 'Expand Details'}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-overlay" />
                        </span>
                    </div>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div key="panel" variants={accordionVariants} initial="closed" animate="open" exit="exit" className="overflow-hidden">
                        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border/60">
                            {hasFiles && (
                                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                    <SectionLabel icon={Paperclip} label="Files" count={source.filesMeta.length} />
                                    <div className="bg-canvas rounded-xl border border-border overflow-hidden divide-y divide-border/50">
                                        {source.filesMeta.map((file, i) => <FileRow key={`${file.name}-${i}`} file={file} />)}
                                    </div>
                                </motion.div>
                            )}
                            {!hasFiles && (isCloud || isDirect) && (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
                                    <SectionLabel icon={isCloud ? Cloud : GitBranch} label="Connection" />
                                    <div className="flex items-center gap-3 p-3 bg-canvas rounded-xl border border-border">
                                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', isCloud ? 'bg-info/10 text-info' : 'bg-brand/10 text-brand')}>
                                            {isCloud ? <Cloud size={14} /> : <GitBranch size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-caption font-semibold text-text-primary">
                                                {isCloud ? `${source.cloudProvider?.toUpperCase() ?? 'Cloud'} connection configured` : 'Direct source connection configured'}
                                            </p>
                                            <p className="text-2xs text-text-subtle">{source.name}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {source.status === 'running' && (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: 0.05 }}>
                                    <SectionLabel icon={HardDrive} label="Progress" />
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-surface rounded-full h-2 overflow-hidden">
                                            <motion.div className="h-2 rounded-full bg-brand" initial={{ width: 0 }} animate={{ width: `${source.progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                                        </div>
                                        <span className="text-caption font-mono text-brand shrink-0 w-9 text-right">{source.progress}%</span>
                                    </div>
                                </motion.div>
                            )}
                            {source.logs.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: hasFiles ? 0.12 : 0.05 }}>
                                    <SectionLabel icon={Terminal} label="Process Logs" count={source.logs.length} />
                                    <div className="bg-canvas border border-border rounded-xl p-3 max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-border-strong font-mono space-y-0.5">
                                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                            {source.logs.map((log, i) => <LogEntry key={i} log={log} />)}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                            {source.errors.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: 0.18 }}>
                                    <SectionLabel icon={AlertTriangle} label="Errors" count={source.errors.length} />
                                    <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 space-y-0.5">
                                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                            {source.errors.map((err, i) => <ErrorEntry key={i} err={err} />)}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
