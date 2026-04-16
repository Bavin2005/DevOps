import { Link, useLocation } from 'react-router-dom'

const ROUTE_LABELS = {
  '/': 'Dashboard',
  '/tickets': 'My Tickets',
  '/tickets/new': 'Create Ticket',
  '/tickets/': 'Ticket',
  '/leaves': 'My Leaves',
  '/leaves/apply': 'Apply Leave',
  '/leaves/approvals': 'Leave Approvals',
  '/announcements': 'Announcements',
  '/announcements/new': 'Create Announcement',
  '/directory': 'Directory',
  '/knowledge-base': 'Knowledge Base',
  '/knowledge-base/add': 'Add Article',
  '/it': 'IT Dashboard',
  '/admin': 'Admin Dashboard',
  '/calendar': 'Calendar',
  '/calendar/new': 'Add Event',
  '/policies': 'Policies',
  '/policies/new': 'Add Policy',
  '/about': 'About',
  '/upcoming': "What's New",
  '/upcoming/new': 'Add Item',
}

function Breadcrumbs() {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  if (paths.length === 0) {
    const label = ROUTE_LABELS['/'] || 'Dashboard'
    return (
      <nav className="flex items-center gap-2 text-sm">
        <span className="font-medium text-slate-900 dark:text-slate-100">{label}</span>
      </nav>
    )
  }

  let currentPath = ''
  const crumbs = paths.map((segment, i) => {
    currentPath += `/${segment}`
    const isLast = i === paths.length - 1
    let label = ROUTE_LABELS[currentPath]
    if (!label && /^[a-f0-9]{24}$/i.test(segment)) {
      label = 'Detail'
    } else if (!label) {
      label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    }
    return { path: currentPath, label, isLast }
  })

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
      <Link
        to="/"
        className="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
      >
        Home
      </Link>
      {crumbs.map(({ path, label, isLast }) => (
        <span key={path} className="flex items-center gap-2">
          <span className="text-slate-400 dark:text-slate-500">/</span>
          {isLast ? (
            <span className="font-medium text-slate-900 dark:text-slate-100">{label}</span>
          ) : (
            <Link
              to={path}
              className="transition-colors hover:text-primary-600 dark:hover:text-primary-400"
            >
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumbs
