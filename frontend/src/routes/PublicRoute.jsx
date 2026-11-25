import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import SessionStatus from '../pages/auth/SessionStatus.jsx'

export default function PublicRoute() {
  const { user, isChecking, sessionError } = useAuth()
  const { state } = useLocation()

  if (isChecking || sessionError) return <SessionStatus />
  if (user) return <Navigate to={state?.from ?? '/'} replace />

  return <Outlet />
}
