import React from 'react';

const H2Header3_2In1Out = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "H2 COUPLING PIPE",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';

    return (
        <g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* Compressed Background Frame / Boundary Box */}
            <rect x="0" y="10" width="250" height="240" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Continuous Connecting Pipe Layout (Background Thick Pipe) */}
            {/* Top input angled down to center, bottom input angled up to center, meeting output */}
            <path d="M 0,90 L 120,130 H 250 M 0,170 L 120,130" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />

            {/* Continuous Connecting Pipe Layout (Foreground Status Color Overlay) */}
            <path d="M 0,90 L 120,130 H 250 M 0,170 L 120,130" fill="none" stroke={statusColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />


            {/* Flow Indicators / Directional Arrows along the pipe routes */}
            {/* Left Side: IN flowing inward along the slope */}
            <polygon points="45,101 57,105 47,112" fill="#f8fafc" />
            <polygon points="47,148 57,155 45,159" fill="#f8fafc" />

            {/* Right Side: OUT flowing outward along the flat center line */}
            <polygon points="200,126 212,130 200,134" fill="#f8fafc" />


            {/* Line Text Labels */}
            <text x="18" y="76" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN-1</text>
            <text x="18" y="196" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN-2</text>

            <text x="228" y="116" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT</text>


            {/* Inline Weld/Coupling Ring Accent at the intersection point */}
            <circle cx="120" cy="130" r="10" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.8" />


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

export default H2Header3_2In1Out;