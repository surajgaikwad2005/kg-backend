'use client';
import React from 'react';
export default function Cooler({ x, y, onPointerDown, status = 'normal' }) {
    const scale = 1.0;
    const isNormal = status === 'normal';
    const isWarning = status === 'warning';
    const isHazard = status === 'hazard';
    // Color and Speed logic
    const statusColor = isHazard ? '#ef4444' : isWarning ? '#eab308' : '#10b981';
    const textClassName = isHazard ? 'fill-danger' : isWarning ? 'fill-warning' : 'fill-text-primary';
    const fanSpeed = isHazard ? "0.3s" : isWarning ? "0.5s" : "0.8s";
    const grateSpeed = isHazard ? "0.8s" : "2s";
    return (<g transform={`translate(${x}, ${y}) scale(${scale})`} onPointerDown={onPointerDown} className="cursor-move select-none">
      <defs>
        <linearGradient id="coolerBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155"/>
          <stop offset="50%" stopColor="#475569"/>
          <stop offset="100%" stopColor="#1e293b"/>
        </linearGradient>

        <filter id="airGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Status LED Indicator */}
      <circle cx="5" cy="-5" r="5" fill={statusColor} className="shadow-lg">
        <animate attributeName="opacity" values="1;0.4;1" dur={isHazard ? "0.5s" : "2s"} repeatCount="indefinite"/>
      </circle>

      {/* 1. Main Cooler Housing */}
      <rect width="160" height="80" fill="url(#coolerBodyGrad)" stroke={isNormal ? "#475569" : statusColor} strokeWidth={isNormal ? "1.5" : "3"} rx="2" className={isHazard ? "animate-pulse" : ""}/>

      {/* 2. Internal Grate Section */}
      <g transform="translate(10, 15)">
        <rect width="140" height="50" fill="#0f172a" stroke="#1e293b" rx="1"/>

        {/* Animated Grate Plates */}
        <g>
          {[20, 45, 70, 95, 120].map((xPos) => (<rect key={xPos} x={xPos} y="10" width="15" height="30" fill={isHazard ? "#450a0a" : "#334155"} stroke={isNormal ? "#475569" : statusColor} strokeWidth="1">
              <animateTransform attributeName="transform" type="translate" values="-2 0; 2 0; -2 0" dur={grateSpeed} repeatCount="indefinite"/>
            </rect>))}
        </g>

        {/* Pulsing Cooling Air (Changes color to Red if Hazard) */}
        <rect x="5" y="42" width="130" height="4" fill={isHazard ? "#ef4444" : "#3b82f6"} filter="url(#airGlow)">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1s" repeatCount="indefinite"/>
        </rect>
      </g>

      {/* 3. Cooling Fans (Bottom Intakes) */}
      <g transform="translate(20, 80)">
        {[0, 45, 90].map((offset) => (<g key={offset} transform={`translate(${offset}, 0)`}>
            <rect width="25" height="15" fill="#1e293b" stroke={isNormal ? "#334155" : statusColor} strokeWidth="1"/>
            <line x1="12.5" y1="2" x2="12.5" y2="13" stroke={isNormal ? "#475569" : statusColor} strokeWidth="2.5">
              <animateTransform attributeName="transform" type="rotate" from="0 12.5 7.5" to="360 12.5 7.5" dur={fanSpeed} repeatCount="indefinite"/>
            </line>
          </g>))}
      </g>

      {/* 4. Live Data Readouts */}
      <g transform="translate(175, 0)">
        {[
            { label: 'Clinker_Temp', val: isHazard ? '210.0 °C' : '85.0 °C', color: isHazard ? 'fill-danger' : 'fill-success', y: 0 },
            { label: 'Air_Press', val: isHazard ? '45 mB' : '125 mB', color: isHazard ? 'fill-danger' : 'fill-info', y: 45 },
            { label: 'Grate_Speed', val: isHazard ? '8.5 SPM' : '4.2 SPM', color: isHazard ? 'fill-danger' : 'fill-warning', y: 90 }
        ].map((d, i) => (<g key={i} transform={`translate(0, ${d.y})`}>
            <rect width="85" height="35" rx="4" fill="#000" stroke={isNormal ? "#334155" : statusColor} strokeWidth="1"/>
            <text x="42.5" y="14" textAnchor="middle" className="fill-text-secondary font-mono text-[8px] uppercase">{d.label}</text>
            <text x="42.5" y="28" textAnchor="middle" className={`${d.color} font-mono text-[11px] font-bold`}>{d.val}</text>
          </g>))}
      </g>

      {/* Equipment Name */}
      <text x="80" y="130" textAnchor="middle" className={`${textClassName} font-sans text-[20px] font-black uppercase tracking-tight`}>
        Grate Cooler
      </text>
    </g>);
}
