'use client';
import React, { Suspense, useCallback, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Building2, LayoutGrid } from 'lucide-react';
import { DesignerHeader } from './_components/DesignerHeader';
import { CategorySidebar } from './_components/CategorySidebar';
import { GridCanvas } from './_components/GridCanvas';
import { useTemplateDesigner } from './_hooks/useTemplateDesigner';

export default function TemplateDesignerPage() {
    return (
        <Suspense>
            <TemplateDesignerContent />
        </Suspense>
    );
}

function TemplateDesignerContent() {
    const params = useParams();
    const searchParams = useSearchParams();

    const {
        categories,
        categoriesLoading,
        categoriesError,
        activeCategory,
        setActiveCategory,
        activeWidgets,
        activeGridSize,
        resizeGrid,
        occupiedCells,
        placedTypeIds,
        assignWidget,
        removeWidget,
        activeCounts,
        widgetCatalog,
        templateMeta,
        saving,
        saveSnapshot,
        isDirty,
        clearCategory,
        noPlantSelected,
    } = useTemplateDesigner(params.templateId);

    // viewWorkflow's response (templateMeta) is the canonical name — falls back to
    // the ?name= query string (set when navigating from the list) and finally the
    // raw id, so a direct URL visit/refresh never shows a blank title.
    const templateName = templateMeta?.template_name || searchParams.get('name') || `Template ${params.templateId}`;

    // Below lg the category list is an overlay drawer instead of a fixed
    // column, matching the same responsive pattern as the Workflow Builder's
    // (Modify) template palette — desktop keeps it always-open.
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    const handleSelectCategory = useCallback((key) => {
        setActiveCategory(key);
        setSidebarOpen(false);
    }, [setActiveCategory]);

    return (
        <>
            <DesignerHeader
                templateName={templateName}
                onSave={saveSnapshot}
                saving={saving}
                isDirty={isDirty}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((v) => !v)}
            />
            <div className="flex-1 flex overflow-hidden min-h-0 relative">
                <div
                    className={`absolute inset-y-0 left-0 z-20 transition-transform duration-base ease-default lg:static lg:translate-x-0 lg:z-auto ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <CategorySidebar
                        categories={categories}
                        loading={categoriesLoading}
                        error={categoriesError}
                        activeCategory={activeCategory}
                        onSelect={handleSelectCategory}
                        activeCounts={activeCounts}
                        noPlantSelected={noPlantSelected}
                    />
                </div>
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Close category list"
                        onClick={closeSidebar}
                        className="absolute inset-0 z-10 bg-overlay/40 backdrop-blur-xs lg:hidden cursor-pointer"
                    />
                )}

                <div className="flex-1 overflow-auto thin-scrollbar p-6 md:p-8 min-w-0">
                    {categoriesLoading ? (
                        <div className="grid grid-cols-5 auto-rows-[8rem] gap-4 min-w-220">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div key={i} className="rounded-2xl bg-surface-2 skeleton-shimmer" />
                            ))}
                        </div>
                    ) : noPlantSelected ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                            <Building2 className="w-10 h-10 text-text-subtle" />
                            <p className="text-sm font-semibold text-text-primary">No plant selected</p>
                            <p className="text-xs text-text-secondary max-w-xs">
                                Select a plant code to design this template&apos;s layout.
                            </p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                            <LayoutGrid className="w-10 h-10 text-text-subtle" />
                            <p className="text-sm font-semibold text-text-primary">No categories configured</p>
                            <p className="text-xs text-text-secondary max-w-xs">
                                This plant has no template categories yet. Once they&apos;re configured on the backend, they&apos;ll appear here to design.
                            </p>
                        </div>
                    ) : (
                        <GridCanvas
                            widgets={activeWidgets}
                            gridSize={activeGridSize}
                            onResize={resizeGrid}
                            onClear={clearCategory}
                            occupiedCells={occupiedCells}
                            placedTypeIds={placedTypeIds}
                            onAssign={assignWidget}
                            onRemove={removeWidget}
                            widgetCatalog={widgetCatalog}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
