import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPolicy } from '../../api/policyApi'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function PolicyDetail() {
  const { id } = useParams()
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPolicy(id)
      .then(setPolicy)
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load policy'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    )
  }

  if (error || !policy) {
    return (
      <div className="space-y-4">
        <Link to="/policies" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          ← Back to Policies
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error || 'Policy not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <Link to="/policies" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
        ← Back to Policies
      </Link>
      <article className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{policy.title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {policy.category} · Updated {formatDate(policy.updatedAt)}
          {policy.createdBy?.name && ` · By ${policy.createdBy.name}`}
        </p>
        <div className="mt-6 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
          {policy.content}
        </div>
      </article>
    </div>
  )
}

export default PolicyDetail
