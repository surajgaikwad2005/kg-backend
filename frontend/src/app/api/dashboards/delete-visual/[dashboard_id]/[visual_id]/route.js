import { createProxy } from '@/src/app/api/_lib/proxy';

export const { DELETE } = createProxy({ 
    backend: 'DASHBOARDS', 
    path: (params) => `/dashboard/deleteVisual/${params.dashboard_id}/${params.visual_id}`,
    methods: ['DELETE'] 
});
