import { useState, useEffect } from 'react'
import { getCelebrations } from '../api/usersApi'

function CelebrationsWidget() {
  const [data, setData] = useState({ birthdays: [], anniversaries: [] })

  useEffect(() => {
    getCelebrations()
      .then((res) => setData({ birthdays: res?.birthdays || [], anniversaries: res?.anniversaries || [] }))
      .catch(() => setData({ birthdays: [], anniversaries: [] }))
  }, [])

  if (data.birthdays.length === 0 && data.anniversaries.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white">Today&apos;s Celebrations</h3>
      <div className="mt-4 space-y-3">
        {data.birthdays.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">Birthdays</p>
            <ul className="mt-1 space-y-1">
              {data.birthdays.map((u) => (
                <li key={u._id} className="text-sm text-slate-700 dark:text-slate-300">
                  🎂 {u.name}{u.department ? ` (${u.department})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.anniversaries.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">Work Anniversaries</p>
            <ul className="mt-1 space-y-1">
              {data.anniversaries.map((u) => {
                const years = u.joiningDate ? new Date().getFullYear() - new Date(u.joiningDate).getFullYear() : 0
                return (
                  <li key={u._id} className="text-sm text-slate-700 dark:text-slate-300">
                    🎉 {u.name}{years ? ` (${years} year${years > 1 ? 's' : ''})` : ''}{u.department ? ` · ${u.department}` : ''}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default CelebrationsWidget
