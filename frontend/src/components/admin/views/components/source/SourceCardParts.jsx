'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { formatFileSize, getFileVisual } from '../../utils/sourceUtils';
import { itemVariants, logVariants } from '../../utils/dataConfigAnimations';

export function FileRow({ file }) {
    const { Icon, iconCls, bgCls, label } = getFileVisual(file.name, file.mimeType ?? '');
    const subtypeLabel = file.subtype || (file.role ? `${file.role.charAt(0).toUpperCase()}${file.role.slice(1)}` : null);
    return (
        <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors group"
        >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', bgCls)}>
                <Icon size={15} className={iconCls} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-caption font-semibold text-text-primary truncate" title={file.name}>
                    {file.name}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {file.label && (
                    <span className="text-2xs font-bold px-1.5 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20 max-w-36 truncate" title={file.label}>
                        {file.label}
                    </span>
                )}
                {subtypeLabel && (
                    <span className="text-2xs font-bold px-1.5 py-0.5 rounded-md bg-brand/10 text-brand uppercase tracking-wide max-w-32 truncate" title={subtypeLabel}>
                        {subtypeLabel}
                    </span>
                )}
                <span className="text-2xs font-bold px-1.5 py-0.5 rounded-md bg-surface-2 text-text-muted uppercase tracking-wide">
                    {label}
                </span>
                <span className="text-caption font-mono text-text-muted w-14 text-right">
                    {formatFileSize(file.size)}
                </span>
            </div>
        </motion.div>
    );
}

export function LogEntry({ log }) {
    return (
        <motion.div variants={logVariants} className="flex items-start gap-2 py-0.5">
            <CheckCircle size={11} className="text-success shrink-0 mt-0.5" />
            <span className="text-caption text-text-muted leading-relaxed">{log}</span>
        </motion.div>
    );
}

export function ErrorEntry({ err }) {
    return (
        <motion.div variants={logVariants} className="flex items-start gap-2 py-0.5">
            <XCircle size={11} className="text-warning shrink-0 mt-0.5" />
            <span className="text-caption text-warning leading-relaxed">{err}</span>
        </motion.div>
    );
}

export function SectionLabel({ icon: Icon, label, count }) {
    return (
        <div className="flex items-center gap-2 mb-2.5">
            <Icon size={12} className="text-text-muted" />
            <span className="text-label font-bold text-text-muted uppercase tracking-wider">{label}</span>
            {count != null && (
                <span className="text-2xs font-bold px-1.5 py-0.5 rounded-full bg-surface-2 text-text-muted">
                    {count}
                </span>
            )}
        </div>
    );
}
