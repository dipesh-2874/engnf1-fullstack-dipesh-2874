import { CalendarDays, Check, ListChecks } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import logo from '../assets/logo.svg'
import '../styles/auth.css'

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <aside className="auth-brand" aria-label="About TriageSync">
        <div className="auth-wordmark">
          <img src={logo} alt="" width="36" height="36" />
          <span>TriageSync</span>
        </div>
        <div className="auth-brand-content">
          <p className="auth-brand-heading">Support triage and<br className="auth-brand-break" /> resource scheduling</p>
          <div className="auth-illustration" aria-hidden="true">
            <div className="auth-illustration-item">
              <span className="auth-illustration-icon"><ListChecks size={20} /></span>
              <span className="auth-illustration-lines" />
              <span className="auth-illustration-check"><Check size={15} /></span>
            </div>
            <div className="auth-illustration-item">
              <span className="auth-illustration-icon"><CalendarDays size={20} /></span>
              <span className="auth-illustration-lines" />
              <span className="auth-illustration-check"><Check size={15} /></span>
            </div>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">{children ?? <Outlet />}</div>
      </main>
    </div>
  )
}
