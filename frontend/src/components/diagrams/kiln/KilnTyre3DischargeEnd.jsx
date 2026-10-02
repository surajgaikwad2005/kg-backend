import React from 'react';
const KilnTyre = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "KILN-TYRE-03", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Equipment Bounding/Background Area */}
            <rect x="-10" y="-30" width="310" height="280" fill="transparent" stroke="none"/>

            {/* Base Support Structure / Pier */}
            <path d="M 40,170 L 160,170 L 180,240 L 20,240 Z" fill="#64748b" stroke="#334155" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M 40,170 L 160,170 L 140,190 L 60,190 Z" fill="#475569" stroke="#334155" strokeWidth="1"/>
            <rect x="20" y="230" width="160" height="10" fill="#334155"/>

            {/* Kiln Shell (Main Cylinder) */}
            <rect x="0" y="40" width="160" height="100" fill="#cbd5e1" stroke="#475569" strokeWidth="2"/>
            {/* Kiln Shell Cylindrical Shading/Lines */}
            <line x1="0" y1="55" x2="160" y2="55" stroke="#94a3b8" strokeWidth="1" strokeDasharray="6,4"/>
            <line x1="0" y1="90" x2="160" y2="90" stroke="#94a3b8" strokeWidth="1" strokeDasharray="10,5"/>
            <line x1="0" y1="125" x2="160" y2="125" stroke="#94a3b8" strokeWidth="1" strokeDasharray="6,4"/>

            {/* Discharge Hood (Right side) */}
            <path d="M 160,40 L 210,20 L 210,180 L 160,140 Z" fill="#94a3b8" stroke="#334155" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M 160,40 L 175,35 L 175,145 L 160,140 Z" fill="#cbd5e1"/>
            
            {/* Hood Access Door */}
            <rect x="170" y="80" width="20" height="30" fill="#475569" stroke="#1e293b" strokeWidth="1.5" rx="2"/>
            <circle cx="185" cy="95" r="2" fill="#94a3b8"/>

            {/* Support Rollers */}
            <g transform="translate(0, 0)">
                {/* Left Roller */}
                <rect x="55" y="145" width="34" height="28" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" rx="3"/>
                <rect x="65" y="145" width="14" height="28" fill="#cbd5e1" stroke="none"/>
                <circle cx="72" cy="159" r="4" fill="#0f172a"/>
                <rect x="50" y="155" width="5" height="8" fill="#334155"/>
                <rect x="89" y="155" width="5" height="8" fill="#334155"/>
                
                {/* Right Roller */}
                <rect x="111" y="145" width="34" height="28" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" rx="3"/>
                <rect x="121" y="145" width="14" height="28" fill="#cbd5e1" stroke="none"/>
                <circle cx="128" cy="159" r="4" fill="#0f172a"/>
                <rect x="106" y="155" width="5" height="8" fill="#334155"/>
                <rect x="145" y="155" width="5" height="8" fill="#334155"/>
            </g>

            {/* Kiln Tyre (Riding Ring) - The massive steel ring */}
            <rect x="70" y="25" width="60" height="130" fill="#475569" stroke="#0f172a" strokeWidth="3" rx="4"/>
            <rect x="75" y="25" width="12" height="130" fill="#64748b" stroke="none"/>
            <rect x="113" y="25" width="12" height="130" fill="#334155" stroke="none"/>
            
            {/* Tyre Wear/Slip Markings */}
            <line x1="70" y1="45" x2="130" y2="45" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="70" y1="90" x2="130" y2="90" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="70" y1="135" x2="130" y2="135" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Sensor Probes / Instrumentation */}
            {/* Temp Sensor */}
            <rect x="135" y="60" width="8" height="6" fill="#f59e0b" stroke="#1e293b" strokeWidth="1"/>
            <line x1="143" y1="63" x2="220" y2="63" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2,2"/>
            
            {/* Slip Sensor */}
            <rect x="135" y="110" width="8" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="1"/>
            <line x1="143" y1="113" x2="220" y2="113" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2,2"/>

            {/* RPM Sensor (On Roller Shaft) */}
            <rect x="126" y="157" width="8" height="6" fill="#10b981" stroke="#1e293b" strokeWidth="1"/>
            <line x1="134" y1="160" x2="220" y2="160" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2,2"/>

            {/* DCS Data Readouts */}
            <g transform="translate(220, 50)">
                {/* Readout 1: Temperature */}
                <rect x="0" y="0" width="70" height="26" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="2"/>
                <text x="35" y="17" textAnchor="middle" fill="#fcd34d" className="text-[12px] font-mono font-bold tracking-wider pointer-events-none select-none">
                    942 °C
                </text>
                
                {/* Readout 2: Tyre Slip */}
                <rect x="0" y="50" width="70" height="26" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="2"/>
                <text x="35" y="67" textAnchor="middle" fill="#93c5fd" className="text-[12px] font-mono font-bold tracking-wider pointer-events-none select-none">
                    12.4 mm
                </text>

                {/* Readout 3: Speed */}
                <rect x="0" y="100" width="70" height="26" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="2"/>
                <text x="35" y="117" textAnchor="middle" fill="#6ee7b7" className="text-[12px] font-mono font-bold tracking-wider pointer-events-none select-none">
                    3.8 RPM
                </text>
            </g>

            {/* Dynamic Status Highlight Border around Readouts */}
            <rect x="215" y="45" width="80" height="136" fill="none" stroke={statusColor} strokeWidth="1.5" strokeDasharray="4,4" rx="4"/>

            {/* Equipment Label */}
            <rect x="50" y="-25" width="100" height="24" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5" rx="3"/>
            <text x="100" y="-8" textAnchor="middle" className="fill-text-secondary text-[12px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Main Status Beacon */}
            <g transform="translate(195, -5)">
                <rect x="-6" y="-8" width="12" height="10" fill="#334155" stroke="#1e293b" strokeWidth="1.5"/>
                <path d="M -8,2 L 8,2 L 10,10 L -10,10 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
                <circle cx="0" cy="-12" r="8" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                    <animate attributeName="opacity" values="1;0.3;1" dur={isHazard ? "0.5s" : "2.5s"} repeatCount="indefinite"/>
                </circle>
                {/* Inner bulb reflection */}
                <circle cx="-2" cy="-14" r="2" fill="#ffffff" opacity="0.6"/>
            </g>

            {/* Fire/Heat Glow indicator inside hood */}
            <ellipse cx="195" cy="100" rx="6" ry="30" fill="#f97316" opacity="0.3">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite"/>
            </ellipse>
        </g>);
};
export default KilnTyre;
