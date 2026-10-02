export function normalizeEvents(apiData) {
    if (!apiData) return [];
    if (Array.isArray(apiData.events)) return apiData.events;
    if (Array.isArray(apiData.data?.events)) return apiData.data.events;
    if (Array.isArray(apiData)) return apiData;
    return [];
}

export function severityClass(sev) {
    const s = (sev || '').toLowerCase();
    if (s === 'critical') return { badge: 'bg-danger/10 text-danger border-danger/20', bar: 'bg-danger', dot: 'bg-danger' };
    if (s === 'high')     return { badge: 'bg-warning/10 text-warning border-warning/20', bar: 'bg-warning', dot: 'bg-warning' };
    if (s === 'medium')   return { badge: 'bg-info/10 text-info border-info/20', bar: 'bg-info', dot: 'bg-info' };
    return { badge: 'bg-info/10 text-info border-info/20', bar: 'bg-info', dot: 'bg-info' };
}

// Local breach detection from canvas signalNodes (fallback)
export function localBreaches(nodes) {
    const thresholdNodes = nodes.filter(n => n.type === 'threshold');
    const masterUpper = thresholdNodes.find(n => n.data?.type === 'upper')?.data?.value ?? 80;
    const masterLower = thresholdNodes.find(n => n.data?.type === 'lower')?.data?.value ?? 20;

    return nodes.flatMap(n => {
        if (n.type !== 'signalNode' || !n.data.trendData?.length) return [];
        return n.data.trendData
            .filter(([, val]) => val > masterUpper || val < masterLower)
            .map(([ts, val]) => ({
                tag: n.data.label,
                value: val,
                start_time: new Date(ts).toLocaleString(),
                severity: val > masterUpper ? 'High' : 'Low',
                event_type: val > masterUpper ? 'Upper Breach' : 'Lower Breach',
                duration_minutes: null,
            }));
    }).sort((a, b) => b.value - a.value).slice(0, 20);
}
