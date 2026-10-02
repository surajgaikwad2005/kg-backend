'use client';
import { useState, useEffect, useMemo, useRef } from 'react';

export function useVirtualList({ itemCount, itemHeight, containerHeight, overscan = 5 }) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                setScrollTop(containerRef.current.scrollTop);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const totalHeight = itemCount * itemHeight;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        itemCount - 1,
        Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const virtualItems = useMemo(() => {
        const items = [];
        for (let i = startIndex; i <= endIndex; i++) {
            items.push({
                index: i,
                offsetTop: i * itemHeight,
            });
        }
        return items;
    }, [startIndex, endIndex, itemHeight]);

    return {
        containerRef,
        totalHeight,
        virtualItems,
    };
}
