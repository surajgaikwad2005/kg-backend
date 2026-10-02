import React from 'react';
const RawMillGearbox = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "GBX-100", onPointerDown, }) => {
    // Computed strictly outside JSX to comply with rules
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-pointer">
            
            {/* Lube Oil Piping (Background) */}
            <path d="M 10,130 L -5,130 L -5,40 L 40,40" fill="none" stroke="#64748b" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M -5,80 L 30,80" fill="none" stroke="#64748b" strokeWidth="3" strokeLinejoin="round"/>
            {/* Oil Pump Component */}
            <rect x="-10" y="120" width="10" height="20" fill="#334155"/>
            <circle cx="-5" cy="125" r="3" fill="#cbd5e1"/>

            {/* Main Base Plate */}
            <rect x="10" y="140" width="120" height="15" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="15" y="136" width="6" height="4" fill="#475569"/>
            <rect x="119" y="136" width="6" height="4" fill="#475569"/>

            {/* Lower Housing (Bevel Gear Primary Stage) */}
            <path d="M 20,140 L 20,100 L 120,100 L 120,140 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            
            {/* Lower Housing Structural Ribs */}
            <path d="M 30,100 L 30,140" fill="none" stroke="#94a3b8" strokeWidth="2"/>
            <path d="M 50,100 L 50,140" fill="none" stroke="#94a3b8" strokeWidth="2"/>
            <path d="M 70,100 L 70,140" fill="none" stroke="#94a3b8" strokeWidth="2"/>
            <path d="M 90,100 L 90,140" fill="none" stroke="#94a3b8" strokeWidth="2"/>
            <path d="M 110,100 L 110,140" fill="none" stroke="#94a3b8" strokeWidth="2"/>

            {/* Inspection Hatch on Lower Housing */}
            <rect x="50" y="110" width="40" height="20" rx="3" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5"/>
            <circle cx="55" cy="120" r="1.5" fill="#1e293b"/>
            <circle cx="85" cy="120" r="1.5" fill="#1e293b"/>

            {/* Input Shaft (Right Side from Motor) */}
            <rect x="120" y="112" width="35" height="16" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="155" y="105" width="8" height="30" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 125,120 L 150,120" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 2"/>

            {/* Middle Housing (Planetary Stage 1) */}
            <path d="M 25,100 L 30,55 L 110,55 L 115,100 Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M 40,55 L 45,100" fill="none" stroke="#94a3b8" strokeWidth="2"/>
            <path d="M 100,55 L 95,100" fill="none" stroke="#94a3b8" strokeWidth="2"/>
            
            {/* Stage 1 Internal Schematic Elements */}
            <circle cx="70" cy="77" r="14" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3"/>
            <circle cx="70" cy="77" r="6" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="50" cy="77" r="5" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="90" cy="77" r="5" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Upper Housing (Planetary Stage 2) */}
            <path d="M 35,55 L 45,15 L 95,15 L 105,55 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            
            {/* Stage 2 Internal Schematic Elements */}
            <circle cx="70" cy="35" r="10" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2"/>
            <circle cx="70" cy="35" r="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="56" cy="35" r="3" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="84" cy="35" r="3" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Top Thrust Bearing / Flange */}
            <rect x="40" y="5" width="60" height="10" rx="1" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Output Shaft (Connecting to Mill Table) */}
            <rect x="55" y="-25" width="30" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="45" y="-35" width="50" height="10" rx="2" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            <path d="M 70,-25 L 70,5" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 2"/>

            {/* Gearbox Vertical Centerline */}
            <path d="M 70,140 L 70,-35" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="10 5 2 5"/>

            {/* Dynamic Status Outline Highlight */}
            <path d="M 20,140 L 20,100 L 25,100 L 30,55 L 35,55 L 45,15 L 95,15 L 105,55 L 110,55 L 115,100 L 120,100 L 120,140 Z" fill="none" stroke={statusColor} strokeWidth="4" opacity="0.5" pointerEvents="none"/>

            {/* Status LED Indicator */}
            <circle cx="25" cy="110" r="4" fill={statusColor} stroke="#1e293b" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>

            {/* Equipment Label */}
            <text x="70" y="-50" textAnchor="middle" className="fill-text-primary text-[16px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* DCS Data Readout 1 - Input Stage Vib */}
            <g>
                <path d="M 20,115 L 5,115" fill="none" stroke="#475569" strokeWidth="1"/>
                <rect x="-43" y="106" width="48" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                <text x="-19" y="119" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">1.2 mm/s</text>
            </g>

            {/* DCS Data Readout 2 - Stage 1 Temp */}
            <g>
                <path d="M 112,77 L 125,77" fill="none" stroke="#475569" strokeWidth="1"/>
                <rect x="125" y="68" width="48" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                <text x="149" y="81" fill="#10b981" fontSize="10" fontFamily="monospace" textAnchor="middle">68 °C</text>
            </g>

            {/* DCS Data Readout 3 - Output Bearing Temp */}
            <g>
                <path d="M 97,20 L 110,20" fill="none" stroke="#475569" strokeWidth="1"/>
                <rect x="110" y="11" width="48" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                <text x="134" y="24" fill="#10b981" fontSize="10" fontFamily="monospace" textAnchor="middle">72 °C</text>
            </g>

        </g>);
};
export default RawMillGearbox;
