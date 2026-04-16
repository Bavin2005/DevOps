/**
 * ProtectedRoute - renders children only when user is authenticated.
 *
 * - If not authenticated: redirects to /login, saving the intended destination in state
 *   so user can be redirected back after login.
 * - If authenticated: renders children (the protected page).
 * - Optional allowedRoles: if provided, only users with one of those roles can access.
 *   Otherwise, any authenticated user can access.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="h-10 w-10 animate-spin text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Non-admin visiting /admin → redirect to /
    if (allowedRoles.includes('Admin')) {
      return <Navigate to="/" replace />
    }
    // Other wrong-role cases → redirect to user's dashboard
    const rolePath = { Admin: '/admin', IT: '/it', Employee: '/' }[user?.role] || '/'
    return <Navigate to={rolePath} replace />
  }

  return children
}

export default ProtectedRoute
