'use client';

import React from 'react';
import { Skeleton } from '@/src/components/ui/Skeleton';

/**
 * KnowledgeGraphSkeleton — canvas-shaped loading placeholder that mirrors the
 * live graph: the top-left control bar, the bottom-left legend card, and a
 * force-directed cluster of orb nodes joined by edges.
 *
 * Each orb and legend row is staggered so the shimmer wave rolls outward from
 * the hub node rather than every element flashing in lockstep.
 */
const NODES = [
    { id: 'hub', x: 50, y: 50, size: 76 },
    { id: 'n1',  x: 24, y: 26, size: 50 },
    { id: 'n2',  x: 76, y: 22, size: 46 },
    { id: 'n3',  x: 15, y: 64, size: 42 },
    { id: 'n4',  x: 84, y: 68, size: 52 },
    { id: 'n5',  x: 50, y: 13, size: 36 },
    { id: 'n6',  x: 40, y: 87, size: 38 },
    { id: 'n7',  x: 90, y: 45, size: 32 },
];

const EDGES = [
    ['hub', 'n1'], ['hub', 'n2'], ['hub', 'n3'], ['hub', 'n4'],
    ['hub', 'n5'], ['hub', 'n6'], ['hub', 'n7'],
    ['n1',  'n5'], ['n2',  'n7'], ['n3',  'n6'],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

const LEGEND_ROWS = ['legend-1', 'legend-2', 'legend-3', 'legend-4'];

function LegendCardSkeleton() {
    return (
        <div className="absolute bottom-5 left-5 z-10 w-56 rounded-2xl border border-border bg-surface/90 backdrop-blur-xl shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5">
                <Skeleton delay={0}    className="h-3.5 w-3.5 rounded-full" />
                <Skeleton delay={0.03} className="h-3 w-16 rounded" />
                <span className="flex-1" />
                <Skeleton delay={0.05} className="h-3 w-5 rounded" />
            </div>
            <div className="px-3 pb-3 pt-0.5 flex flex-col gap-2.5">
                {LEGEND_ROWS.map((rowKey, i) => (
                    <div key={rowKey} className="flex items-center gap-2">
                        <Skeleton delay={+(0.07 + i * 0.06).toFixed(2)} className="h-2.5 w-2.5 rounded-full" />
                        <Skeleton delay={+(0.09 + i * 0.06).toFixed(2)} className="h-3 flex-1 rounded" />
                        <Skeleton delay={+(0.11 + i * 0.06).toFixed(2)} className="h-3 w-4 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function KnowledgeGraphSkeleton() {
    return (
        <div
            className="absolute inset-0 overflow-hidden animate-in fade-in duration-300"
            aria-busy="true"
            aria-label="Loading knowledge graph"
        >
            {/* Top-left control bar (node limit · New · Magnify) */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <Skeleton delay={0}    className="h-9 w-48 rounded-xl" />
                <Skeleton delay={0.05} className="h-9 w-20 rounded-lg" />
                <Skeleton delay={0.09} className="h-9 w-24 rounded-lg" />
            </div>

            {/* Bottom-left legend */}
            <LegendCardSkeleton />

            {/* Orb cluster */}
            <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="relative w-full max-w-3xl aspect-5/4">
                    {/* Edges — pulsed opacity tied to their source node's phase */}
                    <svg
                        className="absolute inset-0 h-full w-full text-border"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        {EDGES.map(([a, b], i) => {
                            const s = byId[a];
                            const t = byId[b];
                            return (
                                <line
                                    key={`${a}-${b}`}
                                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                                    stroke="currentColor"
                                    strokeWidth={1.25}
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                    className="opacity-40"
                                    style={{ animation: `pulse 1.5s linear ${+(i * 0.07).toFixed(2)}s infinite` }}
                                />
                            );
                        })}
                    </svg>

                    {/* Orbs — hub first (index 0 = 0 s delay), then satellites staggered outward */}
                    {NODES.map((n, i) => {
                        const orbDelay  = +(i * 0.08).toFixed(2);
                        const labelDelay = +(orbDelay + 0.04).toFixed(2);
                        return (
                            <div
                                key={n.id}
                                className="absolute flex flex-col items-center gap-2 -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                            >
                                <Skeleton
                                    delay={orbDelay}
                                    className="rounded-full border-2 border-surface shadow-card"
                                    style={{ width: n.size, height: n.size }}
                                />
                                <Skeleton
                                    delay={labelDelay}
                                    className="h-3.5 rounded-full"
                                    style={{ width: Math.max(n.size * 0.9, 44) }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
