'use client';
import React from 'react';
import { useDashboardCreate } from './_hooks/useDashboardCreate';
import { BuilderTopbar } from './_components/BuilderTopbar';
import { ConfigPanel } from './_components/ConfigPanel';
import { PreviewArea } from './_components/PreviewArea';
import { RightPanel } from './_components/RightPanel';
import { BottomBar } from './_components/BottomBar';

export default function CreateDashboardPage() {
  const p = useDashboardCreate();

  return (
    <div className="flex flex-col h-screen font-sans bg-canvas text-text-primary text-sm leading-relaxed antialiased">
      <BuilderTopbar
        title={p.title} onTitleChange={p.setTitle}
        onDiscard={() => p.router.push('/dashboards')}
        onSave={p.handleSave} saveStatus={p.saveStatus}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ConfigPanel
          chartType={p.chartType} setChartType={p.setChartType}
          aggregation={p.aggregation} setAggregation={p.setAggregation}
          interval={p.interval} setInterval={p.setInterval}
          metricA={p.metricA} onMetricAChange={p.setMetricA}
          metricB={p.metricB} onMetricBChange={p.setMetricB}
          metricsList={p.metricsList}
        />
        
        <PreviewArea
          chartData={p.chartData} isLoadingData={p.isLoadingData}
          chartType={p.chartType}
          showGrid={p.showGrid} showLegend={p.showLegend} showLabels={p.showLabels}
          crosshair={p.crosshair} leftAxis={p.leftAxis} rightAxis={p.rightAxis}
          scaleMode={p.scaleMode} lineThickness={p.lineThickness} fillOpacity={p.fillOpacity}
          colors={p.colors} thresholds={p.thresholds} stats={p.stats}
          metricALabel={p.metricALabel} metricBLabel={p.metricBLabel} interval={p.interval}
        />
        
        <RightPanel
          scaleMode={p.scaleMode} setScaleMode={p.setScaleMode}
          showLabels={p.showLabels} setShowLabels={p.setShowLabels}
          showGrid={p.showGrid} setShowGrid={p.setShowGrid}
          showLegend={p.showLegend} setShowLegend={p.setShowLegend}
          crosshair={p.crosshair} setCrosshair={p.setCrosshair}
          autoScale={p.autoScale} setAutoScale={p.setAutoScale}
          leftAxis={p.leftAxis} setLeftAxis={p.setLeftAxis}
          rightAxis={p.rightAxis} setRightAxis={p.setRightAxis}
          lineThickness={p.lineThickness} setLineThickness={p.setLineThickness}
          fillOpacity={p.fillOpacity} setFillOpacity={p.setFillOpacity}
          colorScheme={p.colorScheme} setColorScheme={p.setColorScheme}
          thresholds={p.thresholds} setThresholds={p.setThresholds}
        />
      </div>

      <BottomBar 
        tags={p.tags} 
        setTags={p.setTags} 
        onSave={p.handleSave} 
        saveStatus={p.saveStatus} 
        stats={p.stats} 
      />
    </div>
  );
}
