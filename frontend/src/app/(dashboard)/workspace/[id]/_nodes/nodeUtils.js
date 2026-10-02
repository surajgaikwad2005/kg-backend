export function getUsername() {
    if (typeof window === 'undefined') return 'user';
    return (localStorage.getItem('username') || '').split('@')[0].split('.')[0] || 'user';
}

export function getWorkspaceName() {
    if (typeof window === 'undefined') return 'workspace';
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || 'workspace';
}

export function getTimeRange() {
    try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('timeRange') : null;
        if (saved) {
            const { start, end } = JSON.parse(saved);
            return { start: new Date(start), end: new Date(end) };
        }
    } catch {}
    return { start: new Date(Date.now() - 24 * 3600000), end: new Date() };
}

export function fmtDate(d) {
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function normalizeStat(p) {
    let mean = p.mean ?? p.avg ?? 0;
    if (Array.isArray(mean)) {
        mean = mean.length ? mean.reduce((a, b) => a + b, 0) / mean.length : 0;
    }

    let max = p.max ?? p.peak ?? 0;
    if (Array.isArray(max)) {
        max = max.length ? Math.max(...max) : 0;
    }

    let min = p.min ?? 0;
    if (Array.isArray(min)) {
        min = min.length ? Math.min(...min) : 0;
    }

    let slope = p.slope ?? 0;
    if (Array.isArray(p.mean)) {
        const n = p.mean.length;
        if (n >= 2) {
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            for (let i = 0; i < n; i++) {
                sumX += i;
                sumY += p.mean[i];
                sumXY += i * p.mean[i];
                sumX2 += i * i;
            }
            const den = n * sumX2 - sumX * sumX;
            slope = den === 0 ? 0 : (n * sumXY - sumX * sumY) / den;
        }
    }

    const drift = p.drift ?? p.drift_direction ?? (slope > 0.001 ? 'Upward' : slope < -0.001 ? 'Downward' : 'Stable');

    return {
        tag: p.tag || 'Unknown',
        mean,
        max,
        min,
        std: p.std ?? p.stddev ?? 0,
        slope,
        drift,
    };
}

export function localComputeStats(trendData, label) {
    if (!trendData || trendData.length < 2) return null;
    const values = trendData.map(p => p[1]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) { sumX += i; sumY += values[i]; sumXY += i * values[i]; sumX2 += i * i; }
    const den = n * sumX2 - sumX * sumX;
    const slope = den === 0 ? 0 : (n * sumXY - sumX * sumY) / den;
    return normalizeStat({ tag: label, mean, max, min, slope });
}

export function parseApiData(apiData) {
    if (!apiData) return null;

    const profiles = [];

    // Case 1: profiles or stats array exists in apiData
    if (apiData.profiles || apiData.stats) {
        const raw = apiData.profiles || apiData.stats;
        if (Array.isArray(raw)) {
            profiles.push(...raw);
        }
    }
    // Case 2: direct array in apiData
    else if (Array.isArray(apiData)) {
        profiles.push(...apiData);
    }
    // Case 3: series array exists in apiData (timeseries)
    else if (apiData.series && Array.isArray(apiData.series)) {
        profiles.push(...apiData.series);
    }
    // Case 4: dictionary of tags (trend_analysis)
    else if (typeof apiData === 'object') {
        for (const [tag, tagData] of Object.entries(apiData)) {
            if (tagData && typeof tagData === 'object' && tagData.overall_trend) {
                const trend = tagData.overall_trend;
                const timeseries = tagData.trend_timeseries || [];
                const values = timeseries.map(x => x.value).filter(v => v !== null && v !== undefined);

                const mean = values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
                const max = values.length ? Math.max(...values) : 0;
                const min = values.length ? Math.min(...values) : 0;
                const slope = trend.slope_per_hour ?? trend.slope ?? 0;
                const direction = trend.direction || 'Stable';

                let drift = 'Stable';
                if (direction.toLowerCase().includes('up')) drift = 'Upward';
                else if (direction.toLowerCase().includes('down')) drift = 'Downward';

                profiles.push({
                    tag,
                    mean,
                    max,
                    min,
                    slope,
                    drift,
                    std: trend.volatility ?? 0
                });
            }
        }
    }

    return profiles.length ? profiles.map(normalizeStat) : null;
}
