'use client';
import React, { useMemo, useState } from 'react';
import { Panel, useNodes, useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, ChevronDown } from 'lucide-react';

/**
 * Collapsible mini-map + zoom controls for any ReactFlow canvas in the app.
 * Must be rendered as a child of <ReactFlow> (it uses Panel/useNodes/useReactFlow).
 *
 * Mirrors the Navigator introduced in the workflow-diagram canvas so every
 * flow-based feature shares one look instead of falling back to ReactFlow's
 * default <Controls />, which ignores our design tokens entirely.
 *
 * Customise per feature via `nodeColor` (maps a node to a CSS colour) and
 * `position`; everything else is driven by the shared tokens so it responds
 * to theme, accent, radius, and density from Settings.
 */
const DEFAULT_NODE_COLOR = () => 'var(--color-brand)';

export function FlowNavigator({
    position = 'bottom-right',
    nodeColor = DEFAULT_NODE_COLOR,
    emptyLabel = 'Empty canvas',
    defaultOpen = true,
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const nodes = useNodes();
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    // A node with a parentId stores its position RELATIVE to that parent, so the
    // raw position.x/y cannot be used as canvas coordinates — walking the parent
    // chain here keeps sub-flow children in the right place on the map.
    const { viewBox, rects } = useMemo(() => {
        if (!nodes.length) return { viewBox: null, rects: [] };

        const byId = new Map(nodes.map((n) => [n.id, n]));
        const absolutePosition = (node) => {
            let { x, y } = node.position;
            const seen = new Set([node.id]);
            let parent = node.parentId ? byId.get(node.parentId) : null;
            while (parent && !seen.has(parent.id)) {
                seen.add(parent.id);
                x += parent.position.x;
                y += parent.position.y;
                parent = parent.parentId ? byId.get(parent.parentId) : null;
            }
            return { x, y };
        };

        const mapped = nodes.map((n) => {
            const { x, y } = absolutePosition(n);
            return {
                id: n.id,
                x,
                y,
                width: n.measured?.width || n.width || n.style?.width || 160,
                height: n.measured?.height || n.height || n.style?.height || 100,
                fill: nodeColor(n),
                isGroup: n.type === 'group',
            };
        });

        const pad = 40;
        const xs = mapped.flatMap((r) => [r.x, r.x + r.width]);
        const ys = mapped.flatMap((r) => [r.y, r.y + r.height]);
        const minX = Math.min(...xs) - pad;
        const minY = Math.min(...ys) - pad;
        const vbW = Math.max(Math.max(...xs) + pad - minX, 1);
        const vbH = Math.max(Math.max(...ys) + pad - minY, 1);

        return { viewBox: `${minX} ${minY} ${vbW} ${vbH}`, rects: mapped };
    }, [nodes, nodeColor]);

    const btnClass =
        'flex-1 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors duration-fast cursor-pointer';

    return (
        <Panel position={position} className="m-2.5!">
            <div
                className={`rounded-2xl overflow-hidden shadow-2xl border border-border bg-surface w-40 sm:w-48 lg:w-53 ${className}`}
            >
                <button
                    type="button"
                    onClick={() => setIsOpen((o) => !o)}
                    aria-label={isOpen ? 'Collapse navigator' : 'Expand navigator'}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between px-3 py-2 bg-surface hover:bg-surface-2 transition-colors duration-fast cursor-pointer border-b border-border"
                >
                    <span className="text-[9px] font-black text-text-muted tracking-[0.15em] uppercase select-none">
                        Navigator
                    </span>
                    <ChevronDown
                        className={`w-3.5 h-3.5 text-text-muted transition-transform duration-base ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                </button>

                <div
                    className={`overflow-hidden transition-all duration-base ease-default ${isOpen ? 'max-h-40' : 'max-h-0'}`}
                >
                    <div className="relative bg-surface-2 h-24 sm:h-30 lg:h-37.5">
                        {!viewBox ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-[9px] text-text-muted select-none">{emptyLabel}</p>
                            </div>
                        ) : (
                            <svg
                                viewBox={viewBox}
                                width="100%"
                                height="100%"
                                preserveAspectRatio="xMidYMid meet"
                                className="block p-1"
                                aria-hidden="true"
                            >
                                {/* Groups first so their children paint on top */}
                                {rects.filter((r) => r.isGroup).map((r) => (
                                    <rect
                                        key={r.id}
                                        x={r.x} y={r.y} width={r.width} height={r.height}
                                        rx="12"
                                        fill={r.fill}
                                        fillOpacity="0.12"
                                        stroke={r.fill}
                                        strokeOpacity="0.35"
                                        strokeWidth="3"
                                        strokeDasharray="10 8"
                                    />
                                ))}
                                {rects.filter((r) => !r.isGroup).map((r) => (
                                    <rect
                                        key={r.id}
                                        x={r.x} y={r.y} width={r.width} height={r.height}
                                        rx="8"
                                        fill={r.fill}
                                        fillOpacity="0.85"
                                    />
                                ))}
                            </svg>
                        )}
                    </div>
                </div>

                <div className="flex items-center px-1.5 py-1.5 bg-surface border-t border-border gap-0.5">
                    <button type="button" onClick={() => zoomIn()} aria-label="Zoom in" title="Zoom in" className={btnClass}>
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => zoomOut()} aria-label="Zoom out" title="Zoom out" className={btnClass}>
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => fitView({ duration: 400 })}
                        aria-label="Fit view"
                        title="Fit view"
                        className={btnClass}
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-border mx-0.5" />
                    <button
                        type="button"
                        onClick={() => setIsOpen((o) => !o)}
                        aria-label={isOpen ? 'Collapse navigator' : 'Expand navigator'}
                        aria-expanded={isOpen}
                        title={isOpen ? 'Collapse' : 'Expand'}
                        className={`flex-1 h-8 flex items-center justify-center rounded-lg transition-all duration-fast cursor-pointer ${
                            isOpen ? 'text-brand bg-brand/10 hover:bg-brand/20' : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                        }`}
                    >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-base ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                </div>
            </div>
        </Panel>
    );
}
