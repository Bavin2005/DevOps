import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAnnouncements } from '../../api/announcementApi'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function Announcements() {
  const { user } = useAuth()
  const canCreate = user?.role === 'Admin' || user?.role === 'IT'
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setError(null)
    getAnnouncements()
      .then(({ announcements: data }) => setAnnouncements(data || []))
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load announcements')
        setAnnouncements([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg className="h-10 w-10 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-4 text-sm text-slate-500">Loading announcements...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Announcements</h1>
          {canCreate && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Admin & IT can create announcements</p>
          )}
        </div>
        {canCreate && (
          <Link
            to="/announcements/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            Create Announcement
          </Link>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <article
              key={a._id}
              className={`rounded-xl border bg-white p-6 shadow-sm ${
                a.pinned ? 'border-primary-200 bg-primary-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{a.title}</h2>
                  <p className="mt-2 whitespace-pre-wrap text-slate-700">{a.content}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {formatDate(a.createdAt)} · {a.createdBy?.name || 'Unknown'}
                    {a.pinned && (
                      <span className="ml-2 inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-amber-800">
                        Pinned
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Announcements
