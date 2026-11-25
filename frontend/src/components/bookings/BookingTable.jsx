import { ChevronRight } from 'lucide-react'
import { BOOKING_STATUSES, RESOURCE_TYPES } from '../../utils/constants.js'
import { formatBookingRange } from '../../utils/dateUtils.js'
import Button from '../common/Button.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import BookingCard from './BookingCard.jsx'

export default function BookingTable({ bookings, onOpen, label = 'Your bookings' }) {
  return (
    <>
      <table className="booking-table" aria-label={label}>
        <colgroup><col className="booking-resource-column" /><col /><col className="booking-purpose-column" /><col className="booking-status-column" /><col className="booking-actions-column" /></colgroup>
        <thead><tr><th scope="col">Resource</th><th scope="col">Date and time</th><th scope="col">Purpose</th><th scope="col">Status</th><th scope="col">Details</th></tr></thead>
        <tbody>
          {bookings.map((booking) => {
            const name = booking.resource?.name ?? 'Unavailable resource'
            return (
              <tr key={booking.id}>
                <th scope="row">
                  <p>{name}</p>
                  {booking.resource && <p className="scheduling-muted">{RESOURCE_TYPES[booking.resource.type]}</p>}
                  {booking.requester && <p className="scheduling-muted">{booking.requester.name}</p>}
                </th>
                <td>{formatBookingRange(booking.startTime, booking.endTime)}</td>
                <td><p className="booking-purpose-summary">{booking.purpose}</p></td>
                <td><StatusBadge status={booking.status} label={BOOKING_STATUSES[booking.status]} /></td>
                <td>
                  <Button variant="ghost" className="booking-details-action" onClick={() => onOpen(booking)} aria-label={`View booking details for ${name}`}>
                    View <ChevronRight size={16} aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <ul className="booking-cards" aria-label={label}>
        {bookings.map((booking) => <BookingCard key={booking.id} booking={booking} onOpen={onOpen} />)}
      </ul>
    </>
  )
}
