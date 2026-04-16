/**
 * EmployeeDashboard - welcome message + quick links + cafeteria status for Employee role.
 */

import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import CafeteriaWidget from '../../components/CafeteriaWidget'
import EmergencyContactsWidget from '../../components/EmergencyContactsWidget'
import TransportWidget from '../../components/TransportWidget'
import CelebrationsWidget from '../../components/CelebrationsWidget'

function EmployeeDashboard() {
  const { user } = useAuth()

  const quickLinks = [
    {
      label: 'My Tickets',
      description: 'View and track your support tickets',
      path: '/tickets',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      label: 'Create Ticket',
      description: 'Submit a new support request',
      path: '/tickets/new',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
    },
    {
      label: 'My Leaves',
      description: 'Apply for leave and view your leave balance',
      path: '/leaves',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      label: 'Announcements',
      description: 'Company news and updates',
      path: '/announcements',
      icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.068-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    },
    {
      label: 'Directory',
      description: 'Find colleagues by name or department',
      path: '/directory',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
    {
      label: 'Calendar',
      description: 'Events, holidays, and meetings',
      path: '/calendar',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      label: 'Policies',
      description: 'HR, IT, and company policies',
      path: '/policies',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'About',
      description: 'Company mission, vision, and values',
      path: '/about',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: "What's New",
      description: 'Upcoming features and updates',
      path: '/upcoming',
      icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    },
  ]

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Welcome, {user?.name}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Manage your support tickets from the Employee portal.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-stretch">
          <CafeteriaWidget />
          <EmergencyContactsWidget />
          <TransportWidget />
          <CelebrationsWidget />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="
              group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5
              shadow-sm transition-all duration-200 hover:border-primary-300 hover:shadow-md
              dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500
            "
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-500 group-hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
              </svg>
            </div>
            <div>
            <h2 className="font-semibold text-slate-900 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
              {link.label}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{link.description}</p>
            </div>
            <svg
              className="ml-auto h-5 w-5 shrink-0 text-slate-400 group-hover:text-primary-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default EmployeeDashboard
