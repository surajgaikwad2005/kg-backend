'use client';
import React, { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
const emptyPorts = {};
// PERFECTED GRID LAYOUT: Spaced out to prevent overlaps and label clipping
const INITIAL_NODES = {
    scrub_1: { id: 'scrub_1', type: 'vessel', x: 50, y: 180, status: 'normal', name: 'Suction Scrubber V-2440A', ports: emptyPorts },
    comp_1: { id: 'comp_1', type: 'compressor', x: 220, y: 180, status: 'normal', name: 'K2450 A - 1st Stage ', ports: emptyPorts },
    cool_1: { id: 'cool_1', type: 'heatx', x: 300, y: 340, status: 'normal', name: 'Cooler', ports: emptyPorts },
    asv_1: { id: 'asv_1', type: 'valve', x: 150, y: 460, status: 'normal', name: 'ASV', ports: emptyPorts },
    scrub_2: { id: 'scrub_2', type: 'vessel', x: 550, y: 340, status: 'warning', name: 'Suction Scrubber V-2440B', ports: emptyPorts },
    comp_2: { id: 'comp_2', type: 'compressor', x: 440, y: 180, status: 'normal', name: 'K2450 B - 2nd Stage', ports: emptyPorts },
    cool_2: { id: 'cool_2', type: 'heatx', x: 700, y: 80, status: 'normal', name: 'Cooler', ports: emptyPorts },
    asv_2: { id: 'asv_2', type: 'valve', x: 720, y: 240, status: 'normal', name: 'ASV', ports: emptyPorts },
    header: { id: 'header', type: 'header', x: 820, y: 180, status: 'normal', name: 'Discharge Header', ports: emptyPorts },
    // Changed to text-only and shifted X coordinate slightly right to fit the arrow
    contact: { id: 'contact', type: 'text-only', x: 880, y: 340, status: 'normal', name: 'Glycol Contactor', ports: emptyPorts },
};
const FLUID_COLORS = { gas: '#eab308' };
export default function CompressorDetailedDiagram() {
    const router = useRouter();
    const pathname = usePathname();
    const isWorkflowEditor = pathname?.includes('/Workflow_Diagram');
    const [nodes, setNodes] = useState(INITIAL_NODES);
    const [draggingId, setDraggingId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [viewBox] = useState({ x: 0, y: 0, width: 1000, height: 600 });
    const svgRef = useRef(null);
    const handlePointerDown = (e, id) => {
        if (!svgRef.current)
            return;
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPt = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        setDraggingId(id);
        setDragOffset({ x: cursorPt.x - nodes[id].x, y: cursorPt.y - nodes[id].y });
        e.target.setPointerCapture(e.pointerId);
    };
    const handlePointerMove = (e) => {
        if (!draggingId || !svgRef.current)
            return;
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPt = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        setNodes(prev => ({
            ...prev,
            [draggingId]: {
                ...prev[draggingId],
                x: cursorPt.x - dragOffset.x,
                y: cursorPt.y - dragOffset.y
            }
        }));
    };
    const handlePointerUp = () => setDraggingId(null);
    const renderPath = (d, key) => (<g key={key}>
            {/* 1. PIPE (outer wall) */}
            <path d={d} stroke="#1e293b" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

            {/* 2. FLOW (animated inside pipe) */}
            <path d={d} stroke={FLUID_COLORS.gas} strokeWidth="3" fill="none" strokeDasharray="10 10" strokeLinecap="round">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="0.6s" repeatCount="indefinite"/>
            </path>

            {/* 3. ARROW (direction indicator) */}
            <path d={d} stroke="transparent" fill="none" markerEnd="url(#arrow-gas)"/>
        </g>);
    const renderEquipment = (node) => {
        // Handle the new text-only type (off-page connection)
        if (node.type === 'text-only') {
            return (<g key={node.id} transform={`translate(${node.x}, ${node.y})`} onPointerDown={(e) => handlePointerDown(e, node.id)} className="cursor-move">
                    {/* Invisible box to make clicking and dragging the text easier */}
                    <rect x="-10" y="-5" width="130" height="30" fill="transparent"/>
                    <text y="15" x="0" textAnchor="start" className="text-[11px] font-black fill-text-secondary uppercase pointer-events-none select-none">
                        {node.name}
                    </text>
                </g>);
        }
        const isNormal = node.status === 'normal';
        const statusColor = node.status === 'hazard' ? '#ef4444' : node.status === 'warning' ? '#eab308' : '#10b981';
        const eqProps = { fill: 'url(#lightMetalGrad)', stroke: isNormal ? '#475569' : statusColor, strokeWidth: '2', filter: 'url(#softShadow)' };
        let w = 50, h = 50;
        if (node.type === 'vessel') {
            w = 60;
            h = 100;
        }
        else if (node.type === 'compressor') {
            w = 160;
            h = 60;
        }
        else if (node.type === 'heatx') {
            w = 100;
            h = 40;
        }
        else if (node.type === 'valve') {
            w = 40;
            h = 30;
        }
        else if (node.type === 'header') {
            w = 80;
            h = 40;
        }
        return (<g key={node.id} transform={`translate(${node.x}, ${node.y})`} onPointerDown={(e) => handlePointerDown(e, node.id)} onDoubleClick={() => { if (!isWorkflowEditor)
            router.push(`/compressor-details/${node.id}`); }} className="cursor-move">
                {node.status !== 'normal' && (<rect width={w + 20} height={h + 20} x="-10" y="-10" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.6" rx="8" strokeDasharray="4 4">
                        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/>
                    </rect>)}
                <g>
                    {node.type === 'vessel' && (<g>
                            <rect width="60" height="100" rx="30" {...eqProps}/>
                            <line x1="10" y1="20" x2="50" y2="20" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3"/>
                        </g>)}
                    {node.type === 'compressor' && (<g>
                            <rect width="160" height="60" rx="15" {...eqProps}/>
                            <rect x="-10" y="10" width="10" height="40" rx="4" fill="#334155" stroke="#475569" strokeWidth="1"/>
                            <rect x="160" y="10" width="10" height="40" rx="4" fill="#334155" stroke="#475569" strokeWidth="1"/>
                            <rect x="-15" y="27" width="190" height="6" fill="#94a3b8" rx="2"/>
                            {[20, 45, 68, 88, 106, 122].map((sx, i) => (<path key={i} d={`M ${sx} ${15 + i} L ${sx + 8} ${18 + i} V ${42 - i} L ${sx} ${45 - i} Z`} fill="none" stroke="#475569" strokeWidth="1.5"/>))}
                        </g>)}
                    {node.type === 'heatx' && (<g>
                            <rect width="100" height="40" rx="20" {...eqProps}/>
                            <path d="M 10 20 Q 25 5 40 20 T 70 20 T 100 20" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
                        </g>)}
                    {node.type === 'valve' && (<g>
                            <polygon points="0,0 0,30 20,15" {...eqProps}/>
                            <polygon points="40,0 40,30 20,15" {...eqProps}/>
                        </g>)}
                    {node.type === 'header' && (<g>
                            <rect width="80" height="40" rx="4" {...eqProps}/>
                            <line x1="10" y1="20" x2="70" y2="20" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3"/>
                        </g>)}
                </g>
                <circle cx={w + 5} cy="-5" r="5" fill={statusColor} stroke="#fff" strokeWidth="1.5"/>
                <text y={h + 26} x={w / 2} textAnchor="middle" className="text-[10px] font-black fill-text-secondary uppercase pointer-events-none select-none">{node.name}</text>
            </g>);
    };
    // --- REWIRED FLOW PATHS ---
    const flowPaths = [
        `M 10 ${nodes.scrub_1.y + 50} H ${nodes.scrub_1.x}`,
        // Scrub 1 -> Comp 1
        `M ${nodes.scrub_1.x + 30} ${nodes.scrub_1.y} V ${nodes.comp_1.y - 30} H ${nodes.comp_1.x - 30} V ${nodes.comp_1.y + 30} H ${nodes.comp_1.x}`,
        // Comp 1 -> Cool 1 
        `M ${nodes.comp_1.x + 140} ${nodes.comp_1.y + 60} V ${nodes.cool_1.y + 20} H ${nodes.cool_1.x}`,
        // Cool 1 -> Scrub 2
        `M ${nodes.cool_1.x + 100} ${nodes.cool_1.y + 20} H ${nodes.cool_1.x + 120} V ${nodes.scrub_2.y + 50} H ${nodes.scrub_2.x}`,
        // ASV 1 Recycle
        `M ${nodes.cool_1.x + 120} ${nodes.cool_1.y + 20} V ${nodes.asv_1.y + 15} H ${nodes.asv_1.x + 40}`,
        `M ${nodes.asv_1.x} ${nodes.asv_1.y + 15} H ${nodes.scrub_1.x - 30} V ${nodes.scrub_1.y + 50} H ${nodes.scrub_1.x}`,
        // Scrub 2 -> Comp 2 
        `M ${nodes.scrub_2.x + 30} ${nodes.scrub_2.y} V ${nodes.comp_2.y + 30} H ${nodes.comp_2.x + 160}`,
        // Comp 2 -> Cool 2 
        `M ${nodes.comp_2.x + 100} ${nodes.comp_2.y} V ${nodes.cool_2.y + 20} H ${nodes.cool_2.x}`,
        // Cool 2 -> Header
        `M ${nodes.cool_2.x + 100} ${nodes.cool_2.y + 20} H ${nodes.header.x + 40} V ${nodes.header.y}`,
        // ASV 2 Recycle
        `M ${nodes.header.x + 40} ${nodes.cool_2.y + 20} V ${nodes.asv_2.y + 15} H ${nodes.asv_2.x + 40}`,
        `M ${nodes.asv_2.x} ${nodes.asv_2.y + 15} H ${nodes.asv_2.x - 30} V ${nodes.scrub_2.y + 50} H ${nodes.scrub_2.x + 60}`,
        // Header -> Text block (Points precisely to the start of the text)
        `M ${nodes.header.x + 40} ${nodes.header.y + 40} V ${nodes.contact.y + 10} H ${nodes.contact.x - 10}`
    ];
    return (<svg ref={svgRef} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} className="w-full h-full bg-surface relative overflow-hidden border-t border-border/40 touch-none" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
            <defs>
                <linearGradient id="lightMetalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e2e8f0"/>
                    <stop offset="50%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#cbd5e1"/>
                </linearGradient>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.08"/>
                </filter>
                <marker id="arrow-gas" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M 0 0 L 8 4 L 0 8 Z" fill={FLUID_COLORS.gas}/>
                </marker>
            </defs>

            <g>
                {flowPaths.map((pathStr, index) => renderPath(pathStr, `path-${index}`))}
            </g>

            {Object.values(nodes).map(node => renderEquipment(node))}
        </svg>);
}
