/**
 * knowledgeGraphChatService.js
 * Knowledge-graph batch writes + chat for the P&ID Ontology Generator, via the
 * local `/api/domain-configuration/pnid/knowledge-graph/*` proxy (owned by the
 * PNID domain — separate from the dashboard KG Explorer's `/api/knowledge-graph/*`).
 *
 * The update payload is an array of operations, each either:
 *   { type: 'node', action: 'upsert'|'delete', ... }
 *   { type: 'relationship', action: 'upsert'|'delete', ... }
 *
 * Kept distinct from src/services/knowledge-graph/knowledgeGraphService.js
 * (different API shape: object-with-methods vs named exports) because the
 * P&ID validate flow also needs the chat endpoint, which that module doesn't expose.
 */
import { apiClient } from "../../apiClient";

/**
 * `plantCode` is now a required FIRST argument on both methods.
 *
 * Both previously read `localStorage.admin_plant_id` directly via a
 * `getStoredPlantCode()` helper. That broke the rule that services stay pure
 * (they never read context or ambient state) and, more importantly, made the
 * plant an invisible input: nothing keyed on it could be cached correctly,
 * because two calls that look identical could target different plants.
 * Callers thread it down from `useApp().plantCode` like every other service.
 */
export const knowledgeGraphService = {
    /** Apply a batch of node/relationship upsert/delete operations. */
    update(plantCode, operations) {
        const activeOperations = Array.isArray(operations)
            ? operations.map(op => {
                const mappedOp = {
                    ...op,
                    plant_code_id: plantCode,
                };
                if (op.properties) {
                    mappedOp.properties = {
                        ...op.properties
                    };
                }
                return mappedOp;
            })
            : operations;

        return apiClient.post("/api/domain-configuration/pnid/knowledge-graph/update", activeOperations);
    },

    /**
     * Ask a natural-language question about the knowledge graph.
     * @param {string} plantCode    plant code id (required — see the note above)
     * @param {string} message      the user's question
     * @param {Array}  [history]    prior turns ([{ role, content }, ...])
     * @param {object} [opts]       passed to apiClient (e.g. { signal } to abort)
     * @returns the backend's answer payload (commonly { response | answer }).
     */
    ask(plantCode, message, history = [], opts) {
        const body = {
            message,
            history,
            plant_code_id: plantCode,
        };
        return apiClient.post("/api/domain-configuration/pnid/knowledge-graph/chat", body, opts);
    },
};
