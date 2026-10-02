import React from 'react';

const H2Header5 = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "H2 HEADER MANIFOLD",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';

    return (
        <g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* Compressed Background Frame / Boundary Box */}
            <rect x="0" y="10" width="250" height="340" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Left Hand side (1 Input at y=110, 1 Output at y=230) */}
            {/* Line L1 (IN) */}
            <path d="M 0,110 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,110 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line L2 (OUT) */}
            <path d="M 0,230 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,230 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Right Hand Outputs (3 Streams at y=80, y=170, y=260) */}
            {/* Line R1 (OUT-1) */}
            <path d="M 137,80 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,80 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R2 (OUT-2) */}
            <path d="M 137,170 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,170 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R3 (OUT-3) */}
            <path d="M 137,260 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,260 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Main H2 Header Column */}
            <rect x="113" y="40" width="24" height="260" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Weld/Segment Markers */}
            <line x1="113" y1="100" x2="137" y2="100" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="150" x2="137" y2="150" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="200" x2="137" y2="200" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="250" x2="137" y2="250" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Flow Indicators / Directional Arrows */}
            {/* Left Side (IN: flows inward to right; OUT: flows outward to left) */}
            <polygon points="37,106 25,110 37,114" fill="#f8fafc" />
            <polygon points="25,226 37,230 25,234" fill="#f8fafc" />

            {/* Right Side Outputs (Flows outward to right) */}
            <polygon points="210,76 222,80 210,84" fill="#f8fafc" />
            <polygon points="210,166 222,170 210,174" fill="#f8fafc" />
            <polygon points="210,256 222,260 210,264" fill="#f8fafc" />


            {/* Adjusted Line Labels */}
            <text x="18" y="96" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT</text>
            <text x="18" y="216" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN</text>

            <text x="228" y="66" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-1</text>
            <text x="228" y="156" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-2</text>
            <text x="228" y="246" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-3</text>


            {/* Top Vent Valve Safety Stack Assembly */}
            <line x1="125" y1="40" x2="125" y2="15" stroke="#475569" strokeWidth="6" />
            <polygon points="110,15 140,15 125,28" fill="#475569" stroke="#334155" strokeWidth="1" />
            <polygon points="110,28 140,28 125,15" fill="#475569" stroke="#334155" strokeWidth="1" />
            <circle cx="125" cy="8" r="4" fill="#ef4444" />


            {/* Component Main Label Box */}
            <rect x="45" y="-15" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="125" y="2" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons */}
            <circle cx="190" cy="-2" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="-2" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default H2Header5;