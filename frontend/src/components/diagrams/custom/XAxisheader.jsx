import React from 'react';

const XAxisHeader = ({
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

            {/* Elongated Horizontal Background Frame / Boundary Box */}
            <rect x="10" y="0" width="1380" height="180" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Bottom Side: 1 Input line coming from below up to the manifold at y=137 */}
            {/* Line B1 (IN) */}
            <path d="M 160,180 V 137" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 160,180 V 137" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Top Side: 3 Output lines going upwards from the manifold at y=113 */}
            {/* Line T0 (OUT-0) */}
            <path d="M 240,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 240,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line T1 (OUT-1) */}
            <path d="M 350,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 350,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line T2 (OUT-2) */}
            <path d="M 1050,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 1050,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line T3 (OUT-3) */}
            <path d="M 1160,113 V 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 1160,113 V 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Long Horizontal Manifold Pipe Column */}
            <rect x="30" y="113" width="1340" height="24" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Weld Segment Dividers */}
            <line x1="450" y1="113" x2="450" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="950" y1="113" x2="950" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Flow Direction Indicators / Triangles */}
            {/* Bottom Input: Flowing UPWARD into the header */}
            <polygon points="156,160 160,148 164,160" fill="#f8fafc" />

            {/* Top Outputs: Flowing UPWARD out of the header */}
            <polygon points="236,65 240,53 244,65" fill="#f8fafc" />
            <polygon points="346,65 350,53 354,65" fill="#f8fafc" />
            <polygon points="1046,65 1050,53 1054,65" fill="#f8fafc" />
            <polygon points="1156,65 1160,53 1164,65" fill="#f8fafc" />


            {/* Port Labels */}
            <text x="160" y="174" fill="#000000ff" fontSize="9" fontFamily="monospace" textAnchor="middle">IN</text>

            <text x="240" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-0</text>
            <text x="350" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-1</text>
            <text x="1050" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-2</text>
            <text x="1160" y="24" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT-3</text>


            {/* Right Side Purge Valve Stack Assembly */}
            <line x1="1370" y1="125" x2="1390" y2="125" stroke="#475569" strokeWidth="6" />
            <polygon points="1390,110 1390,140 1377,125" fill="#475569" stroke="#334155" strokeWidth="1" />
            <polygon points="1377,110 1377,140 1390,125" fill="#475569" stroke="#334155" strokeWidth="1" />
            <circle cx="1396" cy="125" r="4" fill="#ef4444" />


            {/* Component Label Box */}
            <rect x="620" y="75" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="700" y="92" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons */}
            <circle cx="770" cy="88" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="630" cy="88" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default XAxisHeader;