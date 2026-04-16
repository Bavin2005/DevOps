import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const KB_ICON = 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
const CALENDAR_ICON = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
const MEGAPHONE_ICON = 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.068-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
const USERS_ICON = 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
const DOCUMENT_ICON = 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
const INFO_ICON = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
const SPARKLES_ICON = 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
const ROOM_ICON = 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
const EMERGENCY_ICON = 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
const TRANSPORT_ICON = 'M8 7h8m0 0v8m0-8l-3 3m0 0l-3-3m3 3v8'
const CAFETERIA_ICON = 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
const ANALYTICS_ICON = 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
const CHAT_ICON = 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'

const EMPLOYEE_NAV_ITEMS = [
  { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/' },
  { label: 'My Tickets', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', path: '/tickets' },
  { label: 'Create Ticket', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', path: '/tickets/new' },
  { label: 'My Leaves', icon: CALENDAR_ICON, path: '/leaves' },
  { label: 'Announcements', icon: MEGAPHONE_ICON, path: '/announcements' },
  { label: 'Meeting Rooms', icon: ROOM_ICON, path: '/meeting-rooms' },
  { label: 'Cafeteria', icon: CAFETERIA_ICON, path: '/cafeteria' },
  { label: 'Chat', icon: CHAT_ICON, path: '/chat' },
  { label: 'Directory', icon: USERS_ICON, path: '/directory' },
  { label: 'Calendar', icon: CALENDAR_ICON, path: '/calendar' },
  { label: 'Emergency', icon: EMERGENCY_ICON, path: '/emergency' },
  { label: 'Transport', icon: TRANSPORT_ICON, path: '/transport' },
  { label: 'Policies', icon: DOCUMENT_ICON, path: '/policies' },
  { label: 'About', icon: INFO_ICON, path: '/about' },
  { label: "What's New", icon: SPARKLES_ICON, path: '/upcoming' },
  { label: 'Knowledge Base', icon: KB_ICON, path: '/knowledge-base' },
]

const IT_NAV_ITEMS = [
  { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/it' },
  { label: 'Leave Approvals', icon: CALENDAR_ICON, path: '/leaves/approvals' },
  { label: 'Announcements', icon: MEGAPHONE_ICON, path: '/announcements' },
  { label: 'Meeting Rooms', icon: ROOM_ICON, path: '/meeting-rooms' },
  { label: 'Cafeteria', icon: CAFETERIA_ICON, path: '/cafeteria' },
  { label: 'Chat', icon: CHAT_ICON, path: '/chat' },
  { label: 'Directory', icon: USERS_ICON, path: '/directory' },
  { label: 'Calendar', icon: CALENDAR_ICON, path: '/calendar' },
  { label: 'Emergency', icon: EMERGENCY_ICON, path: '/emergency' },
  { label: 'Transport', icon: TRANSPORT_ICON, path: '/transport' },
  { label: 'Policies', icon: DOCUMENT_ICON, path: '/policies' },
  { label: 'About', icon: INFO_ICON, path: '/about' },
  { label: "What's New", icon: SPARKLES_ICON, path: '/upcoming' },
  { label: 'Knowledge Base', icon: KB_ICON, path: '/knowledge-base' },
  { label: 'Add Article', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', path: '/knowledge-base/add' },
]

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/admin' },
  { label: 'Leave Approvals', icon: CALENDAR_ICON, path: '/leaves/approvals' },
  { label: 'Announcements', icon: MEGAPHONE_ICON, path: '/announcements' },
  { label: 'Meeting Rooms', icon: ROOM_ICON, path: '/meeting-rooms' },
  { label: 'Cafeteria', icon: CAFETERIA_ICON, path: '/cafeteria' },
  { label: 'Chat', icon: CHAT_ICON, path: '/chat' },
  { label: 'Directory', icon: USERS_ICON, path: '/directory' },
  { label: 'Calendar', icon: CALENDAR_ICON, path: '/calendar' },
  { label: 'Emergency', icon: EMERGENCY_ICON, path: '/emergency' },
  { label: 'Transport', icon: TRANSPORT_ICON, path: '/transport' },
  { label: 'Policies', icon: DOCUMENT_ICON, path: '/policies' },
  { label: 'About', icon: INFO_ICON, path: '/about' },
  { label: "What's New", icon: SPARKLES_ICON, path: '/upcoming' },
  { label: 'Knowledge Base', icon: KB_ICON, path: '/knowledge-base' },
  { label: 'Add Article', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', path: '/knowledge-base/add' },
]

function getNavItems(role) {
  switch (role) {
    case 'Admin':
      return ADMIN_NAV_ITEMS
    case 'IT':
      return IT_NAV_ITEMS
    default:
      return EMPLOYEE_NAV_ITEMS
  }
}

function Sidebar({ collapsed = false, mobileOpen = false, onCloseMobile }) {
  const { user } = useAuth()
  const navItems = getNavItems(user?.role)
  const isRootPath = (path) =>
    path === '/' || path === '/it' || path === '/admin' || path === '/knowledge-base/add' ||
    path === '/leaves' || path === '/leaves/approvals' || path === '/announcements' || path === '/directory' ||
    path === '/calendar' || path === '/policies' || path === '/about' || path === '/upcoming' ||
    path === '/meeting-rooms' || path === '/emergency' || path === '/transport' || path === '/cafeteria' || path === '/analytics' || path === '/chat'

  const baseClass = `
    fixed left-0 top-16 z-40 h-[calc(100vh-4rem)]
    bg-slate-900 text-slate-200 shadow-xl
    transition-all duration-300 ease-out
    dark:bg-slate-950 dark:border-r dark:border-slate-800
  `
  const widthClass = collapsed ? 'w-20' : 'w-64'

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`
          ${baseClass} ${widthClass}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex h-14 items-center border-b border-slate-700/50 px-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {!collapsed && (
              <span className="truncate font-semibold text-white">Enterprise Portal</span>
            )}
          </div>
        </div>

        <nav className="mt-4 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-1 px-3 pb-20">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={isRootPath(item.path)}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ease-out ${
                  isActive
                    ? 'bg-primary-600/25 text-primary-100'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`
              }
            >
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {!collapsed && (
                <span className="truncate text-sm font-medium">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700/50 p-3 dark:border-slate-800">
            <p className="text-xs text-slate-500">v2.0.0</p>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
