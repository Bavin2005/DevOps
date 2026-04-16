/**
 * Notification API - fetch and manage user notifications.
 */

import axios from './axios'

export function getNotifications() {
  return axios.get('/api/notifications').then((res) => res.data)
}

export function markNotificationRead(id) {
  return axios.put(`/api/notifications/mark-read/${id}`).then((res) => res.data)
}
