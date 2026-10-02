import React from 'react';
const CementMillVentFan = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "CM-VENT-01", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Main Foundation Plate */}
            <rect x="15" y="90" width="140" height="8" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Foundation Bolts */}
            <circle cx="25" cy="94" r="1.5" fill="#cbd5e1"/>
            <circle cx="75" cy="94" r="1.5" fill="#cbd5e1"/>
            <circle cx="145" cy="94" r="1.5" fill="#cbd5e1"/>

            {/* Equipment Mounts */}
            <rect x="35" y="80" width="20" height="10" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <rect x="100" y="75" width="30" height="15" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>

            {/* Inlet Duct (Left) */}
            <rect x="-5" y="45" width="20" height="20" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <rect x="15" y="40" width="6" height="30" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>

            {/* Discharge Duct Flange (Top) */}
            <rect x="40" y="5" width="40" height="6" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>

            {/* Main Fan Volute Casing (Centrifugal Spiral Shape) */}
            <path d="M 45,11 L 45,25 A 30,30 0 1,0 75,55 L 75,11 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>

            {/* Discharge Flow Internal Guide Lines */}
            <path d="M 60,35 L 60,15 M 55,22 L 60,15 L 65,22" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Drive Shaft Connecting Motor to Fan */}
            <rect x="75" y="51" width="20" height="8" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="80" y="49" width="10" height="12" fill="#64748b" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Motor Electrical Junction Box */}
            <rect x="110" y="25" width="20" height="10" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="115" y="20" width="10" height="5" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>

            {/* Main Motor Body */}
            <rect x="95" y="35" width="50" height="40" rx="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Motor End Bell Shield */}
            <path d="M 145,35 C 153,35 153,75 145,75 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Motor Cooling Fins (Hardcoded to strictly avoid .map()) */}
            <line x1="100" y1="41" x2="140" y2="41" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="100" y1="47" x2="140" y2="47" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="100" y1="53" x2="140" y2="53" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="100" y1="59" x2="140" y2="59" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="100" y1="65" x2="140" y2="65" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="100" y1="71" x2="140" y2="71" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>

            {/* Fan Internal Rotor Structure */}
            <circle cx="45" cy="55" r="14" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Fan Internal Spokes */}
            <line x1="45" y1="28" x2="45" y2="41" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
            <line x1="45" y1="69" x2="45" y2="82" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
            <line x1="18" y1="55" x2="31" y2="55" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>

            {/* Dynamic Status Hub */}
            <circle cx="45" cy="55" r="7" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* Equipment Health/Status Indicator Panel */}
            <rect x="130" y="102" width="20" height="6" rx="2" fill={statusColor} stroke="#1e293b" strokeWidth="1.5"/>

            {/* Process Airflow Direction Arrows */}
            <path d="M -20,55 L -10,55 M -15,50 L -10,55 L -15,60" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 60,-8 L 60,-18 M 55,-13 L 60,-18 L 65,-13" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Equipment Label */}
            <text x="80" y="-15" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
        </g>);
};
export default CementMillVentFan;
