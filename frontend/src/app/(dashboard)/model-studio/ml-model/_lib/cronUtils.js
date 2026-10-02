/**
 * cronUtils.js
 * Pure helper constants and cron parsing functions for ML Model Deployments.
 */

export const ENV_COLORS = {
    prod: 'bg-red-500/10 text-red-500 border border-red-500/20',
    production: 'bg-red-500/10 text-red-500 border border-red-500/20',
    staging: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    canary: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    dev: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
};

export const TABLE_HEADERS = [
    'DEPLOYMENT ID',
    'EXPERIMENT ID',
    'ENVIRONMENT',
    'STATUS',
    'CRON SCHEDULE',
    'CREATED BY',
    'ACTIONS',
];

export const CRON_LABELS = ['MINUTE', 'HOUR', 'DAY (MONTH)', 'MONTH', 'DAY (WEEK)'];
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getCronDescriptionAndNextRun(cronStr) {
    const parts = (cronStr || '').trim().split(/\s+/).filter(Boolean);
    let desc = 'Custom schedule';
    let nextRun = '';

    const now = new Date();

    if (parts.length === 5) {
        const [min, hour, dom, mon, dow] = parts;

        const isMinNum = !isNaN(parseInt(min, 10)) && !min.includes('*');
        const isHourNum = !isNaN(parseInt(hour, 10)) && !hour.includes('*');
        const isDomNum = !isNaN(parseInt(dom, 10)) && !dom.includes('*');
        const isMonNum = !isNaN(parseInt(mon, 10)) && !mon.includes('*');
        const isDowNum = !isNaN(parseInt(dow, 10)) && !dow.includes('*');

        if (min === '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
            desc = 'Every minute';
        } else {
            let timeDesc = '';
            let dateDesc = '';

            if (isMinNum && isHourNum) {
                timeDesc = `At ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
            } else if (isMinNum && hour === '*') {
                timeDesc = `At minute ${min} past every hour`;
            } else if (min.startsWith('*/') && hour.startsWith('*/')) {
                const m = parseInt(min.replace('*/', ''), 10) || 1;
                const h = parseInt(hour.replace('*/', ''), 10) || 1;
                timeDesc = `Every ${m} minutes, every ${h} hours`;
            } else if (min.startsWith('*/') && hour === '*') {
                const m = parseInt(min.replace('*/', ''), 10) || 5;
                timeDesc = `Every ${m} minute${m > 1 ? 's' : ''}`;
            } else if (min === '0' && hour.startsWith('*/')) {
                const h = parseInt(hour.replace('*/', ''), 10) || 1;
                timeDesc = `Every ${h} hour${h > 1 ? 's' : ''} at minute 0`;
            } else if (min === '0' && isHourNum) {
                timeDesc = `At ${hour.padStart(2, '0')}:00 every day`;
            } else {
                timeDesc = `At minute ${min}, hour ${hour}`;
            }

            if (isDomNum && isMonNum) {
                const mName = MONTH_NAMES[parseInt(mon, 10)] || `month ${mon}`;
                dateDesc = `, on day ${dom} of ${mName}`;
            } else if (isDomNum) {
                dateDesc = `, on day ${dom} of the month`;
            } else if (isDowNum) {
                const wName = WEEKDAY_NAMES[parseInt(dow, 10)] || `day ${dow}`;
                dateDesc = `, on ${wName}`;
            }

            desc = `${timeDesc}${dateDesc}`;
        }

        const targetMin = isMinNum ? parseInt(min, 10) : 0;
        const targetHour = isHourNum ? parseInt(hour, 10) : 0;
        const targetDom = isDomNum ? parseInt(dom, 10) : null;

        const d = new Date(now);
        d.setSeconds(0, 0);

        if (targetDom !== null) {
            d.setHours(targetHour, targetMin, 0, 0);
            d.setDate(targetDom);
            if (d <= now) {
                d.setMonth(d.getMonth() + 1);
                d.setDate(targetDom);
            }
        } else if (isHourNum && isMinNum) {
            d.setHours(targetHour, targetMin, 0, 0);
            if (d <= now) {
                d.setDate(d.getDate() + 1);
            }
        } else if (hour.startsWith('*/')) {
            const hStep = parseInt(hour.replace('*/', ''), 10) || 1;
            const mStep = min.startsWith('*/') ? (parseInt(min.replace('*/', ''), 10) || 1) : 1;
            const curH = d.getHours();
            const curM = d.getMinutes();
            let nextM = (Math.floor(curM / mStep) + 1) * mStep;
            if (nextM >= 60) {
                d.setMinutes(0);
                let nextH = (Math.floor(curH / hStep) + 1) * hStep;
                d.setHours(nextH);
            } else {
                d.setMinutes(nextM);
                let nextH = Math.floor(curH / hStep) * hStep;
                d.setHours(nextH);
            }
        } else if (min.startsWith('*/')) {
            const mStep = parseInt(min.replace('*/', ''), 10) || 5;
            const curM = d.getMinutes();
            let nextM = (Math.floor(curM / mStep) + 1) * mStep;
            if (nextM >= 60) {
                d.setHours(d.getHours() + 1, 0, 0);
            } else {
                d.setMinutes(nextM);
            }
        } else {
            d.setMinutes(d.getMinutes() + 1);
        }

        nextRun = d.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' });
    } else {
        desc = 'Invalid cron expression (requires 5 fields)';
        nextRun = 'N/A';
    }

    return { desc, nextRun };
}
