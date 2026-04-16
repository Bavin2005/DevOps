/**
 * LoginRedirect - if user is already authenticated, redirect to their role-based dashboard.
 * Use this to wrap the Login route so logged-in users can't access /login.
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function getRedirectPath(role) {
  switch (role) {
    case 'Admin':
      return '/admin'
    case 'IT':
      return '/it'
    case 'Employee':
    default:
      return '/'
  }
}

function LoginRedirect({ children }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    const path = getRedirectPath(user?.role)
    return <Navigate to={path} replace />
  }

  return children
}

export default LoginRedirect
