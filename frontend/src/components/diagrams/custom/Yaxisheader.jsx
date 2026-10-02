import React from 'react';

const YAxisHeader = ({
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

            {/* Background Frame / Boundary Box (Height updated to 1340) */}
            <rect x="0" y="0" width="250" height="1340" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Left Hand Side: 2 Output lines spaced out over the new tall height */}
            {/* Line L1 (OUT-1) at y=350 */}
            <path d="M 0,350 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,350 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line L2 (OUT-2) at y=950 */}
            <path d="M 0,950 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,950 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Right Hand Side: 1 Input line centered between the outputs at y=650 */}
            {/* Line R1 (IN) */}
            <path d="M 137,650 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,650 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Top Side: 1 Process Connection line extending straight up at x=125 */}
            {/* Line T1 (TOP CONN) */}
            <path d="M 125,0 V 40" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 125,0 V 40" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Vertical Main Pipe Manifold (Height updated to 1260) */}
            <rect x="113" y="40" width="24" height="1260" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Segment Indicators balanced across the length */}
            <line x1="113" y1="250" x2="137" y2="250" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="450" x2="137" y2="450" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="650" x2="137" y2="650" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="850" x2="137" y2="850" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="1050" x2="137" y2="1050" stroke={statusColor} strokeWidth="2" opacity="0.5" />

            {/* Top Connection: Flowing UPWARD out of the manifold */}
            <polygon points="121,20 125,8 129,20" fill="#f8fafc" />


            {/* Adjusted Line Labels vertically aligned with pipelines */}
            <text x="18" y="336" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN-1</text>
            <text x="18" y="936" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN-2</text>

            <text x="228" y="636" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT</text>

            <text x="150" y="15" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="start">TOP</text>


            {/* Component Main Label Box moved down near the base (y=1305) */}
            <rect x="45" y="1305" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="125" y="1322" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons shifted down to accompany the footer label */}
            <circle cx="190" cy="1318" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="1318" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default YAxisHeader;