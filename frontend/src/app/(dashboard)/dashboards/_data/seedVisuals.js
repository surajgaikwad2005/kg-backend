export const OPS_VISUALS = [
  {
    id: 'v_ops_1',
    title: 'Current Pressure',
    type: 'kpi',
    metricIndex: 8,
    aggregation: 'last',
    grid: { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 1 },
    chartData: {
      title: 'Current Pressure',
      value: 52.33,
      unit: 'mbar',
      datasets: [
        {
          id: 'ds_1',
          tag: 'CP_CC001_PI_002_PV',
          label: 'Cooler Undergrate Pressure',
          unit: 'mbar',
          data: [53.62, 53.64, 53.63, 53.60, 53.76, 53.95, 53.83, 53.81, 53.56, 53.71, 49.63, 52.33]
        }
      ]
    }
  },
  {
    id: 'v_ops_2',
    title: 'Temperature Gauge',
    type: 'gauge',
    metricIndex: 9,
    aggregation: 'last',
    grid: { colStart: 5, colSpan: 4, rowStart: 1, rowSpan: 2 },
    chartData: {
      title: 'Temperature Gauge',
      value: 78.4,
      min: 0,
      max: 100,
      unit: '°C',
      datasets: [
        {
          id: 'ds_2',
          tag: 'CP_CC001_TI_001_PV',
          label: 'Inlet Temperature',
          unit: '°C',
          data: [65.2, 68.4, 72.1, 74.5, 78.4]
        }
      ]
    }
  },
  {
    id: 'v_ops_3',
    title: 'Temperature vs Pressure',
    type: 'combo',
    metricIndex: 7,
    aggregation: 'avg',
    grid: { colStart: 9, colSpan: 4, rowStart: 1, rowSpan: 2 },
    chartData: {
      labels: { x: { values: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'] } },
      datasets: [
        { id: 'ds_3_1', label: 'Temperature', type: 'line', data: [65, 70, 75, 78, 72, 70], unit: '°C' },
        { id: 'ds_3_2', label: 'Pressure', type: 'bar', data: [50, 52, 53, 49, 51, 52], unit: 'mbar' }
      ]
    }
  },
  {
    id: 'v_ops_4',
    title: 'Flow & Temperature Trend',
    type: 'area',
    metricIndex: 0,
    aggregation: 'avg',
    grid: { colStart: 1, colSpan: 6, rowStart: 3, rowSpan: 2 },
    chartData: {
      labels: { x: { values: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'] } },
      datasets: [
        { id: 'ds_4_1', label: 'Air Flow Rate', data: [120, 135, 140, 138, 142, 130], unit: 'm³/h' }
      ]
    }
  },
  {
    id: 'v_ops_5',
    title: 'Hourly Pressure Heatmap',
    type: 'heatmap',
    metricIndex: 12,
    aggregation: 'avg',
    grid: { colStart: 7, colSpan: 6, rowStart: 3, rowSpan: 2 },
    chartData: {
      labels: { x: { values: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] } },
      datasets: [
        { id: 'ds_5_1', label: 'Undergrate Heatmap', data: [50, 55, 60, 52, 48], unit: 'mbar' }
      ]
    }
  }
];

export const PROD_VISUALS = [
  {
    id: 'v_prod_1',
    title: 'Hourly Output Rate',
    type: 'bar',
    metricIndex: 2,
    aggregation: 'sum',
    grid: { colStart: 1, colSpan: 6, rowStart: 1, rowSpan: 2 },
    chartData: {
      labels: { x: { values: ['00:00', '04:00', '08:00', '12:00', '16:00'] } },
      datasets: [
        { id: 'ds_p1', label: 'Clinker Production', data: [420, 480, 510, 490, 530], unit: 'tons' }
      ]
    }
  },
  {
    id: 'v_prod_2',
    title: 'Pressure Safety Threshold',
    type: 'threshold',
    metricIndex: 13,
    aggregation: 'max',
    grid: { colStart: 7, colSpan: 6, rowStart: 1, rowSpan: 2 },
    chartData: {
      labels: { x: { values: ['00:00', '04:00', '08:00', '12:00', '16:00'] } },
      datasets: [
        { id: 'ds_p2', label: 'Max Undergrate Pressure', data: [55, 58, 62, 59, 56], unit: 'mbar' }
      ]
    }
  }
];

export const MAINT_VISUALS = [
  {
    id: 'v_maint_1',
    title: 'Vibration Anomaly Line',
    type: 'line',
    metricIndex: 5,
    aggregation: 'avg',
    grid: { colStart: 1, colSpan: 6, rowStart: 1, rowSpan: 2 },
    chartData: {
      labels: { x: { values: ['00:00', '04:00', '08:00', '12:00', '16:00'] } },
      datasets: [
        { id: 'ds_m1', label: 'Drive Vibration', data: [1.2, 1.4, 1.8, 2.1, 1.5], unit: 'mm/s' }
      ]
    }
  },
  {
    id: 'v_maint_2',
    title: 'Pressure Normal Band',
    type: 'min_max_band',
    metricIndex: 14,
    aggregation: 'avg',
    grid: { colStart: 7, colSpan: 6, rowStart: 1, rowSpan: 2 },
    chartData: {
      labels: { x: { values: ['00:00', '04:00', '08:00', '12:00', '16:00'] } },
      datasets: [
        { id: 'ds_m2', label: 'Undergrate Pressure Band', data: [51, 52, 53, 52, 51], unit: 'mbar' }
      ]
    }
  },
  {
    id: 'v_maint_3',
    title: 'Pressure vs Temp (Dual Axis)',
    type: 'line',
    metricIndex: 1,
    aggregation: 'avg',
    grid: { colStart: 1, colSpan: 6, rowStart: 3, rowSpan: 2 },
    chartData: {
      labels: { x: { values: ['00:00', '04:00', '08:00', '12:00', '16:00'] } },
      datasets: [
        { id: 'ds_m3', label: 'Primary Pressure', data: [52, 54, 53, 51, 52], unit: 'mbar' }
      ]
    }
  },
  {
    id: 'v_maint_4',
    title: 'Pressure vs Temp Area (Dual Axis)',
    type: 'area',
    metricIndex: 3,
    aggregation: 'avg',
    grid: { colStart: 7, colSpan: 6, rowStart: 3, rowSpan: 2 },
    chartData: {
      labels: { x: { values: ['00:00', '04:00', '08:00', '12:00', '16:00'] } },
      datasets: [
        { id: 'ds_m4', label: 'Temp Zone Area', data: [68, 72, 75, 71, 69], unit: '°C' }
      ]
    }
  },
  {
    id: 'v_maint_5',
    title: 'Sensor Logging History',
    type: 'table',
    metricIndex: 10,
    aggregation: 'avg',
    grid: { colStart: 1, colSpan: 12, rowStart: 5, rowSpan: 2 },
    chartData: {
      labels: { x: { values: ['2024-01-01 00:00', '2024-01-01 01:00', '2024-01-01 02:00'] } },
      datasets: [
        { id: 'ds_m5_1', label: 'Vibration (mm/s)', data: [1.2, 1.4, 1.8] },
        { id: 'ds_m5_2', label: 'Temp (°C)', data: [68.0, 72.0, 75.0] }
      ]
    }
  }
];
