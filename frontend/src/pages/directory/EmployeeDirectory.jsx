import { useState, useEffect } from 'react'
import { getDirectory } from '../../api/usersApi'

function roleBadge(role) {
  const map = {
    Employee: 'bg-slate-100 text-slate-700',
    IT: 'bg-blue-100 text-blue-700',
    Admin: 'bg-emerald-100 text-emerald-700'
  }
  return map[role] || 'bg-slate-100 text-slate-700'
}

function EmployeeDirectory() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')

  useEffect(() => {
    setError(null)
    getDirectory()
      .then(setUsers)
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load directory')
        setUsers([])
      })
      .finally(() => setLoading(false))
  }, [])

  const departments = [...new Set(users.map((u) => u.department).filter(Boolean))].sort()

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchDept = !filterDept || u.department === filterDept
    return matchSearch && matchDept
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg className="h-10 w-10 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-4 text-sm text-slate-500">Loading directory...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4">
        <div className="relative min-w-[200px] flex-1">
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 pl-10 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((user) => (
          <div
            key={user._id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-600">
                {user.name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                {user.department && (
                  <p className="mt-1 text-xs text-slate-600">{user.department}</p>
                )}
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge(user.role)}`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-slate-500">No employees found</p>
      )}
    </div>
  )
}

export default EmployeeDirectory
