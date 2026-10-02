import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { groupColor } from './groups';

/**
 * OrbNode — flat, solid-colour circle sized by importance (connection degree),
 * with a plain label beneath. Renders the classic ontology / knowledge-graph
 * look: large hub nodes, small leaf nodes, light radial edges.
 *
 * Driven by `data.{ name, group, size }` (size in px, supplied by the KG host).
 * Both handles sit at the node centre and are invisible, so edges connect
 * centre-to-centre and read as clean lines meeting each orb's border.
 */
const handleStyle = {
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 6,
    height: 6,
    minWidth: 0,
    minHeight: 0,
    opacity: 0,
    border: 'none',
    background: 'transparent',
    pointerEvents: 'none',
};

const OrbNode = ({ id, data, selected }) => {
    const baseSize = data.size || 44;
    const size = selected ? Math.round(baseSize * 1.2) : baseSize;
    const color = data.color || groupColor(data.group, data.label);

    // Indicators
    const isExpandable = data.isExpandable;
    const isCollapsed = data.isCollapsed;
    const hasChildren = data.hasChildren;

    return (
        <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
            <Handle type="target" position={Position.Top} style={handleStyle} isConnectable={false} />

            {/* Expandable Halo (Dashed Ring) */}
            {(isExpandable || (hasChildren && isCollapsed)) && (
                <div 
                    className="absolute rounded-full border border-dashed border-text-subtle opacity-40 group-hover:opacity-100 animate-[spin_12s_linear_infinite] transition-opacity duration-300 pointer-events-none"
                    style={{ inset: -6 }}
                />
            )}

            {/* Orb body */}
            <div
                className={`rounded-full border-[2px] border-surface/80 transition-[box-shadow,filter] duration-200 z-10 ${
                    selected ? 'ring-4 ring-brand/40' : 'hover:brightness-110'
                }`}
                style={{
                    width: size,
                    height: size,
                    background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3) 0%, transparent 60%), ${color}`,
                    boxShadow: selected 
                        ? 'inset -4px -4px 10px rgba(0,0,0,0.25), inset 2px 2px 8px rgba(255,255,255,0.4), 0 8px 24px rgba(0,0,0,0.25)' 
                        : 'inset -4px -4px 10px rgba(0,0,0,0.15), inset 2px 2px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.12)',
                }}
            />



            {/* Label beneath the orb */}
            <div
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-10 flex justify-center"
                style={{ top: size + 8, minWidth: Math.max(size * 2, 100) }}
            >
                <div className={`px-3 py-1 rounded-full backdrop-blur-md border shadow-sm transition-all duration-200 ${
                    selected 
                        ? 'bg-surface/95 border-brand/50 shadow-brand/20' 
                        : 'bg-surface/75 border-border/50'
                }`}>
                    <span
                        className={`text-[11px] font-bold tracking-wide block truncate max-w-[140px] text-center ${
                            selected ? 'text-brand' : 'text-text-secondary'
                        }`}
                        title={data.name}
                    >
                        {data.name}
                    </span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} style={handleStyle} isConnectable={false} />
        </div>
    );
};

export default memo(OrbNode);
