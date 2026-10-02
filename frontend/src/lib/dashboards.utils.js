export const TAG_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#0ea5e9', '#f97316', '#ec4899',
];
export const WINDOW_PRESETS = [
    { label: '1H', hours: 1 }, { label: '2H', hours: 2 },
    { label: '6H', hours: 6 }, { label: '12H', hours: 12 },
    { label: '1D', hours: 24 },
];
export const STORAGE_KEY = 'visuals_workspaces_v2';
export function fmtTs(ts) {
    const d = new Date(ts);
    if (isNaN(d.getTime()))
        return 'Invalid Date';
    const p = (n) => n.toString().padStart(2, '0');
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
export function toDatetimeLocal(d) {
    if (!d || isNaN(d.getTime()))
        return '';
    const p = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Convert a Date to a `datetime-local` input string (`YYYY-MM-DDTHH:mm`)
 * expressed in the given IANA timezone (e.g. "Asia/Kolkata").
 * Falls back to browser-local time if the timezone is invalid.
 */
export function toDatetimeLocalInTz(d, timezone) {
    if (!d || isNaN(d.getTime())) return '';
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
            hour12: false,
        }).formatToParts(d);
        const get = t => parts.find(p => p.type === t)?.value ?? '00';
        const hour = get('hour') === '24' ? '00' : get('hour');
        return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`;
    } catch {
        return toDatetimeLocal(d);
    }
}

/**
 * Format a Date as `YYYY-MM-DD HH:mm:ss` in the given IANA timezone.
 * This is the format expected by the visuals backend APIs.
 * Falls back to browser-local time if the timezone is invalid.
 */
export function fmtInTz(d, timezone) {
    const pad = n => String(n).padStart(2, '0');
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
        }).formatToParts(d);
        const get = t => parts.find(p => p.type === t)?.value ?? '00';
        const hour = get('hour') === '24' ? '00' : get('hour');
        return `${get('year')}-${get('month')}-${get('day')} ${hour}:${get('minute')}:${get('second')}`;
    } catch {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
}

/**
 * Format a `datetime-local` string (`YYYY-MM-DDTHH:mm`) directly to the
 * backend API format (`YYYY-MM-DD HH:mm:ss`) without timezone conversion.
 * The value from the input already reflects the user's selected timezone.
 */
export function fmtLocalStr(datetimeLocalStr) {
    if (!datetimeLocalStr) return '';
    return datetimeLocalStr.replace('T', ' ') + ':00';
}
export function fmtShort(ts) {
    const d = new Date(ts);
    const p = (n) => n.toString().padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
export function getCleanUsername() {
    if (typeof window === 'undefined')
        return 'operator';
    const email = localStorage.getItem('username') || '';
    if (!email)
        return 'operator';
    return email.split('@')[0].split('.')[0];
}
export function normName(s) {
    return (s || '').toLowerCase().replace(/-/g, '_');
}
export function getComponentTags(formula, allTags) {
    return allTags.filter(tag => formula.includes(tag));
}
export function computeCustomTagSeries(formula, physicalTagData, allTags) {
    const usedTags = getComponentTags(formula, allTags);
    if (usedTags.length === 0)
        return [];
    const seriesMap = new Map();
    physicalTagData.forEach(item => {
        seriesMap.set(item.name, item.data);
    });
    const allTimestampsSet = new Set();
    usedTags.forEach(tag => {
        const data = seriesMap.get(tag) || [];
        data.forEach(([ts]) => allTimestampsSet.add(ts));
    });
    const sortedTimestamps = Array.from(allTimestampsSet).sort((a, b) => a - b);
    if (sortedTimestamps.length === 0)
        return [];
    const computedData = [];
    const indicesMap = new Map();
    usedTags.forEach(tag => indicesMap.set(tag, 0));
    sortedTimestamps.forEach(ts => {
        const tagValues = {};
        usedTags.forEach(tag => {
            const data = seriesMap.get(tag) || [];
            if (data.length === 0) {
                tagValues[tag] = 0;
                return;
            }
            let idx = indicesMap.get(tag) || 0;
            while (idx < data.length && data[idx][0] < ts) {
                idx++;
            }
            indicesMap.set(tag, idx);
            if (idx < data.length && data[idx][0] === ts) {
                tagValues[tag] = data[idx][1];
            }
            else {
                if (idx === 0) {
                    tagValues[tag] = data[0][1];
                }
                else if (idx >= data.length) {
                    tagValues[tag] = data[data.length - 1][1];
                }
                else {
                    const prev = data[idx - 1];
                    const next = data[idx];
                    if (ts - prev[0] < next[0] - ts) {
                        tagValues[tag] = prev[1];
                    }
                    else {
                        tagValues[tag] = next[1];
                    }
                }
            }
        });
        let sanitizedFormula = formula;
        const sortedUsedTags = [...usedTags].sort((a, b) => b.length - a.length);
        sortedUsedTags.forEach(tag => {
            const val = tagValues[tag] !== undefined ? tagValues[tag] : 0;
            const escapedTag = tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedTag}\\b`, 'g');
            sanitizedFormula = sanitizedFormula.replace(regex, `(${val})`);
        });
        const cleanFormula = sanitizedFormula.replace(/[^0-9+\-*/().\s]/g, '');
        try {
            const result = Function(`"use strict"; return (${cleanFormula})`)();
            if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                computedData.push([ts, result]);
            }
        }
        catch (e) {
            // silent fail for this timestamp
        }
    });
    return computedData;
}
