import React from 'react';

const XAxisHeader1In4Out = ({
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

            {/* Massive Horizontal Background Frame / Boundary Box (Width expanded to 1500) */}
            <rect x="10" y="0" width="1500" height="180" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Bottom Side: 1 Central Input line centered perfectly at x=750 */}
            {/* Line B1 (IN) */}
            <path d="M 750,180 V 137" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 750,180 V 137" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Top Side: 4 Output lines distributed widely across the 1400px manifold span */}
            {/* Line T1 (OUT-1) at x=150 */}
            <path d="M 150,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 150,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line T2 (OUT-2) at x=550 */}
            <path d="M 550,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 550,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line T3 (OUT-3) at x=950 */}
            <path d="M 950,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 950,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line T4 (OUT-4) at x=1350 */}
            <path d="M 1350,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 1350,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Giant Horizontal Manifold Pipe Column (Expanded width to 1400) */}
            <rect x="50" y="113" width="1400" height="24" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Weld Segment Dividers balanced across the wide span */}
            <line x1="350" y1="113" x2="350" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="750" y1="113" x2="750" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="1150" y1="113" x2="1150" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Flow Direction Indicators / Triangles */}
            {/* Bottom Input: Flowing UPWARD into the wide header bar */}
            <polygon points="746,160 750,148 754,160" fill="#f8fafc" />

            {/* Top Outputs: 4 Arrows flowing UPWARD out of the header bar */}
            <polygon points="146,65 150,53 154,65" fill="#f8fafc" />
            <polygon points="546,65 550,53 554,65" fill="#f8fafc" />
            <polygon points="946,65 950,53 954,65" fill="#f8fafc" />
            <polygon points="1346,65 1350,53 1354,65" fill="#f8fafc" />


            {/* Port Text Labels */}
            <text x="750" y="174" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN</text>

            <text x="150" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-1</text>
            <text x="550" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-2</text>
            <text x="950" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-3</text>
            <text x="1350" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-4</text>


            {/* Component Main Label Box (Centered exactly along the 1500px canvas width) */}
            <rect x="670" y="75" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="750" y="92" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons positioned cleanly around the central label box */}
            <circle cx="820" cy="88" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="680" cy="88" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default XAxisHeader1In4Out;