import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getResource, getResourceAvailability, listResources } from '../api/resourceApi.js'
import { localDayBounds } from '../utils/dateUtils.js'

export const resourceKey = (id) => ['resources', 'detail', id]
export const availabilityKey = (id) => ['resources', 'availability', id]

export function useResources(filters, page) {
  const params = { ...filters, page, limit: 10 }
  return useQuery({
    queryKey: ['resources', 'list', params],
    queryFn: ({ signal }) => listResources(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useResource(id) {
  return useQuery({ queryKey: resourceKey(id), queryFn: ({ signal }) => getResource(id, signal) })
}

export function useResourceAvailability(id, date) {
  const day = localDayBounds(date)
  return useQuery({
    queryKey: [...availabilityKey(id), date, day?.start, day?.end],
    queryFn: ({ signal }) => getResourceAvailability(id, day, signal),
    enabled: Boolean(day),
  })
}
