import React from 'react';
const HopperBin = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "BIN-902", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Structural Supports / Legs (Back layer) */}
            <line x1="10" y1="80" x2="10" y2="160" stroke="#334155" strokeWidth="5" strokeLinecap="square"/>
            <line x1="110" y1="80" x2="110" y2="160" stroke="#334155" strokeWidth="5" strokeLinecap="square"/>
            
            {/* Leg Bracing */}
            <line x1="10" y1="130" x2="40" y2="130" stroke="#475569" strokeWidth="3"/>
            <line x1="80" y1="130" x2="110" y2="130" stroke="#475569" strokeWidth="3"/>
            <line x1="10" y1="110" x2="30" y2="130" stroke="#475569" strokeWidth="2"/>
            <line x1="110" y1="110" x2="90" y2="130" stroke="#475569" strokeWidth="2"/>

            {/* Base Plates */}
            <rect x="0" y="160" width="20" height="4" fill="#1e293b"/>
            <rect x="100" y="160" width="20" height="4" fill="#1e293b"/>

            {/* Top Inlet Feed Pipe */}
            <rect x="45" y="-15" width="30" height="20" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="40" y="-15" width="40" height="4" fill="#334155"/>
            <rect x="40" y="3" width="40" height="4" fill="#334155"/>

            {/* Main Hopper Body */}
            <path d="M 10,5 L 110,5 L 110,75 L 75,140 L 45,140 L 10,75 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>

            {/* Internal Material Fill Indicator (Clinker/Ash level) */}
            <path d="M 12,45 L 108,45 L 108,74 L 74,138 L 46,138 L 12,74 Z" fill="#cbd5e1" stroke="none"/>
            <line x1="12" y1="45" x2="108" y2="45" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2"/>

            {/* Horizontal Stiffening Ribs */}
            <line x1="10" y1="25" x2="110" y2="25" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="10" y1="50" x2="110" y2="50" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="10" y1="75" x2="110" y2="75" stroke="#1e293b" strokeWidth="2"/>
            <line x1="18" y1="95" x2="102" y2="95" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="28" y1="115" x2="92" y2="115" stroke="#64748b" strokeWidth="1.5"/>

            {/* Vertical Seams */}
            <line x1="45" y1="5" x2="45" y2="75" stroke="#e2e8f0" strokeWidth="1"/>
            <line x1="75" y1="5" x2="75" y2="75" stroke="#e2e8f0" strokeWidth="1"/>

            {/* Bottom Discharge / Rotary Feeder Valve */}
            <rect x="40" y="140" width="40" height="6" fill="#334155"/>
            <circle cx="60" cy="158" r="12" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            {/* Feeder Valve Internals (Rotor) */}
            <line x1="60" y1="146" x2="60" y2="170" stroke="#1e293b" strokeWidth="2"/>
            <line x1="48" y1="158" x2="72" y2="158" stroke="#1e293b" strokeWidth="2"/>

            {/* Level Sensor / Transmitter on Right Wall */}
            <rect x="110" y="30" width="12" height="18" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
            <line x1="122" y1="39" x2="135" y2="39" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Status Beacon on Level Sensor */}
            <circle cx="140" cy="39" r="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* DCS Equipment Label Box */}
            <rect x="25" y="15" width="70" height="20" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1"/>
            <text x="60" y="30" textAnchor="middle" className="fill-text-primary text-[12px] font-mono font-bold uppercase tracking-tight pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default HopperBin;
