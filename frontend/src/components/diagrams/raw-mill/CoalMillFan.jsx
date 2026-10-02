import React from 'react';
const CoalMillFan = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "FAN-001", onPointerDown, }) => {
    // Determine exact colors outside of JSX to strictly comply with rules
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Common Ground Pad */}
            <rect x="0" y="80" width="135" height="8" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="5" y="88" width="125" height="4" fill="#475569"/>
            
            {/* Fan Base Brackets & Mounting Bolts */}
            <path d="M 22,72 L 48,72 L 53,80 L 17,80 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="22" cy="77" r="1.5" fill="#1e293b"/>
            <circle cx="48" cy="77" r="1.5" fill="#1e293b"/>

            {/* Motor Base Brackets & Mounting Bolts */}
            <path d="M 75,70 L 85,70 L 85,80 L 75,80 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M 105,70 L 115,70 L 115,80 L 105,80 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="80" cy="77" r="1.5" fill="#1e293b"/>
            <circle cx="110" cy="77" r="1.5" fill="#1e293b"/>

            {/* Drive Shaft & Coupling */}
            <rect x="58" y="47" width="14" height="6" fill="#64748b" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="62" y="44" width="6" height="12" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Motor Main Body */}
            <rect x="70" y="30" width="50" height="40" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Motor Cooling Fins (Unrolled loops) */}
            <line x1="75" y1="36" x2="115" y2="36" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="75" y1="41" x2="115" y2="41" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="75" y1="46" x2="115" y2="46" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="75" y1="51" x2="115" y2="51" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="75" y1="56" x2="115" y2="56" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="75" y1="61" x2="115" y2="61" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="75" y1="66" x2="115" y2="66" stroke="#94a3b8" strokeWidth="2"/>

            {/* Motor End Cap */}
            <path d="M 120,38 Q 130,50 120,62 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="122" cy="45" r="1" fill="#1e293b"/>
            <circle cx="122" cy="55" r="1" fill="#1e293b"/>

            {/* Motor Terminal Box */}
            <rect x="83" y="20" width="16" height="10" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="91" cy="25" r="2" fill="#1e293b"/>

            {/* Centrifugal Fan Casing (Volute Profile) */}
            <path d="M 10,50 L 10,10 L 35,10 L 35,25 A 25,25 0 1,1 10,50 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>

            {/* Hot Air Discharge Duct Flange */}
            <rect x="5" y="5" width="35" height="5" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="10" cy="7.5" r="1" fill="#1e293b"/>
            <circle cx="35" cy="7.5" r="1" fill="#1e293b"/>

            {/* Discharge Damper Valve Detail */}
            <circle cx="22.5" cy="20" r="10" fill="none" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="14" y1="25" x2="31" y2="15" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Damper Actuator Assembly */}
            <rect x="-4" y="16" width="14" height="8" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="3" cy="20" r="2" fill="#f8fafc"/>

            {/* Fan Intake Center Ring & Hub Structure */}
            <circle cx="35" cy="50" r="15" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="35" cy="50" r="6" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Fan Internal Impeller Blades Detail (Unrolled loop) */}
            <line x1="35" y1="44" x2="35" y2="35" stroke="#1e293b" strokeWidth="2"/>
            <line x1="35" y1="56" x2="35" y2="65" stroke="#1e293b" strokeWidth="2"/>
            <line x1="41" y1="50" x2="50" y2="50" stroke="#1e293b" strokeWidth="2"/>
            <line x1="29" y1="50" x2="20" y2="50" stroke="#1e293b" strokeWidth="2"/>
            <line x1="39.2" y1="45.8" x2="45.6" y2="39.4" stroke="#1e293b" strokeWidth="2"/>
            <line x1="30.8" y1="54.2" x2="24.4" y2="60.6" stroke="#1e293b" strokeWidth="2"/>
            <line x1="30.8" y1="45.8" x2="24.4" y2="39.4" stroke="#1e293b" strokeWidth="2"/>
            <line x1="39.2" y1="54.2" x2="45.6" y2="60.6" stroke="#1e293b" strokeWidth="2"/>

            {/* Hot Air Flow Direction Arrow (Status Driven Colors) */}
            <path d="M 22.5,-12 L 16,-2 L 29,-2 Z" fill={statusColor}/>
            <line x1="22.5" y1="-2" x2="22.5" y2="5" stroke={statusColor} strokeWidth="3"/>

            {/* Instrument Line & Indicator Panel */}
            <polyline points="91,20 91,-5 120,-5" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2"/>
            <circle cx="120" cy="-5" r="7" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Status LED inside Panel */}
            <circle cx="120" cy="-5" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* Equipment Name/Tag Label */}
            <text x="67.5" y="110" textAnchor="middle" className="fill-text-secondary text-[16px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default CoalMillFan;
