export const nodeName = (n) => 
    n?.properties?.name || 
    n?.properties?.equipment_id || 
    n?.properties?.tag_name || 
    n?.properties?.pipe_id || 
    n?.properties?.reference_no || 
    n?.properties?.notification_id || 
    n?.properties?.aif_id || 
    n?.properties?.title || 
    n?.id;

export const propsToObject = (list) => {
    const obj = {};
    list.forEach((p) => { if (p.key.trim()) obj[p.key.trim()] = p.value; });
    return obj;
};

export const errMessage = (err, fallback) => {
    const raw = err?.data?.error || err?.data?.detail || err?.message || fallback;
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw === 'object') {
        if (typeof raw.message === 'string') return raw.message;
        if (typeof raw.error === 'string') return raw.error;
        if (typeof raw.detail === 'string') return raw.detail;
        try { return JSON.stringify(raw); } catch { }
    }
    return String(raw || fallback);
};

export const toId = (val) => {
    if (val == null || val === '') return null;
    const num = Number(val);
    return isNaN(num) ? val : num;
};
