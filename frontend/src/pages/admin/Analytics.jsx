import { useState, useEffect } from 'react'
import {
  getSummary,
  getTicketTrends,
  getLeaveAnalytics,
  getItWorkload,
  getSlaCompliance,
} from '../../api/analyticsApi'

function getCount(arr, id) {
  return (arr || []).find((x) => x._id === id)?.count ?? 0
}

function Analytics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [leaveAnalytics, setLeaveAnalytics] = useState(null)
  const [workload, setWorkload] = useState([])
  const [sla, setSla] = useState(null)

  useEffect(() => {
    setError(null)
    setLoading(true)
    Promise.all([
      getSummary(),
      getTicketTrends(30),
      getLeaveAnalytics(),
      getItWorkload(),
      getSlaCompliance(),
    ])
      .then(([s, t, l, w, slaRes]) => {
        setSummary(s)
        setTrends(t?.trends || [])
        setLeaveAnalytics(l)
        setWorkload(w?.workload || [])
        setSla(slaRes)
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load analytics')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg className="h-10 w-10 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Tickets, SLA, leave, and IT workload trends
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tickets</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{summary.totalTickets}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">SLA Breached</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{summary.slaBreached ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">SLA Met %</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{sla?.compliancePercentage ?? 100}%</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Leave Approval Rate</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{leaveAnalytics?.approvalRate ?? 0}%</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tickets by category */}
        {summary?.ticketsByCategory?.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Tickets by Category</h2>
            <div className="mt-4 space-y-3">
              {summary.ticketsByCategory.map((c) => (
                <div key={c._id} className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">{c._id}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tickets by status */}
        {summary?.ticketsByStatus?.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Tickets by Status</h2>
            <div className="mt-4 space-y-3">
              {summary.ticketsByStatus.map((s) => (
                <div key={s._id} className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">{s._id}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ticket trends */}
        {trends.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
            <h2 className="font-semibold text-slate-900 dark:text-white">Ticket Trend (Last 30 Days)</h2>
            <div className="mt-4 flex items-end gap-1 h-32">
              {trends.map((t) => {
                const maxCount = trends.length ? Math.max(...trends.map((x) => x.count), 1) : 1
                const height = Math.max(8, (t.count / maxCount) * 100)
                return (
                  <div
                    key={t._id}
                    className="flex-1 min-w-0 rounded-t bg-primary-500/80 hover:bg-primary-500 transition-colors dark:bg-primary-600/80 dark:hover:bg-primary-600"
                    title={`${t._id}: ${t.count} tickets`}
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{trends[0]?._id}</span>
              <span>{trends[trends.length - 1]?._id}</span>
            </div>
          </div>
        )}

        {/* Leave analytics */}
        {leaveAnalytics && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Leave Analytics</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{leaveAnalytics.total}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
                <p className="text-xl font-bold text-emerald-600">{leaveAnalytics.approved}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                <p className="text-xl font-bold text-amber-600">{leaveAnalytics.pending}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Rejected</p>
                <p className="text-xl font-bold text-red-600">{leaveAnalytics.rejected}</p>
              </div>
            </div>
            {leaveAnalytics.leaveByType?.length > 0 && (
              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">By Type</p>
                <div className="mt-2 space-y-1">
                  {leaveAnalytics.leaveByType.map((l) => (
                    <span key={l._id} className="mr-3 text-sm">
                      {l._id}: <strong>{l.count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* IT Workload */}
        {workload.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">IT Workload</h2>
            <div className="mt-4 space-y-3">
              {workload.map((w) => (
                <div key={w.itUserId} className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">{w.name}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{w.ticketCount} tickets</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!summary && !error && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No analytics data yet</p>
        </div>
      )}
    </div>
  )
}

export default Analytics
