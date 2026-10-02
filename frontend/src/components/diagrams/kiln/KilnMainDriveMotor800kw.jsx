import React from 'react';
const KilnMainDriveMotor = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "M-801", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Foundation Slab */}
            <rect x="15" y="85" width="160" height="15" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Spec Plaque on Foundation */}
            <rect x="70" y="87" width="50" height="11" fill="#f8fafc" stroke="#1e293b" strokeWidth="1"/>
            <text x="95" y="95" textAnchor="middle" className="fill-text-secondary text-[9px] font-mono font-bold pointer-events-none select-none">
                800kW
            </text>

            {/* Motor Mounts */}
            <path d="M 45,65 L 35,85 L 65,85 L 55,65 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M 125,65 L 115,85 L 145,85 L 135,65 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>

            {/* Drive Shaft */}
            <rect x="155" y="34" width="35" height="12" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>

            {/* Girth Gear Coupling */}
            <rect x="190" y="10" width="20" height="60" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="190" y1="18" x2="210" y2="18" stroke="#1e293b" strokeWidth="2"/>
            <line x1="190" y1="26" x2="210" y2="26" stroke="#1e293b" strokeWidth="2"/>
            <line x1="190" y1="34" x2="210" y2="34" stroke="#1e293b" strokeWidth="2"/>
            <line x1="190" y1="42" x2="210" y2="42" stroke="#1e293b" strokeWidth="2"/>
            <line x1="190" y1="50" x2="210" y2="50" stroke="#1e293b" strokeWidth="2"/>
            <line x1="190" y1="58" x2="210" y2="58" stroke="#1e293b" strokeWidth="2"/>
            <line x1="190" y1="66" x2="210" y2="66" stroke="#1e293b" strokeWidth="2"/>

            {/* Motor Casing Outer Outline */}
            <rect x="25" y="15" width="130" height="50" rx="8" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* End Bell Dividers */}
            <line x1="45" y1="15" x2="45" y2="65" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="135" y1="15" x2="135" y2="65" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Motor Cooling Fins */}
            <line x1="45" y1="22" x2="135" y2="22" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="45" y1="30" x2="135" y2="30" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="45" y1="38" x2="135" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="45" y1="46" x2="135" y2="46" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="45" y1="54" x2="135" y2="54" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="45" y1="62" x2="135" y2="62" stroke="#94a3b8" strokeWidth="1.5"/>

            {/* Top Junction Box & Cable */}
            <path d="M 90,0 L 90,-12 L 105,-12" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="75" y="0" width="30" height="15" rx="1" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Power Status Light on Junction Box */}
            <circle cx="90" cy="7.5" r="4" fill={statusColor} stroke="#1e293b" strokeWidth="1.5"/>

            {/* Rotation Indicator (Curved Arrow above Gear) */}
            <path d="M 195,0 A 15,15 0 0,1 215,16" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2"/>
            <polygon points="211,14 219,14 215,20" fill="#64748b"/>

            {/* Tag Label */}
            <text x="95" y="-22" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Main Alert / Status Beacon */}
            <circle cx="225" cy="0" r="5" fill={statusColor} stroke="#1e293b" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>
        </g>);
};
export default KilnMainDriveMotor;
