import { api } from './axiosInstance.js'

function normalizeTicket({ _id, id, assigneeId, ...ticket }) {
  const assignee = assigneeId && typeof assigneeId === 'object' ? assigneeId : null
  return {
    ...ticket,
    id: id ?? _id,
    assigneeId: assignee ? assignee.id ?? assignee._id : assigneeId ?? null,
    assignee,
  }
}

export async function listTickets(filters, signal) {
  const { data } = await api.get('/tickets', { params: filters, signal })
  return {
    tickets: data.tickets.map(normalizeTicket),
    pagination: data.pagination,
  }
}

export async function importTickets(feed) {
  const { data } = await api.post('/tickets/import', feed)
  return data
}

export async function getTicket(id, signal) {
  const { data } = await api.get(`/tickets/${encodeURIComponent(id)}`, { signal })
  return normalizeTicket(data.ticket)
}

export async function getTicketEvents(id, signal) {
  const { data } = await api.get(`/tickets/${encodeURIComponent(id)}/events`, { signal })
  return data.events.map(({ _id, ...event }) => ({ ...event, id: event.id ?? _id }))
}

export async function updateTicket(id, changes) {
  const { data } = await api.patch(`/tickets/${encodeURIComponent(id)}`, changes)
  return normalizeTicket(data.ticket)
}
