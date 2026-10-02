'use client';

/**
 * ValidateContext — composes the validate feature from focused hooks:
 *   useValidateData    → client, pages, connection source
 *   useValidateCanvas  → viewport (image, zoom/pan, region filter)
 *   useConnections     → highlight/validate flow + connection edits
 *   useKnowledgeGraph  → KG state + CRUD
 *
 * The provider owns the small set of state shared between the canvas and the
 * connections layer, and bridges a committed filter box back to re-validation.
 */
import React, { createContext, useContext, useState, useRef } from 'react';
import { usePnidRouter } from '@/src/app/(admin)/admin/domain-configuration/pnid/_context/PnidRouterContext';
import { useValidateData } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_hooks/useValidateData';
import { useValidateCanvas } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_hooks/useValidateCanvas';
import { useConnections } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_hooks/useConnections';
import { useKnowledgeGraph } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_hooks/useKnowledgeGraph';
import { getValidationIconAndCls } from '@/src/app/(admin)/admin/domain-configuration/pnid/validate/_lib/validationStatus';

const ValidateContext = createContext(null);

export const useValidateContext = () => {
    const ctx = useContext(ValidateContext);
    if (!ctx) throw new Error('useValidateContext must be used inside ValidateProvider');
    return ctx;
};

export function ValidateProvider({ children }) {
    const { router } = usePnidRouter();

    // Shared viewer state (spans canvas + connections).
    const [selectedPageFile, setSelectedPageFile] = useState(null);
    const [highlightData, setHighlightData] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [isHighlightLoading, setIsHighlightLoading] = useState(false);
    const [isValidationLoading, setIsValidationLoading] = useState(false);
    const [activeConnection, setActiveConnection] = useState(null);
    const [isFullScreen, setIsFullScreenState] = useState(false);
    const [filterBox, setFilterBox] = useState(null);
    const [isMagnifyMode, setIsMagnifyMode] = useState(false);

    const setIsFullScreen = (valOrFn) => {
        setIsFullScreenState((prev) => {
            const nextVal = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
            const modal = document.getElementById('pnid-flow-modal');
            if (modal) {
                if (nextVal) {
                    modal.classList.remove('relative', 'w-[90vw]', 'h-[90vh]', 'rounded-2xl', 'border', 'border-border');
                    modal.classList.add('fixed', 'inset-0', 'z-[300]', 'w-screen', 'h-screen', 'rounded-none', 'border-0');
                } else {
                    modal.classList.add('relative', 'w-[90vw]', 'h-[90vh]', 'rounded-2xl', 'border', 'border-border');
                    modal.classList.remove('fixed', 'inset-0', 'z-[300]', 'w-screen', 'h-screen', 'rounded-none', 'border-0');
                }
            }
            return nextVal;
        });
    };

    const data = useValidateData({ setSelectedPageFile });

    // Bridges canvas's committed filter box → connection re-validation.
    const filterCommitRef = useRef(null);

    const canvas = useValidateCanvas({
        plantCode: data.plantCode,
        selectedPageFile, highlightData, filterBox, setFilterBox,
        setIsHighlightLoading, setErrorMessage: data.setErrorMessage,
        onFilterCommit: (f) => filterCommitRef.current?.(f),
    });

    const conn = useConnections({
        plantCode: data.plantCode, pdfName: data.pdfName, preprocessedFiles: data.preprocessedFiles,
        ocrExcelFilename: data.ocrExcelFilename,
        connections: data.connections, setConnections: data.setConnections, setErrorMessage: data.setErrorMessage,
        selectedPageFile, setSelectedPageFile, highlightData, setHighlightData,
        setValidationResult, setIsHighlightLoading, setIsValidationLoading,
        activeConnection, setActiveConnection, filterBox,
        canvasRef: canvas.canvasRef, setZoom: canvas.setZoom, setPan: canvas.setPan,
    });
    filterCommitRef.current = conn.revalidateConnection;

    const kg = useKnowledgeGraph({ connections: data.connections, setErrorMessage: data.setErrorMessage });

    const value = {
        router, getValidationIconAndCls,
        ...data,
        // shared viewer state
        selectedPageFile, setSelectedPageFile, highlightData, setHighlightData,
        validationResult, setValidationResult, isHighlightLoading, isValidationLoading,
        activeConnection, setActiveConnection, isFullScreen, setIsFullScreen, filterBox, setFilterBox,
        isMagnifyMode, setIsMagnifyMode,
        ...canvas,
        ...conn,
        ...kg,
    };

    return <ValidateContext.Provider value={value}>{children}</ValidateContext.Provider>;
}
