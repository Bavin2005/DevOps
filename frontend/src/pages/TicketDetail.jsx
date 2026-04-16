/**
 * TicketDetail - full ticket view.
 *
 * - Employee: view own ticket, read-only
 * - IT/Admin: view any ticket, status update
 * - Admin: assign ticket
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getTicket, assignTicket, updateTicketStatus } from '../api/ticketsApi'
import { getItStaff } from '../api/usersApi'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

function priorityBadgeColor(priority) {
  const map = {
    Low: 'bg-slate-100 text-slate-600',
    Medium: 'bg-blue-50 text-blue-700',
    High: 'bg-red-100 text-red-700',
  }
  return map[priority] || 'bg-slate-100 text-slate-600'
}

const STATUS_OPTIONS = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed']

function TicketDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [itStaff, setItStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [assigning, setAssigning] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const role = user?.role
  const isAdmin = role === 'Admin'
  const isIT = role === 'IT'
  const canEdit = isAdmin || isIT

  const backPath = role === 'Employee' ? '/tickets' : role === 'IT' ? '/it' : '/admin'

  useEffect(() => {
    let cancelled = false
    setError(null)
    setLoading(true)

    Promise.all([
      getTicket(id),
      isAdmin ? getItStaff() : Promise.resolve([])
    ])
      .then(([t, staff]) => {
        if (!cancelled) {
          setTicket(t)
          setItStaff(staff || [])
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err.response?.data?.message || err.message || 'Failed to load ticket'
          setError(msg)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id, isAdmin])

  const handleAssign = async (assignedTo) => {
    if (!assignedTo) return
    setAssigning(true)
    try {
      const { ticket: updated } = await assignTicket(id, assignedTo)
      setTicket(updated)
      toast.success('Ticket assigned successfully')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Assignment failed'
      toast.error(msg)
    } finally {
      setAssigning(false)
    }
  }

  const handleStatusChange = async (status) => {
    setUpdatingStatus(true)
    const prev = ticket?.status
    setTicket((t) => t ? { ...t, status } : null)
    try {
      const { ticket: updated } = await updateTicketStatus(id, status)
      setTicket(updated)
      toast.success('Status updated')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Update failed'
      toast.error(msg)
      setTicket((t) => t ? { ...t, status: prev } : null)
    } finally {
      setUpdatingStatus(false)
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
        <p className="mt-4 text-sm text-slate-500">Loading ticket...</p>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="space-y-6">
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Ticket not found'}
        </div>
      </div>
    )
  }

  const assignedToId = ticket.assignedTo?._id?.toString?.() || ticket.assignedTo?.toString?.() || ''

  return (
    <div className="space-y-6">
      <Link
        to={backPath}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
              <p className="mt-1 text-sm text-slate-500">
                Created {formatDate(ticket.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeColor(ticket.status)}`}
              >
                {ticket.status}
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${priorityBadgeColor(ticket.priority)}`}
              >
                {ticket.priority}
              </span>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {ticket.category}
              </span>
              {ticket.slaBreached && (
                <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  SLA Breached
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{ticket.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                SLA Deadline
              </h2>
              <p className="mt-1 text-slate-700">{formatDate(ticket.slaDeadline)}</p>
            </div>
            {ticket.assignedTo && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Assigned To
                </h2>
                <p className="mt-1 text-slate-700">
                  {ticket.assignedTo?.name || '—'}
                </p>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="flex flex-wrap gap-6 border-t border-slate-200 pt-6">
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Assign to IT</label>
                  <select
                    value={assignedToId}
                    onChange={(e) => handleAssign(e.target.value || null)}
                    disabled={assigning}
                    className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <option value="">— Select IT —</option>
                    {itStaff.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {assigning && (
                    <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {updatingStatus && (
                  <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketDetail
