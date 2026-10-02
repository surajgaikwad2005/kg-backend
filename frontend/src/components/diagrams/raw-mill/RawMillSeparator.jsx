import React from 'react';
const RawMillSeparator = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "RMS-100", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Equipment Label */}
            <text x="75" y="-5" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Motor Drive Unit */}
            <rect x="60" y="10" width="30" height="35" rx="2" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            <line x1="60" y1="20" x2="90" y2="20" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="60" y1="30" x2="90" y2="30" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="70" y="45" width="10" height="5" fill="#475569" stroke="#1e293b" strokeWidth="2"/>

            {/* Fines/Gas Outlet Pipe (Top Right) */}
            <path d="M 120,70 L 140,70 L 140,90 L 120,90" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="135" y="65" width="8" height="30" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 148,80 L 160,80 M 155,75 L 160,80 L 155,85" fill="none" stroke="#64748b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Feed Inlet Pipe (Bottom Left) */}
            <path d="M 10,120 L 30,120 L 30,140 L 10,140" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="7" y="115" width="8" height="30" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <path d="M -5,130 L 7,130 M 2,125 L 7,130 L 2,135" fill="none" stroke="#64748b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Coarse Return Outlet Pipe (Bottom Center) */}
            <path d="M 65,220 L 65,240 L 85,240 L 85,220" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="60" y="235" width="30" height="8" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 75,245 L 75,260 M 70,255 L 75,260 L 80,255" fill="none" stroke="#64748b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Main Outer Shell (Cylinder + Cone) */}
            <path d="M 30,50 L 120,50 L 120,150 L 85,220 L 65,220 L 30,150 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            
            {/* Structural Flanges/Lines */}
            <line x1="30" y1="150" x2="120" y2="150" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="30" y1="50" x2="120" y2="50" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Inner Vortex Finder Curve */}
            <path d="M 45,50 L 45,60 C 45,65 105,65 105,60 L 105,50" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"/>

            {/* Rotating Cage / Classifier Rotor */}
            <rect x="45" y="65" width="60" height="70" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3"/>
            <line x1="55" y1="65" x2="55" y2="135" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="65" y1="65" x2="65" y2="135" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="75" y1="65" x2="75" y2="135" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="85" y1="65" x2="85" y2="135" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="95" y1="65" x2="95" y2="135" stroke="#cbd5e1" strokeWidth="2"/>

            {/* Drive Unit Indicator Status Light */}
            <circle cx="120" cy="20" r="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>
            
            {/* Casing Frame Decor */}
            <rect x="25" y="80" width="5" height="15" fill="#334155"/>
            <rect x="120" y="110" width="5" height="15" fill="#334155"/>
            <rect x="38" y="180" width="6" height="6" fill="#334155"/>
            <rect x="106" y="180" width="6" height="6" fill="#334155"/>

        </g>);
};
export default RawMillSeparator;
