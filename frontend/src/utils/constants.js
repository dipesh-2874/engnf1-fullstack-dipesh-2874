export const TICKET_CATEGORIES = ['BILLING', 'BUG', 'FEATURE_REQUEST', 'LOGIN', 'DELIVERY']
export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
export const RESOURCE_TYPES = { ROOM: 'Room', LAB: 'Lab', EQUIPMENT: 'Equipment' }
export const BOOKING_STATUSES = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled' }

export function ticketFieldLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replaceAll('_', ' ')
}
