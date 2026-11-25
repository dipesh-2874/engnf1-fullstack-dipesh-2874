import { api } from './axiosInstance.js'
import { normalizeResource } from './resourceApi.js'

function normalizeBooking({ _id, id, resourceId, ...booking }) {
  const resource = resourceId && typeof resourceId === 'object' ? normalizeResource(resourceId) : null
  return { ...booking, id: id ?? _id, resource, resourceId: resource?.id ?? resourceId ?? null }
}

export async function createBooking(booking) {
  const { data } = await api.post('/bookings', booking)
  return normalizeBooking(data.booking)
}

export async function listMyBookings(status, signal) {
  const { data } = await api.get('/bookings/my', { params: { status: status || undefined }, signal })
  return data.bookings.map(normalizeBooking)
}

export async function cancelBooking({ id }) {
  const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/cancel`)
  return normalizeBooking(data.booking)
}
