'use client';

import React from 'react';
import { getStraightPath, useInternalNode, EdgeLabelRenderer } from '@xyflow/react';

export default function OrbEdge({ id, source, target, sourceX, sourceY, targetX, targetY, style, markerEnd, animated, label }) {
  // Retrieve the target node internal state
  const targetNode = useInternalNode(target);
  
  // Calculate target radius matching the exact visual size (including selection scaling)
  const baseSize = targetNode?.data?.size || 44;
  const targetSize = targetNode?.selected ? Math.round(baseSize * 1.2) : baseSize;
  const targetRadius = targetSize / 2;

  // Compute distance and vector from source to target
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Shorten target coordinates by the orb's radius (+ offset for arrowhead)
  const offset = targetRadius + 6; 
  const adjustedTargetX = distance > 0 ? targetX - (dx / distance) * offset : targetX;
  const adjustedTargetY = distance > 0 ? targetY - (dy / distance) * offset : targetY;

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className={`react-flow__edge-path ${animated ? 'animated' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              cursor: 'pointer',
            }}
            className="nodrag nopan"
            onClick={(e) => {
              e.stopPropagation();
              const pathEl = document.getElementById(id);
              if (pathEl) {
                pathEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
              }
            }}
          >
            <div className="bg-surface/95 backdrop-blur-xs border border-border text-text-primary text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm select-none transition-all hover:scale-105 active:scale-95">
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
