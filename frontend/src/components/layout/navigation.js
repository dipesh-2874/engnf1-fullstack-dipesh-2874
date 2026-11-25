import { Boxes, CalendarDays, ChartNoAxesCombined, ClipboardCheck, Inbox, SlidersHorizontal } from 'lucide-react'
import { matchPath } from 'react-router-dom'

export const workspace = {
  label: 'Workspace',
  links: [
    { to: '/tickets', label: 'Triage Queue', icon: Inbox, description: 'Review, prioritize, and manage incoming support tickets.' },
    { to: '/resources', label: 'Resources', icon: Boxes, description: 'Browse shared resources and find an available time slot.' },
    { to: '/my-bookings', label: 'My Bookings', icon: CalendarDays, description: 'View and manage your resource bookings.' },
  ],
}

export const administration = {
  label: 'Administration',
  links: [
    { to: '/admin/dashboard', label: 'Analytics', title: 'Analytics Dashboard', icon: ChartNoAxesCombined, description: 'Monitor ticket performance and resource utilization.' },
    { to: '/admin/resources', label: 'Manage Resources', icon: SlidersHorizontal, description: 'Create, update, and manage shared resources.' },
    { to: '/admin/bookings', label: 'Manage Bookings', icon: ClipboardCheck, description: 'Review resource requests and record booking decisions.' },
  ],
}

export const resourceDetails = { to: '/resources/:id', label: 'Resource details', icon: Boxes, description: 'Check availability and request a booking.' }

export function getDashboardBreadcrumb(pathname) {
  if (matchPath('/403', pathname)) return { section: workspace.label, current: 'Access denied' }
  if (matchPath(resourceDetails.to, pathname)) return { section: workspace.label, current: resourceDetails.label }

  for (const section of [administration, workspace]) {
    const link = section.links.find(({ to }) => matchPath(to, pathname))
    if (link) return { section: section.label, current: link.label }
  }

  const section = matchPath('/admin', pathname) ? administration : workspace
  return { section: section.label, current: 'Home' }
}
