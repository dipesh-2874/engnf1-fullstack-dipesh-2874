import { useCallback, useId, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import MobileNav from '../components/layout/MobileNav.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import { getDashboardBreadcrumb } from '../components/layout/navigation.js'
import { useAuth } from '../hooks/useAuth.js'
import '../styles/dashboard.css'

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const { key, pathname } = useLocation()
  const [menuLocation, setMenuLocation] = useState(null)
  const menuId = useId()
  const menuOpen = menuLocation === key
  const closeMenu = useCallback(() => setMenuLocation(null), [])

  return (
    <div className="dashboard-layout">
      <a className="dashboard-skip-link" href="#dashboard-content">Skip to content</a>
      <aside className="dashboard-sidebar">
        <Sidebar user={user} />
      </aside>
      <div className="dashboard-main">
        <Navbar
          breadcrumb={getDashboardBreadcrumb(pathname)}
          menuId={menuId}
          menuOpen={menuOpen}
          onOpenMenu={() => setMenuLocation(key)}
          onSignOut={() => signOut()}
        />
        <main className="dashboard-content" id="dashboard-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <MobileNav id={menuId} open={menuOpen} onClose={closeMenu} user={user} />
    </div>
  )
}
