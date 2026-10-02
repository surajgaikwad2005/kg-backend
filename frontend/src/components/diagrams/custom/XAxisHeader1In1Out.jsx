import React from 'react';

const XAxisHeader1In1Out = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "X-AXIS FLOW HEADER",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';

    return (
        <g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* Background Frame / Boundary Box */}
            <rect x="10" y="0" width="380" height="180" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Bottom Side: 1 Central Input line coming up from below to y=137 */}
            {/* Line B1 (IN) */}
            <path d="M 200,180 V 137" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 200,180 V 137" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Top Side: 1 Central Output line extending straight up from y=113 */}
            {/* Line T1 (OUT) */}
            <path d="M 200,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 200,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Horizontal Manifold Pipe Block */}
            <rect x="100" y="113" width="200" height="24" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Weld Segment Dividers */}
            <line x1="150" y1="113" x2="150" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="250" y1="113" x2="250" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Flow Direction Indicators / Triangles */}
            {/* Bottom Input: Flowing UPWARD into the header bar */}
            <polygon points="196,160 200,148 204,160" fill="#f8fafc" />

            {/* Top Output: Flowing UPWARD out of the header bar */}
            <polygon points="196,65 200,53 204,65" fill="#f8fafc" />


            {/* Port Text Labels */}
            <text x="200" y="174" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN</text>
            <text x="200" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT</text>


            {/* Component Main Label Box */}
            <rect x="120" y="75" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="200" y="92" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons */}
            <circle cx="270" cy="88" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="130" cy="88" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default XAxisHeader1In1Out;