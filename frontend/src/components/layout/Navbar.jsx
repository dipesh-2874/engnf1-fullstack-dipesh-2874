import { ChevronRight, LogOut, Menu } from 'lucide-react'
import Button from '../common/Button.jsx'

export default function Navbar({ breadcrumb, menuId, menuOpen, onOpenMenu, onSignOut }) {
  return (
    <header className="dashboard-navbar">
      <Button
        variant="icon"
        className="dashboard-menu-trigger"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-controls={menuId}
        aria-expanded={menuOpen}
      >
        <Menu size={22} aria-hidden="true" />
      </Button>

      <nav className="dashboard-breadcrumb" aria-label="Breadcrumb">
        <span className="dashboard-breadcrumb-section">{breadcrumb.section}</span>
        <ChevronRight className="dashboard-breadcrumb-divider" size={15} aria-hidden="true" />
        <span aria-current="page">{breadcrumb.current}</span>
      </nav>

      <Button variant="ghost" className="dashboard-signout" onClick={onSignOut}>
        <LogOut size={18} aria-hidden="true" />
        <span>Sign out</span>
      </Button>
    </header>
  )
}
