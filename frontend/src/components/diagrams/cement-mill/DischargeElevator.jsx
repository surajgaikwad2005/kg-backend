import React from 'react';
const DischargeElevator = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "ELV-100", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Top Drive Unit */}
            <rect x="25" y="-12" width="30" height="12" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <rect x="55" y="-16" width="22" height="18" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <line x1="35" y1="-12" x2="35" y2="0" stroke="#1e293b" strokeWidth="2"/>
            <line x1="45" y1="-12" x2="45" y2="0" stroke="#1e293b" strokeWidth="2"/>

            {/* Support Structure Lines */}
            <line x1="10" y1="50" x2="70" y2="50" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="10" y1="100" x2="70" y2="100" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="10" y1="150" x2="70" y2="150" stroke="#cbd5e1" strokeWidth="2"/>

            {/* Feed Inlet (Bottom Left from Mill) */}
            <path d="M -5,145 L 20,150 L 20,170 L -5,155 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            
            {/* Discharge Outlet (Top Right) */}
            <path d="M 60,35 L 85,45 L 85,55 L 60,45 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Main Vertical Casing */}
            <path d="M 20,20 L 20,180 A 20,20 0 0,0 60,180 L 60,20 A 20,20 0 0,0 20,20 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Center Divider Wall */}
            <line x1="40" y1="35" x2="40" y2="165" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 2"/>

            {/* Inspection Hatches */}
            <rect x="24" y="80" width="12" height="20" rx="1" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5"/>
            <rect x="44" y="80" width="12" height="20" rx="1" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5"/>
            <circle cx="26" cy="90" r="1.5" fill="#334155"/>
            <circle cx="46" cy="90" r="1.5" fill="#334155"/>

            {/* Internal Belt / Chain Lines */}
            <line x1="30" y1="20" x2="30" y2="180" stroke="#cbd5e1" strokeWidth="1.5"/>
            <line x1="50" y1="20" x2="50" y2="180" stroke="#cbd5e1" strokeWidth="1.5"/>

            {/* Top and Bottom Pulleys */}
            <circle cx="40" cy="20" r="10" fill="#e2e8f0" stroke="#475569" strokeWidth="2"/>
            <circle cx="40" cy="20" r="3" fill="#1e293b"/>
            <circle cx="40" cy="180" r="10" fill="#e2e8f0" stroke="#475569" strokeWidth="2"/>
            <circle cx="40" cy="180" r="3" fill="#1e293b"/>

            {/* UPWARD BUCKETS (Right Side) */}
            <path d="M 50,165 L 56,165 L 58,155 L 50,155 Z" fill="#64748b" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M 50,135 L 56,135 L 58,125 L 50,125 Z" fill="#64748b" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M 50,105 L 56,105 L 58,95 L 50,95 Z" fill="#64748b" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M 50,75 L 56,75 L 58,65 L 50,65 Z" fill="#64748b" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M 50,45 L 56,45 L 58,35 L 50,35 Z" fill="#64748b" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round"/>

            {/* DOWNWARD BUCKETS (Left Side - Upside Down) */}
            <path d="M 30,155 L 24,155 L 22,165 L 30,165 Z" fill="#64748b" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M 30,125 L 24,125 L 22,135 L 30,135 Z" fill="#64748b" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M 30,95 L 24,95 L 22,105 L 30,105 Z" fill="#64748b" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M 30,65 L 24,65 L 22,75 L 30,75 Z" fill="#64748b" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M 30,35 L 24,35 L 22,45 L 30,45 Z" fill="#64748b" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round"/>

            {/* Base Support Platform */}
            <rect x="10" y="200" width="60" height="6" rx="1" fill="#334155" stroke="#1e293b" strokeWidth="1.5"/>
            <polygon points="20,200 25,195 55,195 60,200" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Equipment Label */}
            <text x="40" y="-28" textAnchor="middle" className="fill-text-secondary text-[16px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* DCS Status Control Box & Light */}
            <rect x="65" y="85" width="20" height="25" rx="2" fill="#f8fafc" stroke="#475569" strokeWidth="1.5"/>
            <line x1="60" y1="97" x2="65" y2="97" stroke="#475569" strokeWidth="1.5"/>
            <circle cx="75" cy="97.5" r="5" fill={statusColor} stroke="#1e293b" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>
        </g>);
};
export default DischargeElevator;
