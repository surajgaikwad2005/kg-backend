import { createProxy } from '@/src/app/api/_lib/proxy';

export const { GET } = createProxy({ 
    backend: 'DASHBOARDS', 
    path: (params) => `/dashboard/viewDashboard/${params.dashboard_id}`,
    methods: ['GET'] 
});
