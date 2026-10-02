import React from 'react';

const YAxisHeader3In4Out = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "Y-AXIS HEADER",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';

    return (
        <g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* Elongated Vertical Background Frame / Boundary Box */}
            <rect x="0" y="0" width="250" height="900" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Left Hand Side: 3 Input lines distributed at y=250, y=450, y=650 */}
            {/* Line L1 (IN-1) */}
            <path d="M 0,250 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,250 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line L2 (IN-2) */}
            <path d="M 0,450 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,450 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line L3 (IN-3) */}
            <path d="M 0,650 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,650 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Right Hand Side: 4 Output lines distributed at y=150, y=350, y=550, y=750 */}
            {/* Line R1 (OUT-1) */}
            <path d="M 137,150 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,150 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R2 (OUT-2) */}
            <path d="M 137,350 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,350 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R3 (OUT-3) */}
            <path d="M 137,550 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,550 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R4 (OUT-4) */}
            <path d="M 137,750 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,750 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Vertical Main Pipe Manifold */}
            <rect x="113" y="40" width="24" height="780" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Segment Indicators */}
            <line x1="113" y1="200" x2="137" y2="200" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="400" x2="137" y2="400" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="600" x2="137" y2="600" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Bottom Side: Optional bottom process connection line */}
            {/* Line B1 (BOTTOM CONN) */}
            <path d="M 125,820 V 900" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 125,820 V 900" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Flow Indicators / Directional Arrows */}
            {/* Left Side: 3 IN arrows flowing inward to the right (Left-to-Right) */}
            <polygon points="25,246 37,250 25,254" fill="#f8fafc" />
            <polygon points="25,446 37,450 25,454" fill="#f8fafc" />
            <polygon points="25,646 37,650 25,654" fill="#f8fafc" />

            {/* Right Side: 4 OUT arrows flowing outward to the right */}
            <polygon points="210,146 222,150 210,154" fill="#f8fafc" />
            <polygon points="210,396 222,350 210,354" fill="#f8fafc" /> {/* Fixed vertical center typo here too */}
            <polygon points="210,546 222,550 210,554" fill="#f8fafc" />
            <polygon points="210,746 222,750 210,754" fill="#f8fafc" />

            {/* Bottom Connection: Flowing DOWNWARD out of the manifold */}
            <polygon points="121,875 125,887 129,875" fill="#f8fafc" />


            {/* Corrected Line Text Labels */}
            <text x="18" y="236" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN-1</text>
            <text x="18" y="436" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN-2</text>
            <text x="18" y="636" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN-3</text>

            <text x="228" y="136" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-1</text>
            <text x="228" y="336" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-2</text>
            <text x="228" y="536" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-3</text>
            <text x="228" y="736" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-4</text>

            <text x="150" y="890" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="start">BOTTOM</text>


            {/* Component Main Label Box */}
            <rect x="45" y="830" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="125" y="847" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons */}
            <circle cx="190" cy="843" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="843" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default YAxisHeader3In4Out;