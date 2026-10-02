'use client';

/**
 * LoadingState — themed spinner + label. Replaces the host Aivee.gif asset so
 * the module renders standalone. `fullscreen` centres it over the viewport.
 */
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ label = 'Loading…', fullscreen = false, size = 28 }) {
    const body = (
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-brand animate-spin" size={size} />
            <p className="text-xs font-black text-text-subtle uppercase tracking-widest animate-pulse">{label}</p>
        </div>
    );

    if (fullscreen) {
        return <div className="flex h-screen w-full bg-canvas items-center justify-center">{body}</div>;
    }
    return <div className="flex flex-col items-center justify-center py-20">{body}</div>;
}
