/**
 * Analytics API - integrates with backend analytics endpoints (Admin only).
 */

import axiosInstance from './axios'

export async function getSummary() {
  const { data } = await axiosInstance.get('/api/analytics/summary')
  return data
}

export async function getTicketTrends(days = 30) {
  const { data } = await axiosInstance.get('/api/analytics/ticket-trends', { params: { days } })
  return data
}

export async function getLeaveAnalytics() {
  const { data } = await axiosInstance.get('/api/analytics/leave-analytics')
  return data
}

export async function getItWorkload() {
  const { data } = await axiosInstance.get('/api/analytics/it-workload')
  return data
}

export async function getSlaCompliance() {
  const { data } = await axiosInstance.get('/api/analytics/sla-compliance')
  return data
}
