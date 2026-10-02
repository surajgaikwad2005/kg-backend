import { createProxy } from '@/src/app/api/_lib/proxy';

export const { POST } = createProxy({ backend: 'DASHBOARDS', path: '/dashboard/createDashboard', methods: ['POST'] });
