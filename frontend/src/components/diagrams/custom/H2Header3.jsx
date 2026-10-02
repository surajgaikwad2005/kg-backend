import React from 'react';

const H2Header3 = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "H2 MANIFOLD 3-WAY",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';

    return (
        <g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* Compressed Background Frame / Boundary Box */}
            <rect x="0" y="10" width="250" height="240" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Left Hand Side: 1 Input Point centered vertically at y=130 */}
            {/* Line L1 (IN) */}
            <path d="M 0,130 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,130 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Right Hand Side: 2 Output Points distributed at y=90 and y=170 */}
            {/* Line R1 (OUT-1) */}
            <path d="M 137,90 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,90 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R2 (OUT-2) */}
            <path d="M 137,170 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,170 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Main Vertical Pipe Header (Shortened height to 160 to match 3 ports total) */}
            <rect x="113" y="50" width="24" height="160" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Weld/Segment Markers */}
            <line x1="113" y1="100" x2="137" y2="100" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="150" x2="137" y2="150" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Flow Indicators / Directional Arrows */}
            {/* Left Side: IN flowing inward to the right */}
            <polygon points="25,126 37,130 25,134" fill="#f8fafc" />

            {/* Right Side: OUT flowing outward to the right */}
            <polygon points="210,86 222,90 210,94" fill="#f8fafc" />
            <polygon points="210,166 222,170 210,174" fill="#f8fafc" />


            {/* Line Text Labels */}
            <text x="18" y="116" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN</text>

            <text x="228" y="76" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-1</text>
            <text x="228" y="156" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-2</text>


            {/* Top Vent Valve Safety Stack Assembly */}
            <line x1="125" y1="50" x2="125" y2="25" stroke="#475569" strokeWidth="6" />
            <polygon points="110,25 140,25 125,38" fill="#475569" stroke="#334155" strokeWidth="1" />
            <polygon points="110,38 140,38 125,25" fill="#475569" stroke="#334155" strokeWidth="1" />
            <circle cx="125" cy="18" r="4" fill="#ef4444" />


            {/* Component Main Label Box */}
            <rect x="45" y="-5" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="125" y="12" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons */}
            <circle cx="190" cy="8" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="8" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default H2Header3;