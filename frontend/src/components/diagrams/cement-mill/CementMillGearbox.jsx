import React from 'react';
const CementMillGearbox = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "GB-201", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Base Mounting Plate */}
            <path d="M -15,90 L 155,90 L 155,100 L -15,100 Z" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>
            <path d="M -5,80 L 145,80 L 145,90 L -5,90 Z" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>

            {/* High-Speed Input Shaft (Motor Side) */}
            <rect x="-40" y="46" width="30" height="8" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="-45" y="40" width="5" height="20" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <path d="M -10,42 L -10,58 L -5,58 L -5,42 Z" fill="#334155"/>

            {/* Low-Speed Output Shaft (Mill Side) */}
            <rect x="140" y="35" width="40" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="180" y="25" width="10" height="50" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 140,30 L 140,70 L 145,70 L 145,30 Z" fill="#334155"/>

            {/* Main Gearbox Casing */}
            <path d="M 10,20 L 30,0 L 110,0 L 130,20 L 130,80 L 10,80 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            
            {/* Casing Structural Bevels / Depth */}
            <path d="M 15,24 L 32,5 L 108,5 L 125,24 L 125,75 L 15,75 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1"/>
            <line x1="30" y1="0" x2="30" y2="80" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="110" y1="0" x2="110" y2="80" stroke="#94a3b8" strokeWidth="2"/>

            {/* Internal Gear Schematics (High & Low speed gear rings) */}
            <circle cx="35" cy="50" r="16" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4"/>
            <circle cx="90" cy="50" r="32" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 6"/>
            
            {/* Gear Shaft Centers */}
            <circle cx="35" cy="50" r="4" fill="#334155"/>
            <circle cx="90" cy="50" r="6" fill="#334155"/>

            {/* Top Inspection Hatch */}
            <rect x="55" y="5" width="30" height="10" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="60" cy="10" r="1.5" fill="#1e293b"/>
            <circle cx="80" cy="10" r="1.5" fill="#1e293b"/>

            {/* Lube Oil System Network */}
            {/* Lube Pump & Filter block */}
            <rect x="115" y="-15" width="20" height="15" rx="1" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="125" cy="-7.5" r="4" fill="#38bdf8" stroke="#1e293b" strokeWidth="1"/>
            {/* Piping */}
            <path d="M 125,-15 L 125,-25 L 90,-25 L 90,0" fill="none" stroke="#38bdf8" strokeWidth="2"/>
            <path d="M 135,-7.5 L 145,-7.5 L 145,45 L 130,45" fill="none" stroke="#38bdf8" strokeWidth="2"/>
            
            {/* Oil Sight Glass */}
            <circle cx="120" cy="65" r="7" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 113,65 L 127,65" stroke="#1e293b" strokeWidth="1"/>
            <path d="M 114,68 A 6 6 0 0 0 126,68 Z" fill="#38bdf8"/>

            {/* Status Colored Frame Overlay */}
            <path d="M 10,20 L 30,0 L 110,0 L 130,20 L 130,80 L 10,80 Z" fill="none" stroke={statusColor} strokeWidth="3" strokeOpacity="0.8" pointerEvents="none"/>

            {/* Vibration Sensor Nodes (Status Aware) */}
            <rect x="5" y="38" width="8" height="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="126" y="28" width="8" height="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5"/>

            {/* Equipment Label */}
            <text x="70" y="-35" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Main Operational Indicator */}
            <circle cx="160" cy="-35" r="5" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
        </g>);
};
export default CementMillGearbox;
