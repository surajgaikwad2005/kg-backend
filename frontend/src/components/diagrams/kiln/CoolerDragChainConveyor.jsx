import React from 'react';
const CoolerDragChainConveyor = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "DRAG-CONV-1", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Base Mounts */}
            <rect x="20" y="60" width="12" height="15" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <rect x="168" y="60" width="12" height="15" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <line x1="10" y1="75" x2="42" y2="75" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="158" y1="75" x2="190" y2="75" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>

            {/* Inlet Chute */}
            <path d="M 20,0 L 45,0 L 40,20 L 25,20 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            
            {/* Outlet Chute */}
            <path d="M 160,60 L 175,60 L 180,85 L 155,85 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Main Conveyor Casing / Trough */}
            <rect x="0" y="20" width="200" height="40" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Motor Shaft */}
            <rect x="195" y="34" width="15" height="12" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>

            {/* Drive Motor Unit */}
            <rect x="205" y="20" width="35" height="40" rx="4" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="238" y="25" width="6" height="30" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1.5"/>
            
            {/* Motor Cooling Fins */}
            <line x1="210" y1="28" x2="232" y2="28" stroke="#1e293b" strokeWidth="2"/>
            <line x1="210" y1="34" x2="232" y2="34" stroke="#1e293b" strokeWidth="2"/>
            <line x1="210" y1="40" x2="232" y2="40" stroke="#1e293b" strokeWidth="2"/>
            <line x1="210" y1="46" x2="232" y2="46" stroke="#1e293b" strokeWidth="2"/>

            {/* Internal Tail Sprocket */}
            <circle cx="20" cy="40" r="10" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="20" cy="40" r="4" fill="#1e293b"/>

            {/* Internal Drive Sprocket */}
            <circle cx="180" cy="40" r="10" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="180" cy="40" r="4" fill="#1e293b"/>

            {/* Drag Chain (Top Loop) */}
            <line x1="20" y1="30" x2="180" y2="30" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2"/>
            
            {/* Drag Chain (Bottom Loop) */}
            <line x1="20" y1="50" x2="180" y2="50" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2"/>

            {/* Top Paddles */}
            <line x1="35" y1="26" x2="35" y2="34" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="65" y1="26" x2="65" y2="34" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="95" y1="26" x2="95" y2="34" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="125" y1="26" x2="125" y2="34" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="155" y1="26" x2="155" y2="34" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Bottom Paddles (Dragging the clinker) */}
            <line x1="50" y1="46" x2="50" y2="54" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="80" y1="46" x2="80" y2="54" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="110" y1="46" x2="110" y2="54" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="140" y1="46" x2="140" y2="54" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="170" y1="46" x2="170" y2="54" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Equipment Tag Label */}
            <text x="100" y="-10" textAnchor="middle" className="fill-text-secondary text-[16px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Status Beacon / Light */}
            <rect x="216" y="5" width="12" height="15" fill="#1e293b" rx="2"/>
            <circle cx="222" cy="5" r="7" fill={statusColor} stroke="#0f172a" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* Motor Status LED Indicator */}
            <circle cx="215" cy="53" r="3" fill={statusColor}/>
        </g>);
};
export default CoolerDragChainConveyor;
