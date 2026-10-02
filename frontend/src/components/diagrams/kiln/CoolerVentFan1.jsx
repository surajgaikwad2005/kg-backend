import React from 'react';
const CoolerVentFan = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "CVF-01", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Equipment Main Label */}
            <text x="35" y="-35" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Base Skid / Plate */}
            <rect x="-65" y="115" width="205" height="12" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Skid Mounting Bolts */}
            <circle cx="-50" cy="121" r="2" fill="#94a3b8"/>
            <circle cx="-10" cy="121" r="2" fill="#94a3b8"/>
            <circle cx="30" cy="121" r="2" fill="#94a3b8"/>
            <circle cx="70" cy="121" r="2" fill="#94a3b8"/>
            <circle cx="110" cy="121" r="2" fill="#94a3b8"/>

            {/* Motor Power Cable */}
            <path d="M -50 75 Q -60 75 -60 95 L -60 115" fill="none" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Vibration Sensor Cable */}
            <path d="M 133 70 L 145 70 L 145 115" fill="none" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Motor Base Support */}
            <rect x="-35" y="95" width="30" height="20" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Main Motor Body */}
            <rect x="-50" y="45" width="60" height="50" rx="4" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Motor Cooling Fins */}
            <line x1="-40" y1="55" x2="0" y2="55" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
            <line x1="-40" y1="65" x2="0" y2="65" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
            <line x1="-40" y1="75" x2="0" y2="75" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
            <line x1="-40" y1="85" x2="0" y2="85" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>

            {/* Motor Junction Box */}
            <rect x="-55" y="60" width="10" height="20" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="-55" y1="70" x2="-45" y2="70" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Motor Shaft & Coupling */}
            <rect x="10" y="65" width="35" height="10" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <rect x="20" y="61" width="10" height="18" fill="#334155" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Fan Casing Base Support */}
            <polygon points="60,105 100,105 115,115 45,115" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>

            {/*
            Unified Centrifugal Volute Casing & Tangential Duct
            Arcs from right side clockwise to top center to create the scroll housing
        */}
            <path d="M 80 -10 L 120 -10 L 120 70 A 40 40 0 1 1 80 30 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>

            {/* Inner Volute Scroll Detail (Visual Depth) */}
            <path d="M 80 15 A 25 25 0 1 0 105 70" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2"/>

            {/* Discharge Duct Detail Lines */}
            <line x1="90" y1="-10" x2="90" y2="20" stroke="#e2e8f0" strokeWidth="1"/>
            <line x1="100" y1="-10" x2="100" y2="20" stroke="#e2e8f0" strokeWidth="1"/>
            <line x1="110" y1="-10" x2="110" y2="20" stroke="#e2e8f0" strokeWidth="1"/>

            {/* Top Discharge Flange */}
            <rect x="75" y="-15" width="50" height="5" fill="#334155" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Fan Inlet (Eye of the Impeller) */}
            <circle cx="80" cy="70" r="24" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Impeller Hub */}
            <circle cx="80" cy="70" r="8" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            
            {/* Impeller Blades (Radial) */}
            <line x1="80" y1="46" x2="80" y2="62" stroke="#64748b" strokeWidth="2"/>
            <line x1="80" y1="78" x2="80" y2="94" stroke="#64748b" strokeWidth="2"/>
            <line x1="56" y1="70" x2="72" y2="70" stroke="#64748b" strokeWidth="2"/>
            <line x1="88" y1="70" x2="104" y2="70" stroke="#64748b" strokeWidth="2"/>
            <line x1="63" y1="53" x2="74" y2="64" stroke="#64748b" strokeWidth="2"/>
            <line x1="97" y1="87" x2="86" y2="76" stroke="#64748b" strokeWidth="2"/>
            <line x1="97" y1="53" x2="86" y2="64" stroke="#64748b" strokeWidth="2"/>
            <line x1="63" y1="87" x2="74" y2="76" stroke="#64748b" strokeWidth="2"/>

            {/* Vibration Sensor attached to casing */}
            <rect x="120" y="65" width="10" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="130" cy="70" r="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1"/>

            {/* Status Indicator Beacon on Motor */}
            <rect x="-22" y="32" width="4" height="13" fill="#334155"/>
            <circle cx="-20" cy="25" r="7" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur={isHazard ? "0.5s" : "2s"} repeatCount="indefinite"/>
            </circle>

            {/* Hot Gas Indicators - Inlet (Entering Impeller Eye) */}
            <path d="M 40 40 L 53 53" fill="none" stroke="#ea580c" strokeWidth="2.5"/>
            <polygon points="56,56 56,44 44,56" fill="#ea580c"/>

            {/* Hot Gas Indicators - Discharge (Exiting Tangential Duct) */}
            <path d="M 100 10 L 100 -25" fill="none" stroke="#ea580c" strokeWidth="2.5"/>
            <polygon points="100,-28 94,-15 106,-15" fill="#ea580c"/>
        </g>);
};
export default CoolerVentFan;
