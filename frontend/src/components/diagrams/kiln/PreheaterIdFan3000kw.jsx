import React from 'react';
const PreheaterIDFan = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "ID-FAN-3000", onPointerDown, }) => {
    // Determine color based on DCS status
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Dark Shadow under Foundation */}
            <rect x="-20" y="78" width="160" height="4" fill="#1e293b" opacity="0.3"/>

            {/* Base and Foundation Plates */}
            <rect x="-15" y="60" width="150" height="10" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <rect x="-20" y="70" width="160" height="8" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <path d="M -5,60 L 15,30 L 35,30 L 55,60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Inlet Duct (Behind Fan) */}
            <rect x="-40" y="4" width="45" height="32" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            <rect x="-45" y="-1" width="8" height="42" fill="#334155"/>
            
            {/* Flow Arrow - Inlet */}
            <polygon points="-20,18 -10,18 -10,14 -2,20 -10,26 -10,22 -20,22" fill="#94a3b8"/>
            
            {/* Inlet Damper Internal Lines */}
            <line x1="-10" y1="5" x2="-10" y2="35" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,2"/>

            {/* Main Volute Casing */}
            <circle cx="25" cy="20" r="35" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Outlet Duct */}
            <rect x="25" y="-40" width="30" height="40" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Mask to perfectly merge Volute and Outlet Duct without internal crossing lines */}
            <rect x="26.25" y="-16" width="27.5" height="20" fill="#f8fafc"/>
            
            {/* Outlet Duct Flange & Flow Arrow */}
            <rect x="20" y="-45" width="40" height="6" fill="#334155"/>
            <polygon points="38,-15 38,-25 42,-25 35,-33 28,-25 32,-25 32,-15" fill="#94a3b8"/>

            {/* Volute Stiffening Ribs (Drawn after mask to simulate front surface welds) */}
            <line x1="13" y1="20" x2="-10" y2="20" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="25" y1="32" x2="25" y2="55" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="16" y1="11" x2="0" y2="-5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="34" y1="11" x2="50" y2="-5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="34" y1="29" x2="50" y2="45" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="16" y1="29" x2="0" y2="45" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>

            {/* Center Hub & Main Bearing */}
            <circle cx="25" cy="20" r="12" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="25" cy="20" r="4" fill="#475569"/>

            {/* Drive Shaft to Motor */}
            <rect x="58" y="16" width="18" height="8" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Motor Foundation */}
            <rect x="80" y="40" width="30" height="20" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="75" y="55" width="40" height="6" fill="#334155"/>

            {/* 3000kW Motor Body */}
            <rect x="75" y="0" width="40" height="40" rx="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Motor Cooling Fins */}
            <line x1="80" y1="8" x2="110" y2="8" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="80" y1="14" x2="110" y2="14" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="80" y1="20" x2="110" y2="20" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="80" y1="26" x2="110" y2="26" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="80" y1="32" x2="110" y2="32" stroke="#64748b" strokeWidth="1.5"/>

            {/* Motor End Cooling Fan Cover */}
            <rect x="115" y="4" width="10" height="32" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>

            {/* Power Junction Box & Cabling */}
            <rect x="90" y="-8" width="12" height="8" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <path d="M 96,-8 L 96,-20 L 125,-20 L 125,-25" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Motor Rating Placard */}
            <rect x="85" y="15" width="20" height="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1"/>
            <text x="95" y="22" textAnchor="middle" className="fill-text-secondary text-[5px] font-mono font-bold pointer-events-none select-none">
                3000kW
            </text>

            {/* Motor Grounding (Earth) Connection */}
            <line x1="105" y1="40" x2="105" y2="65" stroke="#16a34a" strokeWidth="1.5"/>
            <line x1="97" y1="65" x2="113" y2="65" stroke="#16a34a" strokeWidth="1.5"/>
            <line x1="100" y1="68" x2="110" y2="68" stroke="#16a34a" strokeWidth="1.5"/>
            <line x1="103" y1="71" x2="107" y2="71" stroke="#16a34a" strokeWidth="1.5"/>

            {/* Damper Control Actuator */}
            <rect x="-15" y="-6" width="10" height="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="-10" cy="-1" r="3" fill="#eab308" stroke="#1e293b" strokeWidth="1"/>
            <line x1="-10" y1="2" x2="-10" y2="4" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Pressure Transmitter (PT) */}
            <rect x="5" y="-30" width="8" height="8" rx="1" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5"/>
            <text x="9" y="-24.5" textAnchor="middle" className="fill-text-primary text-[4px] font-mono font-bold pointer-events-none select-none">PT</text>
            <polyline points="13,-26 25,-26" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="1,1"/>

            {/* Vibration Transmitter (VT) on Motor Bearing */}
            <rect x="62" y="4" width="6" height="8" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1"/>
            <circle cx="65" cy="-1" r="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="1"/>
            <text x="65" y="0.5" textAnchor="middle" className="fill-text-muted text-[3px] font-mono font-bold pointer-events-none select-none">VT</text>

            {/* Local DCS Status Indicator Panel */}
            <rect x="115" y="-45" width="20" height="20" rx="3" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="125" cy="-35" r="5" fill={statusColor} stroke="#1e293b" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>

            {/* Main Equipment Nameplate */}
            <rect x="-5" y="-70" width="90" height="18" rx="2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
            <text x="40" y="-57" textAnchor="middle" className="fill-text-secondary text-[11px] font-mono font-black uppercase tracking-wider pointer-events-none select-none">
                {label}
            </text>

        </g>);
};
export default PreheaterIDFan;
