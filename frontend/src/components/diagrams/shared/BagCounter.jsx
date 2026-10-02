import React from 'react';
const BagCounter = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "BC-8100", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Structural Pillar */}
            <rect x="0" y="0" width="12" height="110" fill="#64748b" stroke="#334155" strokeWidth="2"/>
            <rect x="-5" y="110" width="22" height="6" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Main Electronics Housing */}
            <rect x="12" y="10" width="100" height="45" rx="2" fill="#e2e8f0" stroke="#334155" strokeWidth="2"/>
            
            {/* Housing Screws */}
            <circle cx="18" cy="16" r="1.5" fill="#94a3b8"/>
            <circle cx="18" cy="49" r="1.5" fill="#94a3b8"/>
            <circle cx="106" cy="16" r="1.5" fill="#94a3b8"/>
            <circle cx="106" cy="49" r="1.5" fill="#94a3b8"/>

            {/* Digital Display Area */}
            <text x="62" y="23" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="bold">BAG COUNT</text>
            <rect x="22" y="26" width="80" height="22" fill="#0f172a" stroke="#1e293b" strokeWidth="2" rx="2"/>
            <text x="62" y="42" textAnchor="middle" fill="#10b981" fontFamily="monospace" fontSize="16" fontWeight="bold" letterSpacing="2">
                0 8 5 3
            </text>

            {/* Status LED Indicator */}
            <circle cx="100" cy="18" r="3" fill={statusColor} stroke="#1e293b" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* Sensor Down-Bracket */}
            <rect x="54" y="55" width="12" height="10" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Scanning Beam / Laser */}
            <line x1="60" y1="65" x2="60" y2="80" stroke={statusColor} strokeWidth="2" strokeDasharray="3,3">
                <animate attributeName="stroke-dashoffset" values="6;0" dur="0.4s" repeatCount="indefinite"/>
            </line>

            {/* Conveyor Base / Frame */}
            <rect x="12" y="100" width="128" height="8" fill="#475569" stroke="#1e293b" strokeWidth="2"/>

            {/* Conveyor Rollers (Manually unrolled - NO .map) */}
            <circle cx="20" cy="104" r="4" fill="#94a3b8" stroke="#334155" strokeWidth="1.5"/>
            <circle cx="38" cy="104" r="4" fill="#94a3b8" stroke="#334155" strokeWidth="1.5"/>
            <circle cx="56" cy="104" r="4" fill="#94a3b8" stroke="#334155" strokeWidth="1.5"/>
            <circle cx="74" cy="104" r="4" fill="#94a3b8" stroke="#334155" strokeWidth="1.5"/>
            <circle cx="92" cy="104" r="4" fill="#94a3b8" stroke="#334155" strokeWidth="1.5"/>
            <circle cx="110" cy="104" r="4" fill="#94a3b8" stroke="#334155" strokeWidth="1.5"/>
            <circle cx="128" cy="104" r="4" fill="#94a3b8" stroke="#334155" strokeWidth="1.5"/>

            {/* Bag 1: Directly Under Sensor */}
            <g>
                <rect x="40" y="80" width="40" height="20" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="44" y1="90" x2="76" y2="90" stroke="#cbd5e1" strokeWidth="1.5"/>
                <rect x="52" y="84" width="16" height="12" rx="1" fill="#e2e8f0"/>
            </g>

            {/* Bag 2: Moving down the line */}
            <g>
                <rect x="90" y="80" width="40" height="20" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5"/>
                <line x1="94" y1="90" x2="126" y2="90" stroke="#cbd5e1" strokeWidth="1.5"/>
                <rect x="102" y="84" width="16" height="12" rx="1" fill="#e2e8f0"/>
            </g>

            {/* Equipment Tag / Label */}
            <text x="62" y="-5" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default BagCounter;
