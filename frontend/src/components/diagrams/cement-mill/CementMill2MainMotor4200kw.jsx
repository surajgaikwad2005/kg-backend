import React from 'react';
const CementMillMotor = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "CM2-M-4200", onPointerDown, }) => {
    // Pre-calculate state outside JSX to strictly follow Frontend Parser Rules
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Equipment Baseplate */}
            <rect x="5" y="75" width="170" height="12" rx="2" fill="#334155" stroke="#0f172a" strokeWidth="2.5"/>
            <rect x="0" y="87" width="180" height="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1"/>
            
            {/* Motor Mounting Feet */}
            <path d="M 35 66 L 45 66 L 50 75 L 30 75 Z" fill="#64748b" stroke="#0f172a" strokeWidth="2"/>
            <path d="M 135 66 L 145 66 L 150 75 L 130 75 Z" fill="#64748b" stroke="#0f172a" strokeWidth="2"/>

            {/* Drive Coupling & Shaft (Left Side - Driving Mill) */}
            <rect x="-15" y="32" width="45" height="12" fill="#94a3b8" stroke="#0f172a" strokeWidth="2"/>
            <rect x="-28" y="24" width="13" height="28" rx="2" fill="#475569" stroke="#0f172a" strokeWidth="2.5"/>
            <line x1="-21" y1="24" x2="-21" y2="52" stroke="#0f172a" strokeWidth="1.5"/>
            <rect x="-38" y="28" width="10" height="20" rx="1" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2"/>

            {/* Main Motor Housing (Stator Core) */}
            <rect x="30" y="10" width="120" height="56" rx="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2.5"/>
            <path d="M 150 16 Q 165 38 150 60" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2.5"/>
            
            {/* Hardcoded Cooling Ribs (No .map() allowed) */}
            <line x1="35" y1="18" x2="145" y2="18" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="35" y1="26" x2="145" y2="26" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="35" y1="34" x2="145" y2="34" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="35" y1="42" x2="145" y2="42" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="35" y1="50" x2="145" y2="50" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="35" y1="58" x2="145" y2="58" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>

            {/* End Cap Detail */}
            <circle cx="151" cy="38" r="6" fill="#94a3b8" stroke="#0f172a" strokeWidth="2"/>

            {/* Terminal Junction Box (Top Side) */}
            <rect x="85" y="-12" width="38" height="22" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5"/>
            <rect x="90" y="-6" width="28" height="12" fill="#1e293b" stroke="#0f172a" strokeWidth="1"/>
            {/* Terminal block studs */}
            <circle cx="96" cy="0" r="1.5" fill="#f8fafc"/>
            <circle cx="104" cy="0" r="1.5" fill="#f8fafc"/>
            <circle cx="112" cy="0" r="1.5" fill="#f8fafc"/>
            
            {/* High Voltage Conduit Routing */}
            <path d="M 123 -1 L 140 -1 L 140 100" fill="none" stroke="#475569" strokeWidth="6" strokeLinejoin="round"/>
            <path d="M 123 -1 L 140 -1 L 140 100" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"/>

            {/* Dynamic Flow/Power Input Line overlay matching Status */}
            <path d="M 140 -1 L 140 100" fill="none" stroke={statusColor} strokeWidth="2" strokeDasharray="6 4">
                <animate attributeName="stroke-dashoffset" values="10;0" dur="1s" repeatCount="indefinite"/>
            </path>

            {/* Equipment Nameplate */}
            <rect x="58" y="28" width="24" height="12" rx="1" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5"/>
            <line x1="61" y1="31" x2="79" y2="31" stroke="#475569" strokeWidth="1"/>
            <line x1="61" y1="34" x2="75" y2="34" stroke="#475569" strokeWidth="1"/>
            <line x1="61" y1="37" x2="79" y2="37" stroke="#475569" strokeWidth="1"/>

            {/* Active DCS Status Light */}
            <circle cx="168" cy="5" r="7" fill={statusColor} stroke="#0f172a" strokeWidth="2">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* DCS Overlay Readouts */}
            <text x="90" y="115" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
            <text x="90" y="130" textAnchor="middle" fill="#64748b" className="text-[12px] font-mono font-bold tracking-widest pointer-events-none select-none">
                4200kW MAIN DRV
            </text>
            
            {/* Highlight Accent Line based on Status */}
            <line x1="5" y1="87" x2="175" y2="87" stroke={statusColor} strokeWidth="3" opacity="0.8"/>
        </g>);
};
export default CementMillMotor;
