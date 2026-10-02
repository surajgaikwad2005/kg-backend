import React from 'react';
const CoalVerticalRollerMill = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "MILL-101", onPointerDown, }) => {
    // Determine status color OUTSIDE of JSX to strictly comply with rules
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Status Glow / Highlight Underlay */}
            <polygon points="32,188 168,188 168,112 138,42 62,42 32,112" fill="none" stroke={statusColor} strokeWidth="6" opacity="0.4"/>

            {/* Base Foundation */}
            <rect x="30" y="230" width="140" height="20" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 30,230 L 170,230 L 180,250 L 20,250 Z" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Foundation Anchor Bolts */}
            <rect x="40" y="226" width="6" height="4" fill="#334155"/>
            <rect x="70" y="226" width="6" height="4" fill="#334155"/>
            <rect x="124" y="226" width="6" height="4" fill="#334155"/>
            <rect x="154" y="226" width="6" height="4" fill="#334155"/>

            {/* Gearbox & Base Frame */}
            <path d="M 60,185 L 140,185 L 130,195 L 70,195 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="65" y="195" width="70" height="35" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <rect x="55" y="180" width="90" height="6" fill="#475569" stroke="#1e293b" strokeWidth="2"/>

            {/* Motor Drive */}
            <rect x="85" y="195" width="30" height="35" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <line x1="85" y1="200" x2="115" y2="200" stroke="#1e293b" strokeWidth="2"/>
            <line x1="85" y1="208" x2="115" y2="208" stroke="#1e293b" strokeWidth="2"/>
            <line x1="85" y1="216" x2="115" y2="216" stroke="#1e293b" strokeWidth="2"/>
            <line x1="85" y1="224" x2="115" y2="224" stroke="#1e293b" strokeWidth="2"/>

            {/* Main Lower Grinding Housing */}
            <rect x="40" y="115" width="120" height="70" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Side Roller Extension Housings */}
            <path d="M 40,130 C 15,130 15,170 40,170" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 160,130 C 185,130 185,170 160,170" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>

            {/* Housing Horizontal Flanges */}
            <rect x="35" y="113" width="130" height="6" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="35" y="181" width="130" height="6" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>

            {/* Center Access Maintenance Door */}
            <rect x="80" y="130" width="40" height="40" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="112" cy="150" r="3" fill="#1e293b"/>
            <rect x="75" y="135" width="5" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1"/>
            <rect x="75" y="155" width="5" height="10" fill="#475569" stroke="#1e293b" strokeWidth="1"/>

            {/* Hot Primary Air Inlet Duct */}
            <rect x="-10" y="150" width="50" height="24" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <rect x="-15" y="147" width="10" height="30" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <rect x="35" y="147" width="10" height="30" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 0,162 L 15,162 M 10,157 L 15,162 L 10,167" fill="none" stroke="#f1f5f9" strokeWidth="2"/>

            {/* Raw Coal Feed Chute */}
            <polygon points="145,100 185,50 205,65 165,115" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <polygon points="180,45 190,55 210,70 200,60" fill="#475569" stroke="#1e293b" strokeWidth="2"/>

            {/* Classifier Upper Conical Housing */}
            <polygon points="40,113 160,113 130,50 70,50" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <rect x="65" y="47" width="70" height="6" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>

            {/* Internal Dynamic Separator Blades */}
            <line x1="75" y1="55" x2="55" y2="105" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="90" y1="55" x2="80" y2="105" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="100" y1="55" x2="100" y2="105" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="110" y1="55" x2="120" y2="105" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="125" y1="55" x2="145" y2="105" stroke="#94a3b8" strokeWidth="2"/>

            {/* Pulverized Product Outlet Duct */}
            <rect x="80" y="10" width="40" height="37" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <rect x="75" y="10" width="50" height="8" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 100,40 L 100,20 M 95,25 L 100,20 L 105,25" fill="none" stroke="#f1f5f9" strokeWidth="2"/>

            {/* Equipment Tag Label Box */}
            <rect x="50" y="-35" width="100" height="25" fill="#1e293b" rx="4"/>
            <text x="100" y="-17" textAnchor="middle" className="fill-text-subtle text-[14px] font-mono font-bold uppercase pointer-events-none select-none">
                {label}
            </text>

            {/* Local Control / Status Indicator Panel */}
            <rect x="-20" y="190" width="30" height="50" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="-5" cy="205" r="6" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>
            <rect x="-12" y="218" width="14" height="6" fill="#10b981"/>
            <rect x="-12" y="228" width="14" height="6" fill="#ef4444"/>

            {/* Instrument Process Connections (Dashed lines to readouts) */}
            <polyline points="120,65 210,65 210,140 220,140" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2"/>
            <polyline points="140,150 160,150 160,175 220,175" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2"/>
            <polyline points="115,210 220,210" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2"/>

            {/* Instrument Data Readout 1: Mill Outlet Temp */}
            <g transform="translate(220, 130)">
                <rect x="0" y="0" width="55" height="20" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <text x="5" y="14" className="fill-success text-[10px] font-mono font-bold pointer-events-none">85.0</text>
                <text x="40" y="14" className="fill-text-subtle text-[8px] font-mono pointer-events-none">°C</text>
                <rect x="0" y="-10" width="55" height="10" fill="#334155" stroke="#334155" strokeWidth="1"/>
                <text x="27.5" y="-2" textAnchor="middle" className="fill-text-subtle text-[7px] font-mono pointer-events-none">OUT TEMP</text>
            </g>

            {/* Instrument Data Readout 2: Mill Diff Pressure */}
            <g transform="translate(220, 165)">
                <rect x="0" y="0" width="55" height="20" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <text x="5" y="14" className="fill-success text-[10px] font-mono font-bold pointer-events-none">62.4</text>
                <text x="35" y="14" className="fill-text-subtle text-[8px] font-mono pointer-events-none">kPa</text>
                <rect x="0" y="-10" width="55" height="10" fill="#334155" stroke="#334155" strokeWidth="1"/>
                <text x="27.5" y="-2" textAnchor="middle" className="fill-text-subtle text-[7px] font-mono pointer-events-none">DIFF PRESS</text>
            </g>

            {/* Instrument Data Readout 3: Mill Motor Power */}
            <g transform="translate(220, 200)">
                <rect x="0" y="0" width="55" height="20" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <text x="5" y="14" className="fill-success text-[10px] font-mono font-bold pointer-events-none">1450</text>
                <text x="35" y="14" className="fill-text-subtle text-[8px] font-mono pointer-events-none">kW</text>
                <rect x="0" y="-10" width="55" height="10" fill="#334155" stroke="#334155" strokeWidth="1"/>
                <text x="27.5" y="-2" textAnchor="middle" className="fill-text-subtle text-[7px] font-mono pointer-events-none">MTR PWR</text>
            </g>
        </g>);
};
export default CoalVerticalRollerMill;
