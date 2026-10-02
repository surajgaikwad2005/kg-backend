'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/src/services/apiClient';

export function usePidPreview({ pids, pidStep }) {
    const [previewBlobUrl, setPreviewBlobUrl] = useState(null);

    useEffect(() => {
        const currentPid = pids[pidStep];
        if (!currentPid) {
            setPreviewBlobUrl(null);
            return;
        }

        let cancelled = false;
        let url = null;

        const fetchFile = async () => {
            try {
                const res = await apiClient.raw(currentPid.image);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                if (cancelled) return;

                const blob = await res.blob();
                const isPdf = currentPid.name.toLowerCase().endsWith('.pdf');
                const finalBlob = new Blob([blob], { type: isPdf ? 'application/pdf' : blob.type || 'image/jpeg' });
                url = URL.createObjectURL(finalBlob);
                setPreviewBlobUrl(url);
            } catch (err) {
                if (!cancelled) setPreviewBlobUrl(null);
            }
        };

        setPreviewBlobUrl(null);
        fetchFile();

        return () => {
            cancelled = true;
            if (url) URL.revokeObjectURL(url);
        };
    }, [pids, pidStep]);

    return { previewBlobUrl };
}
