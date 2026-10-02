import React from 'react';

const LongLShapedHeader = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "LONG H2 MANIFOLD",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0ea5e9';

    return (
        <g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* Elongated Background Frame / Boundary Box */}
            <rect x="10" y="0" width="380" height="180" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" opacity="0.3" />

            {/* Left Side: 1 Inlet Line at y=125 */}
            {/* Line L1 (IN-LEFT) */}
            <path d="M 0,125 H 30" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 0,125 H 30" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Bottom Side: 1 Inlet Line coming up from below to y=137 */}
            {/* Line B1 (IN-BOTTOM) */}
            <path d="M 200,180 V 137" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 200,180 V 137" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />

            {/* Right Side: 1 Outlet Line departing at y=125 */}
            {/* Line R1 (OUT-RIGHT) */}
            <path d="M 370,125 H 400" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="square" />
            <path d="M 370,125 H 400" fill="none" stroke={statusColor} strokeWidth="3" opacity="0.6" />


            {/* Central Very Long Horizontal Manifold Pipe Column */}
            <rect x="30" y="113" width="340" height="24" rx="6" fill="#f8fafc" stroke={statusColor} strokeWidth="4" />

            {/* Central Internal Pipe Weld Segment Dividers */}
            <line x1="115" y1="113" x2="115" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />
            <line x1="285" y1="113" x2="285" y2="137" stroke={statusColor} strokeWidth="2" opacity="0.5" />


            {/* Flow Direction Indicators / Triangles */}
            {/* Left Inlet: Flowing RIGHT into the header */}
            <polygon points="10,121 22,125 10,129" fill="#f8fafc" />

            {/* Bottom Inlet: Flowing UPWARD into the header */}
            <polygon points="196,162 200,150 204,162" fill="#f8fafc" />

            {/* Right Output: Flowing RIGHT out of the header */}
            <polygon points="380,121 392,125 380,129" fill="#f8fafc" />


            {/* Port Labels */}
            <text x="15" y="110" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">IN-1</text>
            <text x="218" y="170" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="start">IN-2</text>
            <text x="385" y="110" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">OUT</text>


            {/* Component Main Label Box */}
            <rect x="120" y="70" width="160" height="26" rx="4" fill="#0f172a" stroke={statusColor} strokeWidth="2" />
            <text x="200" y="87" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold" className="pointer-events-none select-none">
                {label}
            </text>


            {/* Flashing Status Beacons */}
            <circle cx="270" cy="83" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="130" cy="83" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

        </g>
    );
};

export default LongLShapedHeader;