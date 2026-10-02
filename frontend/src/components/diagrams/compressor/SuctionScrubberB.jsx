import React from 'react';
const SuctionScrubber = ({ x, y, scale = 1, status = 'normal', liquidLevel = 35, // Default visual level
label = 'V-2440A', onPointerDown, }) => {
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    // Scrubber Dimensions
    const width = 60;
    const height = 100;
    const radius = 10; // For rounded caps
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} className="cursor-pointer select-none" onPointerDown={onPointerDown}>
            <defs>
                <linearGradient id="vesselGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8"/>
                    <stop offset="30%" stopColor="#f1f5f9"/>
                    <stop offset="100%" stopColor="#475569"/>
                </linearGradient>

                {/* Clip path for the liquid level inside the vessel */}
                <clipPath id="vesselClip">
                    <rect x="0" y="0" width={width} height={height} rx={radius}/>
                </clipPath>
            </defs>

            {/* 1. Main Vessel Body */}
            <rect width={width} height={height} rx={radius} fill="url(#vesselGrad)" stroke={isNormal ? "#475569" : statusColor} strokeWidth="2"/>

            {/* 2. Liquid Level Visualization */}
            <rect x="0" y={height - (liquidLevel / 100) * height} width={width} height={(liquidLevel / 100) * height} fill={isHazard ? "#fca5a5" : "#7dd3fc"} opacity="0.5" clipPath="url(#vesselClip)"/>

            {/* 3. Internal Components (P&ID Symbols) */}
            {/* Mist Extractor (Mesh at the top) */}
            <path d={`M 10,20 L ${width - 10},20 M 10,25 L ${width - 10},25`} stroke="#475569" strokeWidth="1" strokeDasharray="2,2"/>

            {/* Inlet Deflector (Where the gas enters) */}
            <path d={`M 0,40 L 15,40 L 15,55`} fill="none" stroke="#475569" strokeWidth="1.5"/>

            {/* 4. Nozzles (External Connections) */}
            {/* Top Outlet (Gas) */}
            <rect x={width / 2 - 5} y="-8" width="10" height="8" fill="#334155"/>
            {/* Bottom Drain (Liquid) */}
            <rect x={width / 2 - 5} y={height} width="10" height="8" fill="#334155"/>
            {/* Side Inlet */}
            <rect x="-8" y="35" width="8" height="10" fill="#334155"/>

            {/* 5. Status LED */}
            <circle cx={width + 10} cy="0" r="4" fill={statusColor}>
                <animate attributeName="opacity" values="1;0.3;1" dur={isHazard ? "0.8s" : "2s"} repeatCount="indefinite"/>
            </circle>

            {/* Equipment Label */}
            <text x={width / 2} y={height + 25} textAnchor="middle" className={`${textClassName} font-mono text-[20px] font-bold uppercase`}>
                {label}
            </text>

            {/* Alarm Aura */}
            {!isNormal && (<rect width={width + 20} height={height + 20} x="-10" y="-10" fill="none" stroke={statusColor} strokeWidth="2" opacity="0.2" rx="12" strokeDasharray="5,3" className={isHazard ? "animate-pulse" : ""}/>)}
        </g>);
};
export default SuctionScrubber;
