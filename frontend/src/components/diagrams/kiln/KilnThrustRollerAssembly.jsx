import React from 'react';
const KilnThrustRoller = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "TR-502A", onPointerDown, }) => {
    // Dynamic status color evaluated entirely outside of JSX
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* --- KILN TIRE (RIDING RING) SEGMENT --- */}
            <rect x="0" y="-15" width="140" height="25" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 10,-15 L 10,10" stroke="#334155" strokeWidth="2"/>
            <path d="M 130,-15 L 130,10" stroke="#334155" strokeWidth="2"/>
            <path d="M 0,-2 L 140,-2" stroke="#1e293b" strokeWidth="1" strokeDasharray="8 4"/>

            {/* --- EQUIPMENT LABEL --- */}
            <text x="70" y="-25" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* --- BASE STRUCTURE & MOUNTING --- */}
            <rect x="5" y="105" width="130" height="10" rx="1" fill="#0f172a"/>
            <rect x="10" y="90" width="120" height="15" rx="2" fill="#1e293b"/>
            <path d="M 30,90 L 40,75 L 100,75 L 110,90 Z" fill="#334155" stroke="#1e293b" strokeWidth="2"/>

            {/* Base Mounting Bolts Left */}
            <rect x="15" y="95" width="6" height="4" fill="#64748b"/>
            <rect x="25" y="95" width="6" height="4" fill="#64748b"/>
            
            {/* Base Mounting Bolts Right */}
            <rect x="109" y="95" width="6" height="4" fill="#64748b"/>
            <rect x="119" y="95" width="6" height="4" fill="#64748b"/>

            {/* --- HYDRAULIC PISTON & SHAFT --- */}
            <rect x="40" y="45" width="60" height="20" fill="#94a3b8" stroke="#475569" strokeWidth="2"/>
            
            {/* Shaft Centerline */}
            <path d="M 35,55 L 105,55" stroke="#1e293b" strokeWidth="1" strokeDasharray="6 3"/>

            {/* --- BEARING HOUSINGS (PEDESTALS) --- */}
            {/* Left Pedestal */}
            <rect x="30" y="35" width="20" height="40" rx="3" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="35" cy="40" r="1.5" fill="#cbd5e1"/>
            <circle cx="45" cy="40" r="1.5" fill="#cbd5e1"/>
            <circle cx="35" cy="70" r="1.5" fill="#cbd5e1"/>
            <circle cx="45" cy="70" r="1.5" fill="#cbd5e1"/>

            {/* Right Pedestal */}
            <rect x="90" y="35" width="20" height="40" rx="3" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="95" cy="40" r="1.5" fill="#cbd5e1"/>
            <circle cx="105" cy="40" r="1.5" fill="#cbd5e1"/>
            <circle cx="95" cy="70" r="1.5" fill="#cbd5e1"/>
            <circle cx="105" cy="70" r="1.5" fill="#cbd5e1"/>

            {/* --- MASSIVE THRUST ROLLER --- */}
            <rect x="55" y="10" width="30" height="80" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="3"/>
            
            {/* Roller Bevel & Contour Details */}
            <rect x="62" y="10" width="16" height="80" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
            <path d="M 55,20 L 85,20" stroke="#94a3b8" strokeWidth="1"/>
            <path d="M 55,80 L 85,80" stroke="#94a3b8" strokeWidth="1"/>
            
            {/* --- STATUS CONNECTION LINE & INDICATOR --- */}
            <path d="M 110,50 L 140,50 L 140,25" fill="none" stroke={statusColor} strokeWidth="2"/>
            
            <circle cx="140" cy="25" r="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* --- DCS SENSOR READOUTS --- */}
            {/* Axial Displacement Readout */}
            <rect x="15" y="122" width="50" height="20" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
            <text x="40" y="136" textAnchor="middle" className="fill-success text-[10px] font-mono pointer-events-none select-none">
                +1.2 mm
            </text>

            {/* Hydraulic Pressure/Thrust Readout */}
            <rect x="75" y="122" width="50" height="20" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
            <text x="100" y="136" textAnchor="middle" className="fill-success text-[10px] font-mono pointer-events-none select-none">
                245 kN
            </text>
        </g>);
};
export default KilnThrustRoller;
