import React from 'react';
const CementMillSeparator = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "SEP-02", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Top Drive Motor */}
            <rect x="85" y="0" width="30" height="30" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="92" y="-5" width="16" height="5" fill="#334155"/>
            
            {/* Gearbox / Transmission Casing */}
            <rect x="75" y="30" width="50" height="20" rx="3" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Main Cylindrical Classifier Body */}
            <rect x="40" y="50" width="120" height="100" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Internal Classifier Rotor Cage (Dashed) */}
            <rect x="55" y="60" width="90" height="80" fill="none" stroke="#64748b" strokeWidth="2.5" strokeDasharray="6 4"/>
            <line x1="100" y1="50" x2="100" y2="140" stroke="#475569" strokeWidth="4"/>
            <line x1="55" y1="100" x2="145" y2="100" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4"/>
            
            {/* Lower Conical Hopper (Fines Separation / Coarse Return) */}
            <polygon points="40,150 160,150 110,250 90,250" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="40" y1="150" x2="160" y2="150" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Cone Structure Inner Lines for DCS Detail */}
            <line x1="70" y1="150" x2="96" y2="250" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="130" y1="150" x2="104" y2="250" stroke="#cbd5e1" strokeWidth="2"/>

            {/* Side Inlet Pipe (Material + Sweeping Air) */}
            <rect x="0" y="100" width="40" height="30" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="-6" y="95" width="6" height="40" fill="#334155"/>
            {/* Inlet Flow Arrow */}
            <path d="M 10,115 L 25,115 L 20,110 M 25,115 L 20,120" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round"/>

            {/* Top Outlet Pipe (Fines + Air out to cyclones/baghouse) */}
            <rect x="160" y="60" width="50" height="40" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="210" y="55" width="6" height="50" fill="#334155"/>
            {/* Outlet Flow Arrow */}
            <path d="M 175,80 L 195,80 L 190,75 M 195,80 L 190,85" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round"/>

            {/* Bottom Outlet Pipe (Coarse reject back to mill) */}
            <rect x="90" y="250" width="20" height="30" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="85" y="280" width="30" height="6" fill="#334155"/>
            {/* Coarse Flow Arrow */}
            <path d="M 100,255 L 100,270 L 95,265 M 100,270 L 105,265" fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round"/>

            {/* Internal Flow Paths (Air/Fines rising) */}
            <path d="M 60,140 C 60,110 80,110 80,80" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3"/>
            <path d="M 140,140 C 140,110 120,110 120,80" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3"/>

            {/* Equipment Label */}
            <text x="100" y="-20" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Status Indicator */}
            <circle cx="213" cy="15" r="7" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>
            
            {/* Dynamic Status Highlight Line to denote active state along the separator body */}
            <line x1="40" y1="150" x2="40" y2="50" stroke={statusColor} strokeWidth="4" opacity="0.6"/>
        </g>);
};
export default CementMillSeparator;
