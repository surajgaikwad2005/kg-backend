'use client';

/**
 * TemplateMatchingContext — composes the viewer (canvas) and the matching
 * actions/data hooks, owning the small set of state shared between them
 * (active drawing, saved crop, the match library, active tab + highlight).
 * Cross-callbacks (crop/manual commit, error reporting) are bridged via refs.
 */
import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { usePnidRouter } from '@/src/app/(admin)/admin/domain-configuration/pnid/_context/PnidRouterContext';
import { useTemplateViewer } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_hooks/useTemplateViewer';
import { useTemplateMatching } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_hooks/useTemplateMatching';
import { useApp } from '@/src/context/AppContext';

const TemplateMatchingContext = createContext(null);

export const useTemplateMatchingContext = () => {
    const ctx = useContext(TemplateMatchingContext);
    if (!ctx) throw new Error('useTemplateMatchingContext must be used inside TemplateMatchingProvider');
    return ctx;
};

export function TemplateMatchingProvider({ children }) {
    const { router } = usePnidRouter();
    const { plantCode } = useApp();

    const [activeDrawing, setActiveDrawing] = useState(null);
    const [savedCropBox3x, setSavedCropBox3x] = useState(null);
    const [libraryMatches, setLibraryMatches] = useState({});
    const [selectedTab, setSelectedTab] = useState('');
    const [activeMatchHighlight, setActiveMatchHighlight] = useState(null);

    const cropCommitRef = useRef(null);
    const manualCommitRef = useRef(null);
    const setErrorRef = useRef(() => {});

    // Stable callbacks — must NOT be inline arrows or they create new references
    // on every render, causing useTemplateViewer's useEffects to re-fire → infinite loop.
    const stableSetError = useCallback((m) => setErrorRef.current(m), []);
    const stableOnCropCommit = useCallback(() => cropCommitRef.current?.(), []);
    const stableOnManualCommit = useCallback((b3, b1) => manualCommitRef.current?.(b3, b1), []);

    const viewer = useTemplateViewer({
        plantCode,
        activeDrawing, libraryMatches, selectedTab, activeMatchHighlight,
        savedCropBox3x, setSavedCropBox3x,
        setErrorMessage: stableSetError,
        onCropCommit: stableOnCropCommit,
        onManualCommit: stableOnManualCommit,
    });

    const actions = useTemplateMatching({
        plantCode,
        activeDrawing, setActiveDrawing, savedCropBox3x, setSavedCropBox3x,
        libraryMatches, setLibraryMatches, selectedTab, setSelectedTab, activeMatchHighlight, setActiveMatchHighlight,
        canvasRef: viewer.canvasRef, imageObj: viewer.imageObj,
        focusOnMatch: viewer.focusOnMatch, resetView: viewer.handleResetZoomPan,
    });
    cropCommitRef.current = actions.handleCropCommitted;
    manualCommitRef.current = actions.handleCreateManualMatch;
    setErrorRef.current = actions.setErrorMessage;

    const value = {
        router,
        ...viewer,
        ...actions,
        activeDrawing, setActiveDrawing, savedCropBox3x,
        libraryMatches, setLibraryMatches, selectedTab, setSelectedTab, activeMatchHighlight, setActiveMatchHighlight,
    };

    return <TemplateMatchingContext.Provider value={value}>{children}</TemplateMatchingContext.Provider>;
}
