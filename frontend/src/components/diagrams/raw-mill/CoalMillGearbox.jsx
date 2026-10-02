import React from 'react';
const CoalMillGearbox = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "GBX-101", onPointerDown, }) => {
    // Determine status color based strictly on status prop
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#22c55e';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Main Label */}
            <text x="70" y="-35" textAnchor="middle" className="fill-text-primary text-[16px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Grinding Table Base Interface (Top Cutaway) */}
            <path d="M 20 -20 L 120 -20 L 95 0 L 45 0 Z" fill="#64748b" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <line x1="30" y1="-10" x2="110" y2="-10" stroke="#475569" strokeWidth="2"/>
            
            {/* Vertical Output Shaft */}
            <rect x="55" y="0" width="30" height="25" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="60" y1="0" x2="60" y2="25" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="80" y1="0" x2="80" y2="25" stroke="#94a3b8" strokeWidth="2"/>

            {/* Thrust Bearing Housing / Top Flange */}
            <rect x="35" y="25" width="70" height="15" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="40" y="25" width="5" height="15" fill="#334155"/>
            <rect x="95" y="25" width="5" height="15" fill="#334155"/>

            {/* Upper Tapered Casing */}
            <path d="M 45 40 L 95 40 L 115 100 L 25 100 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            
            {/* Upper Casing Cooling Ribs (Horizontal) */}
            <path d="M 40 55 L 100 55" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 35 70 L 105 70" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 30 85 L 110 85" stroke="#1e293b" strokeWidth="2"/>

            {/* Lower Main Casing */}
            <rect x="20" y="100" width="100" height="60" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Lower Casing Structural Ribs (Vertical) */}
            <line x1="35" y1="100" x2="35" y2="160" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="105" y1="100" x2="105" y2="160" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="50" y1="100" x2="50" y2="115" stroke="#1e293b" strokeWidth="2"/>
            <line x1="90" y1="100" x2="90" y2="115" stroke="#1e293b" strokeWidth="2"/>
            <line x1="50" y1="145" x2="50" y2="160" stroke="#1e293b" strokeWidth="2"/>
            <line x1="90" y1="145" x2="90" y2="160" stroke="#1e293b" strokeWidth="2"/>

            {/* Oil Sight Glass */}
            <circle cx="90" cy="130" r="8" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 82 130 L 98 130" stroke="#1e293b" strokeWidth="2"/>

            {/* Right Side: Horizontal Input Assembly */}
            <path d="M 120 115 L 140 120 L 140 140 L 120 145 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="140" y="122" width="20" height="16" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <line x1="145" y1="122" x2="145" y2="138" stroke="#94a3b8" strokeWidth="1.5"/>
            
            {/* Input Flange */}
            <rect x="160" y="112" width="12" height="36" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="166" y1="112" x2="166" y2="148" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 2"/>

            {/* Left Side: Lube Oil Pumping System */}
            <rect x="-15" y="120" width="35" height="40" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="-5" y="100" width="20" height="20" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="5" cy="110" r="5" fill="#475569"/>
            
            {/* Lube Oil Piping to Top Bearing */}
            <path d="M 5 100 L 5 32 L 35 32" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M 5 100 L 5 32 L 35 32" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"/>

            {/* Heavy Base Foundation */}
            <rect x="10" y="160" width="120" height="20" fill="#334155" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="10" y1="170" x2="130" y2="170" stroke="#1e293b" strokeWidth="2"/>

            {/* Foundation Anchor Bolts */}
            <rect x="16" y="156" width="8" height="4" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="36" y="156" width="8" height="4" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="96" y="156" width="8" height="4" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="116" y="156" width="8" height="4" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>

            {/* DCS Center Status Indicator Panel */}
            <rect x="55" y="115" width="30" height="30" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2"/>
            <circle cx="70" cy="130" r="8" fill={statusColor} stroke="#0f172a" strokeWidth="1.5"/>
            <circle cx="70" cy="130" r="8" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>
            {/* Indicator Highlight */}
            <circle cx="68" cy="128" r="3" fill="#ffffff" opacity="0.6" pointerEvents="none"/>
        </g>);
};
export default CoalMillGearbox;
