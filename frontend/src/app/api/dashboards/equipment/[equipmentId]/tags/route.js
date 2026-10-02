import { createProxy } from '@/src/app/api/_lib/proxy';

export const { GET } = createProxy({ 
    backend: 'DASHBOARDS', 
    path: (params) => `/dashboard/equipment/${params.equipmentId}/tags`,
    methods: ['GET'] 
});
