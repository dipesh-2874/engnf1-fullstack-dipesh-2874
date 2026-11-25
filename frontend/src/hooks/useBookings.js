import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { approveBooking, cancelBooking, createBooking, listAdminBookings, listMyBookings, rejectBooking } from '../api/bookingApi.js'
import { availabilityKey, resourceKey } from './useResources.js'
import { adminStatsKey } from './useStats.js'

export function useMyBookings(status) {
  return useQuery({
    queryKey: ['bookings', 'mine', status],
    queryFn: ({ signal }) => listMyBookings(status, signal),
  })
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ['bookings', 'admin'],
    queryFn: ({ signal }) => listAdminBookings(signal),
  })
}

function useBookingMutation(mutationFn) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    networkMode: 'always',
    onSettled(data, error, { resourceId }) {
      const conflict = error?.response?.status === 409
      if (!data && !conflict) return

      const queries = [['bookings'], adminStatsKey]
      if (resourceId) {
        queries.push(availabilityKey(resourceId))
        if (conflict) queries.push(resourceKey(resourceId))
      }
      return Promise.all(queries.map((queryKey) => client.invalidateQueries({ queryKey })))
    },
  })
}

export function useCreateBooking() {
  return useBookingMutation(createBooking)
}

export function useCancelBooking() {
  return useBookingMutation(cancelBooking)
}

export function useApproveBooking() {
  return useBookingMutation(approveBooking)
}

export function useRejectBooking() {
  return useBookingMutation(rejectBooking)
}
