import React from 'react';
const RawMillHydraulicSystem = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "HYD-SYS-01", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Base Plates */}
            <rect x="10" y="210" width="170" height="6" fill="#475569" rx="2"/>
            <rect x="25" y="140" width="50" height="10" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>

            {/* Hydraulic Tank / Reservoir */}
            <rect x="20" y="150" width="150" height="60" rx="4" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Tank Filler / Breather Cap */}
            <path d="M 50,150 L 50,135 L 45,135 L 45,130 L 65,130 L 65,135 L 60,135 L 60,150" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Sight Glass for Oil Level */}
            <rect x="35" y="155" width="12" height="45" fill="#0f172a" rx="4"/>
            <rect x="37" y="170" width="8" height="28" fill="#eab308" rx="2"/>
            <line x1="48" y1="165" x2="53" y2="165" stroke="#94a3b8" strokeWidth="1"/>
            <line x1="48" y1="177" x2="53" y2="177" stroke="#94a3b8" strokeWidth="1"/>
            <line x1="48" y1="189" x2="53" y2="189" stroke="#94a3b8" strokeWidth="1"/>

            {/* Tank Temperature Gauge */}
            <circle cx="80" cy="180" r="12" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 80,180 L 85,175" fill="none" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="80" cy="180" r="2" fill="#1e293b"/>
            <text x="80" y="198" textAnchor="middle" className="fill-text-secondary text-[9px] font-mono font-bold pointer-events-none select-none">
                TEMP
            </text>

            {/* Return Filter Block */}
            <rect x="120" y="130" width="20" height="20" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
            <line x1="120" y1="140" x2="140" y2="140" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="2 2"/>

            {/* Return Line */}
            <path d="M 230,200 L 230,220 L 130,220 L 130,150" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinejoin="round"/>

            {/* Suction Line */}
            <path d="M 110,138 L 110,180" fill="none" stroke="#334155" strokeWidth="4"/>

            {/* Motor */}
            <rect x="20" y="100" width="60" height="40" rx="4" fill="#475569" stroke={statusColor} strokeWidth="2.5"/>
            <path d="M 25,105 L 75,105 M 25,112.5 L 75,112.5 M 25,120 L 75,120 M 25,127.5 L 75,127.5 M 25,135 L 75,135" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
            
            {/* Coupling */}
            <rect x="80" y="112" width="12" height="16" fill="#1e293b"/>

            {/* Pump Head */}
            <circle cx="110" cy="120" r="18" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            <circle cx="110" cy="120" r="8" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <path d="M 110,104 L 115,112 L 105,112 Z" fill="#1e293b"/> {/* Upward Flow Indicator */}

            {/* Main Pressure Line */}
            <path d="M 110,102 L 110,80 L 340,80 L 340,170 L 320,170" fill="none" stroke="#ea580c" strokeWidth="3" strokeLinejoin="round"/>

            {/* System Pressure Gauge */}
            <circle cx="130" cy="80" r="12" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 122,80 L 125,80 M 135,80 L 138,80 M 130,72 L 130,75 M 130,85 L 130,88" stroke="#94a3b8" strokeWidth="1"/>
            <path d="M 130,80 L 136,74" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="130" cy="80" r="2" fill="#1e293b"/>
            <text x="130" y="102" textAnchor="middle" className="fill-text-secondary text-[9px] font-mono font-bold pointer-events-none select-none">
                SYS PRESS
            </text>

            {/* Accumulator 1 */}
            <path d="M 158,15 L 158,10 L 166,10 L 166,15" fill="#334155"/>
            <rect x="150" y="15" width="24" height="55" rx="12" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="150" y="30" width="24" height="2" fill="#1e293b"/>
            <path d="M 162,70 L 162,80" fill="none" stroke="#ea580c" strokeWidth="3"/>

            {/* Accumulator 2 */}
            <path d="M 193,15 L 193,10 L 201,10 L 201,15" fill="#334155"/>
            <rect x="185" y="15" width="24" height="55" rx="12" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="185" y="30" width="24" height="2" fill="#1e293b"/>
            <path d="M 197,70 L 197,80" fill="none" stroke="#ea580c" strokeWidth="3"/>

            {/* Roller Segment (Mill Load) */}
            <rect x="210" y="110" width="120" height="20" rx="6" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="220" y1="115" x2="320" y2="115" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
            <line x1="220" y1="125" x2="320" y2="125" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="270" cy="120" r="6" fill="#1e293b"/>
            <path d="M 255,120 A 15 15 0 0 1 270,105" fill="none" stroke="#f1f5f9" strokeWidth="1.5"/>
            <polygon points="270,105 266,101 266,109" fill="#f1f5f9"/>

            {/* Valve Block / Manifold */}
            <rect x="220" y="140" width="100" height="60" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Manifold Internal Valve 1 */}
            <path d="M 247.5,157.5 L 240,150 L 240,165 Z M 247.5,157.5 L 255,150 L 255,165 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="235" y="152" width="5" height="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="1"/>
            <rect x="255" y="152" width="5" height="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="1"/>
            <circle cx="247.5" cy="180" r="6" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Manifold Internal Valve 2 */}
            <path d="M 292.5,157.5 L 285,150 L 285,165 Z M 292.5,157.5 L 300,150 L 300,165 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="280" y="152" width="5" height="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="1"/>
            <rect x="300" y="152" width="5" height="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="1"/>
            <circle cx="292.5" cy="180" r="6" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Hoses from Manifold to Cylinders */}
            <path d="M 248,140 L 248,60 L 235,60" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M 293,140 L 293,60 L 280,60" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinejoin="round"/>

            {/* Hydraulic Cylinder 1 */}
            <rect x="243" y="70" width="10" height="40" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            <rect x="235" y="10" width="26" height="60" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="238" y1="10" x2="238" y2="70" stroke="#334155" strokeWidth="1"/>
            <line x1="258" y1="10" x2="258" y2="70" stroke="#334155" strokeWidth="1"/>

            {/* Hydraulic Cylinder 2 */}
            <rect x="288" y="70" width="10" height="40" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            <rect x="280" y="10" width="26" height="60" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="283" y1="10" x2="283" y2="70" stroke="#334155" strokeWidth="1"/>
            <line x1="303" y1="10" x2="303" y2="70" stroke="#334155" strokeWidth="1"/>

            {/* Status Panel */}
            <rect x="270" y="-20" width="60" height="26" rx="4" fill="#1e293b"/>
            <circle cx="285" cy="-7" r="5" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.5;1" dur={isHazard ? "0.5s" : "2s"} repeatCount="indefinite"/>
            </circle>
            <text x="308" y="-4" textAnchor="middle" className="fill-text-subtle text-[12px] font-mono font-bold pointer-events-none select-none">
                PWR
            </text>

            {/* Main Equipment Label */}
            <rect x="15" y="-20" width="140" height="26" fill="#1e293b" rx="4"/>
            <text x="85" y="-2" textAnchor="middle" className="fill-text-subtle text-[14px] font-mono font-bold uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default RawMillHydraulicSystem;
