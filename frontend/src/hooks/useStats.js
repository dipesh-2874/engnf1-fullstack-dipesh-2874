import { useQuery } from '@tanstack/react-query'
import { getAdminStats, getTicketStats } from '../api/statsApi.js'

export const ticketStatsKey = ['stats', 'tickets']
export const adminStatsKey = ['stats', 'admin']

export function useTicketStats() {
  return useQuery({
    queryKey: ticketStatsKey,
    queryFn: ({ signal }) => getTicketStats(signal),
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminStatsKey,
    queryFn: ({ signal }) => getAdminStats(signal),
  })
}
