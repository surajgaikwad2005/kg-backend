'use client';

/**
 * usePdfjs — lazily injects pdf.js from CDN (with a jsDelivr fallback) and
 * reports readiness. pdf.js is intentionally NOT an npm dependency; it is only
 * needed for client-side PDF thumbnail rendering.
 *
 * Integration note: if the host bundles pdfjs-dist, replace this with a static
 * import and drop the CDN loader.
 */
import { useEffect, useState } from 'react';

const CDN = {
    primary: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    primaryWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    fallback: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js',
    fallbackWorker: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js',
};

export function usePdfjs() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const markReady = (workerSrc) => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
            setIsLoaded(true);
        };

        if (window.pdfjsLib) {
            markReady(CDN.primaryWorker);
            return;
        }

        const script = document.createElement('script');
        script.src = CDN.primary;
        script.async = true;
        script.onload = () => window.pdfjsLib && markReady(CDN.primaryWorker);
        script.onerror = () => {
            const fb = document.createElement('script');
            fb.src = CDN.fallback;
            fb.async = true;
            fb.onload = () => window.pdfjsLib && markReady(CDN.fallbackWorker);
            fb.onerror = (e) =>
            document.body.appendChild(fb);
        };
        document.body.appendChild(script);
    }, []);

    return isLoaded;
}

/** Best-effort PDF page count from raw bytes (no pdf.js needed). */
export function countPdfPages(arrayBuffer) {
    const text = new TextDecoder('latin1').decode(arrayBuffer);
    const countMatches = text.match(/\/Count\s+(\d+)/g);
    if (countMatches?.length) {
        const max = Math.max(...countMatches.map((m) => parseInt(m.replace(/\/Count\s+/, ''), 10)));
        if (max > 0) return max;
    }
    const pageMatches = text.match(/\/Type\s*\/Page\b/g);
    return pageMatches ? pageMatches.length : 1;
}
