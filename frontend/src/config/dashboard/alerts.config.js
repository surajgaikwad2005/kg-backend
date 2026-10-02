/**
 * Configuration settings and business rules for Industrial Alert feeds.
 * Isolates and decouples specific domain rules from generic components.
 */
export const ALERTS_CONFIG = {
    // Assets that require critical state enforcement for operational prioritizations
    prioritizedParameters: ['CPCP2', 'CPCP4'],
    
    // Default limit of recent alerts to retrieve
    fetchLimit: 15,
    
    // Sort priority mapping (lower index is sorted higher)
    statusOrder: ['critical', 'warning', 'info']
};

/**
 * Checks and forces critical status for specific high-priority parameters.
 * 
 * @param {Object} alert - The raw alert item from the stream
 * @returns {Object} Adjusted alert item with appropriate severity status
 */
export function processAlertPriority(alert) {
    const param = (alert.data?.parameter || '').toUpperCase();
    if (ALERTS_CONFIG.prioritizedParameters.includes(param)) {
        return {
            ...alert,
            data: {
                ...alert.data,
                status: 'critical'
            }
        };
    }
    return alert;
}
