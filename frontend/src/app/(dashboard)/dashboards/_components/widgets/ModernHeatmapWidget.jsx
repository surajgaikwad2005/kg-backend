import React from 'react';

export default function ModernHeatmapWidget({ ws }) {
  const chartPayload = ws?.chartData || ws?.data || ws;

  const xValues = chartPayload?.x_axis?.values || [];
  const yValues = chartPayload?.y_axis?.values || [];
  const matrixData = chartPayload?.data || [];

  const xAxisLabel = chartPayload?.x_axis?.label || "NA";
  const yAxisLabel = chartPayload?.y_axis?.label || "NA";

  const [hoveredCell, setHoveredCell] = React.useState(null);
  const containerRef = React.useRef(null);

  if (!matrixData.length || !xValues.length || !yValues.length) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">
        No matrix data available
      </div>
    );
  }

  const allValues = matrixData.flat();
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const valueRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const gridWidth = xValues.length * 20;
  const gridHeight = yValues.length * 16;

  return (
    <div className="relative flex min-h-0 min-w-0 h-full w-full flex-col p-1">
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full rounded-lg bg-transparent p-1 overflow-hidden"
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
            fill="var(--color-text-subtle)"
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
              fill="var(--color-text-muted)"
              fontSize="8"
              fontWeight="600"
              className="select-none font-sans"
            >
              {day ? String(day).substring(0, 3) : ''}
            </text>
          ))}

          {matrixData.map((rowArray, yIdx) =>
            rowArray.map((cellValue, xIdx) => {
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
                  fill="var(--color-chart-1)"
                  fillOpacity={blockOpacity}
                  className="cursor-crosshair transition-all duration-75 hover:stroke-white hover:stroke-[1.5]"
                  onMouseMove={(e) => {
                    const containerRect =
                      containerRef.current.getBoundingClientRect();

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
            })
          )}

          {xValues.map((hour, xIdx) => {
            if (hour % 3 !== 0) return null;

            return (
              <text
                key={hour}
                x={xIdx * 20 + 59}
                y={gridHeight + 12}
                textAnchor="middle"
                fill="var(--color-text-subtle)"
                fontSize="7.5"
                fontWeight="700"
                className="select-none font-mono"
              >
                {String(hour).padStart(2, "0")}h
              </text>
            );
          })}

          <text
            x={(gridWidth / 2) + 50}
            y={gridHeight + 32}
            textAnchor="middle"
            fill="var(--color-text-subtle)"
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
            className="pointer-events-none absolute z-50 rounded-lg border border-border bg-surface/90 backdrop-blur-sm p-2 text-[11px] text-white shadow-panel"
            style={{
              left: `${hoveredCell.left}px`,
              top: `${hoveredCell.top - 10}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="flex justify-between gap-4 font-bold text-text-primary">
              <span>{hoveredCell.yLabel}</span>
              <span className="font-mono text-chart-1">
                {hoveredCell.xLabel}
              </span>
            </div>

            <div className="mt-1 font-mono text-[12px] font-black text-chart-3">
              Value: {hoveredCell.value.toFixed(2)}
              <span className="ml-1 text-[9px] font-normal text-text-muted">
                {chartPayload?.unit || ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}