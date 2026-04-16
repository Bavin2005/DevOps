import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTransportRoutes } from '../api/transportApi'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function TransportWidget() {
  const [routes, setRoutes] = useState([])

  useEffect(() => {
    getTransportRoutes()
      .then((res) => setRoutes(res?.routes || []))
      .catch(() => setRoutes([]))
  }, [])

  if (routes.length === 0) return null

  const today = new Date().getDay()
  const todayRoutes = routes.filter((r) => r.timings?.some((t) => t.dayOfWeek === today && t.times?.length > 0))

  if (todayRoutes.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">Transport Today</h3>
        <Link to="/transport" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
          View schedule
        </Link>
      </div>
      <ul className="mt-4 space-y-2">
        {todayRoutes.slice(0, 3).map((r) => {
          const timing = r.timings?.find((t) => t.dayOfWeek === today)
          const times = timing?.times?.join(', ') || '—'
          return (
            <li key={r._id} className="text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">{r.name}</span>
              <span className="ml-2 text-slate-500 dark:text-slate-400">{times}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default TransportWidget
