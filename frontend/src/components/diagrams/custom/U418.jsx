import React from 'react';

const TerminalBoxU418 = ({
    x = 0,
    y = 0,
    scale = 1,
    status = 'normal',
    label = "U-418",
    onPointerDown,
}) => {
    const isHazard = status === 'hazard';
    const isWarning = status === 'warning';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#334155';

    const textColor = isHazard || isWarning ? '#ffffff' : '#000000';
    const bgColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#f8fafc';

    return (
        <g
            transform={`translate(${x}, ${y}) scale(${scale})`}
            onPointerDown={onPointerDown}
            className="cursor-pointer group"
        >
            {/* The Main Box */}
            <rect
                x="0"
                y="0"
                width="80"
                height="30"
                rx="2"
                fill={bgColor}
                stroke={statusColor}
                strokeWidth="1.5"
                className="transition-colors duration-200"
            />

            {/* The Text - "U-418" is now correctly placed inside */}
            <text
                x="40"
                y="19"
                textAnchor="middle"
                fill={status === 'normal' ? '#000000' : textColor}
                fontSize="13"
                fontFamily="sans-serif"
                fontWeight="bold"
                className="select-none pointer-events-none transition-colors duration-200"
            >
                {label}
            </text>
            {/* Boundary Box (for canvas logic) */}
            <rect x="-10" y="-5" width="100" height="40" fill="none" pointerEvents="none" />

        </g>
    );
};

export default TerminalBoxU418;