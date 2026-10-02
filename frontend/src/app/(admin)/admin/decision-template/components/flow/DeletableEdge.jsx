'use client';
import React from 'react';
import { BaseEdge, getBezierPath, useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';

export const DeletableEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}) => {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = (evt) => {
        evt.stopPropagation();
        setEdges((edges) => edges.filter((e) => e.id !== id));
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <foreignObject
                width={20}
                height={20}
                x={labelX - 10}
                y={labelY - 10}
                className="nodrag nopan pointer-events-auto overflow-visible"
                requiredExtensions="http://www.w3.org/1999/xhtml"
            >
                <button
                    onClick={onEdgeClick}
                    className="w-5 h-5 bg-surface rounded-full border border-border flex justify-center items-center text-text-secondary hover:text-danger shadow-sm transition-colors cursor-pointer hover:bg-danger/10 hover:border-danger/20"
                >
                    <X className="w-3 h-3 pointer-events-none" />
                </button>
            </foreignObject>
        </>
    );
};
