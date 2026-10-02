'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { assetConfigService } from '@/src/services/decision-template/assetConfigService';
import { getCurrentUsername } from '@/src/lib/currentUser';

/**
 * assetConfigOption returns `features` in TWO different shapes and the response
 * does not label which one you got — you have to detect it:
 *
 *   UNCONFIGURED (live-verified 2026-08-03) — the groups ARE `features`:
 *     features: {
 *       template_selection: { name, description, configurations: [...] },
 *       observe:            { name, description, configurations: [...] },
 *     }
 *
 *   CONFIGURED (contract-table sample) — the groups sit under `features.config`,
 *   and `features` itself carries the saved record's metadata:
 *     features: {
 *       config_id, template_id, asset_id, created_by, created_at, updated_at,
 *       config: { template_selection: { configurations: [...] } },
 *     }
 *
 * So: prefer `features.config` when present, otherwise treat `features` as the
 * group map. The `Array.isArray(configurations)` test is what actually keeps the
 * metadata scalars out, so a new metadata key on the backend can't leak in as a
 * bogus empty section.
 */
const extractConfigGroups = (features) => {
    if (!features || typeof features !== 'object') return {};
    const source = features.config && typeof features.config === 'object' ? features.config : features;
    return Object.fromEntries(
        Object.entries(source).filter(
            ([, group]) => group && typeof group === 'object' && Array.isArray(group.configurations),
        ),
    );
};

/**
 * useAssetConfig — the whole asset-configuration workflow in one hook:
 * check status → fetch the config form schema (assetConfigOption returns a
 * default template-selection field if the asset isn't configured yet, or the
 * full saved config if it is) → edit → save.
 *
 * Asset-centric (asset_id + plant_code_id only) — no template_id input, see
 * api-data/decision-template.json for why.
 *
 * NOTE ON PLACEMENT: this lives in src/hooks/ rather than beside the admin
 * Decision Templates page because two unrelated routes drive it now — the
 * admin "Configure Asset" modal (user types an asset ID, then presses Load)
 * and /asset-config/[assetId] (asset ID arrives in the URL from a right-click
 * on the home diagram, so it must load on mount). The two modes are the
 * `autoLoad` option; everything else is identical.
 *
 * The service it calls stays in services/decision-template/ regardless of the
 * caller: services are organised by BACKEND domain (this hits DECISION_TEMPLATE's
 * /p1/decisionModel/assetconfig/*), not by which page consumes them.
 *
 * @param {{ initialAssetId?: string, autoLoad?: boolean }} [options]
 */
