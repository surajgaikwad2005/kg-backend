import React from 'react';

const XAxisHeader1In5Out = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "X-AXIS HEADER",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';

    return (
        <g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* Colossal Horizontal Background Frame / Boundary Box (Width: 3000) */}
            <rect x="10" y="0" width="3000" height="180" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Top Side: 1 Central Input line centered perfectly at x=1500 */}
            {/* Line T1 (IN) */}
            <path d="M 1500,0 V 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 1500,0 V 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Bottom Side: 5 Output lines distributed at massive 600px increments across the 2800px span */}
            {/* Line B1 (OUT-1) at x=300 */}
            <path d="M 300,137 V 180" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 300,137 V 180" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line B2 (OUT-2) at x=900 */}
            <path d="M 900,137 V 180" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 900,137 V 180" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line B3 (OUT-3) at x=1500 */}
            <path d="M 1500,137 V 180" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 1500,137 V 180" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line B4 (OUT-4) at x=2100 */}
            <path d="M 2100,137 V 180" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 2100,137 V 180" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line B5 (OUT-5) at x=2700 */}
            <path d="M 2700,137 V 180" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 2700,137 V 180" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Colossal Horizontal Manifold Pipe Column (Width: 2800) */}
            <rect x="100" y="113" width="2800" height="24" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Weld Segment Dividers balanced across the giant span */}
            <line x1="600" y1="113" x2="600" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="1200" y1="113" x2="1200" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="1800" y1="113" x2="1800" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="2400" y1="113" x2="2400" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Flow Direction Indicators / Triangles */}
            {/* Top Input: Flowing DOWNWARD into the header bar */}
            <polygon points="1496,45 1500,57 1504,45" fill="#f8fafc" />

            {/* Bottom Outputs: 5 Arrows flowing DOWNWARD out of the header bar */}
            <polygon points="296,155 300,167 304,155" fill="#f8fafc" />
            <polygon points="896,155 900,167 904,155" fill="#f8fafc" />
            <polygon points="1496,155 1500,167 1504,155" fill="#f8fafc" />
            <polygon points="2096,155 2100,167 2104,155" fill="#f8fafc" />
            <polygon points="2696,155 2700,167 2704,155" fill="#f8fafc" />


            {/* Port Text Labels */}
            <text x="1500" y="15" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN</text>

            <text x="300" y="174" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-1</text>
            <text x="900" y="174" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-2</text>
            <text x="1500" y="174" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-3</text>
            <text x="2100" y="174" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-4</text>
            <text x="2700" y="174" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-5</text>


            {/* Component Main Label Box (Centered exactly along the 3000px canvas width) */}
            <rect x="1420" y="72" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="1500" y="89" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons */}
            <circle cx="1570" cy="85" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="1430" cy="85" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default XAxisHeader1In5Out;