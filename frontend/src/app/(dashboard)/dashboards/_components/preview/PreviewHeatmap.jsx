import React from 'react';

export function PreviewHeatmap({ chartData, datasets, seriesKeys, chartColors }) {
  const [hoveredCell, setHoveredCell] = React.useState(null);
  const containerRef = React.useRef(null);

  const chartPayload = chartData || {};
  let matrixData = [];
  let yValues = [];
  let xValues = [];
  let xAxisLabel = 'Time (Hours)';
  let yAxisLabel = 'Days';
  let unitStr = chartPayload.unit || '';

  if (Array.isArray(chartPayload.matrix) && chartPayload.matrix.length > 0) {
    matrixData = chartPayload.matrix;
    yValues = chartPayload.y_categories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    xValues = chartPayload.x_categories || Array.from({ length: 24 }, (_, i) => i);
    if (chartPayload.labels?.x?.label) xAxisLabel = chartPayload.labels.x.label;
    if (chartPayload.labels?.y?.label) yAxisLabel = chartPayload.labels.y.label;
    if (chartPayload.labels?.y?.unit) unitStr = chartPayload.labels.y.unit;
  } else {
    yValues = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    xValues = Array.from({ length: 24 }, (_, i) => i);
    matrixData = yValues.map((_, yIdx) =>
      xValues.map((_, xIdx) => {
        const val = Math.sin((xIdx + 1) / 3) * 30 + Math.cos((yIdx + 1) / 2) * 20 + 50;
        return Number(val.toFixed(2));
      })
    );
  }

  const allValues = matrixData.flat();
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const valueRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const gridWidth = xValues.length * 20;
  const gridHeight = yValues.length * 16;
  const heatmapBaseColor = chartColors[0] || '#2563EB';

  const labelTextColor = 'var(--do-text-3)';
  const tickTextColor = 'var(--do-text-4)';

  return (
    <div className="relative flex flex-col h-full w-full p-1">
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full rounded-lg bg-surface p-1 overflow-hidden"
      >
        <svg
          viewBox={`0 0 ${gridWidth + 55} ${gridHeight + 40}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-full w-full"
        >
          <text
            x={-(gridHeight / 2)}
            y="12"
            transform="rotate(-90)"
            textAnchor="middle"
            fill={labelTextColor}
            fontSize="9"
            fontWeight="bold"
            letterSpacing="1"
            className="select-none font-sans uppercase"
          >
            {yAxisLabel}
          </text>

          {yValues.map((day, yIdx) => (
            <text
              key={day}
              x="45"
              y={yIdx * 16 + 12}
              textAnchor="end"
              fill={labelTextColor}
              fontSize="8"
              fontWeight="600"
              className="select-none font-sans"
            >
              {day ? String(day).substring(0, 3) : ''}
            </text>
          ))}

          {matrixData.map((rowArray, yIdx) => {
            return rowArray.map((cellValue, xIdx) => {
              const normalizedWeight = (cellValue - minVal) / valueRange;
              const blockOpacity = 0.12 + normalizedWeight * 0.88;

              return (
                <rect
                  key={`${yIdx}-${xIdx}`}
                  x={xIdx * 20 + 50}
                  y={yIdx * 16}
                  width="18.5"
                  height="14.5"
                  rx="2"
                  fill={heatmapBaseColor}
                  fillOpacity={blockOpacity}
                  className="cursor-crosshair"
                  onMouseMove={(e) => {
                    if (!containerRef.current) return;
                    const containerRect = containerRef.current.getBoundingClientRect();
                    setHoveredCell({
                      value: cellValue,
                      xLabel: `Hour ${xValues[xIdx]}:00`,
                      yLabel: yValues[yIdx],
                      left: e.clientX - containerRect.left,
                      top: e.clientY - containerRect.top,
                    });
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              );
            })}
          })}

          {xValues.map((hour, xIdx) => {
            if (hour % 3 !== 0) return null;
            return (
              <text
                key={hour}
                x={xIdx * 20 + 59}
                y={gridHeight + 12}
                textAnchor="middle"
                fill={tickTextColor}
                fontSize="7.5"
                fontWeight="700"
                className="select-none font-mono"
              >
                {String(hour).padStart(2, '0')}h
              </text>
            );
          })}

          <text
            x={(gridWidth / 2) + 50}
            y={gridHeight + 32}
            textAnchor="middle"
            fill={labelTextColor}
            fontSize="9"
            fontWeight="bold"
            letterSpacing="1"
            className="select-none font-sans uppercase"
          >
            {xAxisLabel}
          </text>
        </svg>

        {hoveredCell && (
          <div
            className="pointer-events-none absolute z-50 rounded-lg p-2 text-[11px] text-white shadow-lg border border-overlay-hover bg-overlay"
            style={{
              left: `${hoveredCell.left}px`,
              top: `${hoveredCell.top - 10}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="flex justify-between gap-4 font-bold text-white/70">
              <span>{hoveredCell.yLabel}</span>
              <span className="font-mono text-brand">
                {hoveredCell.xLabel}
              </span>
            </div>
            <div className="mt-1 font-mono text-xs font-black text-success">
              Value: {hoveredCell.value.toFixed(2)}
              <span className="ml-1 text-[9px] font-normal text-white/50">
                {unitStr}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
