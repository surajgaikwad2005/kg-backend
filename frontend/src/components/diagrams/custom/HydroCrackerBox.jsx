import React from 'react';

const HydrocrackerBox = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "HYDROCRACKER",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const isWarning = status === 'warning';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#334155';

    const textColor = isHazard || isWarning ? '#ffffff' : '#000000';
    const subTextColor = isHazard || isWarning ? '#f1f5f9' : '#475569';
    const bgColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#f8fafc';

    return (
        <g
            transform={`translate(${x}, ${y}) scale(${scale})`}
            onPointerDown={onPointerDown}
            className="cursor-pointer group"
        >
            {/* Enlarged Main Box Container */}
            <rect
                x="0"
                y="0"
                width="160"
                height="45"
                rx="4"
                fill={bgColor}
                stroke={statusColor}
                strokeWidth="2"
                className="transition-colors duration-200"
            />

            {/* Main Title: HYDROCRACKER */}
            <text
                x="80"
                y="18"
                textAnchor="middle"
                fill={status === 'normal' ? '#000000' : textColor}
                fontSize="13"
                fontFamily="sans-serif"
                fontWeight="bold"
                letterSpacing="0.5"
                className="select-none pointer-events-none transition-colors duration-200"
            >
                {label}
            </text>

            {/* Adjusted Canvas Registry Boundary Box */}
            <rect x="-15" y="-5" width="190" height="55" fill="none" pointerEvents="none" />

        </g>
    );
};

export default HydrocrackerBox;