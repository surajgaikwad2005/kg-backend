import React from 'react';

const VerticalHeader4WayCustom = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "Y-AXIS 4-WAY MANIFOLD",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';

    return (
        <g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* Background Frame / Boundary Box */}
            <rect x="0" y="0" width="250" height="400" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Left Hand Side: 1 Output Line at y=200 */}
            {/* Line L1 (OUT-LEFT) */}
            <path d="M 0,200 H 113" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,200 H 113" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Right Hand Side: 2 Input Lines distributed at y=130 and y=270 */}
            {/* Line R1 (IN-RIGHT 1) */}
            <path d="M 137,130 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,130 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Line R2 (IN-RIGHT 2) */}
            <path d="M 137,270 H 250" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 137,270 H 250" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Bottom Side: 1 Output Line dropping straight down at x=125 */}
            {/* Line B1 (BOTTOM OUT) */}
            <path d="M 125,330 V 400" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 125,330 V 400" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Vertical Main Pipe Manifold */}
            <rect x="113" y="40" width="24" height="290" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Weld/Segment Markers */}
            <line x1="113" y1="130" x2="137" y2="130" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="200" x2="137" y2="200" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="113" y1="270" x2="137" y2="270" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            {/* Line Text Labels */}
            <text x="18" y="186" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle"></text>

            <text x="228" y="116" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle"></text>
            <text x="228" y="256" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle"></text>

            <text x="140" y="390" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="start"></text>

            <rect x="45" y="70" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="125" y="87" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>

            <circle cx="190" cy="83" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="83" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default VerticalHeader4WayCustom;