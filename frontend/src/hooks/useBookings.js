import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelBooking, createBooking, listMyBookings } from '../api/bookingApi.js'
import { availabilityKey, resourceKey } from './useResources.js'

export function useMyBookings(status) {
  return useQuery({
    queryKey: ['bookings', 'mine', status],
    queryFn: ({ signal }) => listMyBookings(status, signal),
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

      const queries = [['bookings']]
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
