import React from 'react';
const CementMillMotor = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "M-5000-A", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Power Cable */}
            <path d="M 85 -10 L 85 -40 L 0 -40" fill="none" stroke="#475569" strokeWidth="4"/>
            <path d="M 0 -45 L 0 -35 L -10 -40 Z" fill="#475569"/>

            {/* Mounts */}
            <path d="M 30 70 L 40 50 L 50 50 L 60 70 Z" fill="#475569" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M 110 70 L 120 50 L 130 50 L 140 70 Z" fill="#475569" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M 160 70 L 165 55 L 185 55 L 190 70 Z" fill="#475569" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round"/>

            {/* Base Plate */}
            <rect x="0" y="70" width="240" height="12" rx="2" fill="#1e293b"/>
            <circle cx="15" cy="76" r="3" fill="#64748b"/>
            <circle cx="100" cy="76" r="3" fill="#64748b"/>
            <circle cx="225" cy="76" r="3" fill="#64748b"/>

            {/* Shafts & Coupling */}
            <rect x="140" y="25" width="20" height="10" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2"/>
            <rect x="148" y="20" width="8" height="20" fill="#334155" stroke="#0f172a" strokeWidth="2"/>
            <rect x="195" y="27" width="30" height="16" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2"/>
            
            {/* Output Mill Flange */}
            <path d="M 225 27 L 230 20 L 235 20 L 235 50 L 230 50 L 225 43 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="2"/>

            {/* Fan Housing (Non-Drive End) */}
            <rect x="10" y="15" width="20" height="30" rx="3" fill="#64748b" stroke="#0f172a" strokeWidth="2"/>
            <line x1="15" y1="20" x2="15" y2="40" stroke="#1e293b" strokeWidth="2"/>
            <line x1="20" y1="20" x2="20" y2="40" stroke="#1e293b" strokeWidth="2"/>
            <line x1="25" y1="20" x2="25" y2="40" stroke="#1e293b" strokeWidth="2"/>

            {/* Main Motor Body */}
            <rect x="30" y="10" width="110" height="40" rx="6" fill="#94a3b8" stroke={statusColor} strokeWidth="3"/>
            
            {/* Motor Cooling Ribs */}
            <line x1="45" y1="12" x2="45" y2="48" stroke="#475569" strokeWidth="2"/>
            <line x1="55" y1="12" x2="55" y2="48" stroke="#475569" strokeWidth="2"/>
            <line x1="65" y1="12" x2="65" y2="48" stroke="#475569" strokeWidth="2"/>
            <line x1="75" y1="12" x2="75" y2="48" stroke="#475569" strokeWidth="2"/>
            <line x1="85" y1="12" x2="85" y2="48" stroke="#475569" strokeWidth="2"/>
            <line x1="95" y1="12" x2="95" y2="48" stroke="#475569" strokeWidth="2"/>
            <line x1="105" y1="12" x2="105" y2="48" stroke="#475569" strokeWidth="2"/>
            <line x1="115" y1="12" x2="115" y2="48" stroke="#475569" strokeWidth="2"/>
            <line x1="125" y1="12" x2="125" y2="48" stroke="#475569" strokeWidth="2"/>

            {/* Gearbox */}
            <rect x="160" y="10" width="35" height="45" rx="4" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2"/>
            <circle cx="177.5" cy="32.5" r="10" fill="#94a3b8" stroke="#0f172a" strokeWidth="2"/>
            <circle cx="177.5" cy="32.5" r="4" fill="#64748b" stroke="#0f172a" strokeWidth="1"/>
            <line x1="160" y1="15" x2="195" y2="15" stroke="#94a3b8" strokeWidth="2"/>

            {/* Terminal Box */}
            <rect x="65" y="-10" width="40" height="20" rx="2" fill="#475569" stroke="#0f172a" strokeWidth="2"/>
            <circle cx="75" cy="0" r="3" fill="#1e293b"/>
            <circle cx="85" cy="0" r="3" fill="#1e293b"/>
            <circle cx="95" cy="0" r="3" fill="#1e293b"/>
            <rect x="75" y="-14" width="20" height="4" fill="#ef4444" stroke="#0f172a" strokeWidth="1"/>

            {/* Vibration Sensor - Non-Drive End */}
            <rect x="35" y="-5" width="10" height="15" fill="#334155" stroke="#0f172a" strokeWidth="1"/>
            <line x1="40" y1="-5" x2="40" y2="-20" stroke="#334155" strokeWidth="2"/>
            <circle cx="40" cy="-20" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* Vibration Sensor - Drive End */}
            <rect x="125" y="-5" width="10" height="15" fill="#334155" stroke="#0f172a" strokeWidth="1"/>
            <line x1="130" y1="-5" x2="130" y2="-20" stroke="#334155" strokeWidth="2"/>
            <circle cx="130" cy="-20" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* Data Link Connection Line */}
            <path d="M 40 -24 L 40 -35 L 130 -35 L 130 -24" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2"/>
            <line x1="85" y1="-35" x2="85" y2="-55" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2"/>

            {/* Label Base */}
            <rect x="30" y="-80" width="110" height="24" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Dynamic Label */}
            <text x="85" y="-63" textAnchor="middle" className="fill-text-secondary text-[14px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>

            {/* Main Status Indicator (DCS HMI Lamp) */}
            <rect x="145" y="-80" width="24" height="24" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="2"/>
            <circle cx="157" cy="-68" r="8" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite"/>
            </circle>
        </g>);
};
export default CementMillMotor;
