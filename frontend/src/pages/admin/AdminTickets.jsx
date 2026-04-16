/**
 * AdminTickets - table of all tickets with assign-to-IT dropdown.
 *
 * Fetches GET /api/tickets (Admin sees all) and GET /api/users/it-staff.
 * Assigns via PUT /api/tickets/assign/:ticketId with optimistic UI update.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getTickets } from '../../api/ticketsApi'
import { getItStaff } from '../../api/usersApi'
import { assignTicket } from '../../api/ticketsApi'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusBadgeColor(status) {
  const map = {
    Open: 'bg-slate-100 text-slate-700',
    Assigned: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    Resolved: 'bg-emerald-100 text-emerald-700',
    Closed: 'bg-slate-200 text-slate-600',
  }
  return map[status] || 'bg-slate-100 text-slate-700'
}

function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [itStaff, setItStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [assigningId, setAssigningId] = useState(null)

  const loadData = () => {
    setError(null)
    Promise.all([getTickets(), getItStaff()])
      .then(([ticketRes, staff]) => {
        setTickets(ticketRes.tickets || [])
        setItStaff(staff)
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Failed to load data'
        setError(msg)
        setTickets([])
        setItStaff([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAssign = async (ticketId, assignedTo) => {
    if (!assignedTo) return
    setAssigningId(ticketId)

    const prevTickets = [...tickets]
    const idx = prevTickets.findIndex((t) => t._id === ticketId)
    if (idx >= 0) {
      const staff = itStaff.find((u) => u._id === assignedTo)
      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId
            ? { ...t, assignedTo, status: 'Assigned', assignedToName: staff?.name }
            : t
        )
      )
    }

    try {
      await assignTicket(ticketId, assignedTo)
      toast.success('Ticket assigned successfully')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Assignment failed'
      setError(msg)
      toast.error(msg)
      setTickets(prevTickets)
    } finally {
      setAssigningId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (error && tickets.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Ticket Management</h2>
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-slate-900">Ticket Management</h2>
        <p className="text-sm text-slate-500">Assign tickets to IT staff</p>
      </div>

      {error && (
        <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Assign To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No tickets yet
                </td>
              </tr>
            ) : (
                tickets.map((ticket) => (
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
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeColor(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={
                        ticket.assignedTo?._id?.toString?.() ||
                        ticket.assignedTo?.toString?.() ||
                        ''
                      }
                      onChange={(e) => handleAssign(ticket._id, e.target.value || null)}
                      disabled={assigningId === ticket._id}
                      className="
                        rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700
                        focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
                        disabled:opacity-50
                      "
                    >
                      <option value="">— Select IT —</option>
                      {itStaff.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    {assigningId === ticket._id && (
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
  )
}

export default AdminTickets
