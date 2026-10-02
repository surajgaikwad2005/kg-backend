import React from 'react';
const KilnAuxiliaryDriveMotor = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "M-4020-AUX", onPointerDown, }) => {
    // Status color determined outside JSX to strictly follow Parser Rules
    const statusColor = status === 'hazard' ? '#ef4444' : status === 'warning' ? '#eab308' : '#22c55e';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Mounting Base */}
            <path d="M 25,60 L 15,80 L 105,80 L 95,60 Z" fill="#64748b" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="10" y="80" width="100" height="8" rx="1" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Base Bolts */}
            <rect x="20" y="78" width="8" height="5" rx="1" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="92" y="78" width="8" height="5" rx="1" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Non-Drive End Bell (Left) */}
            <path d="M 30,20 C 5,20 5,60 30,60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Fan Cover Vents (Manual elements, NO array mapping) */}
            <line x1="16" y1="28" x2="25" y2="28" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
            <line x1="13" y1="36" x2="25" y2="36" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="44" x2="25" y2="44" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
            <line x1="13" y1="52" x2="25" y2="52" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>

            {/* Main Stator Body */}
            <rect x="30" y="20" width="60" height="40" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Stator Cooling Fins (Manual elements, NO array mapping) */}
            <line x1="30" y1="25" x2="90" y2="25" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="30" y1="30" x2="90" y2="30" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="30" y1="35" x2="90" y2="35" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="30" y1="40" x2="90" y2="40" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="30" y1="45" x2="90" y2="45" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="30" y1="50" x2="90" y2="50" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="30" y1="55" x2="90" y2="55" stroke="#64748b" strokeWidth="1.5"/>

            {/* Drive End Flange */}
            <rect x="90" y="20" width="10" height="40" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Output Shaft */}
            <rect x="100" y="34" width="25" height="12" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Shaft Keyway */}
            <rect x="105" y="37" width="15" height="3" rx="1" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>

            {/* Coupling to Kiln Gearbox */}
            <rect x="125" y="25" width="12" height="30" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="137" y="25" width="8" height="30" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Terminal Box (Top) */}
            <path d="M 45,20 L 50,5 L 75,5 L 80,20 Z" fill="#64748b" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="48" y="-2" width="30" height="7" rx="1" fill="#334155" stroke="#1e293b" strokeWidth="2"/>

            {/* Power Cable Path */}
            <path d="M 63,-2 C 63,-15 85,-20 85,-35" fill="none" stroke="#1e293b" strokeWidth="4"/>

            {/* 50kW Rating Data Plate */}
            <rect x="40" y="32" width="40" height="16" rx="1" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5"/>
            <text x="60" y="43" textAnchor="middle" className="fill-text-secondary text-[10px] font-mono font-bold pointer-events-none select-none">
                50kW
            </text>

            {/* Equipment Label */}
            <text x="60" y="-22" textAnchor="middle" className="fill-text-muted text-[16px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Dynamic Status Indicator - Strictly uses {statusColor} and NO JS expressions */}
            <circle cx="110" cy="-25" r="5" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>

        </g>);
};
export default KilnAuxiliaryDriveMotor;
