export const cronToInterval = (cron, trigger) => {
    if (trigger === 'Manual' || trigger === 'Webhook' || cron === 'On-demand') return '00:00:00';
    const p = cron.trim().split(/\s+/);
    if (p.length < 5) return '00:01:00';
    const [mn, hr, dom] = p;
    if (hr.startsWith('*/')) return `00:${String(parseInt(hr.slice(2))).padStart(2, '0')}:00`;
    if (mn.startsWith('*/')) return `00:00:${String(parseInt(mn.slice(2))).padStart(2, '0')}`;
    if (hr === '*') return '00:01:00';
    if (dom === '*') return '01:00:00';
    return '07:00:00';
};

export const intervalToHuman = (interval, trigger) => {
    if (trigger === 'Manual') return 'On demand';
    if (trigger === 'Webhook') return 'On webhook';
    const parts = interval.split(':');
    if (parts.length !== 3) return interval;
    const dd = parseInt(parts[0]) || 0;
    const hh = parseInt(parts[1]) || 0;
    const mm = parseInt(parts[2]) || 0;
    const totalMins = dd * 1440 + hh * 60 + mm;
    if (totalMins === 0) return 'On demand';
    if (totalMins < 60) return `Every ${mm} minute${mm !== 1 ? 's' : ''}`;
    if (mm === 0 && hh > 0 && dd === 0) return hh === 1 ? 'Every hour' : `Every ${hh} hours`;
    if (mm === 0 && hh === 0 && dd > 0) return dd === 1 ? 'Every day' : `Every ${dd} days`;
    const seg = [];
    if (dd > 0) seg.push(`${dd}d`);
    if (hh > 0) seg.push(`${hh}h`);
    if (mm > 0) seg.push(`${mm}m`);
    return `Every ${seg.join(' ')}`;
};

export const isValidInterval = (v) => /^\d{2}:\d{2}:\d{2}$/.test(v);

export const STATUS_BADGE_CLS = {
    Success: 'bg-success/10 text-success border-success/20',
    Failed: 'bg-danger/10 text-danger border-danger/20',
    Running: 'bg-brand/10 text-brand border-brand/20',
    Warning: 'bg-warning/10 text-warning border-warning/20',
};

export const statusBadgeCls = (status) =>
    STATUS_BADGE_CLS[status] ?? 'bg-surface-2 text-text-muted border-border';

export const statusIconCls = (status) => {
    if (status === 'Success') return 'bg-success/10 text-success';
    if (status === 'Failed') return 'bg-danger/10 text-danger';
    if (status === 'Running') return 'bg-brand/10 text-brand';
    return 'bg-warning/10 text-warning';
};
