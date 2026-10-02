import React from 'react';
const RotaryFeeder = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "RF-100", onPointerDown, }) => {
    // Status Color Computation (Outside JSX per rules)
    let statusColor = '#0369a1';
    if (status === 'hazard') {
        statusColor = '#ef4444';
    }
    else if (status === 'warning') {
        statusColor = '#eab308';
    }
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Tag / Label */}
            <text x="60" y="-20" textAnchor="middle" className="fill-text-primary text-[16px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Status Blinker Indicator */}
            <circle cx="118" cy="10" r="6" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* Purge Gas Air Seal Inlet */}
            <line x1="5" y1="60" x2="20" y2="60" stroke="#64748b" strokeWidth="3"/>
            <polygon points="5,55 5,65 15,60" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
            <circle cx="5" cy="60" r="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Top Inlet Transition Chute */}
            <path d="M 35,0 L 85,0 L 75,25 L 45,25 Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            
            {/* Bottom Outlet Transition Chute */}
            <path d="M 45,95 L 75,95 L 85,120 L 35,120 Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Top Mounting Flange */}
            <rect x="25" y="-8" width="70" height="8" rx="1" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="30" cy="-4" r="1.5" fill="#1e293b"/>
            <circle cx="90" cy="-4" r="1.5" fill="#1e293b"/>

            {/* Bottom Mounting Flange */}
            <rect x="25" y="120" width="70" height="8" rx="1" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="30" cy="124" r="1.5" fill="#1e293b"/>
            <circle cx="90" cy="124" r="1.5" fill="#1e293b"/>

            {/* Side Motor Drive Unit */}
            <rect x="95" y="45" width="30" height="30" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="105" y="38" width="10" height="7" rx="1" fill="#64748b" stroke="#1e293b" strokeWidth="1.5"/>
            
            {/* Motor Shaft/Coupler */}
            <rect x="85" y="54" width="10" height="12" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            
            {/* Motor Cooling Fins */}
            <line x1="100" y1="50" x2="120" y2="50" stroke="#475569" strokeWidth="1.5"/>
            <line x1="100" y1="55" x2="120" y2="55" stroke="#475569" strokeWidth="1.5"/>
            <line x1="100" y1="60" x2="120" y2="60" stroke="#475569" strokeWidth="1.5"/>
            <line x1="100" y1="65" x2="120" y2="65" stroke="#475569" strokeWidth="1.5"/>
            <line x1="100" y1="70" x2="120" y2="70" stroke="#475569" strokeWidth="1.5"/>

            {/* Main Cylindrical Housing */}
            <circle cx="60" cy="60" r="42" fill="#f8fafc" stroke={statusColor} strokeWidth="3"/>
            
            {/* Inner Wear Lining / Tolerance Gap */}
            <circle cx="60" cy="60" r="35" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5"/>

            {/* Rotating Vane Rotor Assembly */}
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="4s" repeatCount="indefinite"/>
                
                {/* 8-Vane Configuration (Manually laid out per rules) */}
                <line x1="60" y1="60" x2="60" y2="26" stroke="#334155" strokeWidth="6" strokeLinecap="round"/>
                <line x1="60" y1="60" x2="60" y2="94" stroke="#334155" strokeWidth="6" strokeLinecap="round"/>
                <line x1="60" y1="60" x2="94" y2="60" stroke="#334155" strokeWidth="6" strokeLinecap="round"/>
                <line x1="60" y1="60" x2="26" y2="60" stroke="#334155" strokeWidth="6" strokeLinecap="round"/>
                <line x1="60" y1="60" x2="84" y2="84" stroke="#334155" strokeWidth="6" strokeLinecap="round"/>
                <line x1="60" y1="60" x2="36" y2="84" stroke="#334155" strokeWidth="6" strokeLinecap="round"/>
                <line x1="60" y1="60" x2="36" y2="36" stroke="#334155" strokeWidth="6" strokeLinecap="round"/>
                <line x1="60" y1="60" x2="84" y2="36" stroke="#334155" strokeWidth="6" strokeLinecap="round"/>

                {/* Rotor Center Hub */}
                <circle cx="60" cy="60" r="14" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
                <circle cx="60" cy="60" r="6" fill="#1e293b"/>
                <circle cx="60" cy="60" r="2" fill="#f8fafc"/>
            </g>

            {/* Inward Material Flow Indicator */}
            <path d="M 60,6 L 60,18 M 55,13 L 60,18 L 65,13" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Outward Material Flow Indicator */}
            <path d="M 60,102 L 60,114 M 55,109 L 60,114 L 65,109" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

        </g>);
};
export default RotaryFeeder;
