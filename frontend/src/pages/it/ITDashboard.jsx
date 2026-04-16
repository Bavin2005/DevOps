/**
 * ITDashboard - assigned tickets + status update.
 *
 * Fetches GET /api/tickets (IT sees all; filtered to assignedTo === current user).
 * Workload summary derived from filtered tickets.
 * Status update via PUT /api/tickets/update-status/:ticketId.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getTickets } from '../../api/ticketsApi'
import { updateTicketStatus } from '../../api/ticketsApi'
import CafeteriaWidget from '../../components/CafeteriaWidget'
import EmergencyContactsWidget from '../../components/EmergencyContactsWidget'
import TransportWidget from '../../components/TransportWidget'
import CelebrationsWidget from '../../components/CelebrationsWidget'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const STATUS_OPTIONS = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed']

function isAssignedToUser(ticket, userId) {
  if (!userId) return false
  const aid = ticket.assignedTo?._id?.toString?.() || ticket.assignedTo?.toString?.()
  return aid === userId.toString()
}

function ITDashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const userId = user?._id?.toString?.() || user?.id?.toString?.()
  const assignedTickets = tickets.filter((t) => isAssignedToUser(t, userId))

  const workload = {
    total: assignedTickets.length,
    inProgress: assignedTickets.filter((t) => t.status === 'In Progress').length,
    resolved: assignedTickets.filter((t) => t.status === 'Resolved').length,
    assigned: assignedTickets.filter((t) => t.status === 'Assigned').length,
  }

  const loadTickets = () => {
    setError(null)
    getTickets()
      .then(({ tickets: data }) => setTickets(data || []))
      .catch((err) => {
        const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load tickets'
        setError(msg)
        setTickets([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdatingId(ticketId)
    const prev = assignedTickets.find((t) => t._id === ticketId)

    setTickets((prevTickets) =>
      prevTickets.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t))
    )

    try {
      await updateTicketStatus(ticketId, newStatus)
      toast.success('Status updated')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Update failed'
      setError(msg)
      toast.error(msg)
      if (prev) {
        setTickets((prevTickets) =>
          prevTickets.map((t) => (t._id === ticketId ? { ...t, status: prev.status } : t))
        )
      }
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg
          className="h-10 w-10 animate-spin text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-sm text-slate-500">Loading tickets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            IT Dashboard
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Welcome, {user?.name}. Manage your assigned tickets.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-stretch">
          <CafeteriaWidget />
          <EmergencyContactsWidget />
          <TransportWidget />
          <CelebrationsWidget />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Workload summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Assigned to Me</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{workload.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">In Progress</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{workload.inProgress}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Resolved</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{workload.resolved}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Awaiting Start</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{workload.assigned}</p>
        </div>
      </div>

      {/* Assigned tickets table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">My Assigned Tickets</h2>
          <p className="text-sm text-slate-500">Update status as you work</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {assignedTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No tickets assigned to you yet
                  </td>
                </tr>
              ) : (
                assignedTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/tickets/${ticket._id}`}
                        className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ticket.category}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ticket.priority}</td>
                    <td className="px-4 py-3">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                        disabled={updatingId === ticket._id}
                        className="
                          rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700
                          focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
                          disabled:opacity-50
                        "
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {updatingId === ticket._id && (
                        <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(ticket.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ITDashboard
