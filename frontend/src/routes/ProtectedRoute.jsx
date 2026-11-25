import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import SessionStatus from '../pages/auth/SessionStatus.jsx'

export default function ProtectedRoute() {
  const { user, isChecking, sessionError } = useAuth()
  const location = useLocation()

  if (isChecking || sessionError) return <SessionStatus />

  if (!user) {
    const { pathname, search, hash } = location
    return <Navigate to="/login" state={{ from: { pathname, search, hash } }} replace />
  }

  return <Outlet />
}
