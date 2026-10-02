import React from 'react';
const CementBallMill = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "BM-02", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Background Status Area */}
            <rect x="-25" y="-135" width="310" height="370" fill="#f8fafc" opacity="0.6" rx="8"/>
            <rect x="-25" y="-135" width="310" height="370" fill="none" stroke={statusColor} strokeWidth="2" strokeDasharray="8 4" rx="8"/>

            {/* DUCTING (Background/Behind Mill) */}
            {/* Separator Fines Out Product Pipe */}
            <path d="M 120,-80 L 120,-115 L 180,-115" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinejoin="round"/>
            <path d="M 120,-80 L 120,-115 L 180,-115" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinejoin="round"/>
            <polygon points="175,-122 185,-115 175,-108" fill="#1e293b"/>

            {/* Coarse Return Duct (Separator to Mill Feed) */}
            <path d="M 120,10 L 120,50 L 30,50 L 30,100" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinejoin="round"/>
            <path d="M 120,10 L 120,50 L 30,50 L 30,100" fill="none" stroke="#cbd5e1" strokeWidth="10" strokeLinejoin="round"/>
            <polygon points="24,80 30,92 36,80" fill="#64748b"/>

            {/* Fresh Feed Inlet Pipe */}
            <path d="M -10,20 L 30,50" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinejoin="round"/>
            <path d="M -10,20 L 30,50" fill="none" stroke="#94a3b8" strokeWidth="10" strokeLinejoin="round"/>

            {/* Elevator to Separator Feed Duct */}
            <path d="M 235,-85 L 150,-60" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinejoin="round"/>
            <path d="M 235,-85 L 150,-60" fill="none" stroke="#cbd5e1" strokeWidth="10" strokeLinejoin="round"/>

            {/* MAIN MILL BODY (Cylinder) */}
            {/* Feed Trunnion (Left) */}
            <polygon points="60,95 40,105 40,125 60,135" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Discharge Trunnion (Right) */}
            <polygon points="200,95 220,105 220,125 200,135" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Main Drum */}
            <rect x="60" y="80" width="140" height="70" rx="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            
            {/* Drum Curvature Accent */}
            <path d="M 60,95 Q 130,110 200,95" fill="none" stroke="#f8fafc" strokeWidth="2" opacity="0.5"/>
            <rect x="60" y="130" width="140" height="18" fill="#94a3b8" opacity="0.3" rx="2"/>

            {/* Drum Rotation Indicator Arrow */}
            <path d="M 110,125 A 30 15 0 0 0 150 125" fill="none" stroke="#64748b" strokeWidth="2"/>
            <polygon points="150,125 145,120 155,120" fill="#64748b"/>

            {/* Mill Shell Reinforcement Bands */}
            <line x1="90" y1="80" x2="90" y2="150" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="120" y1="80" x2="120" y2="150" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="150" y1="80" x2="150" y2="150" stroke="#94a3b8" strokeWidth="2"/>

            {/* Girth Gear */}
            <rect x="160" y="75" width="12" height="80" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <line x1="160" y1="80" x2="172" y2="80" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="160" y1="90" x2="172" y2="90" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="160" y1="100" x2="172" y2="100" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="160" y1="110" x2="172" y2="110" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="160" y1="120" x2="172" y2="120" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="160" y1="130" x2="172" y2="130" stroke="#1e293b" strokeWidth="1.5"/>
            <line x1="160" y1="140" x2="172" y2="140" stroke="#1e293b" strokeWidth="1.5"/>

            {/* DRIVE UNIT */}
            {/* Reducer / Pinion Box */}
            <rect x="155" y="155" width="22" height="20" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
            {/* Motor Shaft */}
            <line x1="166" y1="175" x2="166" y2="165" stroke="#1e293b" strokeWidth="4"/>
            {/* Main Motor */}
            <rect x="145" y="175" width="42" height="25" rx="3" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            <line x1="150" y1="180" x2="182" y2="180" stroke="#cbd5e1" strokeWidth="1"/>
            <line x1="150" y1="185" x2="182" y2="185" stroke="#cbd5e1" strokeWidth="1"/>
            <line x1="150" y1="190" x2="182" y2="190" stroke="#cbd5e1" strokeWidth="1"/>

            {/* BUCKET ELEVATOR */}
            {/* Elevator Vertical Casing */}
            <rect x="235" y="-90" width="24" height="240" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>
            {/* Elevator Up Direction Arrow */}
            <polygon points="247,0 240,-12 233,0" fill="#64748b"/>
            {/* Elevator Buckets (Internal representation) */}
            <rect x="242" y="-40" width="10" height="8" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
            <rect x="242" y="-10" width="10" height="8" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
            <rect x="242" y="20" width="10" height="8" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
            <rect x="242" y="50" width="10" height="8" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
            <rect x="242" y="80" width="10" height="8" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
            <rect x="242" y="110" width="10" height="8" fill="#94a3b8" stroke="#1e293b" strokeWidth="1"/>
            {/* Elevator Head (Top) */}
            <rect x="230" y="-100" width="34" height="25" rx="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            {/* Elevator Boot (Bottom) */}
            <rect x="225" y="130" width="44" height="30" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>

            {/* Mill Discharge to Elevator Chute */}
            <polygon points="220,115 235,120 235,140 220,135" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>

            {/* DYNAMIC SEPARATOR (Classifier) */}
            {/* Upper Cone */}
            <polygon points="90,-50 150,-50 140,-30 100,-30" fill="#94a3b8" stroke="#1e293b" strokeWidth="2"/>
            {/* Top Cylinder / Rotor Housing */}
            <rect x="90" y="-80" width="60" height="30" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            {/* Lower Cone (Coarse collection) */}
            <polygon points="100,-30 140,-30 125,10 115,10" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>
            {/* Separator Drive Motor */}
            <rect x="110" y="-105" width="20" height="25" fill="#64748b" stroke="#1e293b" strokeWidth="2"/>
            <line x1="120" y1="-105" x2="120" y2="-80" stroke="#1e293b" strokeWidth="2"/>

            {/* FEED BOX (Inlet to Mill) */}
            <rect x="20" y="100" width="20" height="30" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2"/>

            {/* LOCAL CONTROL PANEL & STATUS INDICATORS */}
            <rect x="-10" y="160" width="30" height="40" rx="2" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
            <rect x="-6" y="165" width="22" height="15" fill="#334155"/>
            
            {/* Blinking Status LED on Panel */}
            <circle cx="5" cy="190" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>
            {/* Main Alert Beacon */}
            <circle cx="270" cy="-120" r="8" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>
            
            {/* Equipment Label */}
            <text x="130" y="225" textAnchor="middle" className="fill-text-secondary text-[18px] font-mono font-black uppercase tracking-tighter pointer-events-none select-none">
                {label}
            </text>
            <text x="130" y="240" textAnchor="middle" className="fill-text-muted text-[12px] font-mono font-bold uppercase tracking-tight pointer-events-none select-none">
                CLOSED CIRCUIT MILL
            </text>
        </g>);
};
export default CementBallMill;
