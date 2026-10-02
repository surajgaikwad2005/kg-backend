import React from 'react';
const CoalMillMotor = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "M-1200A", onPointerDown, }) => {
    // Status colors follow DCS standard logic
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Equipment Tag Label */}
            <text x="60" y="-22" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Base Mounting Frame */}
            <path d="M 10,60 L -5,82 L 125,82 L 110,60 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <circle cx="5" cy="76" r="2" fill="#475569"/>
            <circle cx="115" cy="76" r="2" fill="#475569"/>

            {/* Terminal / Junction Box */}
            <rect x="45" y="-12" width="30" height="15" rx="3" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="55" y1="-12" x2="55" y2="3" stroke="#1e293b" strokeWidth="2"/>
            <line x1="65" y1="-12" x2="65" y2="3" stroke="#1e293b" strokeWidth="2"/>

            {/* Main Motor Body (Cylinder) */}
            <rect x="0" y="0" width="120" height="65" rx="12" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Hardcoded Cooling Fins */}
            <line x1="20" y1="3" x2="20" y2="62" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="30" y1="3" x2="30" y2="62" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="40" y1="3" x2="40" y2="62" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="80" y1="3" x2="80" y2="62" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="90" y1="3" x2="90" y2="62" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="100" y1="3" x2="100" y2="62" stroke="#94a3b8" strokeWidth="2"/>

            {/* Motor Fan Vent / Cowling (Left Detail) */}
            <path d="M 0,15 L -8,20 L -8,45 L 0,50 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <line x1="-4" y1="25" x2="0" y2="25" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="-4" y1="32.5" x2="0" y2="32.5" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="-4" y1="40" x2="0" y2="40" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Drive Shaft Assembly */}
            <rect x="120" y="22" width="25" height="20" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Coupling Element */}
            <rect x="145" y="12" width="15" height="40" rx="3" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="152.5" y1="12" x2="152.5" y2="52" stroke="#334155" strokeWidth="1.5"/>
            
            {/* Outgoing Shaft to Coal Mill */}
            <rect x="160" y="26" width="20" height="12" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="165" y1="26" x2="165" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="170" y1="26" x2="170" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="175" y1="26" x2="175" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>

            {/* Main Dynamic Status Ring / Nameplate */}
            <circle cx="60" cy="32.5" r="24" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Status Colored Indicator */}
            <circle cx="60" cy="32.5" r="18" fill={statusColor}/>
            <text x="60" y="38" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900" fontFamily="monospace">M</text>

            {/* Status Radar/Pulse Ring */}
            <circle cx="60" cy="32.5" r="18" fill="none" stroke="#ffffff" strokeWidth="2">
                <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>

            {/* DCS Real-time Telemetry Readouts (Hardcoded layout, no loops) */}
            
            {/* Output Power (kW) */}
            <g transform="translate(-25, 90)">
                <rect width="55" height="18" fill="#0f172a" stroke="#475569" strokeWidth="1" rx="2"/>
                <text x="27.5" y="13" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">1195 kW</text>
            </g>
            
            {/* Motor Speed (RPM) */}
            <g transform="translate(35, 90)">
                <rect width="60" height="18" fill="#0f172a" stroke="#475569" strokeWidth="1" rx="2"/>
                <text x="30" y="13" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">1480 RPM</text>
            </g>
            
            {/* Vibration Sensor (mm/s) */}
            <g transform="translate(100, 90)">
                <rect width="65" height="18" fill="#0f172a" stroke="#475569" strokeWidth="1" rx="2"/>
                <text x="32.5" y="13" textAnchor="middle" fill="#a3e635" fontSize="10" fontFamily="monospace" fontWeight="bold">1.2 mm/s</text>
            </g>
            
        </g>);
};
export default CoalMillMotor;
