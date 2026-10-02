import React from 'react';
const RawMillMainMotor = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "4500kW-RM-M1", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* BASE FRAME */}
            <rect x="0" y="100" width="280" height="8" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <rect x="10" y="108" width="260" height="15" fill="#1e293b"/>
            {/* Base Frame Cross Bracing */}
            <polyline points="10,108 30,123 50,108 70,123 90,108 110,123 130,108 150,123 170,108 190,123 210,108 230,123 250,108 270,123" fill="none" stroke="#0f172a" strokeWidth="3"/>
            <rect x="0" y="123" width="280" height="6" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 20 100 L 10 100 L 10 135" fill="none" stroke="#22c55e" strokeWidth="2"/>

            {/* MOTOR MOUNTS (FEET) */}
            <path d="M 35 100 L 40 80 L 70 80 L 75 100 Z" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <polygon points="40,80 50,80 40,90" fill="#1e293b"/>
            <polygon points="70,80 60,80 70,90" fill="#1e293b"/>
            <circle cx="45" cy="95" r="2" fill="#0f172a"/>
            <circle cx="65" cy="95" r="2" fill="#0f172a"/>

            <path d="M 135 100 L 140 80 L 170 80 L 175 100 Z" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <polygon points="140,80 150,80 140,90" fill="#1e293b"/>
            <polygon points="170,80 160,80 170,90" fill="#1e293b"/>
            <circle cx="145" cy="95" r="2" fill="#0f172a"/>
            <circle cx="165" cy="95" r="2" fill="#0f172a"/>

            {/* REAR FAN COVER (NON-DRIVE END) */}
            <path d="M 20 15 L 0 25 L 0 65 L 20 75 Z" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <rect x="5" y="30" width="5" height="6" fill="#020617"/>
            <rect x="5" y="40" width="5" height="6" fill="#020617"/>
            <rect x="5" y="50" width="5" height="6" fill="#020617"/>
            <rect x="5" y="60" width="5" height="6" fill="#020617"/>
            <line x1="2" y1="28" x2="12" y2="28" stroke="#1e293b" strokeWidth="1"/>
            <line x1="2" y1="38" x2="12" y2="38" stroke="#1e293b" strokeWidth="1"/>
            <line x1="2" y1="48" x2="12" y2="48" stroke="#1e293b" strokeWidth="1"/>
            <line x1="2" y1="58" x2="12" y2="58" stroke="#1e293b" strokeWidth="1"/>

            {/* MAIN MOTOR BODY */}
            <rect x="20" y="10" width="160" height="70" rx="6" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            
            {/* HEAT FINS */}
            <line x1="30" y1="20" x2="170" y2="20" stroke="#334155" strokeWidth="2"/>
            <line x1="30" y1="30" x2="170" y2="30" stroke="#334155" strokeWidth="2"/>
            <line x1="30" y1="40" x2="170" y2="40" stroke="#334155" strokeWidth="2"/>
            <line x1="30" y1="50" x2="170" y2="50" stroke="#334155" strokeWidth="2"/>
            <line x1="30" y1="60" x2="170" y2="60" stroke="#334155" strokeWidth="2"/>
            <line x1="30" y1="70" x2="170" y2="70" stroke="#334155" strokeWidth="2"/>

            {/* BODY HIGHLIGHT & SHADOW */}
            <line x1="25" y1="15" x2="175" y2="15" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="25" y1="75" x2="175" y2="75" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>

            {/* LIFTING LUGS */}
            <circle cx="60" cy="5" r="4" fill="none" stroke="#64748b" strokeWidth="2"/>
            <rect x="58" y="9" width="4" height="6" fill="#64748b"/>
            <circle cx="120" cy="5" r="4" fill="none" stroke="#64748b" strokeWidth="2"/>
            <rect x="118" y="9" width="4" height="6" fill="#64748b"/>

            {/* FRONT FLANGE (DRIVE END) */}
            <rect x="180" y="15" width="12" height="60" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="2"/>

            {/* DRIVE SHAFT */}
            <rect x="192" y="35" width="28" height="20" fill="#94a3b8" stroke="#64748b" strokeWidth="2"/>
            <line x1="192" y1="40" x2="220" y2="40" stroke="#cbd5e1" strokeWidth="1"/>
            <line x1="192" y1="50" x2="220" y2="50" stroke="#64748b" strokeWidth="1"/>

            {/* SPEED SENSOR ON SHAFT */}
            <rect x="200" y="25" width="4" height="10" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
            <line x1="202" y1="20" x2="202" y2="25" stroke="#cbd5e1" strokeWidth="2"/>
            <circle cx="202" cy="18" r="3" fill="#ef4444"/>
            <path d="M 202 15 L 202 5 L 180 5" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2"/>

            {/* HEAVY DUTY COUPLING */}
            <rect x="220" y="15" width="15" height="60" rx="2" fill="#1e293b" stroke="#020617" strokeWidth="2"/>
            <rect x="235" y="15" width="15" height="60" rx="2" fill="#334155" stroke="#020617" strokeWidth="2"/>
            <line x1="235" y1="15" x2="235" y2="75" stroke="#020617" strokeWidth="2"/>
            
            {/* Coupling Bolts */}
            <rect x="218" y="20" width="34" height="4" fill="#64748b" stroke="#020617" strokeWidth="1"/>
            <rect x="218" y="30" width="34" height="4" fill="#64748b" stroke="#020617" strokeWidth="1"/>
            <rect x="218" y="40" width="34" height="4" fill="#64748b" stroke="#020617" strokeWidth="1"/>
            <rect x="218" y="50" width="34" height="4" fill="#64748b" stroke="#020617" strokeWidth="1"/>
            <rect x="218" y="60" width="34" height="4" fill="#64748b" stroke="#020617" strokeWidth="1"/>
            <rect x="218" y="70" width="34" height="4" fill="#64748b" stroke="#020617" strokeWidth="1"/>

            {/* OUTPUT SHAFT & GEARBOX INPUT TIE-IN */}
            <rect x="250" y="35" width="10" height="20" fill="#94a3b8" stroke="#475569" strokeWidth="2"/>
            <path d="M 270 0 L 270 123 L 300 123 L 300 0 Z" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 270 20 L 260 20 L 260 70 L 270 70 Z" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <rect x="270" y="100" width="30" height="23" fill="#1e293b"/>
            <circle cx="295" cy="45" r="15" fill="none" stroke="#334155" strokeWidth="4"/>
            <circle cx="295" cy="45" r="5" fill="#1e293b"/>
            <circle cx="285" cy="5" r="4" fill="none" stroke="#64748b" strokeWidth="2"/>
            <rect x="283" y="9" width="4" height="6" fill="#64748b"/>

            {/* TERMINAL BOX (HIGH VOLTAGE) */}
            <rect x="120" y="-20" width="40" height="30" rx="3" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <polygon points="140,-15 145,-5 135,-5" fill="#eab308" stroke="#ca8a04" strokeWidth="1"/>
            <line x1="140" y1="-12" x2="140" y2="-8" stroke="#000000" strokeWidth="1"/>
            <circle cx="140" cy="-6" r="0.5" fill="#000000"/>
            <rect x="160" y="-10" width="10" height="10" fill="#94a3b8" stroke="#475569" strokeWidth="1"/>
            
            {/* POWER CABLE TRAY/CONDUIT */}
            <path d="M 170 -5 Q 180 -5 180 -15 L 180 -80" fill="none" stroke="#1e293b" strokeWidth="8"/>
            <path d="M 170 -5 Q 180 -5 180 -15 L 180 -80" fill="none" stroke="#475569" strokeWidth="4"/>

            {/* MOTOR NAMEPLATE */}
            <rect x="80" y="35" width="40" height="20" rx="1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1"/>
            <text x="100" y="48" textAnchor="middle" className="fill-text-primary text-[9px] font-sans font-bold pointer-events-none select-none">4500 kW</text>

            {/* VIBRATION SENSOR */}
            <rect x="30" y="5" width="8" height="5" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
            <circle cx="34" cy="2" r="3" fill="#eab308"/>
            <path d="M 34 0 L 34 -20 L 50 -20" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="1 1"/>

            {/* DYNAMIC DCS STATUS ALERTS */}
            <rect x="20" y="-95" width="260" height="6" rx="3" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </rect>
            <circle cx="20" cy="-92" r="8" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* EQUIPMENT LABEL */}
            <text x="150" y="-70" textAnchor="middle" className="fill-text-secondary text-[22px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default RawMillMainMotor;
