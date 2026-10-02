'use client';
import React from 'react';
import TrainB from './TrainB';
export default function TrainBDetailedView() {
    return (<div className="w-full h-full bg-surface relative overflow-hidden border-t border-border/40 flex items-center justify-center p-4">
            <svg viewBox="-120 -80 820 540" className="w-full h-full max-h-[500px] touch-none drop-shadow-sm">
                <TrainB scale={1} x={0} y={0} status="warning" allowInternalNavigation={true}/>
            </svg>
        </div>);
}
