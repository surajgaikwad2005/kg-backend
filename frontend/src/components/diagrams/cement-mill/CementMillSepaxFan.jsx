import React from 'react';
const SepaxFan = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "SEPAX-FN-01", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Ground / Base Line */}
            <line x1="-60" y1="105" x2="130" y2="105" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            
            {/* Motor Pedestal */}
            <path d="M -40 75 L -45 105 L -15 105 L -20 75 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="-45" y="70" width="35" height="5" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>

            {/* Fan Pedestal */}
            <path d="M 30 80 L 15 105 L 85 105 L 70 80 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="20" y="100" width="60" height="5" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>

            {/* Motor Body */}
            <rect x="-50" y="30" width="45" height="40" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Motor Cooling Fins (Manual lines as per strict rules) */}
            <line x1="-42" y1="32" x2="-42" y2="68" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="-36" y1="32" x2="-36" y2="68" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="-30" y1="32" x2="-30" y2="68" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="-24" y1="32" x2="-24" y2="68" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="-18" y1="32" x2="-18" y2="68" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="-12" y1="32" x2="-12" y2="68" stroke="#94a3b8" strokeWidth="2"/>

            {/* Motor Junction Box */}
            <rect x="-45" y="18" width="16" height="12" rx="1" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <line x1="-37" y1="18" x2="-37" y2="10" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Drive Shaft */}
            <rect x="-5" y="46" width="25" height="8" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
            <rect x="2" y="44" width="6" height="12" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Fan Casing (Volute Profile) */}
            <path d="M 50 20 L 105 20 L 105 40 L 78 40 A 30 30 0 1 1 50 20 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            
            {/* Outlet Flange */}
            <rect x="105" y="15" width="8" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <line x1="109" y1="17" x2="109" y2="43" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3"/>

            {/* Expansion Joint (Bellows) */}
            <rect x="113" y="15" width="16" height="30" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <line x1="113" y1="20" x2="129" y2="20" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="113" y1="25" x2="129" y2="25" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="113" y1="30" x2="129" y2="30" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="113" y1="35" x2="129" y2="35" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="113" y1="40" x2="129" y2="40" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Piping connection out */}
            <rect x="129" y="15" width="8" height="30" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Inlet Axial Flange and Concentric Details */}
            <circle cx="50" cy="50" r="16" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            <circle cx="50" cy="50" r="10" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="50" cy="50" r="4" fill="#334155"/>

            {/* Internal Guide Vanes / Radial Blades indicator */}
            <line x1="50" y1="25" x2="50" y2="34" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="50" y1="66" x2="50" y2="75" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="25" y1="50" x2="34" y2="50" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="66" y1="50" x2="75" y2="50" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            
            <line x1="32.3" y1="32.3" x2="38.7" y2="38.7" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="67.7" y1="67.7" x2="61.3" y2="61.3" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="32.3" y1="67.7" x2="38.7" y2="61.3" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="67.7" y1="32.3" x2="61.3" y2="38.7" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>

            {/* Status Alert Borders / Rings */}
            <circle cx="50" cy="50" r="21" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.9"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke={statusColor} strokeWidth="1.5" strokeDasharray="6 4">
                <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.5s" repeatCount="indefinite"/>
            </circle>

            {/* Top Indicator Beacon */}
            <rect x="75" y="-5" width="10" height="12" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="80" cy="-5" r="5" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* DCS Instrumentation Data Blocks */}
            <rect x="-60" y="-15" width="44" height="20" fill="#1e293b" rx="2" stroke="#475569" strokeWidth="1"/>
            <text x="-38" y="-2" textAnchor="middle" fill="#10b981" className="text-[10px] font-mono font-bold">
                1480
            </text>
            <text x="-38" y="12" textAnchor="middle" fill="#94a3b8" className="text-[7px] font-mono">
                RPM
            </text>

            <rect x="100" y="-25" width="44" height="20" fill="#1e293b" rx="2" stroke="#475569" strokeWidth="1"/>
            <text x="122" y="-12" textAnchor="middle" fill="#10b981" className="text-[10px] font-mono font-bold">
                12.4
            </text>
            <text x="122" y="2" textAnchor="middle" fill="#94a3b8" className="text-[7px] font-mono">
                kPa
            </text>

            {/* Main Equipment Label */}
            <rect x="15" y="-40" width="75" height="22" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" rx="3"/>
            <text x="52.5" y="-25" textAnchor="middle" className="fill-text-secondary text-[12px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

        </g>);
};
export default SepaxFan;
