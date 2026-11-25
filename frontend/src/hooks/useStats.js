import { useQuery } from '@tanstack/react-query'
import { getTicketStats } from '../api/statsApi.js'

export const ticketStatsKey = ['stats', 'tickets']

export function useTicketStats() {
  return useQuery({
    queryKey: ticketStatsKey,
    queryFn: ({ signal }) => getTicketStats(signal),
  })
}
