import { createProxy } from '@/src/app/api/_lib/proxy';

export const { GET, POST, PUT, PATCH, DELETE } = createProxy({ backend: 'CPCP', path: '/createTemplate', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] });

