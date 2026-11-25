import { availabilityUtcDates } from '../utils/dateUtils.js'
import { api } from './axiosInstance.js'

export function normalizeResource({ _id, id, ...resource }) {
  return { ...resource, id: id ?? _id }
}

export async function listResources(filters, signal) {
  const { data } = await api.get('/resources', { params: filters, signal })
  return { resources: data.resources.map(normalizeResource), pagination: data.pagination }
}

export async function getResource(id, signal) {
  const { data } = await api.get(`/resources/${encodeURIComponent(id)}`, { signal })
  return normalizeResource(data.resource)
}

export async function saveResource({ id, changes }) {
  const { data } = id
    ? await api.patch(`/resources/${encodeURIComponent(id)}`, changes)
    : await api.post('/resources', changes)
  return normalizeResource(data.resource)
}

export async function getResourceAvailability(id, day, signal) {
  const url = `/resources/${encodeURIComponent(id)}/availability`
  const responses = await Promise.all(availabilityUtcDates(day).map((date) => api.get(url, { params: { date }, signal })))
  const intervals = new Map()

  for (const { data } of responses) {
    for (const { startTime, endTime } of data.availability) {
      const interval = { start: Date.parse(startTime), end: Date.parse(endTime) }
      intervals.set(`${interval.start}-${interval.end}`, interval)
    }
  }
  return [...intervals.values()]
}
