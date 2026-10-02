'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/src/context/visuals/ThemeContext';

/**
 * useChartTheme
 * Highcharts needs literal color values, so it cannot consume Tailwind classes.
 * Instead of hardcoding hex codes (which would silently opt every chart out of
 * the Appearance settings), this hook reads the semantic design tokens straight
 * off `document.documentElement` and re-reads them whenever the active theme
 * variant changes — so charts track all 12 theme variants and the accent color.
 *
 * Returns `null` until mounted (the tokens only exist in the browser), which
 * lets callers render their shimmer skeleton instead of a flash of unthemed
 * chart. No fallback hex values are defined anywhere in this file by design.
 */

const TOKEN_MAP = {
    brand: '--color-brand',
    success: '--color-success',
    warning: '--color-warning',
    danger: '--color-danger',
    info: '--color-info',
    textPrimary: '--color-text-primary',
    textSecondary: '--color-text-secondary',
    textMuted: '--color-text-muted',
    textSubtle: '--color-text-subtle',
    surface: '--color-surface',
    surface2: '--color-surface-2',
    border: '--color-border',
    chart1: '--color-chart-1',
    chart2: '--color-chart-2',
    chart3: '--color-chart-3',
    chart4: '--color-chart-4',
    chart5: '--color-chart-5',
};

const readTokens = () => {
    const styles = getComputedStyle(document.documentElement);
    const palette = {};
    for (const [key, cssVar] of Object.entries(TOKEN_MAP)) {
        palette[key] = styles.getPropertyValue(cssVar).trim();
    }
    palette.series = [palette.chart1, palette.chart2, palette.chart3, palette.chart4, palette.chart5].filter(Boolean);
    return palette;
};

export function useChartTheme() {
    const { themeVariant, resolvedTheme } = useTheme();
    const [palette, setPalette] = useState(null);

    useEffect(() => {
        // rAF lets the theme attribute land on <html> before the tokens are read.
        const frame = requestAnimationFrame(() => setPalette(readTokens()));
        return () => cancelAnimationFrame(frame);
    }, [themeVariant, resolvedTheme]);

    /** Shared Highcharts skeleton every panel on this page spreads over. */
    const baseOptions = useMemo(() => {
        if (!palette) return null;
        return {
            chart: {
                backgroundColor: 'transparent',
                style: { fontFamily: 'inherit' },
                spacing: [12, 12, 8, 8],
            },
            title: { text: undefined },
            credits: { enabled: false },
            legend: { enabled: false },
            xAxis: {
                lineColor: palette.border,
                tickColor: palette.border,
                gridLineColor: 'transparent',
                labels: { style: { color: palette.textSubtle, fontSize: '10px' } },
            },
            yAxis: {
                title: { text: null },
                gridLineColor: palette.border,
                gridLineDashStyle: 'Dash',
                labels: { style: { color: palette.textSubtle, fontSize: '10px' } },
            },
            tooltip: {
                backgroundColor: palette.surface,
                borderColor: palette.border,
                borderRadius: 10,
                shadow: false,
                style: { color: palette.textPrimary, fontSize: '11px' },
            },
            plotOptions: {
                series: { animation: { duration: 450 } },
            },
        };
    }, [palette]);

    return { palette, baseOptions, ready: palette !== null };
}
