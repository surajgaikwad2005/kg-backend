import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Tag, Database, Layers } from 'lucide-react';

/**
 * GraphSidebar — read-only inspector for a selected knowledge-graph node.
 * Shows the node's classification, properties/metadata and any extracted
 * context. Slides in from the right while a node is selected.
 */
export default function GraphSidebar({ selectedNode, onClose }) {
    return (
        <AnimatePresence>
            {selectedNode && (
                <motion.div
                    key="sidebar"
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute right-0 top-0 bottom-0 w-80 lg:w-96 bg-surface/95 backdrop-blur-xl border-l border-border shadow-[-8px_0_40px_rgba(0,0,0,0.1)] dark:shadow-[-8px_0_40px_rgba(0,0,0,0.4)] flex flex-col z-50"
                >
                    <SidebarContent selectedNode={selectedNode} onClose={onClose} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function SidebarContent({ selectedNode, onClose }) {
    const { label, name, props } = selectedNode.data;

    // Hide internal metadata from the property list.
    const displayProps = Object.entries(props || {}).filter(
        ([key]) => !['source_file', 'extracted_entities'].includes(key),
    );

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50 shrink-0">
                <div className="flex items-center gap-2 text-brand">
                    <Info className="w-5 h-5" />
                    <h3 className="font-bold tracking-tight">Node Details</h3>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="p-1.5 text-text-subtle hover:text-text-primary hover:bg-surface rounded-lg transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto thin-scrollbar p-6">
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Entity Classification */}
                    <div className="space-y-3">
                        <h4 className="text-caption font-black text-text-subtle uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Entity Classification
                        </h4>
                        <div className="inline-flex px-3 py-1 bg-brand-muted text-brand border border-brand/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                            {label}
                        </div>
                    </div>

                    {/* Properties & Metadata */}
                    <div className="space-y-3">
                        <h4 className="text-caption font-black text-text-subtle uppercase tracking-widest flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            Properties & Metadata
                        </h4>
                        <div className="bg-surface-2 rounded-2xl border border-border p-5 space-y-4">
                            <div className="space-y-1">
                                <span className="text-2xs font-black text-text-subtle uppercase tracking-widest">Name / ID</span>
                                <p className="text-sm font-semibold text-text-primary wrap-break-word">{name}</p>
                            </div>

                            {displayProps.map(([key, value]) => (
                                <div key={key} className="space-y-1">
                                    <span className="text-2xs font-black text-text-subtle uppercase tracking-widest">
                                        {key.replace(/_/g, ' ')}
                                    </span>
                                    <p className="text-sm font-medium text-text-primary wrap-break-word">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Extracted Entities Summary (if any) */}
                    {props?.extracted_entities && (
                        <div className="space-y-3">
                            <h4 className="text-caption font-black text-text-subtle uppercase tracking-widest flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Extracted Context
                            </h4>
                            <div className="bg-surface-2 rounded-2xl border border-border p-4">
                                <p className="text-xs text-text-secondary leading-relaxed line-clamp-6">
                                    {props.extracted_entities}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
