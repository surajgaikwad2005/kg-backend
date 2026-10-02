import React from 'react';
const CrusherHydraulicUnit = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "HYD-UNIT-01", onPointerDown, }) => {
    // Top-level status styling logic (Allowed outside JSX)
    const statusColor = status === 'hazard' ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Skid Base */}
            <rect x="0" y="140" width="330" height="12" rx="2" fill="#1e293b"/>
            <rect x="20" y="152" width="20" height="8" fill="#475569"/>
            <rect x="290" y="152" width="20" height="8" fill="#475569"/>
            <line x1="0" y1="146" x2="330" y2="146" stroke="#334155" strokeWidth="2"/>
            <circle cx="10" cy="146" r="3" fill="#64748b"/>
            <circle cx="320" cy="146" r="3" fill="#64748b"/>

            {/* Reservoir Tank */}
            <rect x="20" y="60" width="80" height="80" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            {/* Tank Fluid Level */}
            <rect x="22" y="85" width="76" height="53" fill="#f59e0b" opacity="0.6"/>
            <line x1="20" y1="85" x2="100" y2="85" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 2"/>
            <line x1="20" y1="100" x2="100" y2="100" stroke="#cbd5e1" strokeWidth="1"/>
            <line x1="20" y1="120" x2="100" y2="120" stroke="#cbd5e1" strokeWidth="1"/>

            {/* Tank Breather Filter */}
            <rect x="30" y="45" width="14" height="15" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>
            <path d="M 28,45 L 46,45 M 28,49 L 46,49 M 28,53 L 46,53" stroke="#1e293b" strokeWidth="1"/>

            {/* Level Gauge Sight Glass */}
            <rect x="85" y="70" width="8" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" rx="4"/>
            <rect x="85" y="90" width="8" height="40" fill="#3b82f6" rx="4"/>
            <line x1="80" y1="75" x2="85" y2="75" stroke="#1e293b" strokeWidth="1"/>
            <line x1="80" y1="90" x2="85" y2="90" stroke="#1e293b" strokeWidth="1"/>
            <line x1="80" y1="105" x2="85" y2="105" stroke="#1e293b" strokeWidth="1"/>
            <line x1="80" y1="120" x2="85" y2="120" stroke="#1e293b" strokeWidth="1"/>

            {/* Suction Line (Tank to Pump) */}
            <path d="M 100,125 L 130,125 L 130,105" fill="none" stroke="#1e293b" strokeWidth="4"/>
            <path d="M 100,125 L 130,125 L 130,105" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>

            {/* Main Hydraulic Pump & Motor */}
            <rect x="150" y="80" width="60" height="36" rx="4" fill="#475569" stroke="#0f172a" strokeWidth="2"/>
            {/* Motor Cooling Fins */}
            <line x1="155" y1="84" x2="205" y2="84" stroke="#334155" strokeWidth="2"/>
            <line x1="155" y1="89" x2="205" y2="89" stroke="#334155" strokeWidth="2"/>
            <line x1="155" y1="94" x2="205" y2="94" stroke="#334155" strokeWidth="2"/>
            <line x1="155" y1="99" x2="205" y2="99" stroke="#334155" strokeWidth="2"/>
            <line x1="155" y1="104" x2="205" y2="104" stroke="#334155" strokeWidth="2"/>
            <line x1="155" y1="109" x2="205" y2="109" stroke="#334155" strokeWidth="2"/>
            {/* Motor Terminal Box */}
            <rect x="170" y="72" width="20" height="8" fill="#334155" stroke="#0f172a" strokeWidth="1.5"/>
            {/* Pump Body */}
            <circle cx="130" cy="98" r="16" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <polygon points="120,104 140,104 130,86" fill="#1e293b"/>
            {/* Drive Coupling */}
            <rect x="146" y="93" width="4" height="10" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1"/>

            {/* High Pressure Supply Line */}
            <path d="M 130,82 L 130,42 L 230,42" fill="none" stroke="#1e293b" strokeWidth="3.5"/>
            <path d="M 130,82 L 130,42 L 230,42" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.8"/>

            {/* High Pressure Gauge */}
            <circle cx="130" cy="60" r="9" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="130" cy="60" r="2" fill="#1e293b"/>
            <line x1="130" y1="60" x2="135" y2="55" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M 124,60 A 6 6 0 0 1 136,60" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="2 2"/>

            {/* Accumulator (Safety Shock Absorption) */}
            <line x1="180" y1="42" x2="180" y2="20" stroke="#1e293b" strokeWidth="3"/>
            <rect x="168" y="-20" width="24" height="40" rx="12" fill="#3b82f6" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 168,0 L 192,0" stroke="#1e293b" strokeWidth="2"/>
            <text x="180" y="-5" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fontWeight="bold" fill="#ffffff" className="pointer-events-none select-none">N2</text>

            {/* Directional Control Valve Block */}
            <rect x="218" y="30" width="24" height="24" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            {/* Bowtie valve symbol inside block */}
            <polygon points="222,34 222,50 238,34 238,50" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
            {/* Valve Solenoids */}
            <rect x="210" y="34" width="8" height="16" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="242" y="34" width="8" height="16" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Cylinder Line */}
            <line x1="230" y1="30" x2="230" y2="20" stroke="#1e293b" strokeWidth="3"/>
            <line x1="230" y1="20" x2="250" y2="20" stroke="#1e293b" strokeWidth="3"/>

            {/* Gap Adjustment / Release Cylinder */}
            {/* Cylinder Body */}
            <rect x="250" y="5" width="55" height="30" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="255" y1="5" x2="255" y2="35" stroke="#94a3b8" strokeWidth="2"/>
            {/* Internal Fluid */}
            <rect x="252" y="7" width="8" height="26" fill="#f59e0b" opacity="0.6"/>
            {/* Piston */}
            <rect x="260" y="7" width="12" height="26" fill="#1e293b"/>
            {/* Rod */}
            <rect x="272" y="16" width="45" height="8" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5"/>
            {/* Clevis end */}
            <rect x="317" y="12" width="8" height="16" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="321" cy="20" r="3" fill="#1e293b"/>

            {/* Return Line (Safety Release & Relief to Tank) */}
            <path d="M 230,30 L 230,10 L 60,10 L 60,35" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 3"/>

            {/* Oil Cooler on Return Line */}
            <rect x="120" y="0" width="40" height="20" rx="2" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5"/>
            <path d="M 120,5 L 130,15 L 140,5 L 150,15 L 160,5" fill="none" stroke="#1e293b" strokeWidth="1.5"/>
            {/* Cooler Fan Indicator */}
            <circle cx="140" cy="10" r="6" fill="none" stroke="#64748b" strokeWidth="1"/>
            <line x1="136" y1="10" x2="144" y2="10" stroke="#64748b" strokeWidth="1"/>
            <line x1="140" y1="6" x2="140" y2="14" stroke="#64748b" strokeWidth="1"/>

            {/* Return Oil Filter */}
            <rect x="52" y="35" width="16" height="25" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="52" y1="45" x2="68" y2="45" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 1"/>
            <line x1="52" y1="50" x2="68" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 1"/>
            <line x1="52" y1="55" x2="68" y2="55" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 1"/>

            {/* Animated Status Indicator */}
            <rect x="10" y="10" width="20" height="20" rx="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="20" cy="20" r="6" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="20" cy="20" r="10" fill="none" stroke={statusColor} strokeWidth="2">
                <animate attributeName="r" values="10;14;10" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>

            {/* Equipment Labels */}
            <text x="165" y="165" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
            <text x="277" y="-5" textAnchor="middle" className="fill-text-secondary text-[10px] font-mono font-bold uppercase pointer-events-none select-none">
                GAP ADJ CYL
            </text>
        </g>);
};
export default CrusherHydraulicUnit;
