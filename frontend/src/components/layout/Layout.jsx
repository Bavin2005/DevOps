import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import AIChatWidget from '../AIChatWidget'
import Breadcrumbs from '../Breadcrumbs'
import CommandPalette from '../CommandPalette'
import AnimatedPage from '../AnimatedPage'
import { useAuth } from '../../context/AuthContext'

function Layout({ children }) {
  const { user } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <CommandPalette />
      <Topbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleMobile={() => setSidebarMobileOpen((o) => !o)}
        sidebarMobileOpen={sidebarMobileOpen}
        user={user || {}}
      />
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={sidebarMobileOpen}
        onCloseMobile={() => setSidebarMobileOpen(false)}
      />

      <main
        className={`
          min-h-screen pt-16 transition-all duration-300 ease-in-out
          px-4 pb-8 sm:px-6
          lg:px-8
          ${sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'}
        `}
      >
        <div className="pb-8">
          <div className="mb-6">
            <Breadcrumbs />
          </div>
          <AnimatePresence mode="wait">
            <AnimatedPage key={location.pathname}>
              {children}
            </AnimatedPage>
          </AnimatePresence>
        </div>
      </main>
      <AIChatWidget />
    </div>
  )
}

export default Layout
