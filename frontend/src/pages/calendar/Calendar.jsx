import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getEvents } from '../../api/eventApi'
import { SkeletonTable } from '../../components/Skeleton'
import { INDIAN_HOLIDAYS } from '../../constants/indianHolidays'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function Calendar() {
  const { user } = useAuth()
  const canCreate = user?.role === 'Admin' || user?.role === 'IT'
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('upcoming')
  const [selectedMonth, setSelectedMonth] = useState(null) // { year, month } for "Pick Month" view

  const load = () => {
    setError(null)
    const now = new Date()
    let fromDate, toDate
    if (view === 'upcoming') {
      fromDate = now
      toDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    } else if (view === 'month' && selectedMonth) {
      fromDate = new Date(selectedMonth.year, selectedMonth.month, 1)
      toDate = new Date(selectedMonth.year, selectedMonth.month + 1, 0)
    } else {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
      toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }
    const from = fromDate.toISOString()
    const to = toDate.toISOString()
    getEvents(from, to)
      .then(({ events: data }) => {
        const apiEvents = data || []
        // Add Indian public holidays within range
        const fromTime = fromDate.getTime()
        const toTime = toDate.getTime()
        const holidayEvents = INDIAN_HOLIDAYS
          .filter((h) => {
            const t = new Date(h.date + 'T12:00:00').getTime()
            return t >= fromTime && t <= toTime
          })
          .map((h) => ({
            _id: `holiday-${h.date}`,
            title: h.name,
            startDate: new Date(h.date + 'T00:00:00'),
            endDate: new Date(h.date + 'T23:59:59'),
            type: 'Holiday',
            allDay: true,
            location: '',
            description: 'India Public / Government Holiday',
          }))
        const merged = [...apiEvents, ...holidayEvents].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        )
        setEvents(merged)
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load events')
        setEvents([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [view, selectedMonth])

  const typeColors = {
    Meeting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    Holiday: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    'Team Event': 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    Training: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    Other: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar & Events</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Includes India public & government holidays (2026–2027)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setView('upcoming'); setSelectedMonth(null) }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === 'upcoming'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => { setView('month'); setSelectedMonth(null) }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === 'month' && !selectedMonth
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            This Month
          </button>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">View month:</span>
            <select
              value={selectedMonth ? `${selectedMonth.year}-${selectedMonth.month}` : ''}
              onChange={(e) => {
                const v = e.target.value
                if (!v) { setSelectedMonth(null); return }
                const [year, month] = v.split('-').map(Number)
                setView('month')
                setSelectedMonth({ year, month })
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">Select month...</option>
              {[2026, 2027].map((year) =>
                MONTHS.map((m, i) => (
                  <option key={`${year}-${i}`} value={`${year}-${i}`}>
                    {m} {year}
                  </option>
                ))
              )}
            </select>
          </div>
          {canCreate && (
            <Link
              to="/calendar/new"
              className="btn-primary inline-flex items-center gap-2"
            >
              Add Event
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={6} />
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <svg
            className="mx-auto h-14 w-14 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-slate-500 dark:text-slate-400">No events yet</p>
          {canCreate && (
            <Link to="/calendar/new" className="btn-primary mt-4 inline-flex">
              Add first event
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <div
              key={e._id}
              className="card flex flex-wrap items-start justify-between gap-4 p-5"
            >
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{e.title}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(e.startDate)}
                  {!e.allDay && ` · ${formatTime(e.startDate)} – ${formatTime(e.endDate)}`}
                </p>
                {e.location && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">{e.location}</p>
                )}
                {e.description && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{e.description}</p>
                )}
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${typeColors[e.type] || typeColors.Other}`}
              >
                {e.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Calendar
