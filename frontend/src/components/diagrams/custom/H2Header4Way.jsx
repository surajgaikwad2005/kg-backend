import React from 'react';

const H2Header4Way = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "H2 MANIFOLD 4-WAY",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';

    return (
        <g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* Compressed Background Frame / Boundary Box */}
            <rect x="0" y="0" width="250" height="340" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Left Hand Side: 2 Output lines (Distributed at y=110 and y=230) */}
            {/* Line L1 (OUT-1) */}
            <path d="M 0,110 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,110 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line L2 (OUT-2) */}
            <path d="M 0,230 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,230 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Right Hand Side: 1 Input line centered vertically at y=170 */}
            {/* Line R1 (IN) */}
            <path d="M 137,170 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,170 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Top Side: 1 Output Process line extending straight up at x=125 */}
            {/* Line T1 (TOP OUT) */}
            <path d="M 125,0 V 40" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 125,0 V 40" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Vertical Main Manifold Pipe */}
            <rect x="113" y="40" width="24" height="260" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Segment Indicators */}
            <line x1="113" y1="100" x2="137" y2="100" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="160" x2="137" y2="160" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="220" x2="137" y2="220" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Flow Indicators / Directional Arrows */}
            {/* Left Side: OUT flowing outward to the left */}
            <polygon points="37,106 25,110 37,114" fill="#f8fafc" />
            <polygon points="37,226 25,230 37,234" fill="#f8fafc" />

            {/* Right Side: IN flowing inward to the left (Right-to-Left) */}
            <polygon points="222,166 210,170 222,174" fill="#f8fafc" />

            {/* Top Connection: OUT flowing UPWARD out of the manifold */}
            <polygon points="121,17 125,5 129,17" fill="#f8fafc" />


            {/* Line Text Labels */}
            <text x="18" y="96" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-1</text>
            <text x="18" y="216" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-2</text>

            <text x="228" y="156" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN</text>
            <text x="145" y="15" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="start">TOP OUT</text>


            {/* Component Main Label Box */}
            <rect x="45" y="305" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="125" y="322" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons */}
            <circle cx="190" cy="318" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="318" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default H2Header4Way;