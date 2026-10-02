import React from 'react';
const WeighFeeder = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "WF-4100", onPointerDown, }) => {
    // Determine system status color
    const statusColor = status === 'hazard' ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Structural Base & Supports */}
            <rect x="40" y="30" width="6" height="30" fill="#64748b" stroke="#1e293b" strokeWidth="1"/>
            <rect x="154" y="30" width="6" height="30" fill="#64748b" stroke="#1e293b" strokeWidth="1"/>
            <line x1="10" y1="60" x2="210" y2="60" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
            <line x1="20" y1="30" x2="180" y2="30" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>

            {/* Infeed Hopper (Chute) */}
            <polygon points="20,-40 65,-40 50,5 35,5" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            <line x1="25" y1="-30" x2="60" y2="-30" stroke="#94a3b8" strokeWidth="1"/>
            
            {/* Material Flow Profile on Belt */}
            <path d="M 38,5 L 48,8 L 160,8 L 172,16 L 162,20 L 50,20 L 42,5 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="1" strokeLinejoin="round"/>

            {/* Main Conveyor Belt */}
            <rect x="20" y="10" width="160" height="20" rx="10" fill="none" stroke="#1e293b" strokeWidth="2.5"/>
            
            {/* Drive & Tail Pulleys */}
            <circle cx="30" cy="20" r="8" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="170" cy="20" r="8" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Speed Sensor / Tensioner on Tail Pulley */}
            <rect x="12" y="17" width="10" height="6" fill="#334155"/>
            <circle cx="30" cy="20" r="3" fill="#0f172a"/>

            {/* Idler Rollers */}
            <circle cx="58" cy="20" r="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="86" cy="20" r="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="114" cy="20" r="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="142" cy="20" r="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5"/>

            {/* Weigh Bridge & Load Cell Frame */}
            <rect x="76" y="24" width="48" height="6" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="96" y="30" width="8" height="12" fill="#334155"/>
            <circle cx="100" cy="36" r="2" fill={statusColor}/>
            
            {/* Signal Cable to Transmitter */}
            <path d="M 100,42 L 100,50 L 120,50" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2,2"/>

            {/* Local Transmitter Panel */}
            <rect x="120" y="42" width="28" height="16" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
            <rect x="123" y="45" width="16" height="10" fill="#0f172a"/>
            <circle cx="144" cy="50" r="2" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>
            <text x="131" y="53" fill="#38bdf8" fontSize="6" fontFamily="mono" fontWeight="bold" textAnchor="middle">W</text>

            {/* Discharge Chute */}
            <polygon points="160,30 185,30 180,55 155,55" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M 172,30 L 168,50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2"/>

            {/* Drive Motor Assembly */}
            <rect x="180" y="10" width="26" height="20" rx="3" fill="#f8fafc" stroke="#1e293b" strokeWidth="2"/>
            <rect x="206" y="12" width="6" height="16" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="185" y1="15" x2="200" y2="15" stroke="#94a3b8" strokeWidth="1"/>
            <line x1="185" y1="20" x2="200" y2="20" stroke="#94a3b8" strokeWidth="1"/>
            <line x1="185" y1="25" x2="200" y2="25" stroke="#94a3b8" strokeWidth="1"/>
            <rect x="175" y="17" width="5" height="6" fill="#1e293b"/>
            
            {/* Motor Status Indicator */}
            <circle cx="193" cy="10" r="3" fill={statusColor} stroke="#1e293b" strokeWidth="1"/>

            {/* Equipment Label */}
            <rect x="80" y="-42" width="65" height="20" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1"/>
            <text x="112.5" y="-28" textAnchor="middle" className="fill-text-primary text-[14px] font-mono font-black uppercase tracking-tight pointer-events-none select-none">
                {label}
            </text>

            {/* DCS Real-time Data Readout Panel */}
            <rect x="165" y="-42" width="45" height="36" rx="2" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5"/>
            <rect x="165" y="-42" width="45" height="10" fill="#1e293b"/>
            <text x="187.5" y="-35" textAnchor="middle" fill="#f8fafc" fontSize="6" fontFamily="mono" fontWeight="bold">FLOW RATE</text>
            <text x="187.5" y="-21" textAnchor="middle" fill="#0f172a" fontSize="10" fontFamily="mono" fontWeight="black">314.2</text>
            <text x="187.5" y="-12" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="mono" fontWeight="bold">TON/HR</text>
            
            {/* Status Underline on Panel */}
            <rect x="170" y="-8" width="35" height="2" fill={statusColor}/>
        </g>);
};
export default WeighFeeder;
