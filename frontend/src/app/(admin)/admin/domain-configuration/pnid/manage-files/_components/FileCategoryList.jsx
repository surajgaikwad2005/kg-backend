'use client';

/**
 * FileCategoryList — selectable file lists grouped by category, with a per-group
 * select-all (tri-state) header. Features modern animated checkboxes with Framer Motion.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Layers, Database, Upload, Check, Minus } from 'lucide-react';
import { getCategoryFiles } from '@/src/app/(admin)/admin/domain-configuration/pnid/_lib/domainConfigUtils';

const CATEGORIES = [
    { key: 'pnid', label: 'P&ID Diagrams', icon: FileText, color: 'text-brand' },
    { key: 'pfd', label: 'PFD Diagrams', icon: Layers, color: 'text-chart-5' },
    { key: 'line_list', label: 'Line Lists', icon: Database, color: 'text-success' },
    { key: 'others', label: 'Other Files', icon: Upload, color: 'text-text-muted' },
];

function AnimatedCheckbox({ checked, indeterminate = false, onChange, ariaLabel, size = 'sm' }) {
    const isSm = size === 'sm';
    const boxSizeClass = isSm ? 'w-5 h-5' : 'w-6 h-6';
    const iconSize = isSm ? 13 : 15;

    return (
        <motion.button
            type="button"
            role="checkbox"
            aria-checked={indeterminate ? 'mixed' : checked}
            aria-label={ariaLabel}
            onClick={(e) => {
                e.stopPropagation();
                onChange?.();
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{ borderRadius: 'calc(var(--do-radius) * 0.45)' }}
            className={`relative flex items-center justify-center shrink-0 border-2 transition-colors cursor-pointer select-none rounded-md ${boxSizeClass} ${
                checked
                    ? 'bg-brand border-brand text-white shadow-xs shadow-brand/20'
                    : indeterminate
                    ? 'bg-brand-muted border-brand text-brand shadow-xs'
                    : 'bg-surface border-border-strong text-transparent hover:border-brand/60 hover:bg-surface-2'
            }`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {checked && (
                    <motion.div
                        key="check"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                        <Check size={iconSize} strokeWidth={3} />
                    </motion.div>
                )}
                {!checked && indeterminate && (
                    <motion.div
                        key="minus"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                        <Minus size={iconSize} strokeWidth={3} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

function CategoryGroup({ category, files, selectedFiles, extractedFiles, onToggleFile, onToggleCategory }) {
    const { label, icon: Icon, color, key } = category;
    const allSelected = files.every((f) => selectedFiles.has(f.path));
    const someSelected = files.some((f) => selectedFiles.has(f.path));

    return (
        <div
            style={{ borderRadius: 'calc(var(--do-radius) * 2.2)' }}
            className="bg-surface border border-border shadow-card overflow-hidden rounded-2xl"
        >
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface-2/50">
                <div className="flex items-center gap-4">
                    <AnimatedCheckbox
                        checked={allSelected}
                        indeterminate={!allSelected && someSelected}
                        onChange={() => onToggleCategory(files)}
                        ariaLabel={`Toggle all ${label}`}
                        size="md"
                    />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-surface border border-border shadow-xs ${color}`}>
                        <Icon size={16} />
                    </div>
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">{label}</h3>
                    <span className="text-label font-bold px-2.5 py-0.5 rounded-full bg-surface-2 text-text-muted">{files.length} Files</span>
                    {key === 'line_list' && files.length > 0 && (
                        <span className="text-label font-bold px-2.5 py-0.5 rounded-full bg-success/10 dark:bg-success/20 text-success dark:text-success border border-success/20 dark:border-success/30">Baseline ✓</span>
                    )}
                </div>
            </div>

            <div className="divide-y divide-border">
                {files.map((file, idx) => {
                    const isSelected = selectedFiles.has(file.path);
                    const nameLower = file.name.toLowerCase();
                    const baseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
                    const pathBaseName = file.path.split('/').pop().replace(/\.[^/.]+$/, '').toLowerCase();
                    const isExtracted = extractedFiles?.has(nameLower) || extractedFiles?.has(baseName) || extractedFiles?.has(pathBaseName);
                    
                    return (
                        <div
                            key={idx}
                            onClick={() => onToggleFile(file.path)}
                            className={`flex items-center justify-between gap-4 p-4 transition-colors cursor-pointer hover:bg-surface-2 ${isSelected ? 'bg-brand-muted/40' : ''}`}
                        >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className="pl-2 shrink-0">
                                    <AnimatedCheckbox
                                        checked={isSelected}
                                        onChange={() => onToggleFile(file.path)}
                                        ariaLabel={`Select ${file.name}`}
                                        size="sm"
                                    />
                                </div>
                                <FileText className={`w-5 h-5 shrink-0 transition-colors ${isSelected ? 'text-brand' : 'text-text-subtle'}`} />
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{file.name}</p>
                                    <p className="text-2xs text-text-subtle font-medium uppercase tracking-wider truncate">{file.path}</p>
                                </div>
                            </div>
                            {isExtracted && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-black bg-success/10 text-success border border-success/30 tracking-wider uppercase shrink-0 shadow-xs">
                                    EXTRACTED
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function FileCategoryList({ clientFiles, selectedFiles, extractedFiles, onToggleFile, onToggleCategory }) {
    return (
        <div className="space-y-6">
            {CATEGORIES.map((category) => {
                const files = getCategoryFiles(clientFiles, category.key);
                if (files.length === 0) return null;
                return (
                    <CategoryGroup
                        key={category.key}
                        category={category}
                        files={files}
                        selectedFiles={selectedFiles}
                        extractedFiles={extractedFiles}
                        onToggleFile={onToggleFile}
                        onToggleCategory={onToggleCategory}
                    />
                );
            })}
        </div>
    );
}
