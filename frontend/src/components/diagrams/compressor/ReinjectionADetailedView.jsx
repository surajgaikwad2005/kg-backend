'use client';
import React from 'react';
import ReinjectionCompressorTrainA from './ReinjectionCompressorTrainA';
export default function ReinjectionADetailedView() {
    return (<div className="w-full h-full bg-surface relative overflow-hidden border-t border-border/40 flex items-center justify-center p-4">
            <svg viewBox="-100 -60 500 450" className="w-full h-full max-h-[500px] touch-none drop-shadow-sm">
                <ReinjectionCompressorTrainA scale={1} x={0} y={0}/>
            </svg>
        </div>);
}
