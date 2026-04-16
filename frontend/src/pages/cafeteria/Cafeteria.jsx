import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import CafeteriaWidget from '../../components/CafeteriaWidget'

function Cafeteria() {
  const { user } = useAuth()
  const canManage = user?.role === 'Admin' || user?.role === 'IT'

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cafeteria</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Status, timings, and today&apos;s menu
          </p>
        </div>
        {canManage && (
          <Link to="/cafeteria/menu" className="btn-primary inline-flex gap-2">
            Manage Menu
          </Link>
        )}
      </div>

      <div className="max-w-md">
        <CafeteriaWidget />
      </div>
    </div>
  )
}

export default Cafeteria
