import React from 'react';
const FeedChute = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "FC-101", onPointerDown, }) => {
    // Dynamic calculations must be outside JSX
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Background Drop Shadow */}
            <path d="M 23 13 L 73 13 L 113 113 L 63 113 Z" fill="#94a3b8" opacity="0.3"/>

            {/* Main Inclined Duct Body */}
            <path d="M 20 10 L 70 10 L 110 110 L 60 110 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>

            {/* Duct 3D Highlights and Shadows (Simulated Depth) */}
            <polygon points="20,10 30,10 70,110 60,110" fill="#ffffff" opacity="0.4" pointerEvents="none"/>
            <polygon points="60,10 70,10 110,110 100,110" fill="#000000" opacity="0.1" pointerEvents="none"/>

            {/* Structural Reinforcement Rib 1 */}
            <line x1="28" y1="30" x2="78" y2="30" stroke="#1e293b" strokeWidth="3.5"/>
            <line x1="28" y1="30" x2="78" y2="30" stroke="#94a3b8" strokeWidth="1.5"/>

            {/* Structural Reinforcement Rib 2 */}
            <line x1="52" y1="90" x2="102" y2="90" stroke="#1e293b" strokeWidth="3.5"/>
            <line x1="52" y1="90" x2="102" y2="90" stroke="#94a3b8" strokeWidth="1.5"/>

            {/* Inspection Hatch */}
            <polygon points="49,45 69,45 81,75 61,75" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            <polygon points="52,49 66,49 76,71 62,71" fill="#334155" stroke="#0f172a" strokeWidth="1"/>
            
            {/* Hatch Corner Bolts */}
            <circle cx="51" cy="47" r="1.5" fill="#1e293b"/>
            <circle cx="67" cy="47" r="1.5" fill="#1e293b"/>
            <circle cx="79" cy="73" r="1.5" fill="#1e293b"/>
            <circle cx="63" cy="73" r="1.5" fill="#1e293b"/>

            {/* Flow Direction Chevron (Painted on Chute) */}
            <path d="M 54 52 L 65 65 L 76 52" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            <path d="M 56 60 L 65 71 L 74 60" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>

            {/* Top Inlet Flange */}
            <rect x="10" y="0" width="70" height="10" rx="1.5" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="12" y1="5" x2="78" y2="5" stroke="#1e293b" strokeWidth="1" opacity="0.4"/>
            
            {/* Top Flange Bolts */}
            <circle cx="15" cy="5" r="1.5" fill="#f8fafc"/>
            <circle cx="35" cy="5" r="1.5" fill="#f8fafc"/>
            <circle cx="55" cy="5" r="1.5" fill="#f8fafc"/>
            <circle cx="75" cy="5" r="1.5" fill="#f8fafc"/>

            {/* Bottom Outlet Flange */}
            <rect x="50" y="110" width="70" height="10" rx="1.5" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="52" y1="115" x2="118" y2="115" stroke="#1e293b" strokeWidth="1" opacity="0.4"/>
            
            {/* Bottom Flange Bolts */}
            <circle cx="55" cy="115" r="1.5" fill="#f8fafc"/>
            <circle cx="75" cy="115" r="1.5" fill="#f8fafc"/>
            <circle cx="95" cy="115" r="1.5" fill="#f8fafc"/>
            <circle cx="115" cy="115" r="1.5" fill="#f8fafc"/>

            {/* Side Support Bracket */}
            <rect x="25" y="45" width="10" height="15" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="30" cy="52.5" r="2" fill="#1e293b"/>

            {/* Equipment Label */}
            <text x="45" y="-15" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Status Indicator Module */}
            <rect x="-10" y="-5" width="18" height="24" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="-1" cy="7" r="4" fill={statusColor} stroke="#0f172a" strokeWidth="1"/>
            <circle cx="-1" cy="7" r="8" fill={statusColor} opacity="0.3" pointerEvents="none">
                <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1.5s" repeatCount="indefinite"/>
            </circle>
        </g>);
};
export default FeedChute;
