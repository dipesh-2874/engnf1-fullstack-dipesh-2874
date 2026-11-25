import { Link } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'

export default function Forbidden() {
  return (
    <AuthLayout>
      <h1>Access denied</h1>
      <p className="auth-description">This page requires an administrator account.</p>
      <div className="auth-actions">
        <Link className="auth-primary" to="/" replace>Back to workspace</Link>
      </div>
    </AuthLayout>
  )
}
