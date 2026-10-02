'use client';
import React, { memo } from 'react';
import { cn } from '@/src/lib/utils';
import { useCustomization } from '@/src/context/visuals/CustomizationContext';

/**
 * IndustrialDoodleBackground
 *
 * Executive Architectural & Live Process Telemetry Background.
 * Tailored for enterprise energy & heavy process giants (Petronas, ADNOC, Titan):
 *
 * Micro-Animations:
 * - Hydrocarbon & Cryogenic Flow: Subtle animated dash pulses along pipeline manifolds
 * - Live Flare Stack: Gentle breathing flame glow
 * - Ocean Water Shimmer: Calm wave oscillations beneath the LNG carrier vessel
 * - Operating Pressure Telemetry: Subtle needle drift on dial gauges
 * - Energy Transition & H2 Pulse: Soft luminescent breathing on green/hydrogen nodes
 * - Smooth Ambient Drift: Ultra-slow cinematic canvas drift (disabled when motion = off)
 *
 * 100% Theme-Adaptive, Retina-Crisp, Zero Image Requests, Settings Togglable.
 */
export const IndustrialDoodleBackground = memo(function IndustrialDoodleBackground({
    className,
    maskCenter = true,
}) {
    const { prefs } = useCustomization();
    const isEnabled = prefs?.industrialBackground !== false;
    const isMotionActive = prefs?.motion !== 'off';

    if (!isEnabled) return null;

    return (
        <div
            aria-hidden="true"
            className={cn(
                'pointer-events-none absolute inset-0 w-full h-full overflow-hidden select-none',
                className,
            )}
            style={
                maskCenter
                    ? {
                          maskImage:
                              'radial-gradient(ellipse 72% 72% at 50% 50%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,1) 85%)',
                          WebkitMaskImage:
                              'radial-gradient(ellipse 72% 72% at 50% 50%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,1) 85%)',
                      }
                    : undefined
            }
        >
            <style jsx>{`
                @keyframes pipeFlow {
                    from { stroke-dashoffset: 24; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes flareFlutter {
                    0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.75; }
                    50% { transform: scaleY(1.18) scaleX(0.92); opacity: 1; }
                }
                @keyframes oceanDrift {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(6px); }
                }
                @keyframes gaugeDrift {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(8deg); }
                }
                @keyframes nodePulse {
                    0%, 100% { opacity: 0.45; }
                    50% { opacity: 1; }
                }
                @keyframes canvasDrift {
                    0% { transform: translate(0, 0); }
                    50% { transform: translate(-20px, -25px); }
                    100% { transform: translate(0, 0); }
                }

                .live-flow {
                    stroke-dasharray: 4 6;
                    animation: ${isMotionActive ? 'pipeFlow 2.8s linear infinite' : 'none'};
                }
                .live-flow-fast {
                    stroke-dasharray: 5 5;
                    animation: ${isMotionActive ? 'pipeFlow 1.8s linear infinite' : 'none'};
                }
                .live-flare {
                    transform-origin: bottom center;
                    animation: ${isMotionActive ? 'flareFlutter 2.2s ease-in-out infinite' : 'none'};
                }
                .live-flare-alt {
                    transform-origin: bottom center;
                    animation: ${isMotionActive ? 'flareFlutter 3s ease-in-out infinite 0.8s' : 'none'};
                }
                .live-wave {
                    animation: ${isMotionActive ? 'oceanDrift 6s ease-in-out infinite' : 'none'};
                }
                .live-gauge {
                    transform-origin: 16px 16px;
                    animation: ${isMotionActive ? 'gaugeDrift 4.5s ease-in-out infinite' : 'none'};
                }
                .live-pulse {
                    animation: ${isMotionActive ? 'nodePulse 3.5s ease-in-out infinite' : 'none'};
                }
                .live-pulse-alt {
                    animation: ${isMotionActive ? 'nodePulse 4s ease-in-out infinite 1.5s' : 'none'};
                }
                .live-canvas {
                    animation: ${isMotionActive ? 'canvasDrift 60s ease-in-out infinite' : 'none'};
                }
            `}</style>

            <svg
                className="w-full h-full text-text-primary/[0.13] dark:text-text-primary/[0.085] transition-colors duration-300 live-canvas"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern
                        id="industrial-architectural-pattern"
                        width="720"
                        height="1000"
                        patternUnits="userSpaceOnUse"
                    >
                        {/* ─────────────────────────────────────────────────────────────
                            SECTION 1 (Y: 10 to 180) - Major Refinery Skyline & Stacks
                            ───────────────────────────────────────────────────────────── */}

                        {/* 1. Complete Refinery Complex Left (x: 30, y: 30) */}
                        <g transform="translate(30, 30)">
                            <rect x="20" y="30" width="16" height="70" rx="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            {/* Super tall stack */}
                            <line x1="48" y1="10" x2="48" y2="100" stroke="currentColor" strokeWidth="1.4" />
                            <line x1="52" y1="10" x2="52" y2="100" stroke="currentColor" strokeWidth="1.4" />
                            <line x1="46" y1="10" x2="54" y2="10" stroke="currentColor" strokeWidth="1.2" />
                            {/* Tower 3 */}
                            <rect x="62" y="38" width="14" height="62" rx="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            {/* Small reactor vessels */}
                            <rect x="2" y="60" width="12" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="1" />
                            <rect x="82" y="70" width="10" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
                            {/* Interconnecting process piping with LIVE FLOW */}
                            <path d="M8 60V50H20" fill="none" stroke="currentColor" strokeWidth="0.9" className="live-flow" />
                            <path d="M28 30V20H48" fill="none" stroke="currentColor" strokeWidth="0.9" className="live-flow" />
                            <path d="M52 25H68V38" fill="none" stroke="currentColor" strokeWidth="0.9" />
                            <path d="M76 50H86V70" fill="none" stroke="currentColor" strokeWidth="0.9" className="live-flow" />
                            <line x1="36" y1="65" x2="62" y2="65" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="36" y1="80" x2="62" y2="80" stroke="currentColor" strokeWidth="0.8" />
                            {/* Ground horizon line */}
                            <line x1="-15" y1="100" x2="110" y2="100" stroke="currentColor" strokeWidth="1.2" />
                        </g>

                        {/* Top Pressure Gauge (x: 230, y: 40) with LIVE NEEDLE */}
                        <g transform="translate(230, 40)">
                            <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <circle cx="20" cy="20" r="2.5" fill="currentColor" />
                            <g className="live-gauge" style={{ transformOrigin: '20px 20px' }}>
                                <line x1="20" y1="20" x2="28" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </g>
                            <line x1="20" y1="7" x2="20" y2="10" stroke="currentColor" strokeWidth="1" />
                            <line x1="7" y1="20" x2="10" y2="20" stroke="currentColor" strokeWidth="1" />
                            <line x1="33" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="1" />
                            <line x1="20" y1="36" x2="20" y2="44" stroke="currentColor" strokeWidth="1.2" />
                        </g>

                        {/* Tanker Semi-Truck (x: 240, y: 110) */}
                        <g transform="translate(240, 110)">
                            <path d="M2 24H18V8H10L2 16Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                            <rect x="8" y="10" width="6" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8" />
                            <rect x="20" y="8" width="42" height="16" rx="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <circle cx="9" cy="26" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
                            <circle cx="30" cy="26" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
                            <circle cx="54" cy="26" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
                            <line x1="-5" y1="30" x2="70" y2="30" stroke="currentColor" strokeWidth="1" />
                        </g>

                        {/* Flare Stack with LIVE FLUTTER FLAME (x: 375, y: 90) */}
                        <g transform="translate(375, 90)">
                            <line x1="10" y1="12" x2="4" y2="50" stroke="currentColor" strokeWidth="1.1" />
                            <line x1="18" y1="12" x2="24" y2="50" stroke="currentColor" strokeWidth="1.1" />
                            <line x1="8" y1="22" x2="20" y2="22" stroke="currentColor" strokeWidth="0.7" />
                            <line x1="6" y1="34" x2="22" y2="34" stroke="currentColor" strokeWidth="0.7" />
                            <line x1="8" y1="22" x2="22" y2="34" stroke="currentColor" strokeWidth="0.6" />
                            <line x1="20" y1="22" x2="6" y2="34" stroke="currentColor" strokeWidth="0.6" />
                            <g className="live-flare" style={{ transformOrigin: '14px 12px' }}>
                                <path d="M14 12C12 8 12 3 14 0C16 3 16 8 14 12Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            </g>
                            <line x1="0" y1="50" x2="28" y2="50" stroke="currentColor" strokeWidth="1.1" />
                        </g>

                        {/* 2. Heavy Refinery Complex Right (x: 420, y: 30) */}
                        <g transform="translate(420, 30)">
                            <rect x="15" y="35" width="14" height="65" rx="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="38" y1="15" x2="38" y2="100" stroke="currentColor" strokeWidth="1.3" />
                            <line x1="42" y1="15" x2="42" y2="100" stroke="currentColor" strokeWidth="1.3" />
                            <line x1="58" y1="5" x2="58" y2="100" stroke="currentColor" strokeWidth="1.4" />
                            <line x1="62" y1="5" x2="62" y2="100" stroke="currentColor" strokeWidth="1.4" />
                            <rect x="74" y="45" width="12" height="55" rx="6" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            <path d="M8 80H15M29 60H38M42 40H58M62 70H74" stroke="currentColor" strokeWidth="0.9" className="live-flow" />
                            <path d="M22 35V25H38" fill="none" stroke="currentColor" strokeWidth="0.9" />
                            <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeWidth="1.2" />
                        </g>

                        {/* Desert Dunes & Palm Trees (x: 570, y: 70) */}
                        <g transform="translate(570, 70)">
                            <path d="M0 50C30 35 60 55 100 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            <path d="M10 50C40 38 70 52 110 44" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 2" />
                            <path d="M40 50C42 35 38 20 35 10" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M35 10C25 8 18 12 16 16M35 10C28 4 22 5 18 8M35 10C35 2 30 -2 24 -1M35 10C42 4 48 5 52 8M35 10C45 8 52 12 54 16" fill="none" stroke="currentColor" strokeWidth="1" />
                            <path d="M60 48C62 38 60 28 58 18" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            <path d="M58 18C50 16 44 19 42 22M58 18C52 12 46 13 42 16M58 18C64 12 70 13 74 16M58 18C66 16 72 19 74 22" fill="none" stroke="currentColor" strokeWidth="0.9" />
                        </g>


                        {/* ─────────────────────────────────────────────────────────────
                            SECTION 2 (Y: 190 to 360) - Storage Tanks & Cryogenics
                            ───────────────────────────────────────────────────────────── */}

                        {/* City skyline & Palm Dunes (x: 20, y: 230) */}
                        <g transform="translate(20, 230)">
                            <path d="M0 60C30 50 60 65 100 55" fill="none" stroke="currentColor" strokeWidth="1" />
                            <rect x="50" y="20" width="8" height="35" fill="none" stroke="currentColor" strokeWidth="0.8" />
                            <rect x="60" y="10" width="10" height="45" fill="none" stroke="currentColor" strokeWidth="0.8" />
                            <path d="M65 10L65 2" stroke="currentColor" strokeWidth="0.8" />
                            <rect x="72" y="26" width="7" height="29" fill="none" stroke="currentColor" strokeWidth="0.8" />
                            <path d="M30 58C32 45 28 32 25 22" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M25 22C15 20 8 24 6 28M25 22C18 16 12 17 8 20M25 22C25 14 20 10 14 11M25 22C32 16 38 17 42 20M25 22C35 20 42 24 44 28" fill="none" stroke="currentColor" strokeWidth="1" />
                        </g>

                        {/* Storage Tank Farm (x: 180, y: 210) */}
                        <g transform="translate(180, 210)">
                            {/* Left Hortonsphere */}
                            <circle cx="28" cy="38" r="20" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="8" y1="38" x2="48" y2="38" stroke="currentColor" strokeWidth="0.8" />
                            <ellipse cx="28" cy="38" rx="10" ry="20" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 2" />
                            <line x1="14" y1="52" x2="8" y2="70" stroke="currentColor" strokeWidth="1.1" />
                            <line x1="42" y1="52" x2="48" y2="70" stroke="currentColor" strokeWidth="1.1" />
                            <line x1="22" y1="56" x2="22" y2="70" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="34" y1="56" x2="34" y2="70" stroke="currentColor" strokeWidth="0.8" />

                            {/* Small storage tank */}
                            <rect x="75" y="28" width="34" height="42" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M75 28C75 20 109 20 109 28" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M75 66L109 36" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2" />

                            {/* Large primary storage tank */}
                            <rect x="125" y="16" width="46" height="54" fill="none" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M125 16C125 6 171 6 171 16" fill="none" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M125 64L171 28" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2.5 2" />
                            <line x1="162" y1="16" x2="162" y2="70" stroke="currentColor" strokeWidth="0.7" />
                            <line x1="166" y1="16" x2="166" y2="70" stroke="currentColor" strokeWidth="0.7" />

                            {/* Right Hortonsphere */}
                            <circle cx="210" cy="38" r="18" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="192" y1="38" x2="228" y2="38" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="198" y1="50" x2="192" y2="70" stroke="currentColor" strokeWidth="1" />
                            <line x1="222" y1="50" x2="228" y2="70" stroke="currentColor" strokeWidth="1" />

                            {/* Ground manifold with LIVE FLOW */}
                            <line x1="0" y1="70" x2="245" y2="70" stroke="currentColor" strokeWidth="1.2" className="live-flow" />
                        </g>

                        {/* Top-Right Pipeline with Gate Valve (x: 540, y: 210) */}
                        <g transform="translate(540, 210)">
                            <path d="M0 40H40C44 40 48 36 48 32V0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="live-flow" />
                            <line x1="0" y1="34" x2="0" y2="46" stroke="currentColor" strokeWidth="1.2" />
                            <circle cx="48" cy="18" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
                            <line x1="48" y1="13" x2="48" y2="23" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="43" y1="18" x2="53" y2="18" stroke="currentColor" strokeWidth="0.8" />
                            <rect x="44" y="24" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="0.9" />
                        </g>


                        {/* ─────────────────────────────────────────────────────────────
                            SECTION 3 (Y: 370 to 540) - LNG Ocean Tanker & Solar/H2 Node
                            ───────────────────────────────────────────────────────────── */}

                        {/* Large LNG Cargo Ship / Ocean Tanker (x: 25, y: 390) with LIVE WAVES */}
                        <g transform="translate(25, 390)">
                            <path d="M4 35H190L170 60H30L4 35Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                            <line x1="0" y1="48" x2="200" y2="48" stroke="currentColor" strokeWidth="0.8" />
                            <rect x="140" y="10" width="30" height="25" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            <rect x="145" y="4" width="20" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
                            <line x1="155" y1="4" x2="155" y2="-4" stroke="currentColor" strokeWidth="1" />
                            <rect x="35" y="28" width="80" height="7" fill="none" stroke="currentColor" strokeWidth="0.9" />
                            <line x1="50" y1="28" x2="50" y2="15" stroke="currentColor" strokeWidth="0.9" />
                            <line x1="75" y1="28" x2="75" y2="15" stroke="currentColor" strokeWidth="0.9" />
                            <line x1="100" y1="28" x2="100" y2="15" stroke="currentColor" strokeWidth="0.9" />
                            {/* Ocean wave ripples with LIVE DRIFT */}
                            <g className="live-wave">
                                <path d="M0 64C15 62 30 66 45 64C60 62 75 66 90 64C105 62 120 66 135 64C150 62 165 66 180 64C195 62 210 66 220 64" fill="none" stroke="currentColor" strokeWidth="0.9" />
                                <path d="M10 70C25 68 40 72 55 70C70 68 85 72 100 70C115 68 130 72 145 70C160 68 175 72 190 70" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 2" />
                            </g>
                            <rect x="195" y="20" width="10" height="30" fill="none" stroke="currentColor" strokeWidth="0.7" />
                            <rect x="207" y="10" width="12" height="40" fill="none" stroke="currentColor" strokeWidth="0.7" />
                        </g>

                        {/* Mid-level Pressure Dial (x: 290, y: 375) */}
                        <g transform="translate(290, 375)">
                            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            <circle cx="16" cy="16" r="2" fill="currentColor" />
                            <g className="live-gauge" style={{ transformOrigin: '16px 16px' }}>
                                <line x1="16" y1="16" x2="23" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </g>
                            <line x1="16" y1="2" x2="16" y2="5" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="16" y1="30" x2="16" y2="38" stroke="currentColor" strokeWidth="1" />
                        </g>

                        {/* Solar Panel Array + Eco Leaf + H2 Node with LIVE PULSE (x: 370, y: 390) */}
                        <g transform="translate(370, 390)">
                            <path d="M4 22L16 4H46L34 22Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                            <line x1="12" y1="13" x2="40" y2="13" stroke="currentColor" strokeWidth="0.7" />
                            <line x1="22" y1="4" x2="14" y2="22" stroke="currentColor" strokeWidth="0.7" />
                            <line x1="32" y1="4" x2="24" y2="22" stroke="currentColor" strokeWidth="0.7" />
                            <line x1="20" y1="22" x2="20" y2="32" stroke="currentColor" strokeWidth="1" />
                            <line x1="30" y1="22" x2="30" y2="32" stroke="currentColor" strokeWidth="1" />
                            <circle cx="48" cy="2" r="4" fill="none" stroke="currentColor" strokeWidth="0.9" />
                            <path d="M48 -4V-6M48 8V10M42 2H40M56 2H54" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />

                            <path d="M65 32C65 18 82 14 85 14C85 28 78 36 65 32Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                            <path d="M65 32L78 20" stroke="currentColor" strokeWidth="0.8" />

                            {/* Hydrogen H2 Node Badge with LIVE PULSE */}
                            <g className="live-pulse">
                                <circle cx="115" cy="22" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                <text x="115" y="27" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">H₂</text>
                            </g>
                        </g>

                        {/* Mid-Right Refinery Unit (x: 540, y: 440) */}
                        <g transform="translate(540, 440)">
                            <rect x="15" y="25" width="12" height="60" rx="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="35" y1="10" x2="35" y2="85" stroke="currentColor" strokeWidth="1.3" />
                            <line x1="38" y1="10" x2="38" y2="85" stroke="currentColor" strokeWidth="1.3" />
                            <rect x="48" y="30" width="14" height="55" rx="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="0" y1="85" x2="70" y2="85" stroke="currentColor" strokeWidth="1.2" />
                        </g>


                        {/* ─────────────────────────────────────────────────────────────
                            SECTION 4 (Y: 550 to 730) - Plant Facilities, Pipes & Rig
                            ───────────────────────────────────────────────────────────── */}

                        {/* Heavy Pipeline Gate Valve Left (x: 10, y: 560) */}
                        <g transform="translate(10, 560)">
                            <path d="M0 50V30H120V50" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="live-flow" />
                            <line x1="0" y1="50" x2="0" y2="80" stroke="currentColor" strokeWidth="1.4" />
                            <circle cx="60" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            <line x1="60" y1="16" x2="60" y2="24" stroke="currentColor" strokeWidth="1" />
                            <rect x="54" y="24" width="12" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
                            <path d="M80 80H110V50" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="live-flow-fast" />
                        </g>

                        {/* Central Chemical Reactor & Stacks (x: 230, y: 520) */}
                        <g transform="translate(230, 520)">
                            <rect x="18" y="35" width="14" height="65" rx="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="42" y1="15" x2="42" y2="100" stroke="currentColor" strokeWidth="1.4" />
                            <line x1="46" y1="15" x2="46" y2="100" stroke="currentColor" strokeWidth="1.4" />
                            <rect x="58" y="25" width="16" height="75" rx="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="7" y1="100" x2="90" y2="100" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M32 50H42M46 45H58" stroke="currentColor" strokeWidth="0.8" className="live-flow" />
                        </g>

                        {/* Heavy Tanker Truck Mid-Right (x: 440, y: 620) */}
                        <g transform="translate(440, 620)">
                            <path d="M60 22H46V8H52L60 15Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                            <rect x="4" y="8" width="40" height="15" rx="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <circle cx="12" cy="24" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
                            <circle cx="24" cy="24" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
                            <circle cx="53" cy="24" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
                            <line x1="0" y1="28" x2="68" y2="28" stroke="currentColor" strokeWidth="1" />
                        </g>

                        {/* Flare Derrick with LIVE FLUTTER (x: 540, y: 640) */}
                        <g transform="translate(540, 640)">
                            <line x1="12" y1="16" x2="6" y2="60" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="22" y1="16" x2="28" y2="60" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="10" y1="30" x2="24" y2="30" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="8" y1="45" x2="26" y2="45" stroke="currentColor" strokeWidth="0.8" />
                            <g className="live-flare-alt" style={{ transformOrigin: '17px 16px' }}>
                                <path d="M17 16C15 10 15 4 17 0C19 4 19 10 17 16Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            </g>
                            <path d="M28 60C50 48 80 62 120 50" fill="none" stroke="currentColor" strokeWidth="1" />
                            <path d="M60 55C62 42 58 30 55 20" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M55 20C45 18 38 22 36 26M55 20C48 14 42 15 38 18M55 20C62 14 68 15 72 18M55 20C65 18 72 22 74 26" fill="none" stroke="currentColor" strokeWidth="0.9" />
                        </g>


                        {/* ─────────────────────────────────────────────────────────────
                            SECTION 5 (Y: 740 to 950) - Offshore Platform, Dome & Plant
                            ───────────────────────────────────────────────────────────── */}

                        {/* Offshore Drilling Platform / Oil Rig (x: 20, y: 730) */}
                        <g transform="translate(20, 730)">
                            <rect x="8" y="24" width="48" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="24" y1="6" x2="16" y2="24" stroke="currentColor" strokeWidth="1.1" />
                            <line x1="30" y1="6" x2="38" y2="24" stroke="currentColor" strokeWidth="1.1" />
                            <line x1="20" y1="14" x2="34" y2="14" stroke="currentColor" strokeWidth="0.7" />
                            <line x1="14" y1="32" x2="14" y2="60" stroke="currentColor" strokeWidth="1.3" />
                            <line x1="28" y1="32" x2="28" y2="60" stroke="currentColor" strokeWidth="1.3" />
                            <line x1="42" y1="32" x2="42" y2="60" stroke="currentColor" strokeWidth="1.3" />
                            <line x1="14" y1="32" x2="28" y2="46" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="28" y1="32" x2="14" y2="46" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="28" y1="32" x2="42" y2="46" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="42" y1="32" x2="28" y2="46" stroke="currentColor" strokeWidth="0.8" />
                            <g className="live-wave">
                                <path d="M0 58C10 56 20 60 30 58C40 56 50 60 60 58C70 56 80 60 90 58" fill="none" stroke="currentColor" strokeWidth="0.9" />
                            </g>
                        </g>

                        {/* Head-on Cargo Vessel (x: 160, y: 770) */}
                        <g transform="translate(160, 770)">
                            <path d="M12 28L28 48H44L60 28H12Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                            <rect x="24" y="14" width="24" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
                            <rect x="30" y="8" width="12" height="6" fill="none" stroke="currentColor" strokeWidth="0.9" />
                            <line x1="36" y1="8" x2="36" y2="2" stroke="currentColor" strokeWidth="1" />
                            <g className="live-wave">
                                <path d="M4 48C16 46 24 50 36 48C48 46 56 50 68 48" fill="none" stroke="currentColor" strokeWidth="0.9" />
                            </g>
                        </g>

                        {/* Dome Reactor Plant Building (x: 270, y: 720) */}
                        <g transform="translate(270, 720)">
                            <path d="M10 40C10 16 54 16 54 40" fill="none" stroke="currentColor" strokeWidth="1.3" />
                            <rect x="10" y="40" width="44" height="20" fill="none" stroke="currentColor" strokeWidth="1.3" />
                            <rect x="54" y="28" width="38" height="32" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            <line x1="76" y1="12" x2="76" y2="28" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="60" y1="36" x2="84" y2="36" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" />
                            <line x1="0" y1="60" x2="105" y2="60" stroke="currentColor" strokeWidth="1.2" />
                        </g>

                        {/* Bottom Manifold & Multistage Process Plant (x: 400, y: 830) */}
                        <g transform="translate(400, 830)">
                            <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="1.1" className="live-pulse-alt" />
                            <path d="M20 12C20 12 25 17 25 21C25 23.8 22.8 26 20 26C17.2 26 15 23.8 15 21C15 17 20 12 20 12Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
                            <rect x="50" y="10" width="12" height="35" rx="6" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            <rect x="66" y="10" width="12" height="35" rx="6" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            <rect x="82" y="10" width="12" height="35" rx="6" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            <rect x="100" y="18" width="24" height="27" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            <path d="M108 18L112 4H116L120 18" fill="none" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="40" y1="45" x2="135" y2="45" stroke="currentColor" strokeWidth="1.2" />
                        </g>

                        {/* Bottom Pipeline Spool with LIVE FLOW (x: 180, y: 890) */}
                        <g transform="translate(180, 890)">
                            <path d="M0 40H60C64 40 68 36 68 32V10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="live-flow" />
                            <circle cx="68" cy="18" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
                            <line x1="68" y1="13" x2="68" y2="23" stroke="currentColor" strokeWidth="0.8" />
                            <line x1="63" y1="18" x2="73" y2="18" stroke="currentColor" strokeWidth="0.8" />
                            <path d="M68 40H120" stroke="currentColor" strokeWidth="1.3" className="live-flow" />
                        </g>


                        {/* ─────────────────────────────────────────────────────────────
                            ACCENTS & SCATTERED FLUID/ECO MOTIFS (Even distribution)
                            ───────────────────────────────────────────────────────────── */}

                        {/* Oil / Chemical Droplets */}
                        <path d="M640 320C640 320 645 327 645 331C645 333.8 642.8 336 640 336C637.2 336 635 333.8 635 331C635 327 640 320 640 320Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
                        <path d="M120 180C120 180 124 186 124 190C124 192.5 122 194.5 120 194.5C118 194.5 116 192.5 116 190C116 186 120 180 120 180Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                        <path d="M480 260C480 260 484 266 484 270C484 272.5 482 274.5 480 274.5C478 274.5 476 272.5 476 270C476 266 480 260 480 260Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                        <path d="M260 740C260 740 264 746 264 750C264 752.5 262 754.5 260 754.5C258 754.5 256 752.5 256 750C256 746 260 740 260 740Z" fill="none" stroke="currentColor" strokeWidth="0.8" />

                        {/* Delicate Clouds */}
                        <path d="M320 70C318 67 314 67 312 69C310 66 305 66 303 69C301 68 297 70 298 74H324C326 73 325 70 320 70Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                        <path d="M240 380C238 377 234 377 232 379C230 376 225 376 223 379C221 378 217 380 218 384H244C246 383 245 380 240 380Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                        <path d="M210 575C208 572 204 572 202 574C200 571 195 571 193 574C191 573 187 575 188 579H214C216 578 215 575 210 575Z" fill="none" stroke="currentColor" strokeWidth="0.8" />

                        {/* Stream / Wave Squiggles (~) */}
                        <path d="M330 115Q335 110 340 115T350 115" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M410 215Q415 210 420 215T430 215" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M30 705Q35 700 40 705T50 705" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M620 480Q625 475 630 480T640 480" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />

                        {/* Subtle Technical Crosshairs (+) */}
                        <g stroke="currentColor" strokeWidth="0.7">
                            <path d="M210 100V106M207 103H213" />
                            <path d="M510 170V176M507 173H513" />
                            <path d="M150 350V356M147 353H153" />
                            <path d="M340 490V496M337 493H343" />
                            <path d="M150 635V641M147 638H153" />
                            <path d="M510 725V731M507 728H513" />
                            <path d="M340 860V866M337 863H343" />
                        </g>

                        {/* Tiny Technical Diamonds & Dots */}
                        <rect x="360" y="215" width="3.5" height="3.5" transform="rotate(45 361.75 216.75)" fill="none" stroke="currentColor" strokeWidth="0.7" />
                        <rect x="580" y="360" width="3.5" height="3.5" transform="rotate(45 581.75 361.75)" fill="none" stroke="currentColor" strokeWidth="0.7" />
                        <rect x="220" y="660" width="3.5" height="3.5" transform="rotate(45 221.75 661.75)" fill="none" stroke="currentColor" strokeWidth="0.7" />
                        <circle cx="160" cy="80" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                        <circle cx="530" cy="80" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                        <circle cx="360" cy="780" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#industrial-architectural-pattern)" />
            </svg>
        </div>
    );
});

export default IndustrialDoodleBackground;
