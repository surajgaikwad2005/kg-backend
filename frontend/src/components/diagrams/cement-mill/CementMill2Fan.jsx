import React from 'react';
const CementMillFan = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "CM-FAN-02", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Concrete Foundation / Base */}
            <rect x="25" y="125" width="70" height="12" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="35" y="95" width="50" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Volute Casing (Main Centrifugal Fan Body) */}
            <path d="M 60 20 L 100 20 L 100 65 A 40 40 0 1 1 60 25 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Inner Decorative Casing Outline for depth */}
            <path d="M 92 65 A 32 32 0 1 1 60 33" fill="none" stroke="#cbd5e1" strokeWidth="2"/>

            {/* Radial Casing Ribs for structural detail */}
            <line x1="60" y1="65" x2="100" y2="65" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="60" y1="65" x2="60" y2="105" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="60" y1="65" x2="20" y2="65" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="60" y1="65" x2="60" y2="25" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="60" y1="65" x2="88" y2="93" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="60" y1="65" x2="32" y2="93" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="60" y1="65" x2="32" y2="37" stroke="#94a3b8" strokeWidth="2"/>

            {/* Top Discharge Flange */}
            <rect x="55" y="12" width="50" height="8" fill="#334155" stroke="#1e293b" strokeWidth="1.5"/>
            
            {/* Flange Bolts */}
            <circle cx="60" cy="16" r="1.5" fill="#f8fafc"/>
            <circle cx="70" cy="16" r="1.5" fill="#f8fafc"/>
            <circle cx="80" cy="16" r="1.5" fill="#f8fafc"/>
            <circle cx="90" cy="16" r="1.5" fill="#f8fafc"/>
            <circle cx="100" cy="16" r="1.5" fill="#f8fafc"/>

            {/* Internal Airflow Arrow Indicator */}
            <path d="M 80 50 L 80 30 M 75 35 L 80 30 L 85 35" stroke="#64748b" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>

            {/* Side Inlet Connection Indication */}
            <circle cx="60" cy="65" r="24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 2"/>

            {/* Center Hub / Bearing Housing */}
            <circle cx="60" cy="65" r="18" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            <circle cx="60" cy="65" r="12" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Inlet Guide Vanes Details */}
            <line x1="53" y1="65" x2="67" y2="65" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="56" y1="59" x2="64" y2="71" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="56" y1="71" x2="64" y2="59" stroke="#94a3b8" strokeWidth="1.5"/>

            {/* DCS Operational Status Indicator Light Panel Mounted on Casing */}
            <rect x="78" y="75" width="14" height="18" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1"/>
            <circle cx="85" cy="84" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* Equipment Tag / Label */}
            <text x="60" y="155" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Process Data Readout 1 (Vibration Sensor) */}
            <g transform="translate(-25, 20)">
                <rect width="36" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
                <text x="18" y="13" fill="#10b981" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">1.2</text>
                <text x="18" y="26" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">mm/s</text>
            </g>

            {/* Process Data Readout 2 (Motor Amps) */}
            <g transform="translate(108, 85)">
                <rect width="36" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
                <text x="18" y="13" fill="#10b981" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">145</text>
                <text x="18" y="26" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">AMPS</text>
            </g>

            {/* Process Data Readout 3 (Bearing Temperature) */}
            <g transform="translate(115, 10)">
                <rect width="36" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
                <text x="18" y="13" fill="#10b981" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">68</text>
                <text x="18" y="26" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">°C</text>
            </g>
        </g>);
};
export default CementMillFan;
