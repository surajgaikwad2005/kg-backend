import React from 'react';
const RotaryKiln = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "KILN-4872", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Base Support & Rollers */}
            <path d="M 90,85 L 125,85 L 115,75 L 100,75 Z" fill="#475569" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <circle cx="100" cy="75" r="5" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="115" cy="75" r="5" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>

            <path d="M 210,85 L 245,85 L 235,75 L 220,75 Z" fill="#475569" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <circle cx="220" cy="75" r="5" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="235" cy="75" r="5" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>

            <path d="M 330,85 L 365,85 L 355,75 L 340,75 Z" fill="#475569" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <circle cx="340" cy="75" r="5" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="355" cy="75" r="5" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>

            {/* Main Kiln Cylinder Body */}
            <rect x="50" y="30" width="360" height="40" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="50" y1="40" x2="410" y2="40" stroke="#cbd5e1" strokeWidth="1"/>
            <line x1="50" y1="60" x2="410" y2="60" stroke="#94a3b8" strokeWidth="1"/>

            {/* Riding Rings (Tires) */}
            <rect x="100" y="25" width="15" height="50" rx="2" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="220" y="25" width="15" height="50" rx="2" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="340" y="25" width="15" height="50" rx="2" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>

            {/* Rotation Direction Indicators */}
            <path d="M 160,45 Q 175,25 190,45" fill="none" stroke="#334155" strokeWidth="2"/>
            <polygon points="190,45 185,38 193,38" fill="#334155"/>
            
            <path d="M 280,45 Q 295,25 310,45" fill="none" stroke="#334155" strokeWidth="2"/>
            <polygon points="310,45 305,38 313,38" fill="#334155"/>

            {/* Feed Hood (Left Side) */}
            <path d="M 20,10 L 60,10 L 60,80 L 30,80 L 20,60 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="30" y="-20" width="20" height="30" fill="#64748b" stroke="#1e293b" strokeWidth="2.5"/>
            <line x1="40" y1="-10" x2="40" y2="20" stroke="#f8fafc" strokeWidth="2" strokeDasharray="4 2"/>
            <polygon points="40,25 36,18 44,18" fill="#f8fafc"/>

            {/* Discharge Hood (Right Side) */}
            <path d="M 400,10 L 450,20 L 450,110 L 410,110 L 400,80 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="440" y="45" width="40" height="10" fill="#475569" stroke="#1e293b" strokeWidth="2.5"/>
            <rect x="470" y="40" width="10" height="20" fill="#1e293b"/>
            
            {/* Burner Flame Inside Hood */}
            <path d="M 410,50 Q 425,45 420,35 Q 430,40 435,50 Q 425,60 410,50" fill="#ef4444" stroke="#b91c1c" strokeWidth="1"/>
            
            {/* Clinker Output Animation */}
            <line x1="425" y1="80" x2="425" y2="105" stroke="#f59e0b" strokeWidth="4" strokeDasharray="4 4">
                <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.5s" repeatCount="indefinite"/>
            </line>

            {/* Refractory Temperature Sensors (TE) */}
            <circle cx="150" cy="30" r="3" fill="#ef4444" stroke="#1e293b"/>
            <line x1="150" y1="30" x2="150" y2="10" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="140" y="0" width="20" height="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="1"/>
            <text x="150" y="8" fontSize="8" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontFamily="monospace">TE</text>

            <circle cx="280" cy="30" r="3" fill="#ef4444" stroke="#1e293b"/>
            <line x1="280" y1="30" x2="280" y2="10" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="270" y="0" width="20" height="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="1"/>
            <text x="280" y="8" fontSize="8" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontFamily="monospace">TE</text>

            {/* Control & Status Label */}
            <rect x="170" y="-35" width="120" height="28" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <text x="235" y="-16" textAnchor="middle" className="fill-text-secondary text-[14px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
            <circle cx="185" cy="-21" r="5" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>
        </g>);
};
export default RotaryKiln;
