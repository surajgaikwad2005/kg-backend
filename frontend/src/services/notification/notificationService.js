/**
 * notificationService.js
 * Pure async functions for the notification / observation workflow APIs
 * (industrial backend). Returns the parsed response body.
 */
import { apiClient } from '../apiClient';

/** All notification records. */
export const getAllNotifications = () => apiClient.get('/api/notification/notification-record');

/** Match a free-text observation against known notifications. */
export const matchObservation = (body) => apiClient.post('/api/notification/match-observation', body);

/** Generate a work order from a notification. */
export const generateWorkorder = (body) => apiClient.post('/api/notification/generate-workorder', body);

/** Generate (or fetch) a structured notification from an id/observation. */
export const generateNotification = (body) => apiClient.post('/api/notification/generate-notification', body);
