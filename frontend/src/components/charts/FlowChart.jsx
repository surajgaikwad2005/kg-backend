'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTimeRange } from '@/src/hooks/dashboard/useTimeRange';
export default function FlowChart() {
    const range = useTimeRange();
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    const chartData = useMemo(() => {
        const points = 12;
        const data = [];
        const start = range.start.getTime();
        const end = range.end.getTime();
        const step = (end - start) / (points - 1);
        for (let i = 0; i < points; i++) {
            const time = new Date(start + i * step);
            const hours = time.getHours().toString().padStart(2, '0');
            const minutes = time.getMinutes().toString().padStart(2, '0');
            data.push({
                time: `${hours}:${minutes}`,
                value: 200 + Math.random() * 150 + (i === 6 ? 100 : 0), // Add a peak in the middle
                fullTime: time.toLocaleString()
            });
        }
        return data;
    }, [range]);
    return (<div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-2 px-2">
                <div className="text-[12px] font-bold text-text-subtle uppercase tracking-widest">
                    {range.start.toLocaleDateString()} - {range.end.toLocaleDateString()}
                </div>
                <div className="text-text-muted text-[14px] font-mono">m³/h</div>
            </div>

            <div className="flex-1 w-full min-h-0">
                {isMounted && (<ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false}/>
                            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 'auto']}/>
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} itemStyle={{ color: '#3b82f6' }} labelStyle={{ fontWeight: 'bold' }} labelFormatter={(label, payload) => payload[0]?.payload?.fullTime}/>
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6' }} animationDuration={500}/>
                        </LineChart>
                    </ResponsiveContainer>)}
            </div>
        </div>);
}
