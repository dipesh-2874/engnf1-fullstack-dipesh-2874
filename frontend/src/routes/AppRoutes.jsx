import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Loader from '../components/common/Loader.jsx'
import { administration, resourceDetails, workspace } from '../components/layout/navigation.js'
import { useAuth } from '../hooks/useAuth.js'
import AuthLayout from '../layouts/AuthLayout.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import AdminBookings from '../pages/admin/AdminBookings.jsx'
import AdminResources from '../pages/admin/AdminResources.jsx'
import Login from '../pages/auth/Login.jsx'
import Register from '../pages/auth/Register.jsx'
import MyBookings from '../pages/bookings/MyBookings.jsx'
import ResourceDetail from '../pages/resources/ResourceDetail.jsx'
import Resources from '../pages/resources/Resources.jsx'
import TriageQueue from '../pages/tickets/TriageQueue.jsx'
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
        <Route element={<DashboardLayout />}>
          <Route index element={<WorkspaceRedirect />} />
          {workspace.links.map((page) => (
            <Route key={page.to} path={page.to} element={workspaceViews[page.to]} />
          ))}
          <Route path={resourceDetails.to} element={<ResourceDetail />} />
          <Route path="403" element={<Forbidden />} />
          <Route path="admin" element={<AdminRoute />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            {administration.links.map((page) => (
              <Route key={page.to} path={page.to} element={adminViews[page.to]} />
            ))}
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const workspaceViews = { '/tickets': <TriageQueue />, '/resources': <Resources />, '/my-bookings': <MyBookings /> }
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.jsx'))
const adminViews = {
  '/admin/dashboard': <Suspense fallback={<Loader label="Loading analytics…" />}><AdminDashboard /></Suspense>,
  '/admin/resources': <AdminResources />,
  '/admin/bookings': <AdminBookings />,
}
