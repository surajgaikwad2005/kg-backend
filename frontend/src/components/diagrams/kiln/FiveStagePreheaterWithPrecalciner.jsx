import React from 'react';
const Preheater = ({ x = 0, y = 0, scale = 1, status = 'normal', label = "5-STG PREHEATER", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">
            {/* Background Frame / Tower Structure */}
            <rect x="30" y="10" width="260" height="580" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6"/>
            <line x1="30" y1="120" x2="290" y2="120" stroke="#334155" strokeWidth="2" strokeDasharray="4,4"/>
            <line x1="30" y1="210" x2="290" y2="210" stroke="#334155" strokeWidth="2" strokeDasharray="4,4"/>
            <line x1="30" y1="300" x2="290" y2="300" stroke="#334155" strokeWidth="2" strokeDasharray="4,4"/>
            <line x1="30" y1="390" x2="290" y2="390" stroke="#334155" strokeWidth="2" strokeDasharray="4,4"/>
            <line x1="30" y1="480" x2="290" y2="480" stroke="#334155" strokeWidth="2" strokeDasharray="4,4"/>

            {/* Platform Railings */}
            <line x1="100" y1="70" x2="220" y2="70" stroke="#475569" strokeWidth="1"/>
            <line x1="100" y1="75" x2="220" y2="75" stroke="#475569" strokeWidth="2"/>
            
            <line x1="30" y1="160" x2="150" y2="160" stroke="#475569" strokeWidth="1"/>
            <line x1="30" y1="165" x2="150" y2="165" stroke="#475569" strokeWidth="2"/>
            
            <line x1="170" y1="250" x2="290" y2="250" stroke="#475569" strokeWidth="1"/>
            <line x1="170" y1="255" x2="290" y2="255" stroke="#475569" strokeWidth="2"/>
            
            <line x1="30" y1="340" x2="150" y2="340" stroke="#475569" strokeWidth="1"/>
            <line x1="30" y1="345" x2="150" y2="345" stroke="#475569" strokeWidth="2"/>
            
            <line x1="170" y1="430" x2="290" y2="430" stroke="#475569" strokeWidth="1"/>
            <line x1="170" y1="435" x2="290" y2="435" stroke="#475569" strokeWidth="2"/>

            {/* Gas Ducts (Background Paths) */}
            <line x1="160" y1="40" x2="160" y2="-10" stroke="#94a3b8" strokeWidth="18" strokeLinecap="round"/>
            <path d="M 90,130 V 90 L 140,60" fill="none" stroke="#94a3b8" strokeWidth="18" strokeLinejoin="round"/>
            <path d="M 230,220 V 180 L 110,150" fill="none" stroke="#94a3b8" strokeWidth="18" strokeLinejoin="round"/>
            <path d="M 90,310 V 270 L 210,240" fill="none" stroke="#94a3b8" strokeWidth="18" strokeLinejoin="round"/>
            <path d="M 230,400 V 360 L 110,330" fill="none" stroke="#94a3b8" strokeWidth="18" strokeLinejoin="round"/>
            <path d="M 160,420 V 390 L 210,420" fill="none" stroke="#94a3b8" strokeWidth="18" strokeLinejoin="round"/>
            <path d="M 70,560 L 160,560 L 160,540" fill="none" stroke="#94a3b8" strokeWidth="22" strokeLinejoin="round"/>

            {/* Exhaust Fan ID */}
            <circle cx="160" cy="-20" r="15" fill="#cbd5e1" stroke="#334155" strokeWidth="3"/>
            <path d="M 160,-30 L 165,-20 L 160,-10 L 155,-20 Z" fill="#334155"/>
            <path d="M 150,-20 L 160,-15 L 170,-20 L 160,-25 Z" fill="#334155"/>

            {/* Tertiary Air Duct (TAD) */}
            <path d="M 10,480 L 135,480" fill="none" stroke="#cbd5e1" strokeWidth="14"/>
            <rect x="15" y="455" width="30" height="16" fill="#334155" rx="2"/>
            <text x="30" y="467" fill="#f8fafc" fontSize="10" fontFamily="monospace" textAnchor="middle">TAD</text>

            {/* Main Kiln Inlet Pipe */}
            <polygon points="10,528 80,545 80,575 10,563" fill="#cbd5e1" stroke={statusColor} strokeWidth="3" strokeLinejoin="round"/>
            <line x1="30" y1="535" x2="30" y2="566" stroke="#1e293b" strokeWidth="4"/>
            <line x1="50" y1="540" x2="50" y2="570" stroke="#1e293b" strokeWidth="4"/>

            {/* Stacked Cyclone Separators (Foreground) */}
            {/* Stage 1 */}
            <path d="M 140,40 h 40 v 30 l -15,40 h -10 l -15,-40 z" fill="#f8fafc" stroke={statusColor} strokeWidth="3" strokeLinejoin="round"/>
            {/* Stage 2 */}
            <path d="M 70,130 h 40 v 30 l -15,40 h -10 l -15,-40 z" fill="#e2e8f0" stroke={statusColor} strokeWidth="3" strokeLinejoin="round"/>
            {/* Stage 3 */}
            <path d="M 210,220 h 40 v 30 l -15,40 h -10 l -15,-40 z" fill="#e2e8f0" stroke={statusColor} strokeWidth="3" strokeLinejoin="round"/>
            {/* Stage 4 */}
            <path d="M 70,310 h 40 v 30 l -15,40 h -10 l -15,-40 z" fill="#e2e8f0" stroke={statusColor} strokeWidth="3" strokeLinejoin="round"/>
            {/* Stage 5 */}
            <path d="M 210,400 h 40 v 30 l -15,40 h -10 l -15,-40 z" fill="#cbd5e1" stroke={statusColor} strokeWidth="3" strokeLinejoin="round"/>

            {/* Precalciner Vessel */}
            <rect x="135" y="420" width="50" height="120" rx="15" fill="#f8fafc" stroke={statusColor} strokeWidth="3"/>
            <line x1="135" y1="450" x2="185" y2="450" stroke={statusColor} strokeWidth="2" opacity="0.6"/>
            <line x1="135" y1="480" x2="185" y2="480" stroke={statusColor} strokeWidth="2" opacity="0.6"/>
            <line x1="135" y1="510" x2="185" y2="510" stroke={statusColor} strokeWidth="2" opacity="0.6"/>

            {/* Precalciner Burner Details */}
            <polygon points="115,495 135,490 135,500" fill="#ef4444" stroke="#1e293b" strokeWidth="2"/>
            <polygon points="120,495 130,493 130,497" fill="#fef08a"/>

            {/* Raw Meal Feed Pipe */}
            <path d="M 220,10 V 50 L 145,70" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round"/>
            <polygon points="155,60 145,70 155,70" fill="#f59e0b"/>
            <rect x="200" y="-10" width="40" height="20" fill="#334155" rx="2"/>
            <text x="220" y="4" fill="#f8fafc" fontSize="9" fontFamily="monospace" textAnchor="middle">FEED</text>

            {/* Material Drop Ducts (Foreground) */}
            <path d="M 160,110 V 150 L 110,170" fill="none" stroke="#475569" strokeWidth="6" strokeLinejoin="round"/>
            <path d="M 90,200 V 240 L 210,260" fill="none" stroke="#475569" strokeWidth="6" strokeLinejoin="round"/>
            <path d="M 230,290 V 330 L 110,350" fill="none" stroke="#475569" strokeWidth="6" strokeLinejoin="round"/>
            <path d="M 90,380 V 415 L 145,430" fill="none" stroke="#475569" strokeWidth="6" strokeLinejoin="round"/>
            <path d="M 230,470 V 550 L 160,550" fill="none" stroke="#475569" strokeWidth="6" strokeLinejoin="round"/>

            {/* Material Flow Direction Arrows */}
            <polygon points="160,135 155,125 165,125" fill="#f59e0b"/>
            <polygon points="90,225 85,215 95,215" fill="#f59e0b"/>
            <polygon points="230,315 225,305 235,305" fill="#f59e0b"/>
            <polygon points="90,405 85,395 95,395" fill="#f59e0b"/>
            <polygon points="230,515 225,505 235,505" fill="#f59e0b"/>

            {/* Stage Sensor Data Displays */}
            <g transform="translate(190, 50)">
                <rect width="45" height="20" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="2"/>
                <text x="22.5" y="14" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">320°</text>
            </g>
            <g transform="translate(120, 140)">
                <rect width="45" height="20" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="2"/>
                <text x="22.5" y="14" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">480°</text>
            </g>
            <g transform="translate(260, 230)">
                <rect width="45" height="20" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="2"/>
                <text x="22.5" y="14" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">620°</text>
            </g>
            <g transform="translate(120, 320)">
                <rect width="45" height="20" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="2"/>
                <text x="22.5" y="14" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">750°</text>
            </g>
            <g transform="translate(260, 410)">
                <rect width="45" height="20" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="2"/>
                <text x="22.5" y="14" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">880°</text>
            </g>
            <g transform="translate(195, 480)">
                <rect width="45" height="20" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="2"/>
                <text x="22.5" y="14" fill="#ef4444" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">910°</text>
            </g>

            {/* Main Label Box */}
            <rect x="90" y="-50" width="140" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2"/>
            <text x="160" y="-32" textAnchor="middle" fill="#f8fafc" fontSize="12" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>

            {/* DCS Flashing Status Indicators */}
            <circle cx="245" cy="-37" r="6" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>
            <circle cx="75" cy="-37" r="6" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
            </circle>
        </g>);
};
export default Preheater;
