import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getLeaves, decideLeave } from '../../api/leaveApi'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function LeaveApprovals() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [decidingId, setDecidingId] = useState(null)
  const [rejectReason, setRejectReason] = useState({})

  const loadLeaves = () => {
    setError(null)
    getLeaves()
      .then(({ leaves: data }) => setLeaves(data || []))
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load leaves')
        setLeaves([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLeaves()
  }, [])

  const pending = leaves.filter((l) => l.status === 'Pending')

  const handleDecision = async (leaveId, status) => {
    setDecidingId(leaveId)
    const reason = status === 'Rejected' ? rejectReason[leaveId] : undefined
    try {
      await decideLeave(leaveId, status, reason)
      toast.success(`Leave ${status.toLowerCase()}`)
      loadLeaves()
      setRejectReason((prev) => ({ ...prev, [leaveId]: '' }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave')
    } finally {
      setDecidingId(null)
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

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Leave Approvals</h2>
      <p className="text-sm text-slate-500">
        {pending.length} leave request{pending.length !== 1 ? 's' : ''} pending approval
      </p>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Dates</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No pending leave requests
                  </td>
                </tr>
              ) : (
                pending.map((leave) => {
                  const u = leave.userId || {}
                  return (
                    <tr key={leave._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{u.name || '—'}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{leave.type}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{leave.reason || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Rejection reason (if rejecting)"
                            value={rejectReason[leave._id] || ''}
                            onChange={(e) =>
                              setRejectReason((prev) => ({ ...prev, [leave._id]: e.target.value }))
                            }
                            className="w-full max-w-xs rounded border border-slate-300 px-2 py-1.5 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDecision(leave._id, 'Approved')}
                              disabled={decidingId === leave._id}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecision(leave._id, 'Rejected')}
                              disabled={decidingId === leave._id}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                            {decidingId === leave._id && (
                              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LeaveApprovals
