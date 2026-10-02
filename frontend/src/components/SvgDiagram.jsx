'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/src/components/ui/Toast';
import TrainA from './diagram/TrainA';
import TrainB from './diagram/TrainB';
import WellManifold from './diagram/WellManifold';
import CommonShaft from './diagram/CommonShaft';
import ScrubberC2210 from './diagram/ScrubberC2210';
import ExportPipeline from './diagram/ExportPipeline';
import ReinjectionCompressorTrainA from './diagram/ReinjectionCompressorTrainA';
import ReinjectionCompressorTrainB from './diagram/ReinjectionCompressorTrainB';
import CommonShaftB from './diagram/CommonShaftB';
export default function SvgDiagram() {
    const { info: toastInfo } = useToast();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 5500, height: 2400 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [manifoldPos, setManifoldPos] = useState({ x: 10, y: 2500 });
    const [trainAPos, setTrainAPos] = useState({ x: 900, y: -550 });
    const [trainBPos, setTrainBPos] = useState({ x: 900, y: 1350 });
    const [shaftPos, setShaftPos] = useState({ x: 3200, y: -750 });
    const [scrubberCPos, setScrubberCPos] = useState({ x: 3200, y: 2400 });
    const [pipelinePos, setPipelinePos] = useState({ x: 3400, y: -450 });
    const [reinjectionTrainAPos, setReinjectionTrainAPos] = useState({ x: 3650, y: -150 });
    const [reinjectionTrainBPos, setReinjectionTrainBPos] = useState({ x: 3650, y: 1350 });
    const [shaftBPos, setShaftBPos] = useState({ x: 5000, y: -750 });
    const [activeDrag, setActiveDrag] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const svgRef = useRef(null);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    const handlePointerMove = (e) => {
        if (!svgRef.current)
            return;
        const svg = svgRef.current;
        if (activeDrag) {
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
            if (activeDrag === 'A') {
                setTrainAPos({ x: cursorPt.x - dragOffset.x, y: cursorPt.y - dragOffset.y });
            }
            else if (activeDrag === 'B') {
                setTrainBPos({ x: cursorPt.x - dragOffset.x, y: cursorPt.y - dragOffset.y });
            }
            else if (activeDrag === 'M') {
                setManifoldPos({ x: cursorPt.x - dragOffset.x, y: cursorPt.y - dragOffset.y });
            }
            else if (activeDrag === 'S') {
                setShaftPos({ x: cursorPt.x - dragOffset.x, y: cursorPt.y - dragOffset.y });
            }
            else if (activeDrag === 'C') {
                setScrubberCPos({ x: cursorPt.x - dragOffset.x, y: cursorPt.y - dragOffset.y });
            }
            else if (activeDrag === 'P') {
                setPipelinePos({ x: cursorPt.x - dragOffset.x, y: cursorPt.y - dragOffset.y });
            }
            else if (activeDrag === 'RA') {
                setReinjectionTrainAPos({ x: cursorPt.x - dragOffset.x, y: cursorPt.y - dragOffset.y });
            }
            else if (activeDrag === 'RB') {
                setReinjectionTrainBPos({ x: cursorPt.x - dragOffset.x, y: cursorPt.y - dragOffset.y });
            }
            else if (activeDrag === 'SB') {
                setShaftBPos({ x: cursorPt.x - dragOffset.x, y: cursorPt.y - dragOffset.y });
            }
            return;
        }
        if (isPanning) {
            const dx = (e.clientX - panStart.x) * (viewBox.width / (svgRef.current?.clientWidth || 1));
            const dy = (e.clientY - panStart.y) * (viewBox.height / (svgRef.current?.clientHeight || 1));
            setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };
    const handlePointerDownDrag = (type) => (e) => {
        if (!svgRef.current)
            return;
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        let pos = { x: 0, y: 0 };
        if (type === 'A')
            pos = trainAPos;
        else if (type === 'B')
            pos = trainBPos;
        else if (type === 'M')
            pos = manifoldPos;
        else if (type === 'S')
            pos = shaftPos;
        else if (type === 'C')
            pos = scrubberCPos;
        else if (type === 'P')
            pos = pipelinePos;
        else if (type === 'RA')
            pos = reinjectionTrainAPos;
        else if (type === 'RB')
            pos = reinjectionTrainBPos;
        else if (type === 'SB')
            pos = shaftBPos;
        setActiveDrag(type);
        setDragOffset({ x: cursorPt.x - pos.x, y: cursorPt.y - pos.y });
        e.target.setPointerCapture(e.pointerId);
        e.stopPropagation();
    };
    const handlePointerUp = (e) => {
        setActiveDrag(null);
        setIsPanning(false);
    };
    // Global Coordination Logic
    const mainScale = 3;
    const globalStroke = 12;
    const flowStroke = 5;
    // Distribution Inlet (split manifold)
    const manifoldOut = { x: manifoldPos.x + 180 * mainScale, y: manifoldPos.y + 6 * mainScale };
    const trainAIn = { x: trainAPos.x - 8 * mainScale, y: trainAPos.y + 185 * mainScale };
    const trainBIn = { x: trainBPos.x - 8 * mainScale, y: trainBPos.y + 185 * mainScale };
    // Discharge Merge Logic
    const v2460a_out = { x: trainAPos.x + 520 * mainScale, y: trainAPos.y + 72.5 * mainScale };
    const v2460b_out = { x: trainBPos.x + 520 * mainScale, y: trainBPos.y + 72.5 * mainScale };
    const shaftMiddle = { x: shaftPos.x, y: shaftPos.y + 150 * mainScale };
    const mergePoint = { x: (v2460a_out.x + shaftMiddle.x) / 2, y: shaftMiddle.y };
    const shaftBottom = { x: shaftPos.x, y: shaftPos.y + 300 * mainScale };
    const scrubberCIn = { x: scrubberCPos.x - 8 * mainScale, y: scrubberCPos.y + 35 * mainScale };
    const pipelineIn = { x: pipelinePos.x, y: pipelinePos.y };
    const scrubberCOut = { x: scrubberCPos.x + 30 * mainScale, y: scrubberCPos.y - 8 * mainScale };
    const reinjTrainAIn = { x: reinjectionTrainAPos.x - 8 * mainScale, y: reinjectionTrainAPos.y + 185 * mainScale };
    const reinjTrainBIn = { x: reinjectionTrainBPos.x - 8 * mainScale, y: reinjectionTrainBPos.y + 185 * mainScale };
    // SHAFT B Connections
    const reinjAO_out = { x: reinjectionTrainAPos.x + 278 * mainScale, y: reinjectionTrainAPos.y + 262.5 * mainScale };
    const reinjBO_out = { x: reinjectionTrainBPos.x + 278 * mainScale, y: reinjectionTrainBPos.y + 262.5 * mainScale };
    const shaftBMiddle = { x: shaftBPos.x, y: shaftBPos.y + 200 * mainScale };
    const mergePointB = { x: (reinjAO_out.x + shaftBMiddle.x) / 2, y: shaftBMiddle.y };
    return (<div className="w-full h-full bg-canvas relative overflow-hidden rounded-lg font-sans border border-border shadow-inner">
            <svg ref={svgRef} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full touch-none cursor-grab active:cursor-grabbing" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onPointerDown={(e) => {
            if (activeDrag)
                return;
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
        }}>
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="2" fill="#475569" opacity="0.1"/>
                </pattern>

                <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.width + 2000} height={viewBox.height + 2000} fill="url(#grid)"/>

                {isMounted && (<>
                        {/* Distribution Piping */}
                        <g className="cursor-pointer hover:brightness-125 transition-all group" onClick={() => toastInfo('Inlet Header', 'Distributes well gas to compressor trains.')}>
                            <g fill="none" strokeWidth={globalStroke} stroke="#64748b" opacity="0.8">
                                <path d={`M ${manifoldOut.x},${manifoldOut.y} H ${manifoldOut.x + 50} V ${trainAIn.y} H ${trainAIn.x}`}/>
                                <path d={`M ${manifoldOut.x},${manifoldOut.y} H ${manifoldOut.x + 50} V ${trainBIn.y} H ${trainBIn.x}`}/>
                            </g>
                            <g fill="none" strokeWidth={flowStroke} stroke="#eab308" strokeDasharray="8,10">
                                <path d={`M ${manifoldOut.x},${manifoldOut.y} H ${manifoldOut.x + 50} V ${trainAIn.y} H ${trainAIn.x}`}>
                                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
                                </path>
                                <path d={`M ${manifoldOut.x},${manifoldOut.y} H ${manifoldOut.x + 50} V ${trainBIn.y} H ${trainBIn.x}`}>
                                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            <text x={manifoldOut.x + 10} y={manifoldOut.y - 40} className="fill-text-muted font-bold text-[48px] uppercase pointer-events-none select-none">INLET HEADER</text>
                        </g>

                        {/* DISCHARGE MERGE PIPING */}
                        <g className="cursor-pointer hover:brightness-125 transition-all group" onClick={() => toastInfo('Main Discharge', 'Compressed gas heading to main drive shaft.')}>
                            <g fill="none" strokeWidth={globalStroke} stroke="#64748b" opacity="0.8">
                                <path d={`M ${v2460a_out.x},${v2460a_out.y} H ${mergePoint.x} V ${shaftMiddle.y} H ${shaftMiddle.x}`}/>
                                <path d={`M ${v2460b_out.x},${v2460b_out.y} H ${mergePoint.x} V ${shaftMiddle.y} H ${shaftMiddle.x}`}/>
                            </g>
                            <g fill="none" strokeWidth={flowStroke} stroke="#eab308" strokeDasharray="8,10">
                                <path d={`M ${v2460a_out.x},${v2460a_out.y} H ${mergePoint.x} V ${shaftMiddle.y} H ${shaftMiddle.x}`}>
                                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
                                </path>
                                <path d={`M ${v2460b_out.x},${v2460b_out.y} H ${mergePoint.x} V ${shaftMiddle.y} H ${shaftMiddle.x}`}>
                                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            <text x={mergePoint.x - 400} y={shaftMiddle.y - 60} className="fill-text-muted font-bold text-[48px] uppercase pointer-events-none select-none">MAIN DISCHARGE</text>
                        </g>

                        {/* SHAFT TO DOWNSTREAM SPLIT */}
                        <g className="cursor-pointer hover:brightness-125 transition-all group" onClick={() => toastInfo('Export Header', 'Route to sales pipeline and scrubbing.')}>
                            <g fill="none" strokeWidth={globalStroke} stroke="#64748b" opacity="0.8">
                                <path d={`M ${shaftBottom.x},${shaftBottom.y} V ${scrubberCIn.y} H ${scrubberCIn.x}`}/>
                                <path d={`M ${shaftBottom.x},${shaftBottom.y} V ${pipelineIn.y} H ${pipelineIn.x}`}/>
                            </g>
                            <g fill="none" strokeWidth={flowStroke} stroke="#eab308" strokeDasharray="8,10">
                                <path d={`M ${shaftBottom.x},${shaftBottom.y} V ${scrubberCIn.y} H ${scrubberCIn.x}`}>
                                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
                                </path>
                                <path d={`M ${shaftBottom.x},${shaftBottom.y} V ${pipelineIn.y} H ${pipelineIn.x}`}>
                                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            <text x={shaftBottom.x - 250} y={shaftBottom.y + 100} className="fill-text-muted font-bold text-[48px] uppercase pointer-events-none select-none">EXPORT HEADER</text>
                        </g>

                        {/* SCRUBBER C TO REINJECTION TRAINS SPLIT */}
                        <g className="cursor-pointer hover:brightness-125 transition-all group" onClick={() => toastInfo('Reinjection Feed', 'Supplying gas to the injection compressor trains.')}>
                            <g fill="none" strokeWidth={globalStroke} stroke="#64748b" opacity="0.8">
                                <path d={`M ${scrubberCOut.x},${scrubberCOut.y} V ${scrubberCOut.y - 120} H ${scrubberCOut.x + 100} V ${reinjTrainAIn.y} H ${reinjTrainAIn.x}`}/>
                                <path d={`M ${scrubberCOut.x},${scrubberCOut.y} V ${scrubberCOut.y - 120} H ${scrubberCOut.x + 100} V ${reinjTrainBIn.y} H ${reinjTrainBIn.x}`}/>
                            </g>
                            <g fill="none" strokeWidth={flowStroke} stroke="#eab308" strokeDasharray="8,10">
                                <path d={`M ${scrubberCOut.x},${scrubberCOut.y} V ${scrubberCOut.y - 120} H ${scrubberCOut.x + 100} V ${reinjTrainAIn.y} H ${reinjTrainAIn.x}`}>
                                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
                                </path>
                                <path d={`M ${scrubberCOut.x},${scrubberCOut.y} V ${scrubberCOut.y - 120} H ${scrubberCOut.x + 100} V ${reinjTrainBIn.y} H ${reinjTrainBIn.x}`}>
                                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            <text x={scrubberCOut.x - 50} y={scrubberCOut.y - 180} className="fill-text-muted font-bold text-[48px] uppercase pointer-events-none select-none">REINJECTION FEED</text>
                        </g>

                        {/* SHAFT B MERGE PIPING */}
                        <g className="cursor-pointer hover:brightness-125 transition-all group" onClick={() => toastInfo('Reinjection Discharge', 'High-pressure gas output from injection trains.')}>
                            <g fill="none" strokeWidth={globalStroke} stroke="#64748b" opacity="0.8">
                                <path d={`M ${reinjAO_out.x},${reinjAO_out.y} H ${mergePointB.x} V ${shaftBMiddle.y} H ${shaftBMiddle.x}`}/>
                                <path d={`M ${reinjBO_out.x},${reinjBO_out.y} H ${mergePointB.x} V ${shaftBMiddle.y} H ${shaftBMiddle.x}`}/>
                            </g>
                            <g fill="none" strokeWidth={flowStroke} stroke="#eab308" strokeDasharray="8,10">
                                <path d={`M ${reinjAO_out.x},${reinjAO_out.y} H ${mergePointB.x} V ${shaftBMiddle.y} H ${shaftBMiddle.x}`}>
                                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
                                </path>
                                <path d={`M ${reinjBO_out.x},${reinjBO_out.y} H ${mergePointB.x} V ${shaftBMiddle.y} H ${shaftBMiddle.x}`}>
                                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            <text x={mergePointB.x - 400} y={shaftBMiddle.y - 60} className="fill-text-muted font-bold text-[48px] uppercase pointer-events-none select-none">REINJECTION DISCHARGE</text>
                        </g>

                        <WellManifold x={manifoldPos.x} y={manifoldPos.y} scale={mainScale} onPointerDown={handlePointerDownDrag('M')}/>

                        <TrainA x={trainAPos.x} y={trainAPos.y} scale={mainScale} status="normal" liquidLevel={45} onPointerDown={handlePointerDownDrag('A')}/>
                        <TrainB x={trainBPos.x} y={trainBPos.y} scale={mainScale} status="hazard" liquidLevel={30} onPointerDown={handlePointerDownDrag('B')}/>

                        <CommonShaft x={shaftPos.x} y={shaftPos.y} width={300 * mainScale} scale={mainScale} status="normal" onPointerDown={handlePointerDownDrag('S')}/>

                        <ScrubberC2210 x={scrubberCPos.x} y={scrubberCPos.y} scale={mainScale} status="normal" onPointerDown={handlePointerDownDrag('C')}/>

                        <ExportPipeline x={pipelinePos.x} y={pipelinePos.y} scale={mainScale} status="normal" onPointerDown={handlePointerDownDrag('P')}/>

                        <ReinjectionCompressorTrainA x={reinjectionTrainAPos.x} y={reinjectionTrainAPos.y} scale={mainScale} status="normal" onPointerDown={handlePointerDownDrag('RA')}/>

                        <ReinjectionCompressorTrainB x={reinjectionTrainBPos.x} y={reinjectionTrainBPos.y} scale={mainScale} status="hazard" onPointerDown={handlePointerDownDrag('RB')}/>

                        <CommonShaftB x={shaftBPos.x} y={shaftBPos.y} width={400 * mainScale} scale={mainScale} status="normal" label="REINJECTION DRIVE SHAFT" onPointerDown={handlePointerDownDrag('SB')}/>
                    </>)}
            </svg>
        </div>);
}
