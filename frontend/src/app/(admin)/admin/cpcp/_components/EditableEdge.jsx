import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow, Position } from '@xyflow/react';
import { ChevronDown } from 'lucide-react';

const RELATIONSHIP_TYPES = [
    { value: 'PROCESS_FLOW', label: 'Process Flow' },
    { value: 'FLOWS_TO', label: 'Flows To' },
    { value: 'DEPENDS_ON', label: 'Depends On' },
    { value: 'OPERATES_IN_PARALLEL_WITH', label: 'Operates in Parallel With' },
    { value: 'PROTECTED_BY', label: 'Protected By' },
    { value: 'ROUTED_TO', label: 'Routed To' },
    { value: 'ISOLATED_BY', label: 'Isolated By' },
];

export default function EditableEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}) {
    const { setEdges } = useReactFlow();
    if (sourceX == null || sourceY == null || targetX == null || targetY == null || Number.isNaN(sourceX) || Number.isNaN(targetX)) {
        return null;
    }
    let edgePath = '';
    let labelX = (sourceX + targetX) / 2;
    let labelY = (sourceY + targetY) / 2;

    if (data?.waypoints && data.waypoints.length > 0) {
        const pts = [{ x: sourceX, y: sourceY }, ...data.waypoints, { x: targetX, y: targetY }];

        for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];

            let sPos = Position.Right;
            if (i === 0) {
                sPos = sourcePosition;
            } else {
                if (Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y)) {
                    sPos = p2.x > p1.x ? Position.Right : Position.Left;
                } else {
                    sPos = p2.y > p1.y ? Position.Bottom : Position.Top;
                }
            }

            let tPos = Position.Left;
            if (i === pts.length - 2) {
                tPos = targetPosition;
            } else {
                if (Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y)) {
                    tPos = p2.x > p1.x ? Position.Left : Position.Right;
                } else {
                    tPos = p2.y > p1.y ? Position.Top : Position.Bottom;
                }
            }

            const [segPath] = getSmoothStepPath({
                sourceX: p1.x, sourceY: p1.y, sourcePosition: sPos,
                targetX: p2.x, targetY: p2.y, targetPosition: tPos,
                borderRadius: 12,
            });
            edgePath += (i === 0 ? '' : ' ') + segPath;
        }

        const midIdx = Math.floor(data.waypoints.length / 2);
        labelX = data.waypoints[midIdx].x;
        labelY = data.waypoints[midIdx].y - 24;
    } else {
        const [defaultPath, defLabelX, defLabelY] = getSmoothStepPath({
            sourceX, sourceY, sourcePosition,
            targetX, targetY, targetPosition,
            borderRadius: 12,
        });
        edgePath = defaultPath;
        labelX = defLabelX;
        labelY = defLabelY;
    }

    if (data?.readOnly) {
        return (
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{ ...style, strokeWidth: 2, stroke: 'var(--color-border-strong)' }}
            />
        );
    }

    const currentRelType = data?.relationshipType || 'PROCESS_FLOW';

    const onRelationshipChange = (evt) => {
        const newValue = evt.target.value;
        setEdges((eds) =>
            eds.map((edge) =>
                edge.id === id
                    ? { ...edge, data: { ...edge.data, relationshipType: newValue } }
                    : edge
            )
        );
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: 'var(--color-border-strong)' }} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan z-10"
                >
                    <div className="relative inline-flex items-center bg-surface hover:bg-surface-2 border border-border shadow-md rounded-lg px-3 py-1.5 text-xs transition-all group cursor-pointer">
                        <select
                            value={currentRelType}
                            onChange={onRelationshipChange}
                            className="bg-transparent text-text-primary font-medium text-xs pr-5 appearance-none outline-none cursor-pointer z-10"
                        >
                            {RELATIONSHIP_TYPES.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-surface text-text-primary">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary absolute right-2 pointer-events-none stroke-[2.5]" />
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
