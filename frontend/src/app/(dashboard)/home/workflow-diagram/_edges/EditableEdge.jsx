import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow, Position } from '@xyflow/react';
import { Trash2, Plus } from 'lucide-react';

export default function PipeEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data, selected }) {
    const { setEdges, screenToFlowPosition } = useReactFlow();
    const [isHovered, setIsHovered] = useState(false);

    let path = '';
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
            path += (i === 0 ? '' : ' ') + segPath;
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
        path = defaultPath;
        labelX = defLabelX;
        labelY = defLabelY;
    }

    const [isEditing, setIsEditing] = useState(false);
    const label = data?.label || 'flow';
    const flowColor = data?.flowColor || 'var(--color-text-subtle)';
    const animated = data?.animated !== false;
    const flowDirection = data?.direction || 'forward';

    const handleLabelClick = () => setIsEditing(true);

    const handleBlur = (e) => {
        const newValue = e.target.value;
        setIsEditing(false);
        setEdges(edges => edges.map(edge => edge.id === id ? { ...edge, data: { ...edge.data, label: newValue } } : edge));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const newValue = e.currentTarget.value;
            setIsEditing(false);
            setEdges(edges => edges.map(edge => edge.id === id ? { ...edge, data: { ...edge.data, label: newValue } } : edge));
        }
        if (e.key === 'Escape') setIsEditing(false);
    };

    const cycleDirection = (e) => {
        e.stopPropagation();
        const dirCycle = { forward: 'reverse', reverse: 'bidirectional', bidirectional: 'forward' };
        const nextDir = dirCycle[flowDirection] || 'forward';
        setEdges(edges => edges.map(edge => edge.id === id ? { ...edge, data: { ...edge.data, direction: nextDir } } : edge));
    };

    const cycleColor = (e) => {
        e.stopPropagation();
        const colors = [
            'var(--color-text-subtle)', 
            'var(--color-warning)', 
            'var(--color-brand)', 
            'var(--color-danger)', 
            'var(--color-success)', 
            '#8b5cf6', 
            '#f97316'
        ];
        const idx = colors.indexOf(flowColor);
        const next = colors[(idx + 1) % colors.length];
        setEdges(edges => edges.map(edge => edge.id === id ? { ...edge, data: { ...edge.data, flowColor: next } } : edge));
    };

    const onDelete = (e) => {
        e.stopPropagation();
        setEdges((eds) => eds.filter((edge) => edge.id !== id));
    };

    const addWaypointAtMidpoint = (e) => {
        e.stopPropagation();
        const midX = Math.round((sourceX + targetX) / 2);
        const midY = Math.round((sourceY + targetY) / 2);
        setEdges(eds => eds.map(edge => {
            if (edge.id !== id) return edge;
            const wps = [...(edge.data?.waypoints || [])];
            wps.push({ x: midX, y: midY });
            return { ...edge, data: { ...edge.data, waypoints: wps } };
        }));
    };

    const handlePathDoubleClick = (e) => {
        e.stopPropagation();
        const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        setEdges(eds => eds.map(edge => {
            if (edge.id !== id) return edge;
            const wps = [...(edge.data?.waypoints || [])];
            wps.push({ x: Math.round(flowPos.x), y: Math.round(flowPos.y) });
            return { ...edge, data: { ...edge.data, waypoints: wps } };
        }));
    };

    const handleWaypointDragStart = (event, index) => {
        event.stopPropagation();
        event.preventDefault();

        const handlePointerMove = (e) => {
            const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            setEdges(eds => eds.map(edge => {
                if (edge.id !== id) return edge;
                const wps = [...(edge.data?.waypoints || [])];
                wps[index] = { x: Math.round(flowPos.x), y: Math.round(flowPos.y) };
                return { ...edge, data: { ...edge.data, waypoints: wps } };
            }));
        };

        const handlePointerUp = () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    };

    const removeWaypoint = (index) => {
        setEdges(eds => eds.map(edge => {
            if (edge.id !== id) return edge;
            const wps = (edge.data?.waypoints || []).filter((_, i) => i !== index);
            return { ...edge, data: { ...edge.data, waypoints: wps } };
        }));
    };

    const arrowId = `arrow-${id}`;
    const arrowBackId = `arrow-back-${id}`;

    return (
        <g onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <defs>
                <marker id={arrowId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M 0 0 L 6 3 L 0 6 Z" fill={flowColor} />
                </marker>
                <marker id={arrowBackId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto-start-reverse">
                    <path d="M 0 0 L 6 3 L 0 6 Z" fill={flowColor} />
                </marker>
            </defs>

            <BaseEdge
                path={path}
                style={{ ...style, stroke: flowColor, strokeWidth: 4, opacity: 0.85 }}
                markerEnd={flowDirection !== 'reverse' ? `url(#${arrowId})` : undefined}
                markerStart={flowDirection === 'reverse' || flowDirection === 'bidirectional' ? `url(#${arrowBackId})` : undefined}
            />

            {animated && (
                <path d={path} fill="none" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="8 12" opacity={0.7} style={{ pointerEvents: 'none' }}>
                    <animate attributeName="stroke-dashoffset" from={flowDirection === 'reverse' ? '0' : '20'} to={flowDirection === 'reverse' ? '20' : '0'} dur="1.2s" repeatCount="indefinite" />
                </path>
            )}

            <path d={path} fill="none" stroke="transparent" strokeWidth={16} className="cursor-pointer" style={{ pointerEvents: 'all' }} onDoubleClick={handlePathDoubleClick} />

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                        zIndex: 1000,
                    }}
                    className="nodrag nopan z-[1000]"
                >
                    {isEditing ? (
                        <input
                            autoFocus
                            defaultValue={label}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="bg-surface border-2 border-brand text-caption px-2 py-1 rounded-lg shadow-lg w-28 text-center text-text-primary font-mono outline-none"
                        />
                    ) : (
                        <div className="flex items-center gap-1">
                            <div
                                onClick={handleLabelClick}
                                className="bg-surface/95 backdrop-blur-sm border border-border text-text-secondary text-label font-bold px-2.5 py-1 rounded-full shadow-md cursor-pointer hover:border-brand hover:text-brand transition-all font-mono select-none"
                                style={{ borderColor: flowColor, borderWidth: 1.5 }}
                            >
                                {label}
                            </div>
                            <button onClick={cycleDirection} className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm hover:border-brand transition-all cursor-pointer" title={`Direction: ${flowDirection} — click to cycle`} style={{ borderColor: flowColor }}>
                                <span className="text-[9px] font-black" style={{ color: flowColor }}>
                                    {flowDirection === 'forward' ? '→' : flowDirection === 'reverse' ? '←' : '↔'}
                                </span>
                            </button>
                            <button onClick={cycleColor} className="w-4 h-4 rounded-full border-2 border-surface shadow-sm hover:scale-110 transition-all cursor-pointer" style={{ background: flowColor }} title="Change pipe color" aria-label="Change pipe color" />
                            <button onClick={addWaypointAtMidpoint} className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm hover:border-brand text-text-muted hover:text-brand transition-all cursor-pointer" title="Add routing waypoint" aria-label="Add routing waypoint">
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={onDelete} className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm hover:border-danger hover:text-danger transition-all ml-1 group/del cursor-pointer" title="Delete connection" aria-label="Delete connection">
                                <Trash2 className="w-3 h-3 text-text-muted group-hover/del:text-danger" />
                            </button>
                        </div>
                    )}
                </div>

                {(isHovered || selected) && (data?.waypoints || []).map((wp, idx) => (
                    <div
                        key={wp.x + '-' + wp.y + '-' + idx}
                        style={{
                            position: 'absolute',
                            transform: 'translate(-50%, -50%)',
                            left: wp.x,
                            top: wp.y,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: 'var(--color-brand)',
                            border: '2px solid var(--color-surface)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            cursor: 'move',
                            pointerEvents: 'all',
                            zIndex: 1010,
                        }}
                        onPointerDown={(e) => handleWaypointDragStart(e, idx)}
                        onDoubleClick={(e) => { e.stopPropagation(); removeWaypoint(idx); }}
                        title="Drag to route pipe · Double click to delete point"
                    />
                ))}
            </EdgeLabelRenderer>
        </g>
    );
}
