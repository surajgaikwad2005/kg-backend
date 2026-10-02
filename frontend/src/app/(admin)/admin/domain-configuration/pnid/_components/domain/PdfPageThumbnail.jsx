'use client';

/**
 * PdfPageThumbnail — renders a single pdf.js page to a canvas thumbnail,
 * cancelling in-flight renders on unmount / page change.
 */
import React, { useEffect, useState, useRef } from 'react';

export default function PdfPageThumbnail({ pdfDoc, pageNumber, isSelected }) {
    const canvasRef = useRef(null);
    const renderTaskRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const renderPage = async () => {
            if (!pdfDoc) return;
            setLoading(true);
            try {
                const page = await pdfDoc.getPage(pageNumber);
                if (!active) return;

                const unscaled = page.getViewport({ scale: 1.0 });
                const viewport = page.getViewport({ scale: 200 / unscaled.width });

                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                if (!canvas || !ctx) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                renderTaskRef.current?.cancel();
                const task = page.render({ canvasContext: ctx, viewport });
                renderTaskRef.current = task;

                await task.promise;
                if (active) setLoading(false);
            } catch (err) {
                if (err?.name !== 'RenderingCancelledException') {
                }
            }
        };

        renderPage();
        return () => {
            active = false;
            renderTaskRef.current?.cancel();
        };
    }, [pdfDoc, pageNumber]);

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-surface-2 overflow-hidden">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-xs">
                    <div className="w-5 h-5 rounded-full border-2 border-brand/20 border-t-brand animate-spin" />
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={`max-w-full max-h-full object-contain transition-all duration-300 ${
                    loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
            />
        </div>
    );
}
