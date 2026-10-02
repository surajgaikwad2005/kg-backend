/** Static seed data for ML Model Studio tabs (dev/test only). Replace with real API calls. */

export const performanceData = [
  { month: '1 Mar', accuracy: 0.95 },
  { month: '5 Mar', accuracy: 0.96 },
  { month: '10 Mar', accuracy: 0.98 },
  { month: '15 Mar', accuracy: 0.97 },
  { month: '20 Mar', accuracy: 0.9 },
  { month: '25 Mar', accuracy: 0.91 },
];

export const resourceData = [
  { day: 'Mon', gpu: 65, cpu: 45, memory: 60 },
  { day: 'Tue', gpu: 70, cpu: 55, memory: 65 },
  { day: 'Wed', gpu: 85, cpu: 65, memory: 75 },
  { day: 'Thu', gpu: 80, cpu: 60, memory: 70 },
  { day: 'Fri', gpu: 90, cpu: 75, memory: 85 },
  { day: 'Sat', gpu: 50, cpu: 40, memory: 55 },
  { day: 'Sun', gpu: 45, cpu: 35, memory: 50 },
];

export const deploymentsData = [
  {
    name: '2ndStage-Compressor-Endpoint',
    version: 'v1',
    env: 'Production',
    envColor: 'text-success bg-success/10',
    status: 'Healthy',
    endpoint: '/api/v1/fraud/predict',
    requests: '137',
    latency: '96ms',
    errorRate: '0%',
  },
];
