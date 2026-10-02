import { OPS_VISUALS, PROD_VISUALS, MAINT_VISUALS } from './seedVisuals';

export const SEED_GROUPS = [
  {
    id: 'ops',
    name: 'Operations Monitor',
    description: 'Real-time monitoring of cooler operations, pressures, and inlet temperature gauges.',
    theme: 'blue',
    visuals: OPS_VISUALS,
  },
  {
    id: 'prod',
    name: 'Production Rate',
    description: 'Clinker production outputs, feed rates, and safety threshold alerts.',
    theme: 'amber',
    visuals: PROD_VISUALS,
  },
  {
    id: 'maint',
    name: 'Maintenance & Health',
    description: 'Vibration metrics, dual-axis temperature bands, and detailed sensor logging.',
    theme: 'purple',
    visuals: MAINT_VISUALS,
  }
];

export const SPARKS = {
  ops: 'M 0,25 Q 15,10 30,30 T 60,15 T 90,35 T 120,5 T 150,20 T 180,10 T 210,30 T 240,15 T 270,35 T 300,10',
  prod: 'M 0,35 L 30,25 L 60,30 L 90,10 L 120,20 L 150,15 L 180,5 L 210,35 L 240,25 L 270,10 L 300,15',
  maint: 'M 0,10 Q 30,35 60,10 T 120,35 T 180,10 T 240,35 T 300,10',
};

export const DEFAULT_SPARK = 'M 0,25 Q 30,10 60,30 T 120,10 T 180,30 T 240,10 T 300,25';
