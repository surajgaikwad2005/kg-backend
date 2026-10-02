import React from 'react';
const CompressionStage = ({ x = 0, y = 0, scale = 1, status = 'normal', tagK = "A-2402", tagD = "V-2420A", onPointerDown, }) => {
    const isHazard = status === 'hazard';
    const statusColor = isHazard ? '#ef4444' : status === 'warning' ? '#eab308' : '#0369a1';
    const labelFontClass = "font-mono text-[20px] font-bold uppercase";
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move">

            {/* 1. Piping Logic */}
            <g fill="none" strokeLinecap="round">
                {/* 1.2 Compressor Discharge to Cooler */}
                <path d="M 115,30 L 150,30" stroke="#64748b" strokeWidth="4"/>
                <path d="M 115,30 L 150,30" stroke="#eab308" strokeWidth="2" strokeDasharray="4,4">
                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite"/>
                </path>

                {/* 1.3 Driver Discharge (Outlet Downwards) */}
                <path d="M 85,160 L 85,190" stroke="#64748b" strokeWidth="4"/>
                <path d="M 85,160 L 85,190" stroke="#eab308" strokeWidth="2" strokeDasharray="4,4">
                    <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1s" repeatCount="indefinite"/>
                </path>
            </g>

            {/* 2. Primary Trapezoidal Compressor (K-2410A) */}
            <g transform="translate(55, 0)">
                <path d="M 0,15 L 60,0 L 60,60 L 0,45 Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>

                {/* Impeller / Fan Icon */}
                <g transform="translate(30, 30)">
                    <g className="animate-[spin_6s_linear_infinite]">
                        {[0, 90, 180, 270].map((a) => (<path key={a} transform={`rotate(${a})`} d="M 0,0 C 5,-12 15,-12 15,0 C 15,12 5,12 0,0" fill="#0f172a"/>))}
                        <circle r="4" fill="#64748b"/>
                    </g>
                </g>

                {/* Right-side Shaft Connection */}
                <rect x="60" y="25" width="20" height="10" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>

                <text x="30" y="-15" textAnchor="middle" className={`font-mono text-[20px] font-bold uppercase ${labelFontClass}`}>
                    {tagK}
                </text>
            </g>

            {/* 3. VERTICAL DRIVE SHAFT (Connecting the two shapes) */}
            <rect x="80" y="60" width="10" height="40" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5"/>

            {/* 4. Secondary Trapezium Shape (Below K-2410A) */}
            {/* Mirroring the shape visually to indicate a different role (e.g., Driver) */}
            <g transform="translate(55, 100)">
                <path d="M 0,0 L 60,15 L 60,45 L 0,60 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2"/>

                {/* Internal static symbol (indicates drive unit) */}
                <circle cx="30" cy="30" r="12" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="3,3"/>
                <path d="M 22,30 L 38,30 M 30,22 L 30,38" stroke="#475569" strokeWidth="2"/>

                <text x="-10" y="42" textAnchor="end" className={`font-mono text-[20px] font-bold uppercase ${labelFontClass}`}>
                    {tagD}
                </text>
            </g>

            {/* 5. Horizontal Cooler */}
            <g transform="translate(150, 12.5)">
                <rect width="80" height="35" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2"/>
                <path d="M 10,17.5 L 70,17.5 M 25,5 L 25,30 M 55,5 L 55,30" stroke="#94a3b8" strokeWidth="1.5"/>
                <text x="40" y="52" textAnchor="middle" className={`font-mono text-[12px] font-bold uppercase ${labelFontClass}`}>
                    Cooler
                </text>
            </g>
        </g>);
};
export default CompressionStage;
