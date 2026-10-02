import React from 'react';

const YAxisHeader1In5Out = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "Y-AXIS MANIFOLD",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';

    return (
        <g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* Background Frame / Boundary Box */}
            <rect x="0" y="0" width="250" height="1340" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Left Hand Side: 1 Input line centered perfectly at y=650 */}
            {/* Line L1 (IN) */}
            <path d="M 0,650 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,650 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Right Hand Side: 5 Output lines spaced out evenly along the 1260px manifold body */}
            {/* Line R1 (OUT-1) at y=150 */}
            <path d="M 137,150 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,150 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R2 (OUT-2) at y=400 */}
            <path d="M 137,400 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,400 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R3 (OUT-3) at y=650 */}
            <path d="M 137,650 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,650 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R4 (OUT-4) at y=900 */}
            <path d="M 137,900 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,900 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R5 (OUT-5) at y=1150 */}
            <path d="M 137,1150 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,1150 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Top Side: Optional top process venting connection line */}
            {/* Line T1 (TOP CONN) */}
            <path d="M 125,0 V 40" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 125,0 V 40" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Vertical Main Pipe Manifold */}
            <rect x="113" y="40" width="24" height="1260" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Segment Weld Ring Layout */}
            <line x1="113" y1="150" x2="137" y2="150" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="400" x2="137" y2="400" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="650" x2="137" y2="650" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="900" x2="137" y2="900" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="1150" x2="137" y2="1150" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Flow Indicators / Directional Arrows */}
            {/* Left Side: IN flowing inward to the right (towards the pipe) */}
            <polygon points="25,646 37,650 25,654" fill="#f8fafc" />

            {/* Right Side: 5 OUT arrows flowing outward to the right */}
            <polygon points="210,146 222,150 210,154" fill="#f8fafc" />
            <polygon points="210,396 222,400 210,404" fill="#f8fafc" />
            <polygon points="210,646 222,650 210,654" fill="#f8fafc" />
            <polygon points="210,896 222,900 210,904" fill="#f8fafc" />
            <polygon points="210,1146 222,1150 210,1154" fill="#f8fafc" />

            {/* Top Connection: Flowing UPWARD out of the manifold */}
            <polygon points="121,20 125,8 129,20" fill="#f8fafc" />


            {/* Adjusted Line Labels */}
            <text x="18" y="636" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN</text>

            <text x="228" y="136" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-1</text>
            <text x="228" y="386" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-2</text>
            <text x="228" y="636" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-3</text>
            <text x="228" y="886" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-4</text>
            <text x="228" y="1136" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-5</text>

            <text x="150" y="15" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="start">TOP</text>


            {/* Component Main Label Box */}
            <rect x="45" y="1305" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="125" y="1322" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons */}
            <circle cx="190" cy="1318" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="1318" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default YAxisHeader1In5Out;