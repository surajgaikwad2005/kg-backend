import React from 'react';
const CrusherGearbox = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "GBX-100", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#22c55e';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Lube Oil Piping & Header */}
            <path d="M 35 -15 L 105 -15" fill="none" stroke="#64748b" strokeWidth="5" strokeLinecap="round"/>
            <path d="M 45 -15 L 45 15" fill="none" stroke="#64748b" strokeWidth="4"/>
            <path d="M 95 -15 L 95 15" fill="none" stroke="#64748b" strokeWidth="4"/>
            
            {/* Lube Oil Pump/Reservoir Block */}
            <rect x="60" y="-25" width="20" height="15" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <rect x="65" y="-30" width="10" height="5" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="70" cy="-17.5" r="4" fill="#60a5fa" stroke="#0f172a" strokeWidth="1"/>

            {/* Heavy Mounting Base */}
            <path d="M 15 90 L 30 15 L 110 15 L 125 90 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="5" y="90" width="130" height="12" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Anchor Bolts */}
            <rect x="12" y="85" width="6" height="6" fill="#0f172a"/>
            <rect x="122" y="85" width="6" height="6" fill="#0f172a"/>

            {/* Left Input Shaft (High Speed, Lower Torque from Motor) */}
            <rect x="-20" y="46" width="50" height="12" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <rect x="-10" y="37" width="12" height="30" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <line x1="-20" y1="52" x2="-10" y2="52" stroke="#94a3b8" strokeWidth="1"/>

            {/* Right Output Shaft (Low Speed, High Torque to Crusher) */}
            <rect x="110" y="38" width="45" height="28" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <rect x="135" y="27" width="14" height="50" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <line x1="110" y1="52" x2="135" y2="52" stroke="#94a3b8" strokeWidth="2"/>

            {/* Main Enclosed Gearbox Housing */}
            <rect x="30" y="15" width="80" height="75" rx="6" fill="#e2e8f0" stroke="#1e293b" strokeWidth="3"/>
            <rect x="36" y="22" width="68" height="61" rx="4" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5"/>

            {/* Cooling Fins / Ribs (Horizontal) */}
            <line x1="36" y1="30" x2="104" y2="30" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="36" y1="40" x2="104" y2="40" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="36" y1="50" x2="104" y2="50" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="36" y1="60" x2="104" y2="60" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="36" y1="70" x2="104" y2="70" stroke="#94a3b8" strokeWidth="2"/>

            {/* Vertical Support Ribs */}
            <line x1="48" y1="22" x2="48" y2="83" stroke="#64748b" strokeWidth="3"/>
            <line x1="92" y1="22" x2="92" y2="83" stroke="#64748b" strokeWidth="3"/>

            {/* Central Output Gear / Bearing Cover */}
            <circle cx="70" cy="52" r="26" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            <circle cx="70" cy="52" r="16" fill="#94a3b8" stroke="#334155" strokeWidth="2"/>
            <circle cx="70" cy="52" r="5" fill="#0f172a"/>

            {/* Bearing Cover Fastener Bolts */}
            <circle cx="70" cy="32" r="2" fill="#1e293b"/>
            <circle cx="70" cy="72" r="2" fill="#1e293b"/>
            <circle cx="50" cy="52" r="2" fill="#1e293b"/>
            <circle cx="90" cy="52" r="2" fill="#1e293b"/>
            <circle cx="56" cy="38" r="2" fill="#1e293b"/>
            <circle cx="84" cy="38" r="2" fill="#1e293b"/>
            <circle cx="56" cy="66" r="2" fill="#1e293b"/>
            <circle cx="84" cy="66" r="2" fill="#1e293b"/>

            {/* Equipment Tag / Label Plate */}
            <rect x="25" y="112" width="90" height="22" rx="3" fill="#f8fafc" stroke="#334155" strokeWidth="2"/>
            <text x="70" y="128" textAnchor="middle" className="fill-text-primary text-[14px] font-mono font-bold uppercase tracking-widest pointer-events-none select-none">
                {label}
            </text>

            {/* Status Indicator (Vibration/Temperature Sensor Box) */}
            <rect x="94" y="12" width="18" height="18" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
            <circle cx="103" cy="21" r="5" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

        </g>);
};
export default CrusherGearbox;