export function useAssetConfig({ initialAssetId = '', autoLoad = false } = {}) {
    const { plantCode } = useApp();
    const toast = useToast();

    // Page mode's identifier lives in the URL, so it is DERIVED, not mirrored into
    // state: navigating /asset-config/A -> /asset-config/B reuses this hook
    // instance, and a derived value flows straight through — no state-sync effect,
    // no render where the id is still A. Modal mode owns a real editable field.
    const [typedAssetId, setTypedAssetId] = useState(initialAssetId);
    const assetId = autoLoad ? initialAssetId : typedAssetId;

    const [phase, setPhase] = useState('idle'); // idle | loading | ready | error
    const [error, setError] = useState(null);
    const [alreadyConfigured, setAlreadyConfigured] = useState(false);
    // { [groupKey]: { name?, description?, configurations: [{ ...field, userValue }] } }
    // The group's own `name`/`description` come straight from the backend and are
    // what the section headers render — never a humanized version of the key.
    const [configGroups, setConfigGroups] = useState({});
    const [saving, setSaving] = useState(false);

    // Drops a slower earlier response (e.g. the previous plant, or the previous
    // asset when the route param changes mid-flight) so it can't overwrite a
    // newer one — same guard useDashboardDiagram uses.
    const requestRef = useRef(0);

    const loadConfig = useCallback(async () => {
        const trimmedId = assetId.trim();
        if (!trimmedId || !plantCode) return;

        const requestId = ++requestRef.current;
        const isStale = () => requestId !== requestRef.current;

        setPhase('loading');
        setError(null);
        setAlreadyConfigured(false);

        try {
            const checkResult = await assetConfigService.checkAssetConfig(plantCode, trimmedId).catch(() => null);
            if (isStale()) return;
            const configured = Boolean(checkResult?.data?.config_id ?? checkResult?.config_id);

            const optionResult = await assetConfigService.getAssetConfigOptions(plantCode, trimmedId);
            if (isStale()) return;
            // The service already unwraps {success,message,data}; the `?.data`
            // branch is the belt-and-braces path for an un-enveloped response.
            const features = optionResult?.features ?? optionResult?.data?.features;
            const groups = extractConfigGroups(features);

            // Every group is kept whole (name/description included) so the section
            // headers can render the backend's own copy and so save() can echo the
            // schema back unchanged apart from the edited values.
            const seeded = Object.fromEntries(
                Object.entries(groups).map(([groupKey, group]) => [
                    groupKey,
                    { ...group, configurations: group.configurations.map((c) => ({ ...c, userValue: c.default })) },
                ])
            );
            setAlreadyConfigured(configured);
            setConfigGroups(seeded);
            setPhase('ready');
        } catch (err) {
            if (isStale()) return;
            setError(err?.message || 'Failed to load configuration options for this asset.');
            setPhase('error');
        }
    }, [assetId, plantCode]);

    // Page mode: the identifier comes from the URL, so there is no "Load" button
    // to press. Re-runs on asset/plant change because loadConfig is keyed to both.
    useEffect(() => {
        if (!autoLoad) return;
        loadConfig();
    }, [autoLoad, loadConfig]);

    const updateFieldValue = useCallback((groupKey, index, newValue) => {
        setConfigGroups((prev) => {
            const group = prev[groupKey];
            if (!group) return prev;
            const configurations = [...group.configurations];
            configurations[index] = { ...configurations[index], userValue: newValue };
            return { ...prev, [groupKey]: { ...group, configurations } };
        });
    }, []);

    const save = useCallback(async () => {
        const trimmedId = assetId.trim();
        if (!trimmedId || !plantCode) return false;

        setSaving(true);
        try {
            // "the filled config schema returned by assetConfigOption" — so the
            // group is echoed back whole (name/description and any future keys
            // intact); only `userValue` is folded into `default` and dropped.
            const data = Object.fromEntries(
                Object.entries(configGroups).map(([groupKey, group]) => [
                    groupKey,
                    {
                        ...group,
                        configurations: group.configurations.map((c) => {
                            const saved = { ...c };
                            if (saved.userValue !== undefined && saved.userValue !== '') {
                                saved.default = saved.userValue;
                            }
                            delete saved.userValue;
                            return saved;
                        }),
                    },
                ])
            );

            await assetConfigService.createAssetConfig(plantCode, {
                assetId: trimmedId,
                createdBy: getCurrentUsername(),
                config: data,
            });
            setAlreadyConfigured(true);
            toast.success('Asset configuration saved', `${trimmedId} has been configured successfully.`);
            return true;
        } catch (err) {
            toast.error(err?.message || 'Failed to save asset configuration.');
            return false;
        } finally {
            setSaving(false);
        }
    }, [assetId, plantCode, configGroups, toast]);

    const reset = useCallback(() => {
        requestRef.current += 1; // orphan any in-flight load
        setTypedAssetId(initialAssetId);
        setPhase('idle');
        setError(null);
        setAlreadyConfigured(false);
        setConfigGroups({});
        setSaving(false);
    }, [initialAssetId]);

    return {
        assetId,
        setAssetId: setTypedAssetId,
        phase,
        error,
        alreadyConfigured,
        configGroups,
        loadConfig,
        updateFieldValue,
        saving,
        save,
        reset,
    };
}
