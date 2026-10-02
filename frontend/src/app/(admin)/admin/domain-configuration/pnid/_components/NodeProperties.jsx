'use client';

/**
 * NodeProperties — self-contained inspector stub for the selected KG node/relationship.
 * Same prop contract as the host component (selectedNode + action callbacks).
 */
import React from 'react';
import { Pencil, Link2, Trash2, MousePointerClick } from 'lucide-react';

export default function NodeProperties({ selectedNode, onEditNode, onConnectFromNode, onDeleteNode, onDeleteRelationship }) {
    if (!selectedNode) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center text-text-subtle">
                <MousePointerClick className="w-7 h-7 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-wider">Select a node or relationship</p>
            </div>
        );
    }

    const isRel = !!selectedNode.type;
    const props = selectedNode.properties ?? {};
    const title = isRel
        ? `${selectedNode.source} → ${selectedNode.target}`
        : selectedNode.properties?.name || selectedNode.id;

    return (
        <div className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-border bg-surface-2/50">
                <p className="text-label font-black uppercase tracking-widest text-text-subtle">
                    {isRel ? `Relationship · ${selectedNode.type}` : `Entity · ${selectedNode.labels?.[0] || 'Node'}`}
                </p>
                <h3 className="text-sm font-black text-text-primary truncate mt-1">{title}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2">
                {Object.entries(props).length === 0 ? (
                    <p className="text-xs italic text-text-subtle">No properties.</p>
                ) : (
                    Object.entries(props).map(([k, v]) => (
                        <div key={k} className="flex items-start justify-between gap-3 text-xs border-b border-border/60 pb-2">
                            <span className="font-black uppercase tracking-wider text-text-subtle">{k}</span>
                            <span className="font-bold text-text-secondary text-right break-all">{String(v)}</span>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-border space-y-2">
                {isRel ? (
                    <button
                        onClick={() => onDeleteRelationship?.(selectedNode)}
                        className="w-full py-2.5 bg-danger hover:bg-danger/90 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Connection
                    </button>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => onEditNode?.(selectedNode)}
                                className="py-2.5 bg-surface-2 hover:bg-surface border border-border text-text-secondary text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                                onClick={() => onConnectFromNode?.(selectedNode)}
                                className="py-2.5 bg-brand-muted hover:bg-brand/10 border border-brand/30 text-brand text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Link2 className="w-3.5 h-3.5" /> Connect
                            </button>
                        </div>
                        <button
                            onClick={() => onDeleteNode?.(selectedNode)}
                            className="w-full py-2.5 bg-danger hover:bg-danger/90 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Entity
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
