import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const COMMANDS = [
  { label: 'Dashboard', path: '/', roles: ['Employee'] },
  { label: 'IT Dashboard', path: '/it', roles: ['IT'] },
  { label: 'Admin Dashboard', path: '/admin', roles: ['Admin'] },
  { label: 'My Tickets', path: '/tickets', roles: ['Employee'] },
  { label: 'Create Ticket', path: '/tickets/new', roles: ['Employee'] },
  { label: 'My Leaves', path: '/leaves', roles: ['Employee'] },
  { label: 'Apply Leave', path: '/leaves/apply', roles: ['Employee'] },
  { label: 'Leave Approvals', path: '/leaves/approvals', roles: ['IT', 'Admin'] },
  { label: 'Announcements', path: '/announcements', roles: ['Employee', 'IT', 'Admin'] },
  { label: 'Directory', path: '/directory', roles: ['Employee', 'IT', 'Admin'] },
  { label: 'Knowledge Base', path: '/knowledge-base', roles: ['Employee', 'IT', 'Admin'] },
  { label: 'Calendar', path: '/calendar', roles: ['Employee', 'IT', 'Admin'] },
  { label: 'Policies', path: '/policies', roles: ['Employee', 'IT', 'Admin'] },
  { label: 'About', path: '/about', roles: ['Employee', 'IT', 'Admin'] },
  { label: "What's New", path: '/upcoming', roles: ['Employee', 'IT', 'Admin'] },
]

function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  const role = user?.role || 'Employee'
  const filtered = COMMANDS.filter(
    (c) => c.roles.includes(role) && c.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleOpen = useCallback(() => {
    setOpen(true)
    setQuery('')
    setSelected(0)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleSelect = useCallback((path) => {
    navigate(path)
    handleClose()
  }, [navigate, handleClose])

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('open-command-palette', onOpen)
    return () => window.removeEventListener('open-command-palette', onOpen)
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (!open) return
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => (s < filtered.length - 1 ? s + 1 : 0))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => (s > 0 ? s - 1 : filtered.length - 1))
      }
      if (e.key === 'Enter' && filtered[selected]) {
        e.preventDefault()
        handleSelect(filtered[selected].path)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, filtered, selected, handleClose, handleSelect])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-[20%] z-[101] w-full max-w-xl -translate-x-1/2 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
        role="dialog"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <svg
            className="h-5 w-5 shrink-0 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            placeholder="Search or navigate..."
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100"
            autoFocus
          />
          <kbd className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
            Esc
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-slate-500">No results</p>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.path}
                onClick={() => handleSelect(cmd.path)}
                onMouseEnter={() => setSelected(i)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selected
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="truncate font-medium">{cmd.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default CommandPalette
