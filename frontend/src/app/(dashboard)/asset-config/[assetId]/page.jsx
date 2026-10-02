'use client';
import React, { useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { AssetConfigForm } from '@/src/components/asset-config/AssetConfigForm';
import { useAssetConfig } from '@/src/hooks/asset-config/useAssetConfig';
import { AssetConfigHeader } from './_components/AssetConfigHeader';

/**
 * /asset-config/[assetId] — full-page asset configuration.
 *
 * Reached by right-clicking an equipment node on /home and choosing
 * "Configure <label>"; the node's label IS the asset id (the CPCP diagram
 * contract returns only `{ id, data: { label, componentType } }` per node —
 * `id` is a synthetic `node_1`-style key and there is no asset field, see
 * api-data/cpcp-configuration.json → loadDiagram).
 *
 * Same hook + same field renderer as the admin "Configure Asset" modal; the
 * only difference is that the id arrives in the URL, so the form loads on
 * mount (`autoLoad`) instead of behind a Load button.
 */
export default function AssetConfigPage() {
    const params = useParams();
    const { plantCode } = useApp();

    const assetId = useMemo(() => {
        try {
            return decodeURIComponent(params.assetId ?? '');
        } catch {
            return String(params.assetId ?? '');
        }
    }, [params.assetId]);

    const {
        phase,
        error,
        alreadyConfigured,
        configGroups,
        updateFieldValue,
        saving,
        save,
    } = useAssetConfig({ initialAssetId: assetId, autoLoad: true });

    const handleSave = useCallback(() => { save(); }, [save]);

    return (
        <>
            <AssetConfigHeader
                assetId={assetId}
                onSave={handleSave}
                saving={saving}
                canSave={phase === 'ready'}
            />

            <div className="flex-1 overflow-y-auto thin-scrollbar p-4 sm:p-6 lg:p-8 min-h-0">
                {!plantCode ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                        <Building2 className="w-10 h-10 text-text-subtle" />
                        <p className="text-sm font-semibold text-text-primary">No plant selected</p>
                        <p className="text-xs text-text-secondary max-w-xs">
                            Select a plant code to load this asset&apos;s configuration.
                        </p>
                    </div>
                ) : (
                    <div className="mx-auto w-full max-w-3xl">
                        <AssetConfigForm
                            assetId={assetId}
                            phase={phase}
                            error={error}
                            alreadyConfigured={alreadyConfigured}
                            configGroups={configGroups}
                            onFieldChange={updateFieldValue}
                            variant="cards"
                        />
                    </div>
                )}
            </div>
        </>
    );
}
