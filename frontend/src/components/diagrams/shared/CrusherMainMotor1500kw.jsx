import React from 'react';
const CrusherMotor = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "M-1500A", onPointerDown, }) => {
    // DCS Standard Color Status Mapping
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Background bounding plate for DCS Screen context */}
            <rect x="-25" y="-40" width="265" height="195" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" rx="6"/>

            {/* Dynamic Power Cable Input */}
            <path d="M 70,5 L 70,-15 L -5,-15" fill="none" stroke={statusColor} strokeWidth="2.5" strokeDasharray="4 4">
                <animate attributeName="stroke-dashoffset" values="8;0" dur="1s" repeatCount="indefinite"/>
            </path>

            {/* Equipment Grounding Cable */}
            <path d="M 40,118 L 40,135 L 20,135" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="3 2"/>
            <line x1="16" y1="131" x2="16" y2="139" stroke="#16a34a" strokeWidth="1.5"/>
            <line x1="12" y1="133" x2="12" y2="137" stroke="#16a34a" strokeWidth="1.5"/>
            <line x1="8" y1="134" x2="8" y2="136" stroke="#16a34a" strokeWidth="1.5"/>

            {/* Main Concrete/Steel Mount Base */}
            <rect x="30" y="106" width="110" height="12" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            <rect x="35" y="102" width="5" height="4" fill="#1e293b"/>
            <rect x="110" y="102" width="5" height="4" fill="#1e293b"/>

            {/* Motor Stator Mount Feet */}
            <rect x="40" y="100" width="15" height="6" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <rect x="115" y="100" width="15" height="6" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>

            {/* Non-Drive End Fan Housing (Cowl) */}
            <rect x="5" y="20" width="20" height="80" rx="4" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="10" y1="30" x2="10" y2="90" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4"/>
            <line x1="15" y1="30" x2="15" y2="90" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4"/>
            
            {/* Cooling Fan Air Exhaust indicators */}
            <path d="M -2,40 L -12,35" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M -2,60 L -12,60" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M -2,80 L -12,85" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>

            {/* Main Motor Body */}
            <rect x="25" y="20" width="120" height="80" rx="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Motor Body Cooling Fins - Manually Repeated NO MAP */}
            <line x1="30" y1="28" x2="140" y2="28" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="30" y1="36" x2="140" y2="36" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="30" y1="44" x2="140" y2="44" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="30" y1="52" x2="140" y2="52" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="30" y1="60" x2="140" y2="60" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="30" y1="68" x2="140" y2="68" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="30" y1="76" x2="140" y2="76" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="30" y1="84" x2="140" y2="84" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="30" y1="92" x2="140" y2="92" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>

            {/* Electrical Junction Box (Terminal Box) */}
            <rect x="50" y="5" width="40" height="15" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <rect x="55" y="2" width="30" height="3" fill="#1e293b"/>
            
            {/* Status Indicator LED on Junction Box */}
            <circle cx="82" cy="12.5" r="4" fill={statusColor} stroke="#1e293b" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* Drive Shaft (Output) */}
            <rect x="145" y="53" width="20" height="14" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>

            {/* Heavy Duty Coupling */}
            <rect x="165" y="35" width="20" height="50" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <line x1="175" y1="35" x2="175" y2="85" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="170" cy="45" r="1.5" fill="#94a3b8"/>
            <circle cx="180" cy="45" r="1.5" fill="#94a3b8"/>
            <circle cx="170" cy="75" r="1.5" fill="#94a3b8"/>
            <circle cx="180" cy="75" r="1.5" fill="#94a3b8"/>

            {/* Driven Shaft connecting to Crusher Rotor */}
            <rect x="185" y="53" width="25" height="14" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 2"/>
            <line x1="185" y1="60" x2="225" y2="60" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 2"/>
            <polygon points="220,57 228,60 220,63" fill="#1e293b"/>
            <text x="207" y="50" fill="#64748b" fontSize="8" fontFamily="sans-serif" fontWeight="bold" className="pointer-events-none select-none">TO CRUSHER</text>

            {/* Motor Standard P&ID Identification Emblem */}
            <circle cx="85" cy="60" r="16" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <text x="85" y="66" textAnchor="middle" fill="#1e293b" fontSize="16" fontFamily="sans-serif" fontWeight="900" className="pointer-events-none select-none">M</text>

            {/* Equipment Top Label */}
            <text x="85" y="-22" textAnchor="middle" className="fill-text-primary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* DCS Telemetry Data Readouts - Manually Typed Blocks NO MAP */}
            
            {/* Telemetry Block 1: RPM */}
            <g>
                <rect x="25" y="125" width="40" height="22" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <text x="45" y="137" textAnchor="middle" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">1485</text>
                <text x="45" y="144" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="sans-serif" fontWeight="bold" className="pointer-events-none select-none">RPM</text>
            </g>

            {/* Telemetry Block 2: Power Load */}
            <g>
                <rect x="75" y="125" width="40" height="22" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <text x="95" y="137" textAnchor="middle" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">1.42</text>
                <text x="95" y="144" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="sans-serif" fontWeight="bold" className="pointer-events-none select-none">MW</text>
            </g>

            {/* Telemetry Block 3: Amperage */}
            <g>
                <rect x="125" y="125" width="40" height="22" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                <text x="145" y="137" textAnchor="middle" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">124</text>
                <text x="145" y="144" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="sans-serif" fontWeight="bold" className="pointer-events-none select-none">AMPS</text>
            </g>

        </g>);
};
export default CrusherMotor;
