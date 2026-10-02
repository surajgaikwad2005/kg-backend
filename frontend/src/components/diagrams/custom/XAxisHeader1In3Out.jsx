import React from 'react';

const XAxisHeader1In3Out = ({
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

            {/* Horizontal Background Frame / Boundary Box (Width: 1000) */}
            <rect x="10" y="0" width="1000" height="180" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Bottom Side: 1 Central Input line centered perfectly at x=500 */}
            {/* Line B1 (IN) */}
            <path d="M 500,180 V 137" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 500,180 V 137" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Top Side: 3 Output lines distributed widely across the 900px manifold span */}
            {/* Line T1 (OUT-1) at x=200 */}
            <path d="M 200,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 200,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line T2 (OUT-2) at x=500 */}
            <path d="M 500,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 500,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line T3 (OUT-3) at x=800 */}
            <path d="M 800,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 800,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Wide Horizontal Manifold Pipe Column (Width: 900) */}
            <rect x="50" y="113" width="900" height="24" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Weld Segment Dividers balanced across the span */}
            <line x1="350" y1="113" x2="350" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="650" y1="113" x2="650" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Flow Direction Indicators / Triangles */}
            {/* Bottom Input: Flowing UPWARD into the header bar */}
            <polygon points="496,160 500,148 504,160" fill="#f8fafc" />

            {/* Top Outputs: 3 Arrows flowing UPWARD out of the header bar */}
            <polygon points="196,65 200,53 204,65" fill="#f8fafc" />
            <polygon points="496,65 500,53 504,65" fill="#f8fafc" />
            <polygon points="796,65 800,53 804,65" fill="#f8fafc" />


            {/* Port Text Labels */}
            <text x="500" y="174" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN</text>

            <text x="200" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-1</text>
            <text x="500" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-2</text>
            <text x="800" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-3</text>


            {/* Component Main Label Box (Centered exactly along the 1000px canvas width) */}
            <rect x="420" y="75" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="500" y="92" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons */}
            <circle cx="570" cy="88" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="430" cy="88" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default XAxisHeader1In3Out;