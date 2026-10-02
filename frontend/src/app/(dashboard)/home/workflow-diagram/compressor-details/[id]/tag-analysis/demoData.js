// Demo data for Tag Deviation Analysis - Jan 18-20, 2025 timeline
const TAG_COLORS = ['#3b82f6', '#1e40af', '#10b981', '#06b6d4', '#8b5cf6', '#f97316'];
export const DEMO_TAG_CONFIGS = [
    { name: 'COMP_SPEED', color: '#3b82f6', category: 'V', minTh: 0, maxTh: 13000, minLabel: '', maxLabel: '' },
    { name: 'SEAL_AIR_DP', color: '#1e40af', category: 'P', minTh: 17, maxTh: 40, minLabel: 'Min - PT Seal Air DP', maxLabel: 'Max - PT Seal Air DP' },
    { name: 'EXP_DE_BRG_T1', color: '#10b981', category: 'V', minTh: 89, maxTh: 118, minLabel: 'Min - Bearing DE Temp', maxLabel: 'HH - Bearing DE Temp' },
    { name: 'GGLO_TANK_TA', color: '#06b6d4', category: 'C', minTh: 65, maxTh: 80, minLabel: 'Min - GGLO Tank Temp', maxLabel: 'Max GGLO Tank Temp' },
    { name: 'GGLO_SUPP_TA', color: '#8b5cf6', category: 'C', minTh: 50, maxTh: 80, minLabel: 'Min - GGLO Supply Temp', maxLabel: 'HH GGLO Supply Temp' },
    { name: 'EXP_NDE_BRG_T1', color: '#f97316', category: 'V', minTh: 101, maxTh: 170, minLabel: 'Min - NDE Journal Bearing T1', maxLabel: 'Max - NDE Journal Bearing T' },
];
const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
export function generateDemoData() {
    const S = new Date('2025-01-18T00:00:00').getTime();
    const E = new Date('2025-01-20T18:00:00').getTime();
    const step = 10 * 60 * 1000; // 10 min
    const N = Math.floor((E - S) / step);
    const ts = Array.from({ length: N }, (_, i) => S + i * step);
    const r = rng(42);
    const n = (a) => (r() - 0.5) * a;
    // COMP_SPEED: high ~12636, drops to ~16 between h6-36, recovers
    const compSpeed = ts.map(t => {
        const h = (t - S) / 3600000;
        let v;
        if (h < 6)
            v = 12636 + n(40);
        else if (h < 8)
            v = 12636 - (12620 * ((h - 6) / 2)) + n(20);
        else if (h < 36)
            v = 16 + n(6);
        else if (h < 38)
            v = 16 + (12620 * ((h - 36) / 2)) + n(20);
        else
            v = 12636 + n(40);
        return [t, Math.max(0, v)];
    });
    // SEAL_AIR_DP: starts ~40, gradual decrease, crosses min at ~h30, drops to ~5
    const sealAirDp = ts.map(t => {
        const h = (t - S) / 3600000;
        let v;
        if (h < 12)
            v = 40 + n(1.5);
        else if (h < 30)
            v = 40 - ((h - 12) / 18) * 23 + n(1.2);
        else if (h < 42)
            v = 17 - ((h - 30) / 12) * 12 + n(0.8);
        else
            v = 5 + n(0.5);
        return [t, Math.max(2, v)];
    });
    // EXP_DE_BRG_T1: generally 89-100, slight increases
    const deBrg = ts.map(t => {
        const h = (t - S) / 3600000;
        let v;
        if (h < 6)
            v = 95 + n(3);
        else if (h < 10)
            v = 100 + n(4); // elevated during RPM change
        else if (h < 36)
            v = 92 + n(3);
        else
            v = 95 + n(3);
        return [t, v];
    });
    // GGLO_TANK_TA: ~75 normally, drops below 65 around h48+
    const gTank = ts.map(t => {
        const h = (t - S) / 3600000;
        let v;
        if (h < 40)
            v = 75 + n(2);
        else if (h < 48)
            v = 75 - ((h - 40) / 8) * 15 + n(1.5);
        else
            v = 60 + n(2);
        return [t, v];
    });
    // GGLO_SUPP_TA: ~70 normally, some variation
    const gSupp = ts.map(t => {
        const h = (t - S) / 3600000;
        let v;
        if (h < 30)
            v = 72 + n(3);
        else if (h < 40)
            v = 72 + Math.sin(h * 0.5) * 5 + n(2.5); // increasing vibration-like
        else
            v = 68 + n(3);
        return [t, v];
    });
    // EXP_NDE_BRG_T1: ~110 normally, spike to ~238 around h30, increasing trend
    const ndeBrg = ts.map(t => {
        const h = (t - S) / 3600000;
        let v;
        if (h < 20)
            v = 110 + n(5);
        else if (h < 28)
            v = 110 + ((h - 20) / 8) * 50 + n(8); // increasing
        else if (h < 30)
            v = 160 + ((h - 28) / 2) * 78 + n(10); // spike
        else if (h < 32)
            v = 238 - ((h - 30) / 2) * 100 + n(15); // drop from spike
        else
            v = 120 + Math.abs(Math.sin(h * 0.3)) * 30 + n(10); // elevated with spikes
        return [t, Math.max(32, v)];
    });
    const allData = [compSpeed, sealAirDp, deBrg, gTank, gSupp, ndeBrg];
    return DEMO_TAG_CONFIGS.map((cfg, i) => ({
        name: cfg.name,
        color: cfg.color,
        data: allData[i],
    }));
}
// Hardcoded annotations matching the reference image exactly
export const DEMO_ANNOTATIONS = [
    {
        tagIdx: 0, category: 'V',
        time: new Date('2025-01-18T05:00:00').getTime(),
        text: 'RPM was increased due to which DE BRG Temp was also increased',
    },
    {
        tagIdx: 1, category: 'V',
        time: new Date('2025-01-18T18:00:00').getTime(),
        text: 'Seal air DP going below minimum value indicating seal contamination or leakage',
    },
    {
        tagIdx: 1, category: 'V',
        time: new Date('2025-01-20T06:00:00').getTime(),
        text: 'No changes in the Load, RPM observed. Seal DP continuously decreased over a period of time, and again crossed the minimum limit. Same time Lube oil temperature dropped indicating insufficient cooling.',
    },
    {
        tagIdx: 3, category: 'C',
        time: new Date('2025-01-20T10:00:00').getTime(),
        text: 'Seal DP deviated. Lube oil tank temperature dropped below minimum indicating insufficient cooling.',
        extraCategory: 'V',
    },
    {
        tagIdx: 4, category: 'V',
        time: new Date('2025-01-19T12:00:00').getTime(),
        text: 'NDE vibration was continuously increasing leading with major spikes.',
    },
    {
        tagIdx: 5, category: 'V',
        time: new Date('2025-01-19T06:00:00').getTime(),
        text: 'NDE BRG Temp exceeded the maximum value (Excessive vibrations, or invalid sensor)',
    },
];
