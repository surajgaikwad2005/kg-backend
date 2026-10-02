'use client';
import React, { useState, useRef } from 'react';
// 1. Precise Port Mappings (Pinned exactly to the component's outer boundaries)
const ports = {
    scrubber: { gas_in: { x: 0, y: 60 }, gas_out: { x: 60, y: 60 } },
    contactor: { gas_in: { x: 0, y: 250 }, gas_out: { x: 40, y: 0 }, lean_in: { x: 0, y: 50 }, rich_out: { x: 40, y: 300 } },
    flash: { rich_in: { x: 50, y: 50 }, gas_out: { x: 25, y: 0 }, rich_out: { x: 25, y: 100 } }, // Fixed rich_in to right side
    exchanger: { rich_in: { x: 0, y: 15 }, rich_out: { x: 100, y: 15 }, lean_in: { x: 100, y: 35 }, lean_out: { x: 0, y: 35 } },
    filter: { in: { x: 0, y: 25 }, out: { x: 40, y: 25 } },
    still: { reflux_in: { x: 35, y: 20 }, reflux_out: { x: 35, y: 50 }, still_in: { x: 35, y: 110 }, gas_out: { x: 55, y: 0 }, lean_out: { x: 0, y: 215 } },
    pump: { in: { x: 40, y: 20 }, out: { x: 0, y: 20 } },
};
// 2. Initial Draggable State
const INITIAL_NODES = {
    scrubber: { id: 'scrubber', type: 'vessel', x: 80, y: 280, status: 'normal', name: 'Inlet Scrubber', ports: ports.scrubber },
    contactor: { id: 'contactor', type: 'tower', x: 240, y: 80, status: 'normal', name: 'Glycol Contactor', ports: ports.contactor },
    pump: { id: 'pump', type: 'pump', x: 350, y: 460, status: 'warning', name: 'Glycol Pump', ports: ports.pump },
    flash: { id: 'flash', type: 'drum', x: 520, y: 220, status: 'hazard', name: 'Flash Drum', ports: ports.flash },
    exchanger: { id: 'exchanger', type: 'heatx', x: 640, y: 440, status: 'normal', name: 'Lean/Rich Exchanger', ports: ports.exchanger },
    filter: { id: 'filter', type: 'filter', x: 780, y: 360, status: 'normal', name: 'Filter', ports: ports.filter },
    still_unit: { id: 'still_unit', type: 'still', x: 880, y: 120, status: 'normal', name: 'Still Column & Reboiler', ports: ports.still },
};
// 3. Dynamic Connections Logic
const CONNECTIONS = [
    { id: 'c1', from: 'scrubber', fromPort: 'gas_out', to: 'contactor', toPort: 'gas_in', fluid: 'wet_gas' },
    { id: 'c2', from: 'contactor', fromPort: 'gas_out', fluid: 'dry_gas' },
    { id: 'c3', from: 'contactor', fromPort: 'rich_out', to: 'still_unit', toPort: 'reflux_in', fluid: 'rich_teg' },
    { id: 'c4', from: 'still_unit', fromPort: 'reflux_out', to: 'flash', toPort: 'rich_in', fluid: 'rich_teg' },
    { id: 'c5', from: 'flash', fromPort: 'gas_out', fluid: 'wet_gas' },
    { id: 'c6', from: 'flash', fromPort: 'rich_out', to: 'exchanger', toPort: 'rich_in', fluid: 'rich_teg' },
    { id: 'c7', from: 'exchanger', fromPort: 'rich_out', to: 'filter', toPort: 'in', fluid: 'rich_teg' },
    { id: 'c8', from: 'filter', fromPort: 'out', to: 'still_unit', toPort: 'still_in', fluid: 'rich_teg' },
    { id: 'c9', from: 'still_unit', fromPort: 'gas_out', fluid: 'water' },
    { id: 'c10', from: 'still_unit', fromPort: 'lean_out', to: 'exchanger', toPort: 'lean_in', fluid: 'lean_teg' },
    { id: 'c11', from: 'exchanger', fromPort: 'lean_out', to: 'pump', toPort: 'in', fluid: 'lean_teg' },
    { id: 'c12', from: 'pump', fromPort: 'out', to: 'contactor', toPort: 'lean_in', fluid: 'lean_teg' },
];
const FLUID_COLORS = {
    gas: '#eab308', lean_teg: '#10b981', rich_teg: '#d97706', water: '#0ea5e9'
};
export default function TegDetailedDiagram() {
    const [nodes, setNodes] = useState(INITIAL_NODES);
    const [draggingId, setDraggingId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1150, height: 650 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const svgRef = useRef(null);
    // --- DRAG AND PAN HANDLERS ---
    const handlePointerDown = (e, id) => {
        e.stopPropagation();
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
        if (draggingId && svgRef.current) {
            const pt = svgRef.current.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const cursorPt = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
            setNodes(prev => ({ ...prev, [draggingId]: { ...prev[draggingId], x: cursorPt.x - dragOffset.x, y: cursorPt.y - dragOffset.y } }));
            return;
        }
        if (isPanning) {
            const dx = (e.clientX - panStart.x) * (viewBox.width / (svgRef.current?.clientWidth || 1));
            const dy = (e.clientY - panStart.y) * (viewBox.height / (svgRef.current?.clientHeight || 1));
            setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };
    const handlePointerUp = () => { setDraggingId(null); setIsPanning(false); };
    // --- HIGH FIDELITY EQUIPMENT RENDERER ---
    const renderEquipment = (node) => {
        const isHazard = node.status === 'hazard';
        const isWarning = node.status === 'warning';
        const isNormal = node.status === 'normal';
        const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
        const eqProps = { fill: 'url(#equipGrad)', stroke: '#334155', strokeWidth: '2', filter: 'url(#subtleShadow)' };
        let w = 50, h = 50;
        if (node.type === 'tower') {
            w = 80;
            h = 300;
        }
        else if (node.type === 'vessel') {
            w = 60;
            h = 120;
        }
        else if (node.type === 'drum') {
            w = 50;
            h = 100;
        }
        else if (node.type === 'heatx') {
            w = 100;
            h = 40;
        }
        else if (node.type === 'still') {
            w = 120;
            h = 240;
        }
        else if (node.type === 'filter') {
            w = 40;
            h = 50;
        }
        else if (node.type === 'pump') {
            w = 40;
            h = 40;
        }
        return (<g key={node.id} transform={`translate(${node.x}, ${node.y})`} onPointerDown={(e) => handlePointerDown(e, node.id)} className="cursor-move">

                {!isNormal && (<rect width={w + 20} height={h + 20} x="-10" y="-10" fill="none" stroke={statusColor} strokeWidth="2.5" opacity="0.8" rx="8">
                        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
                    </rect>)}

                <g className={isHazard ? "animate-pulse" : ""}>
                    {node.type === 'tower' && (<g>
                            <rect width="80" height="300" rx="40" {...eqProps}/>
                            <line x1="15" y1="40" x2="65" y2="40" stroke="#475569" strokeWidth="2"/>
                            {[80, 120, 160, 200, 240].map(y => (<g key={y}>
                                    <line x1="15" y1={y} x2="60" y2={y} stroke="#475569" strokeWidth="2"/>
                                    <line x1="60" y1={y} x2="60" y2={y + 15} stroke="#475569" strokeWidth="2"/>
                                </g>))}
                            <path d="M 30 270 L 40 250 L 50 270" fill="none" stroke="#475569" strokeWidth="2"/>
                        </g>)}
                    {node.type === 'vessel' && (<g>
                            <rect width="60" height="120" rx="30" {...eqProps}/>
                            <line x1="10" y1="20" x2="50" y2="20" stroke="#475569" strokeWidth="2"/>
                        </g>)}
                    {node.type === 'drum' && <rect width="50" height="100" rx="25" {...eqProps}/>}
                    {node.type === 'heatx' && (<g>
                            <rect width="100" height="40" rx="20" {...eqProps}/>
                            <path d="M 10 20 Q 25 5 40 20 T 70 20 T 100 20" fill="none" stroke="#475569" strokeWidth="2"/>
                        </g>)}
                    {node.type === 'still' && (<g>
                            <path d="M 0 190 A 25 25 0 0 0 25 240 L 95 240 A 25 25 0 0 0 120 190 Z" {...eqProps}/>
                            <rect x="35" y="0" width="40" height="190" {...eqProps}/>
                            <path d="M 35 20 L 75 30 L 35 40 L 75 50" fill="none" stroke="#475569" strokeWidth="2"/>
                            <rect x="40" y="80" width="30" height="30" fill="none" stroke="#475569" strokeWidth="1.5"/>
                            <path d="M 40 80 L 70 110 M 40 110 L 70 80" stroke="#475569" strokeWidth="1.5"/>
                            <rect x="40" y="130" width="30" height="30" fill="none" stroke="#475569" strokeWidth="1.5"/>
                            <path d="M 40 130 L 70 160 M 40 160 L 70 130" stroke="#475569" strokeWidth="1.5"/>
                            <path d="M -5 205 L 80 205 A 10 10 0 0 1 80 225 L -5 225" fill="none" stroke="#d97706" strokeWidth="2"/>
                            <line x1="95" y1="240" x2="95" y2="210" stroke="#475569" strokeWidth="2"/>
                        </g>)}
                    {node.type === 'filter' && (<g>
                            <path d="M 0 0 L 40 0 L 30 50 L 10 50 Z" {...eqProps}/>
                            <line x1="10" y1="20" x2="30" y2="20" stroke="#475569" strokeWidth="2" strokeDasharray="3 3"/>
                        </g>)}
                    {node.type === 'pump' && (<g>
                            <circle cx="20" cy="20" r="20" {...eqProps}/>
                            <polygon points="12,12 28,20 12,28" fill="#475569"/>
                        </g>)}
                </g>

                <circle cx={w + 5} cy="-5" r="5" fill={statusColor} stroke="#ffffff" strokeWidth="1">
                    <animate attributeName="opacity" values="1;0.4;1" dur={isHazard ? "0.5s" : "2s"} repeatCount="indefinite"/>
                </circle>

                <text y={h + 22} x={w / 2} textAnchor="middle" className="text-[10px] font-black fill-text-secondary uppercase tracking-tight pointer-events-none">
                    {node.name}
                </text>
            </g>);
    };
    return (<div className="w-full h-full bg-white relative overflow-hidden font-sans border-t border-border">
            <svg ref={svgRef} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full touch-none cursor-grab active:cursor-grabbing" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onPointerDown={(e) => {
            if (e.target.closest('.cursor-move'))
                return;
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
        }}>
                <defs>
                    <linearGradient id="equipGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f1f5f9"/><stop offset="20%" stopColor="#ffffff"/><stop offset="80%" stopColor="#e2e8f0"/><stop offset="100%" stopColor="#cbd5e1"/>
                    </linearGradient>
                    <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.08"/>
                    </filter>
                    <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="#94a3b8" opacity="0.3"/>
                    </pattern>
                    {Object.values(FLUID_COLORS).map(color => (<marker key={color} id={`arrow-${color.replace('#', '')}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                            <path d="M 0 0 L 8 4 L 0 8 Z" fill={color}/>
                        </marker>))}
                </defs>

                <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.width + 2000} height={viewBox.height + 2000} fill="url(#gridPattern)"/>

                {/* --- DYNAMIC P&ID ROUTING --- */}
                <g>
                    {/* Dynamic Initial Inlet Stream attached to Scrubber */}
                    <path d={`M ${nodes.scrubber.x - 60} ${nodes.scrubber.y + 60} H ${nodes.scrubber.x}`} stroke={FLUID_COLORS.gas} strokeWidth="2.5" fill="none" strokeDasharray="6 4" markerEnd="url(#arrow-eab308)">
                        <animate attributeName="stroke-dashoffset" values="20;0" dur="0.8s" repeatCount="indefinite"/>
                    </path>
                    <text x={nodes.scrubber.x - 60} y={nodes.scrubber.y + 50} className="text-[9px] font-bold fill-text-muted uppercase pointer-events-none">Wet Gas In</text>

                    {/* Smart Connections Loop */}
                    {CONNECTIONS.map(link => {
            const from = nodes[link.from];
            const to = link.to ? nodes[link.to] : null;
            if (!from || !from.ports[link.fromPort])
                return null;
            const x1 = from.x + from.ports[link.fromPort].x;
            const y1 = from.y + from.ports[link.fromPort].y;
            let d = "";
            if (!to || !link.toPort || !to.ports[link.toPort]) {
                // Vertical Outbound Streams
                d = `M ${x1} ${y1} V ${y1 - 60}`;
            }
            else {
                const x2 = to.x + to.ports[link.toPort].x;
                const y2 = to.y + to.ports[link.toPort].y;
                const midX = x1 + (x2 - x1) / 2;
                // Edge-case overrides to prevent line-crossing when components are nearby
                if (link.id === 'c3')
                    d = `M ${x1} ${y1} H ${x1 + 60} V ${y2} H ${x2}`; // Contactor to Reflux
                else if (link.id === 'c10')
                    d = `M ${x1} ${y1} H ${x1 - 20} V ${Math.max(y1, y2) + 30} H ${x2 + 20} V ${y2} H ${x2}`; // Reboiler to Exchanger under filter
                else if (link.id === 'c12')
                    d = `M ${x1} ${y1} H ${x2 - 30} V ${y2} H ${x2}`; // Pump to Contactor
                else
                    d = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`; // Standard Midpoint Routing
            }
            const colorKey = (link.fluid === 'wet_gas' || link.fluid === 'dry_gas') ? 'gas' : link.fluid;
            const hex = FLUID_COLORS[colorKey].replace('#', '');
            return (<path key={link.id} d={d} stroke={FLUID_COLORS[colorKey]} strokeWidth="2.5" fill="none" strokeDasharray="6 4" markerEnd={`url(#arrow-${hex})`}>
                                <animate attributeName="stroke-dashoffset" values="20;0" dur="0.8s" repeatCount="indefinite"/>
                            </path>);
        })}

                    {/* Dynamic Outlet Labels attached to respective nodes */}
                    <text x={nodes.contactor.x + 40} y={nodes.contactor.y - 75} textAnchor="middle" className="text-[10px] font-bold fill-text-muted uppercase pointer-events-none">Dry Gas Out</text>
                    <text x={nodes.still_unit.x + 55} y={nodes.still_unit.y - 75} textAnchor="middle" className="text-[10px] font-bold fill-text-muted uppercase pointer-events-none">Water Vapor</text>
                    <text x={nodes.flash.x + 25} y={nodes.flash.y - 75} textAnchor="middle" className="text-[10px] font-bold fill-text-muted uppercase pointer-events-none">Flash Gas</text>
                </g>

                {/* Render Nodes on top of pipes */}
                {Object.values(nodes).map(node => renderEquipment(node))}
            </svg>
        </div>);
}
