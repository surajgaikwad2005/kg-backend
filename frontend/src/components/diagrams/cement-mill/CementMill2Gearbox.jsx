import React from 'react';
const CementMillGearbox = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "CM2-GBX-01", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#22c55e';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Gearbox Mounting Base */}
            <rect x="10" y="100" width="140" height="15" fill="#475569" stroke="#0f172a" strokeWidth="2"/>
            <rect x="20" y="105" width="12" height="6" fill="#94a3b8" stroke="#0f172a" strokeWidth="1"/>
            <rect x="128" y="105" width="12" height="6" fill="#94a3b8" stroke="#0f172a" strokeWidth="1"/>

            {/* Main Housing */}
            <path d="M 30,100 L 30,45 L 60,20 L 110,20 L 130,45 L 130,100 Z" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round"/>

            {/* Structural Ribbing */}
            <line x1="45" y1="35" x2="45" y2="100" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="60" y1="20" x2="60" y2="100" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="85" y1="20" x2="85" y2="100" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="110" y1="20" x2="110" y2="100" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="120" y1="35" x2="120" y2="100" stroke="#94a3b8" strokeWidth="2"/>

            {/* Internal Gear Visual Representation (Overlaid dashes) */}
            <circle cx="55" cy="70" r="18" fill="none" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4"/>
            <circle cx="95" cy="65" r="28" fill="none" stroke="#64748b" strokeWidth="3" strokeDasharray="6 6"/>
            <circle cx="55" cy="70" r="4" fill="#334155"/>
            <circle cx="95" cy="65" r="5" fill="#334155"/>

            {/* Bearing Blocks */}
            <rect x="25" y="55" width="10" height="30" fill="#64748b" stroke="#0f172a" strokeWidth="1.5"/>
            <rect x="125" y="45" width="12" height="40" fill="#64748b" stroke="#0f172a" strokeWidth="1.5"/>

            {/* Input Shaft (High Speed - Left) */}
            <rect x="-10" y="65" width="35" height="10" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5"/>
            <rect x="0" y="55" width="12" height="30" fill="#334155" stroke="#0f172a" strokeWidth="1.5" rx="1"/>
            <line x1="-10" y1="70" x2="25" y2="70" stroke="#0f172a" strokeWidth="1" strokeDasharray="2 2"/>

            {/* Output Shaft (Low Speed - Right) */}
            <rect x="137" y="52" width="40" height="26" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5"/>
            <rect x="150" y="42" width="16" height="46" fill="#334155" stroke="#0f172a" strokeWidth="1.5" rx="1"/>
            <line x1="137" y1="65" x2="177" y2="65" stroke="#0f172a" strokeWidth="1" strokeDasharray="4 2"/>

            {/* Top Breather / Vent */}
            <rect x="75" y="8" width="6" height="12" fill="#475569" stroke="#0f172a" strokeWidth="1.5"/>
            <path d="M 70,8 L 86,8" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round"/>

            {/* Top Inspection Cover */}
            <rect x="90" y="16" width="16" height="4" fill="#334155" stroke="#0f172a" strokeWidth="1.5"/>

            {/* Oil Level Sight Glass */}
            <circle cx="115" cy="85" r="7" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5"/>
            <path d="M 108,85 L 122,85" stroke="#0f172a" strokeWidth="1"/>
            <path d="M 108,85 A 7 7 0 0 0 122 85 Z" fill="#eab308"/>

            {/* Status Indicator / Vibration Sensor */}
            <rect x="42" y="15" width="8" height="10" fill="#334155" stroke="#0f172a" strokeWidth="1.5"/>
            <circle cx="46" cy="12" r="5" fill={statusColor} stroke="#0f172a" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* Label Base & Text */}
            <rect x="40" y="-22" width="80" height="18" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" rx="2"/>
            <text x="80" y="-8" textAnchor="middle" className="fill-text-secondary text-[12px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Connecting Anchor Points */}
            <circle cx="-10" cy="70" r="3" fill="#0f172a"/>
            <circle cx="177" cy="65" r="3" fill="#0f172a"/>
        </g>);
};
export default CementMillGearbox;
