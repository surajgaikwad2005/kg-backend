import React from 'react';
import { cn } from '@/src/lib/utils';
import { GROUP_CONFIG, groupColor } from './groups';

export { groupColor };

/**
 * GraphMiniMap — custom SVG-based preview map driven directly by live Cytoscape state.
 */
export default function GraphMiniMap({ embedded = false, className, style, cyRef, mapTick, ...props }) {
    const cy = cyRef?.current;
    
    // Default dimensions
    const width = 200;
    const height = 130;
    const padding = 12;

    if (!cy) {
        return (
            <div
                className={cn(
                    'bg-surface overflow-hidden relative select-none pointer-events-none',
                    embedded
                        ? 'static! inset-auto! m-0! rounded-none border-0 shadow-none'
                        : 'rounded-xl border border-border shadow-card',
                    className,
                )}
                style={{
                    width: embedded ? `${width}px` : '100%',
                    height: embedded ? `${height}px` : '100%',
                    ...style,
                }}
            />
        );
    }

    const cyNodes = cy.nodes();
    const nodesList = cyNodes.map(node => {
        return {
            id: node.id(),
            position: node.position(),
            selected: node.selected(),
            color: node.style('background-color'),
        };
    });

    const viewportExtent = cy.extent();
    const showViewport = typeof viewportExtent.x1 === 'number' && nodesList.length > 0;

    // Determine bounding box of all nodes AND viewport extent
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    nodesList.forEach(n => {
        const x = n.position?.x ?? 0;
        const y = n.position?.y ?? 0;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    });

    // Expand boundaries to include the viewport box so it never gets clipped or drawn offscreen
    if (showViewport) {
        if (viewportExtent.x1 < minX) minX = viewportExtent.x1;
        if (viewportExtent.x2 > maxX) maxX = viewportExtent.x2;
        if (viewportExtent.y1 < minY) minY = viewportExtent.y1;
        if (viewportExtent.y2 > maxY) maxY = viewportExtent.y2;
    }

    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;

    // Viewport scaling functions
    const scaleX = (x) => padding + ((x - minX) / dx) * (width - 2 * padding);
    const scaleY = (y) => padding + ((y - minY) / dy) * (height - 2 * padding);

    return (
        <div
            className={cn(
                'bg-surface overflow-hidden relative select-none pointer-events-none',
                embedded
                    ? 'static! inset-auto! m-0! rounded-none border-0 shadow-none'
                    : 'rounded-xl border border-border shadow-card',
                className,
            )}
            style={{
                width: embedded ? `${width}px` : '100%',
                height: embedded ? `${height}px` : '100%',
                ...style,
            }}
            {...props}
        >
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full opacity-80"
            >
                {/* Viewport Box Overlay (indicating current visible section) */}
                {showViewport && (
                    <rect
                        x={scaleX(viewportExtent.x1)}
                        y={scaleY(viewportExtent.y1)}
                        width={scaleX(viewportExtent.x2) - scaleX(viewportExtent.x1)}
                        height={scaleY(viewportExtent.y2) - scaleY(viewportExtent.y1)}
                        fill="rgba(59, 130, 246, 0.05)"
                        stroke="rgba(59, 130, 246, 0.55)"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        rx={1.5}
                    />
                )}

                {nodesList.map(n => {
                    const px = scaleX(n.position.x);
                    const py = scaleY(n.position.y);
                    const isSelected = n.selected;

                    return (
                        <circle
                            key={n.id}
                            cx={px}
                            cy={py}
                            r={isSelected ? 4 : 2.2}
                            fill={n.color}
                            stroke={isSelected ? '#ffffff' : 'none'}
                            strokeWidth={isSelected ? 1.2 : 0}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
