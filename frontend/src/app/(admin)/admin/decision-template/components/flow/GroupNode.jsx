'use client';
import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';

const categoryHeaderColors = {
    Observe: 'text-brand border-brand/30',
    Investigate: 'text-warning border-warning/30',
    Diagnose: 'text-success border-success/30',
};

export const GroupNode = ({ data, id }) => {
    const { setNodes, setEdges } = useReactFlow();

    const onDelete = (e) => {
        e.stopPropagation();
        if (data.onDelete) {
            data.onDelete(id);
        } else {
            setNodes((nds) => nds.filter((n) => n.id !== id && n.parentId !== id));
            setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        }
    };

    const headerColor = categoryHeaderColors[data.label] || 'text-text-secondary border-border';

    return (
        <div className="w-full h-full relative p-4 group pointer-events-none">
            <div className={`absolute -top-3 left-4 bg-surface px-2 text-xs font-bold uppercase tracking-wider rounded-md border pointer-events-auto ${headerColor}`}>
                {data.label}
            </div>
            <button
                onClick={onDelete}
                className="absolute -top-3 -right-3 bg-surface rounded-full border border-border shadow-sm p-1 text-text-secondary hover:text-danger transition-colors nodrag z-10 pointer-events-auto cursor-pointer"
            aria-label="Delete group"
            >
                <X className="w-3.5 h-3.5" />
            </button>
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                className="w-3 h-3 !bg-brand !rounded-sm pointer-events-auto"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="w-3 h-3 !bg-brand !rounded-sm pointer-events-auto"
            />
        </div>
    );
};
