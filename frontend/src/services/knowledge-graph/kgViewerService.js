"use client";
/**
 * kgViewerService.js — read-only client for the SAP PM Knowledge Graph demo.
 *
 * Talks to three local Next route handlers under /api/kg/* which forward to the
 * FastAPI service (see src/app/api/kg/*). No auth, no plant code.
 */
import { apiClient } from '../apiClient';

/** GET /graph/initial — seed graph. */
export const fetchInitialGraph = async () => {
    const res = await apiClient.get('/api/kg/initial');
    return res?.data || res;
};

// Client-side in-memory caches to make re-clicks and navigations 0.00ms instantaneous.
const _EXPAND_CLIENT_CACHE = new Map();
const _DETAILS_CLIENT_CACHE = new Map();

/** GET /graph/expand?node_id=<id> — parent + child neighbours of a node. */
export const expandGraphNode = async (nodeId) => {
    if (_EXPAND_CLIENT_CACHE.has(nodeId)) {
        return _EXPAND_CLIENT_CACHE.get(nodeId);
    }
    const res = await apiClient.get('/api/kg/expand', { params: { node_id: nodeId } });
    const data = res?.data || res;
    _EXPAND_CLIENT_CACHE.set(nodeId, data);
    return data;
};

/** GET /graph/node-details?node_id=<id> — a node's full property bag. */
export const fetchNodeDetails = async (nodeId) => {
    if (_DETAILS_CLIENT_CACHE.has(nodeId)) {
        return _DETAILS_CLIENT_CACHE.get(nodeId);
    }
    const res = await apiClient.get('/api/kg/node-details', { params: { node_id: nodeId } });
    const data = res?.data || res;
    _DETAILS_CLIENT_CACHE.set(nodeId, data);
    return data;
};

/** Optional: clear in-memory client caches on explicit user graph reload */
export const clearClientKgCaches = () => {
    _EXPAND_CLIENT_CACHE.clear();
    _DETAILS_CLIENT_CACHE.clear();
};
