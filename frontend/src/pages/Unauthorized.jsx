/**
 * Unauthorized page - shown when user tries to access a route they don't have permission for.
 */

import { Link } from 'react-router-dom'

function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200">403</h1>
        <h2 className="mt-4 text-xl font-semibold text-slate-800">Access denied</h2>
        <p className="mt-2 text-slate-500">
          You don't have permission to view this page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Unauthorized
