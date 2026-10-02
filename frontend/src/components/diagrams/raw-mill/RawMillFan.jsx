import React from 'react';
const RawMillFan = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "RM-FAN-01", onPointerDown, }) => {
    // Dynamic status color calculated outside JSX to strictly comply with rules
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* --- FOUNDATION & BASE --- */}
            {/* Motor Support */}
            <rect x="-20" y="90" width="30" height="15" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            {/* Casing Support */}
            <rect x="30" y="90" width="60" height="15" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            {/* Unified Pedestal */}
            <rect x="-25" y="105" width="120" height="10" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="-30" y="115" width="130" height="8" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>

            {/* --- DRIVE MOTOR --- */}
            {/* Motor Body */}
            <rect x="-30" y="50" width="40" height="40" rx="4" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            {/* Motor Cooling Fins */}
            <line x1="-25" y1="58" x2="5" y2="58" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
            <line x1="-25" y1="66" x2="5" y2="66" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
            <line x1="-25" y1="74" x2="5" y2="74" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
            <line x1="-25" y1="82" x2="5" y2="82" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
            {/* Drive Shaft Coupling */}
            <rect x="10" y="66" width="10" height="8" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>

            {/* --- CENTRIFUGAL SPIRAL CASING (VOLUTE) --- */}
            {/* Main Volute Body (Draws a spiral/snail shape typical for fans) */}
            <path d="M 100 50 A 40 40 0 1 1 60 10 L 60 -30 L 100 -30 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round"/>
            
            {/* Casing Structural Reinforcement Ribs */}
            <path d="M 85 58 L 95 62" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
            <path d="M 72 75 L 78 85" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
            <path d="M 48 75 L 42 85" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
            <path d="M 35 58 L 25 62" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>

            {/* --- DISCHARGE DUCT (TOP OUTLET) --- */}
            {/* Base Flange */}
            <rect x="55" y="-35" width="50" height="5" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            {/* Connecting Pipe Interface */}
            <rect x="60" y="-45" width="40" height="10" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            {/* Airflow Direction Indicator */}
            <path d="M 80 -38 L 80 -48 M 76 -44 L 80 -49 L 84 -44" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

            {/* --- INLET DUCT (CENTER SUCTION) --- */}
            {/* Outer Suction Ring */}
            <circle cx="60" cy="50" r="26" fill="#1e293b" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Centrifugal Impeller Blades (Visible inside suction) */}
            <path d="M 60 50 L 74 36 M 60 50 L 74 64 M 60 50 L 46 64 M 60 50 L 46 36 M 60 50 L 80 50 M 60 50 L 40 50 M 60 50 L 60 70 M 60 50 L 60 30" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
            
            {/* Center Shaft Hub */}
            <circle cx="60" cy="50" r="8" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            {/* Hub Core Status Indicator */}
            <circle cx="60" cy="50" r="3" fill={statusColor}/>
            
            {/* Dynamic Operations Ring (Pulses based on status) */}
            <circle cx="60" cy="50" r="28" fill="none" stroke={statusColor} strokeWidth="2.5" strokeDasharray="6 4"/>

            {/* --- STATUS BEACON --- */}
            {/* Beacon Mount */}
            <rect x="105" y="-35" width="10" height="10" rx="2" fill="#1e293b"/>
            {/* Beacon Light */}
            <circle cx="110" cy="-30" r="5" fill={statusColor} stroke="#0f172a" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* --- EQUIPMENT LABEL --- */}
            <text x="35" y="145" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default RawMillFan;
