/**
 * AdminDashboard - analytics summary + ticket management.
 *
 * Fetches real data from:
 * - GET /api/analytics/summary (Total, Open, SLA Breached, SLA Met %)
 * - GET /api/tickets (all tickets)
 * - GET /api/users/it-staff (IT users for assign dropdown)
 *
 * Admin can assign tickets to IT users via PUT /api/tickets/assign/:ticketId.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getSummary } from '../../api/analyticsApi'
import CafeteriaWidget from '../../components/CafeteriaWidget'
import EmergencyContactsWidget from '../../components/EmergencyContactsWidget'
import TransportWidget from '../../components/TransportWidget'
import CelebrationsWidget from '../../components/CelebrationsWidget'
import AdminTickets from './AdminTickets'
import LeaveApprovals from '../leave/LeaveApprovals'

function getStatusCount(ticketsByStatus, status) {
  const item = (ticketsByStatus || []).find((s) => s._id === status)
  return item?.count ?? 0
}

function AdminDashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    setLoading(true)

    getSummary()
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err.response?.data?.message || err.message || 'Failed to load analytics'
          setError(msg)
          setSummary(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const openCount = summary?.ticketsByStatus ? getStatusCount(summary.ticketsByStatus, 'Open') : 0
  const slaMetPercent =
    summary && summary.totalTickets > 0
      ? Math.round(((summary.totalTickets - (summary.slaBreached || 0)) / summary.totalTickets) * 100)
      : 100

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Welcome, {user?.name}. Analytics and ticket management.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-stretch">
          <CafeteriaWidget />
          <EmergencyContactsWidget />
          <TransportWidget />
          <CelebrationsWidget />
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <svg
            className="h-10 w-10 animate-spin text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-sm text-slate-500">Loading analytics...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Tickets</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalTickets}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Open Tickets</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{openCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">SLA Breached</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{summary.slaBreached ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">SLA Met %</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{slaMetPercent}%</p>
          </div>
        </div>
      )}

      {/* Ticket Management - always shown so Admin can manage tickets even if analytics fails */}
      {!loading && <AdminTickets />}

      {/* Leave Approvals */}
      {!loading && <LeaveApprovals />}
    </div>
  )
}

export default AdminDashboard
