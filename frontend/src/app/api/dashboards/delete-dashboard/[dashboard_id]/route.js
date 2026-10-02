import { createProxy } from '@/src/app/api/_lib/proxy';

export const { DELETE } = createProxy({ 
    backend: 'DASHBOARDS', 
    path: (params) => `/dashboard/deleteDashboard/${params.dashboard_id}`,
    methods: ['DELETE'] 
});
