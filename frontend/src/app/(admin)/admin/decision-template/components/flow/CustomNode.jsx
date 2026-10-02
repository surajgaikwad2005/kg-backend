'use client';
import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';

export const CustomNode = ({ data, id }) => {
    const { setNodes, setEdges } = useReactFlow();

    const onDelete = (e) => {
        e.stopPropagation();
        if (data.onDelete) {
            data.onDelete(id);
        } else {
            setNodes((nds) => nds.filter((n) => n.id !== id));
            setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        }
    };

    const categoryColors = {
        Observe: 'border-brand/40 bg-brand-muted/50',
        Investigate: 'border-warning/40 bg-warning/10',
        Diagnose: 'border-success/40 bg-success/10',
    };

    const dotColors = {
        Observe: 'bg-brand',
        Investigate: 'bg-warning',
        Diagnose: 'bg-success',
    };

    const borderClass = categoryColors[data.type] || 'border-border bg-surface';
    const dotClass = dotColors[data.type] || 'bg-text-subtle';

    return (
        <div className={`px-4 py-2.5 shadow-sm rounded-lg border min-w-[160px] relative group ${borderClass}`}>
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-text-subtle" />

            <button
                onClick={onDelete}
                className="absolute -top-2 -right-2 bg-surface rounded-full border border-border shadow-sm p-1 text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity nodrag z-10 cursor-pointer"
            aria-label="Delete node"
            >
                <X className="w-3 h-3" />
            </button>

            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                <div className="flex flex-col min-w-0">
                    <div className="font-semibold text-text-primary text-sm truncate">{data.label}</div>
                    <div className="text-xs text-text-secondary truncate">{data.type}</div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-text-subtle" />
        </div>
    );
};
