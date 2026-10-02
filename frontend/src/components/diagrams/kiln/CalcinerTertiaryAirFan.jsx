import React from 'react';
const CalcinerTertiaryAirFan = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "TAF-310", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Power Cable Line */}
            <path d="M 31 38 L 31 25 L -5 25" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 2"/>
            
            {/* Vibration Isolators */}
            <rect x="10" y="102" width="10" height="6" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="70" y="102" width="10" height="6" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="130" y="102" width="10" height="6" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Main Base Plate */}
            <rect x="0" y="90" width="150" height="12" rx="2" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="15" cy="96" r="1.5" fill="#0f172a"/>
            <circle cx="75" cy="96" r="1.5" fill="#0f172a"/>
            <circle cx="135" cy="96" r="1.5" fill="#0f172a"/>

            {/* Motor Support Base */}
            <path d="M 20 90 L 25 75 L 50 75 L 55 90 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            
            {/* Casing Support Base */}
            <path d="M 85 90 L 95 80 L 115 80 L 125 90 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Motor Cylinder */}
            <rect x="10" y="45" width="45" height="30" rx="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <line x1="20" y1="45" x2="20" y2="75" stroke="#64748b" strokeWidth="2"/>
            <line x1="30" y1="45" x2="30" y2="75" stroke="#64748b" strokeWidth="2"/>
            <line x1="40" y1="45" x2="40" y2="75" stroke="#64748b" strokeWidth="2"/>
            
            {/* Motor End Cap */}
            <rect x="4" y="52" width="6" height="16" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Motor Terminal Box */}
            <rect x="25" y="38" width="12" height="7" rx="1" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Shaft & Coupling */}
            <rect x="55" y="55" width="15" height="10" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 55 52 L 70 52 L 70 68 L 55 68 Z" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>

            {/* Volute / Fan Casing */}
            <path d="M 105 20 L 105 0 L 135 0 L 135 55 A 35 35 0 1 1 100 20 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            
            {/* Discharge Flange */}
            <rect x="100" y="-5" width="40" height="5" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>

            {/* Discharge Damper Assembly */}
            <line x1="102" y1="10" x2="138" y2="10" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="140" cy="10" r="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="140" y1="10" x2="148" y2="5" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Flow Arrow in Duct */}
            <path d="M 120 30 L 120 15 M 115 20 L 120 15 L 125 20" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Pressure Transmitter Instrument */}
            <circle cx="120" cy="-15" r="2.5" fill="#334155"/>
            <path d="M 120 -15 L 145 -15 L 145 -5" fill="none" stroke="#334155" strokeWidth="1.5"/>
            <rect x="135" y="-5" width="20" height="14" rx="2" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5"/>
            <text x="145" y="5" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#0f172a">PT</text>

            {/* Impeller Inner Eye */}
            <circle cx="100" cy="55" r="18" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Impeller Blades */}
            <path d="M 100 50 L 100 37 M 100 60 L 100 73 M 105 55 L 118 55 M 95 55 L 82 55 M 103.5 51.5 L 112.7 42.3 M 96.5 51.5 L 87.3 42.3 M 103.5 58.5 L 112.7 67.7 M 96.5 58.5 L 87.3 67.7" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>

            {/* Airflow / Spin Indicator Arcs */}
            <path d="M 82 37 A 25 25 0 0 1 118 37" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M 118 73 A 25 25 0 0 1 82 73" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>

            {/* Dynamic Active Hub Indicator */}
            <circle cx="100" cy="55" r="5" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>

            {/* Equipment Label */}
            <rect x="35" y="112" width="80" height="20" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1"/>
            <text x="75" y="126" textAnchor="middle" className="fill-text-secondary text-[14px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Independent Status Panel Light */}
            <rect x="155" y="45" width="8" height="20" fill="#334155" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="159" cy="55" r="3" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>
        </g>);
};
export default CalcinerTertiaryAirFan;
