import { CalendarDays, ChevronRight } from 'lucide-react'
import { BOOKING_STATUSES, RESOURCE_TYPES } from '../../utils/constants.js'
import { formatBookingRange } from '../../utils/dateUtils.js'
import Button from '../common/Button.jsx'
import StatusBadge from '../common/StatusBadge.jsx'

export default function BookingCard({ booking, onOpen }) {
  const name = booking.resource?.name ?? 'Unavailable resource'

  return (
    <li className="booking-card">
      <div className="booking-card-header">
        <div>
          <h3>{name}</h3>
          {booking.resource && <p className="scheduling-muted">{RESOURCE_TYPES[booking.resource.type]}</p>}
        </div>
        <StatusBadge status={booking.status} label={BOOKING_STATUSES[booking.status]} />
      </div>
      {booking.requester && <p className="scheduling-muted">Requested by {booking.requester.name}</p>}
      <p className="booking-time"><CalendarDays size={16} aria-hidden="true" /> {formatBookingRange(booking.startTime, booking.endTime)}</p>
      <p className="booking-purpose-summary">{booking.purpose}</p>
      <Button variant="ghost" className="booking-details-action" onClick={() => onOpen(booking)} aria-label={`View booking details for ${name}`}>
        View details <ChevronRight size={16} aria-hidden="true" />
      </Button>
    </li>
  )
}
