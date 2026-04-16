import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getPolicies } from '../../api/policyApi'
import { SkeletonTable } from '../../components/Skeleton'

const CATEGORIES = ['HR', 'IT', 'Finance', 'Security', 'General', 'Other']

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function Policies() {
  const { user } = useAuth()
  const canCreate = user?.role === 'Admin' || user?.role === 'IT'
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('')

  const load = () => {
    setError(null)
    getPolicies(filter || undefined)
      .then(({ policies: data }) => setPolicies(data || []))
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load policies')
        setPolicies([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [filter])

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Policies & Documents</h1>
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
          {canCreate && (
            <Link to="/policies/new" className="btn-primary inline-flex">
              Add Policy
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
      ) : policies.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">No policies yet</p>
          {canCreate && (
            <Link to="/policies/new" className="btn-primary mt-4 inline-flex">
              Add first policy
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((p) => (
            <Link
              key={p._id}
              to={`/policies/${p._id}`}
              className="card block p-5 transition-all hover:border-primary-300 hover:shadow-md dark:hover:border-primary-600"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">{p.title}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {p.category} · Updated {formatDate(p.updatedAt)}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  {p.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Policies
