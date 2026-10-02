import React from 'react';
const DowncomerDamperActuator = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "DMP-4021", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            
            {/* Top Flange */}
            <rect x="15" y="5" width="70" height="8" rx="1" fill="#334155"/>
            <circle cx="20" cy="9" r="1.5" fill="#94a3b8"/>
            <circle cx="40" cy="9" r="1.5" fill="#94a3b8"/>
            <circle cx="60" cy="9" r="1.5" fill="#94a3b8"/>
            <circle cx="80" cy="9" r="1.5" fill="#94a3b8"/>

            {/* Bottom Flange */}
            <rect x="15" y="107" width="70" height="8" rx="1" fill="#334155"/>
            <circle cx="20" cy="111" r="1.5" fill="#94a3b8"/>
            <circle cx="40" cy="111" r="1.5" fill="#94a3b8"/>
            <circle cx="60" cy="111" r="1.5" fill="#94a3b8"/>
            <circle cx="80" cy="111" r="1.5" fill="#94a3b8"/>

            {/* Main Duct (Downcomer) */}
            <rect x="20" y="13" width="60" height="94" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Flow Direction Indicator (Underneath blades) */}
            <line x1="50" y1="20" x2="50" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4"/>
            <polygon points="46,95 54,95 50,103" fill="#94a3b8"/>

            {/* Internal Damper Blades (Louvers at 45 degree angle) */}
            {/* Blade 1 */}
            <line x1="30" y1="25" x2="70" y2="45" stroke="#475569" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="50" cy="35" r="3" fill="#1e293b"/>
            {/* Blade 2 */}
            <line x1="30" y1="50" x2="70" y2="70" stroke="#475569" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="50" cy="60" r="3" fill="#1e293b"/>
            {/* Blade 3 */}
            <line x1="30" y1="75" x2="70" y2="95" stroke="#475569" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="50" cy="85" r="3" fill="#1e293b"/>

            {/* Internal Linkage Rod */}
            <line x1="65" y1="42.5" x2="65" y2="92.5" stroke="#1e293b" strokeWidth="2.5"/>
            <circle cx="65" cy="42.5" r="2" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1"/>
            <circle cx="65" cy="67.5" r="2" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1"/>
            <circle cx="65" cy="92.5" r="2" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1"/>

            {/* Actuator Packing Gland / Wall Seal */}
            <rect x="76" y="61.5" width="8" height="12" rx="1" fill="#334155"/>

            {/* Main Drive Shaft to Actuator */}
            <line x1="65" y1="67.5" x2="100" y2="67.5" stroke="#1e293b" strokeWidth="3.5"/>

            {/* Actuator Mounting Bracket */}
            <rect x="90" y="55" width="10" height="25" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>

            {/* Motor End / Cylinder Details */}
            <rect x="145" y="45" width="20" height="45" rx="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <line x1="145" y1="50" x2="165" y2="50" stroke="#1e293b" strokeWidth="2"/>
            <line x1="145" y1="57" x2="165" y2="57" stroke="#1e293b" strokeWidth="2"/>
            <line x1="145" y1="64" x2="165" y2="64" stroke="#1e293b" strokeWidth="2"/>
            <line x1="145" y1="71" x2="165" y2="71" stroke="#1e293b" strokeWidth="2"/>
            <line x1="145" y1="78" x2="165" y2="78" stroke="#1e293b" strokeWidth="2"/>
            <line x1="145" y1="85" x2="165" y2="85" stroke="#1e293b" strokeWidth="2"/>

            {/* Main Actuator Housing */}
            <rect x="100" y="35" width="45" height="65" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Smart Positioner / Diagnostic Box */}
            <rect x="110" y="55" width="25" height="30" rx="2" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            <rect x="115" y="60" width="15" height="10" fill="#0f172a"/>
            
            {/* Status LED Indicator */}
            <circle cx="122.5" cy="78" r="4" fill={statusColor} stroke="#1e293b" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* Wiring / Conduit for Actuator */}
            <path d="M 122.5 85 L 122.5 110 L 140 110" fill="none" stroke="#475569" strokeWidth="3" strokeLinejoin="round"/>

            {/* Manual Override Handwheel (Top Mounted) */}
            <rect x="118.5" y="20" width="8" height="15" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="105" y="15" width="35" height="6" rx="3" fill="#ef4444" stroke="#1e293b" strokeWidth="2"/>
            <rect x="119.5" y="11" width="6" height="4" fill="#1e293b"/>

            {/* Equipment Label */}
            <text x="85" y="-15" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

        </g>);
};
export default DowncomerDamperActuator;
