import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { applyLeave, getLeaveBalance } from '../../api/leaveApi'

const LEAVE_TYPES = ['Annual', 'Sick', 'Personal', 'Unpaid']

function ApplyLeave() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    type: 'Annual',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(true)

  useEffect(() => {
    getLeaveBalance()
      .then(setBalance)
      .catch(() => setBalance({ annual: 20, sick: 10, personal: 5 }))
      .finally(() => setLoadingBalance(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.startDate || !form.endDate) {
      toast.error('Please select start and end dates')
      return
    }
    setLoading(true)
    try {
      await applyLeave(form)
      toast.success('Leave applied successfully')
      navigate('/leaves')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to apply leave'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const bal = balance || { annual: 20, sick: 10, personal: 5 }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Apply for Leave</h1>

      {!loadingBalance && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Leave Balance
          </h2>
          <div className="mt-2 flex gap-6">
            <span className="text-slate-700">Annual: <strong>{bal.annual ?? 20}</strong> days</span>
            <span className="text-slate-700">Sick: <strong>{bal.sick ?? 10}</strong> days</span>
            <span className="text-slate-700">Personal: <strong>{bal.personal ?? 5}</strong> days</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Leave Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Reason (optional)</label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={3}
            placeholder="Brief reason for leave"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Applying...' : 'Apply Leave'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/leaves')}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ApplyLeave
