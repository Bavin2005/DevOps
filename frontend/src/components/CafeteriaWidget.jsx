import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCafeteriaStatus } from '../constants/cafeteria'
import { getMenuForDate } from '../api/cafeteriaApi'

function CafeteriaWidget() {
  const { user } = useAuth()
  const canManage = user?.role === 'Admin' || user?.role === 'IT'
  const [cafeteria, setCafeteria] = useState(() => getCafeteriaStatus())
  const [menu, setMenu] = useState(null)
  const [menuLoading, setMenuLoading] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setCafeteria(getCafeteriaStatus()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setMenuLoading(true)
    const today = new Date().toISOString().split('T')[0]
    getMenuForDate(today)
      .then((res) => setMenu(res?.items?.length ? res.items : null))
      .catch(() => setMenu(null))
      .finally(() => setMenuLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${cafeteria.isOpen ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Cafeteria</p>
            <p className={`text-sm font-medium ${cafeteria.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {cafeteria.isOpen ? 'Open' : 'Closed'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{cafeteria.days} {cafeteria.openTime}</p>
          </div>
        </div>
        {canManage && (
          <Link
            to="/cafeteria/menu"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Manage Menu
          </Link>
        )}
      </div>
      {menuLoading ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading menu...</p>
      ) : menu?.length > 0 ? (
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today&apos;s Menu
          </p>
          <ul className="space-y-1.5">
            {menu.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${item.type === 'Non-Veg' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                  {item.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No menu for today</p>
      )}
    </div>
  )
}

export default CafeteriaWidget
