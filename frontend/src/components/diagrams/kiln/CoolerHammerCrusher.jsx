import React from 'react';
const CoolerHammerCrusher = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "CR-100", onPointerDown, }) => {
    // Process status color evaluation entirely outside of JSX payload
    const statusColor = status === 'hazard' ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Equipment Label */}
            <text x="80" y="-15" textAnchor="middle" className="fill-text-muted text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Top Inlet Feed (Cooler Discharge Chute) */}
            <path d="M 30,0 L 130,0 L 120,40 L 40,40 Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            
            {/* Incoming Uncrushed Clinker Lumps */}
            <polygon points="50,10 65,5 75,15 60,25 45,20" fill="#94a3b8" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>
            <polygon points="90,15 105,8 115,18 100,28 85,22" fill="#64748b" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>
            <polygon points="75,20 85,28 75,35 65,30" fill="#cbd5e1" stroke="#475569" strokeWidth="1" strokeLinejoin="round"/>

            {/* Main Crusher Circular Housing */}
            <circle cx="80" cy="80" r="55" fill="#e2e8f0" stroke="#1e293b" strokeWidth="3"/>
            
            {/* Inner Wear Liners / Breaker Plates Ring */}
            <circle cx="80" cy="80" r="45" fill="none" stroke="#94a3b8" strokeWidth="5" strokeDasharray="12,6"/>

            {/* Bottom Discharge Chute */}
            <path d="M 45,125 L 115,125 L 125,165 L 35,165 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>

            {/* Crushed Clinker Fine Particles Dropping */}
            <circle cx="50" cy="140" r="3" fill="#475569"/>
            <circle cx="65" cy="150" r="2" fill="#64748b"/>
            <circle cx="80" cy="145" r="4" fill="#94a3b8"/>
            <circle cx="95" cy="135" r="2.5" fill="#475569"/>
            <circle cx="110" cy="155" r="3" fill="#64748b"/>
            <circle cx="55" cy="160" r="3" fill="#94a3b8"/>
            <circle cx="75" cy="158" r="2" fill="#475569"/>
            <circle cx="100" cy="150" r="3.5" fill="#64748b"/>

            {/* --- Rotor Assembly --- */}
            
            {/* Center Shaft / Hub */}
            <circle cx="80" cy="80" r="14" fill="#1e293b"/>
            <circle cx="80" cy="80" r="6" fill="#f8fafc"/>

            {/* Heavy Hammers (Manual declarations per rules) */}
            
            {/* Top Hammer Shaft & Head */}
            <rect x="76" y="35" width="8" height="35" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="65" y="28" width="30" height="14" rx="2" fill="#0f172a"/>
            
            {/* Bottom Hammer Shaft & Head */}
            <rect x="76" y="90" width="8" height="35" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="65" y="118" width="30" height="14" rx="2" fill="#0f172a"/>
            
            {/* Left Hammer Shaft & Head */}
            <rect x="35" y="76" width="35" height="8" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="28" y="65" width="14" height="30" rx="2" fill="#0f172a"/>
            
            {/* Right Hammer Shaft & Head */}
            <rect x="90" y="76" width="35" height="8" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="118" y="65" width="14" height="30" rx="2" fill="#0f172a"/>

            {/* --- External Drive & Mounts --- */}

            {/* Right-Side Drive Motor */}
            <rect x="135" y="65" width="30" height="30" rx="4" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            {/* Motor Cooling Ribs */}
            <line x1="145" y1="65" x2="145" y2="95" stroke="#334155" strokeWidth="2"/>
            <line x1="150" y1="65" x2="150" y2="95" stroke="#334155" strokeWidth="2"/>
            <line x1="155" y1="65" x2="155" y2="95" stroke="#334155" strokeWidth="2"/>
            
            {/* Drive Coupling / Shaft Connector */}
            <rect x="125" y="74" width="10" height="12" fill="#334155"/>

            {/* Structural Floor Mounts */}
            <rect x="25" y="130" width="12" height="40" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <rect x="123" y="130" width="12" height="40" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <line x1="10" y1="170" x2="150" y2="170" stroke="#1e293b" strokeWidth="5" strokeLinecap="round"/>

            {/* Dynamic Status / Alert Visuals */}
            {/* Alert Beacon on Top of Motor */}
            <rect x="142" y="55" width="16" height="10" rx="2" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </rect>
            
            {/* Bearing Temp/Vibration Sensor Alert on Main Housing */}
            <circle cx="45" cy="55" r="7" fill={statusColor} stroke="#1e293b" strokeWidth="1.5">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>

            {/* Housing Bolts Decor */}
            <circle cx="45" cy="105" r="2" fill="#64748b"/>
            <circle cx="115" cy="105" r="2" fill="#64748b"/>
            <circle cx="115" cy="55" r="2" fill="#64748b"/>
        </g>);
};
export default CoolerHammerCrusher;
