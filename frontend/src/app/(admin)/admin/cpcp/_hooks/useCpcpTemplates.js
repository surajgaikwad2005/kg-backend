'use client';

import { useEffect, useState } from 'react';
import { readTemplates } from '../_lib/templateStore';

/**
 * Backs the CPCP Operations home list. Reads the locally-persisted template
 * list (see templateStore.js) on mount — swap for a `cpcpService.getTemplates()`
 * call once the backend endpoint exists.
 */
export function useCpcpTemplates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTemplates(readTemplates());
        setLoading(false);
    }, []);

    return { templates, loading };
}
