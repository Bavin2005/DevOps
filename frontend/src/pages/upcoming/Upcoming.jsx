import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getUpcoming, updateUpcomingStatus } from '../../api/upcomingApi'
import { SkeletonTable } from '../../components/Skeleton'

const CATEGORIES = ['Feature', 'Update', 'Maintenance', 'Event', 'Other']
const STATUS_OPTIONS = ['Planned', 'In Progress', 'Done', 'Cancelled']

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function Upcoming() {
  const { user } = useAuth()
  const canEdit = user?.role === 'Admin' || user?.role === 'IT'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const load = () => {
    setError(null)
    getUpcoming(filter || undefined)
      .then(({ items: data }) => setItems(data || []))
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load')
        setItems([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [filter])

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id)
    try {
      await updateUpcomingStatus(id, status)
      toast.success('Status updated')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const statusColors = {
    Planned: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    Done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">What&apos;s New</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-base w-auto"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {canEdit && (
            <Link to="/upcoming/new" className="btn-primary inline-flex">
              Add Item
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
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">No upcoming items</p>
          {canEdit && (
            <Link to="/upcoming/new" className="btn-primary mt-4 inline-flex">
              Add first item
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card flex flex-wrap items-start justify-between gap-4 p-5">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.category} · Target: {formatDate(item.targetDate)}
                </p>
                {item.description && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    statusColors[item.status] || statusColors.Planned
                  }`}
                >
                  {item.status}
                </span>
                {canEdit && (
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    disabled={updatingId === item._id}
                    className="input-base w-auto py-1.5 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Upcoming
