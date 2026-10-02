import { createProxy } from '@/src/app/api/_lib/proxy';

export const { PUT } = createProxy({ 
    backend: 'DASHBOARDS', 
    path: (params) => `/dashboard/editVisual/${params.visual_id}`,
    methods: ['PUT'] 
});
