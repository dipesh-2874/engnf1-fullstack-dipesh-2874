import { Link } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'

export default function NotFound() {
  return (
    <AuthLayout>
      <h1>Page not found</h1>
      <p className="auth-description">Check the address or return to your workspace.</p>
      <div className="auth-actions">
        <Link className="auth-primary" to="/" replace>Back to TriageSync</Link>
      </div>
    </AuthLayout>
  )
}
