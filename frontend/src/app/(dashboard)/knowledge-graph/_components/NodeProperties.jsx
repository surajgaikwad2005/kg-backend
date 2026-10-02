import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { ShieldAlert, Activity, Droplets, Box, ClipboardList, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getTypeConfig } from '@/src/components/ui/knowledge-graph/groups';

/**
 * NodeProperties — read-only side panel for the Knowledge Graph demo.
 * All create/edit/connect/delete affordances have been removed; this renders
 * purely from `selectedNode.labels` + `selectedNode.properties`.
 */

const KPI_CONFIG = [
    { key: 'corrosion_loop',           label: 'Corrosion Loop',          icon: ShieldAlert, color: 'text-warning',    bg: 'bg-warning/10' },
    { key: 'damage_mechanism',          label: 'Damage Mechanism',         icon: Activity,   color: 'text-danger',     bg: 'bg-danger/5' },
    { key: 'material_flow',             label: 'Material Flow',            icon: Droplets,   color: 'text-brand',      bg: 'bg-brand-muted' },
    { key: 'material_of_construction',  label: 'Material of Construction', icon: Box,        color: 'text-text-muted', bg: 'bg-surface-2' },
];

const EXCLUDED_KEYS = ['corrosion_loop', 'damage_mechanism', 'material_flow', 'material_of_construction', 'detailed_specifications'];

export default function NodeProperties({ selectedNode, nodes = [], onClose, onPropertyClick }) {
    if (!selectedNode) return null;

    const isRelationship = !selectedNode?.labels && selectedNode?.type;
    const isLine = selectedNode?.labels?.includes('Pipe');

    const getNodeName = (nodeId) => {
        const found = nodes.find(n => String(n.id) === String(nodeId) || String(n.dbId) === String(nodeId));
        if (!found) return `ID: ${nodeId}`;
        return found.properties?.name || found.properties?.equipment_id || found.properties?.title || found.id;
    };

    const headerTitle = isRelationship ? 'Relationship Details' : (isLine ? 'Line Details' : 'Node Details');

    return (
        <div className="flex flex-col h-full w-full bg-surface">
            {/* Tab header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50 shrink-0">
                <div className="flex items-center gap-2 text-brand">
                    <InformationCircleIcon className="w-5 h-5" />
                    <h3 className="font-bold tracking-tight uppercase">{headerTitle}</h3>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1.5 text-text-subtle hover:text-text-primary hover:bg-surface rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto thin-scrollbar p-5">
                <div className="space-y-7">
                    {/* Labels */}
                    <section>
                        <h3 className="text-label font-black text-text-muted mb-2.5 uppercase tracking-widest">
                            {isRelationship ? 'Relationship Type' : 'Entity Classification'}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {isRelationship ? (
                                <span className="px-2.5 py-1 text-label font-black uppercase tracking-wider bg-brand-muted text-brand rounded-lg border border-brand/15">
                                    {selectedNode.type}
                                </span>
                            ) : (
                                selectedNode.labels?.map((label) => {
                                    const config = getTypeConfig(label);
                                    return (
                                        <span
                                            key={label}
                                            className="px-2.5 py-1 text-label font-black uppercase tracking-wider bg-surface-2 text-text-primary rounded-lg border border-border flex items-center gap-1.5"
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full ring-1 ring-surface shrink-0"
                                                style={{ backgroundColor: config.color }}
                                            />
                                            {label}
                                        </span>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* Connection Flow (for relationships) */}
                    {isRelationship && (
                        <section>
                            <h3 className="text-label font-black text-text-muted mb-2.5 uppercase tracking-widest">
                                Connection Flow
                            </h3>
                            <div className="bg-surface-2/50 border border-border rounded-xl p-4 space-y-3">
                                <div className="flex flex-col border-b border-border pb-3">
                                    <span className="font-bold text-text-subtle text-[10px] uppercase tracking-widest mb-1">
                                        Source Node
                                    </span>
                                    <span className="text-body-sm text-text-primary font-medium">
                                        {getNodeName(selectedNode.source)}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-text-subtle text-[10px] uppercase tracking-widest mb-1">
                                        Target Node
                                    </span>
                                    <span className="text-body-sm text-text-primary font-medium">
                                        {getNodeName(selectedNode.target)}
                                    </span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* KPI grid — pipe nodes only */}
                    {isLine && (
                        <section>
                            <h3 className="text-label font-black text-text-muted mb-2.5 uppercase tracking-widest">
                                Key Performance Indicators
                            </h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                {KPI_CONFIG.map((kpi) => (
                                    <div
                                        key={kpi.key}
                                        className="p-3 rounded-xl border border-border bg-surface shadow-card"
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className={cn('p-1.5 rounded-lg', kpi.bg)}>
                                                <kpi.icon className={cn('w-3.5 h-3.5', kpi.color)} />
                                            </div>
                                            <span className="text-2xs font-bold text-text-muted uppercase tracking-wide leading-none">
                                                {kpi.label}
                                            </span>
                                        </div>
                                        <div className="text-caption font-black text-text-primary truncate" title={selectedNode.properties?.[kpi.key] || 'N/A'}>
                                            {selectedNode.properties?.[kpi.key] || 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Detailed specifications table */}
                    {isLine && Array.isArray(selectedNode.properties?.detailed_specifications) && (
                        <section>
                            <div className="flex items-center gap-2 mb-2.5">
                                <ClipboardList className="w-3.5 h-3.5 text-text-muted" />
                                <h3 className="text-label font-black text-text-muted uppercase tracking-widest">
                                    Detailed Specifications
                                </h3>
                            </div>
                            <div className="border border-border rounded-xl overflow-hidden shadow-card">
                                <table className="w-full text-left text-caption">
                                    <thead className="bg-surface-2 border-b border-border">
                                        <tr>
                                            <th className="px-3.5 py-2 font-black text-text-muted uppercase tracking-wide">Parameter</th>
                                            <th className="px-3.5 py-2 font-black text-text-muted uppercase tracking-wide text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {selectedNode.properties.detailed_specifications.map((spec) => (
                                            <tr key={spec.parameter} className="hover:bg-surface-2/60 transition-colors">
                                                <td className="px-3.5 py-2.5 text-text-muted font-medium italic">{spec.parameter}</td>
                                                <td className="px-3.5 py-2.5 text-text-primary font-black text-right">{spec.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* General properties */}
                    <section>
                        <h3 className="text-label font-black text-text-muted mb-2.5 uppercase tracking-widest">
                            {isLine ? 'Additional Properties' : 'Properties & Metadata'}
                        </h3>
                        {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 ? (
                            <div className="bg-surface-2/50 border border-border rounded-xl p-4 space-y-3">
                                {Object.entries(selectedNode.properties)
                                    .filter(([key]) => !EXCLUDED_KEYS.includes(key))
                                    .map(([key, value]) => (
                                        <div
                                            key={key}
                                            onClick={() => onPropertyClick?.(key)}
                                            className={cn(
                                                'flex flex-col border-b border-border last:border-0 pb-3 last:pb-0',
                                                onPropertyClick && 'cursor-pointer group',
                                            )}
                                        >
                                            <span className={cn(
                                                'font-bold text-text-subtle text-2xs uppercase tracking-widest mb-1',
                                                onPropertyClick && 'group-hover:text-brand transition-colors',
                                            )}>
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-body-sm text-text-primary font-medium wrap-break-word leading-relaxed">
                                                {value === null || value === undefined ? '—' : String(value)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-body-sm text-text-subtle italic bg-surface-2/30 border border-dashed border-border rounded-xl p-4 text-center">
                                No properties.
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
