import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import AuthLayout from '../layouts/AuthLayout.jsx'
import Login from '../pages/auth/Login.jsx'
import Register from '../pages/auth/Register.jsx'
import WorkspaceLanding from '../pages/WorkspaceLanding.jsx'
import Forbidden from '../pages/Forbidden.jsx'
import NotFound from '../pages/NotFound.jsx'
import AdminRoute from './AdminRoute.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import PublicRoute from './PublicRoute.jsx'

function WorkspaceRedirect() {
  const { user } = useAuth()
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/tickets'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route index element={<WorkspaceRedirect />} />
        <Route path="tickets" element={<WorkspaceLanding title="Triage Queue" />} />
        <Route path="resources" element={<WorkspaceLanding title="Resources" />} />
        <Route path="resources/:id" element={<WorkspaceLanding title="Resource details" />} />
        <Route path="my-bookings" element={<WorkspaceLanding title="My Bookings" />} />
        <Route path="403" element={<Forbidden />} />
        <Route path="admin" element={<AdminRoute />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WorkspaceLanding title="Analytics Dashboard" />} />
          <Route path="resources" element={<WorkspaceLanding title="Manage Resources" />} />
          <Route path="bookings" element={<WorkspaceLanding title="Manage Bookings" />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
