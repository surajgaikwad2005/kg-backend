'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { ChartSkeleton } from './PanelState';

/**
 * TrainDiagram — the interactive P&ID schematic for the selected train.
 *
 * Each view is a heavy SVG scene, so they're code-split per train: only the
 * schematic actually on screen is downloaded, instead of bundling all four
 * into the page as the previous static imports did.
 */
const loading = () => <ChartSkeleton bars={8} />;

const TRAIN_VIEWS = {
    A: dynamic(() => import('@/src/components/diagrams/compressor/TrainADetailedView'), { ssr: false, loading }),
    B: dynamic(() => import('@/src/components/diagrams/compressor/TrainBDetailedView'), { ssr: false, loading }),
    RA: dynamic(() => import('@/src/components/diagrams/compressor/ReinjectionADetailedView'), { ssr: false, loading }),
    RB: dynamic(() => import('@/src/components/diagrams/compressor/ReinjectionBDetailedView'), { ssr: false, loading }),
};

export function TrainDiagram({ train }) {
    const View = TRAIN_VIEWS[train] || TRAIN_VIEWS.A;
    return (
        <div className="h-full w-full overflow-hidden bg-canvas">
            <View />
        </div>
    );
}
