import React from 'react';
const VerticalRollerMill = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "RM-1010", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Top Product Outlet */}
            <rect x="45" y="-20" width="30" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Top Separator / Classifier Section */}
            <polygon points="20,30 10,10 110,10 100,30" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Classifier Inner Vanes */}
            <line x1="30" y1="10" x2="30" y2="30" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="50" y1="10" x2="50" y2="30" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="70" y1="10" x2="70" y2="30" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="90" y1="10" x2="90" y2="30" stroke="#94a3b8" strokeWidth="2"/>

            {/* Main Cylindrical Housing */}
            <rect x="20" y="30" width="80" height="105" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Housing Segment Lines */}
            <line x1="20" y1="60" x2="100" y2="60" stroke="#cbd5e1" strokeWidth="1.5"/>
            <line x1="20" y1="90" x2="100" y2="90" stroke="#cbd5e1" strokeWidth="1.5"/>

            {/* Raw Material Inlet Chute (Left side) */}
            <polygon points="-10,40 20,60 20,75 -10,55" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="-10" y="35" width="8" height="25" fill="#334155"/>

            {/* Hot Air / Gas Inlet (Bottom Right side) */}
            <polygon points="100,120 120,120 120,135 95,135" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="120" y="115" width="8" height="25" fill="#334155"/>

            {/* Grinding Base / Table */}
            <polygon points="30,115 90,115 100,135 20,135" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>

            {/* Material Bed (Under Rollers) */}
            <ellipse cx="60" cy="115" rx="28" ry="4" fill="#475569"/>

            {/* Grinding Rollers */}
            {/* Left Roller */}
            <g transform="translate(45, 95) rotate(20)">
                <ellipse cx="0" cy="0" rx="12" ry="22" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
                <line x1="0" y1="-22" x2="0" y2="22" stroke="#1e293b" strokeWidth="1.5"/>
                <circle cx="0" cy="0" r="3" fill="#1e293b"/>
            </g>

            {/* Right Roller */}
            <g transform="translate(75, 95) rotate(-20)">
                <ellipse cx="0" cy="0" rx="12" ry="22" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
                <line x1="0" y1="-22" x2="0" y2="22" stroke="#1e293b" strokeWidth="1.5"/>
                <circle cx="0" cy="0" r="3" fill="#1e293b"/>
            </g>

            {/* Hydraulic Pressure Arms */}
            <path d="M 20,75 L 38,80" fill="none" stroke="#64748b" strokeWidth="4"/>
            <path d="M 100,75 L 82,80" fill="none" stroke="#64748b" strokeWidth="4"/>

            {/* Drive Motor and Gearbox Base */}
            <rect x="30" y="135" width="60" height="15" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="40" y="150" width="40" height="20" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="35" y="170" width="50" height="5" fill="#1e293b"/>

            {/* Equipment Label */}
            <text x="60" y="-30" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Status Indicator */}
            <circle cx="115" cy="-5" r="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>

        </g>);
};
export default VerticalRollerMill;
