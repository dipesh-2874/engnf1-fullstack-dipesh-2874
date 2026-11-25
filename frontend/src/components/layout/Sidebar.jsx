import { Link, NavLink } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import { administration, workspace } from './navigation.js'

function getInitials(name) {
  const words = name.trim().split(/\s+/)
  const chosenWords = words.length > 1 ? [words[0], words.at(-1)] : words
  return chosenWords.map((word) => [...word][0]).join('').toLocaleUpperCase()
}

export default function Sidebar({ user, onNavigate, showBrand = true }) {
  const isAdmin = user.role === 'ADMIN'
  const sections = isAdmin ? [administration, workspace] : [workspace]
  const roleLabel = isAdmin ? 'Administrator' : 'Support Agent'

  return (
    <div className="dashboard-sidebar-content">
      {showBrand && (
        <Link className="dashboard-wordmark" to="/" aria-label="TriageSync home">
          <img src={logo} width="36" height="36" alt="" />
          <span className="dashboard-sidebar-label">TriageSync</span>
        </Link>
      )}

      <nav className="dashboard-navigation" aria-label="Main navigation">
        {sections.map(({ label, links }) => (
          <div className="dashboard-nav-group" key={label} role="group" aria-label={label}>
            <p className="dashboard-nav-heading dashboard-sidebar-label" aria-hidden="true">{label}</p>
            <ul>
              {links.map(({ to, label: linkLabel, icon }) => {
                const Icon = icon

                return (
                  <li key={to}>
                    <NavLink className="dashboard-nav-link" to={to} aria-label={linkLabel} title={linkLabel} onClick={onNavigate}>
                      <Icon size={19} aria-hidden="true" />
                      <span className="dashboard-sidebar-label">{linkLabel}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="dashboard-account" title={`${user.name} · ${roleLabel}`}>
        <span className="dashboard-avatar" aria-hidden="true">{getInitials(user.name)}</span>
        <div className="dashboard-account-copy dashboard-sidebar-label">
          <p>{user.name}</p>
          <p>{roleLabel}</p>
        </div>
      </div>
    </div>
  )
}
