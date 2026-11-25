import { Link } from 'react-router-dom'
import { BOOKING_STATUSES, RESOURCE_TYPES } from '../../utils/constants.js'
import { formatBookingRange, formatLocalDate, formatLocalTime } from '../../utils/dateUtils.js'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'
import StatusBadge from '../common/StatusBadge.jsx'

export default function BookingDetails({ booking, open, onClose, onCancel, canCancel, actions }) {
  return (
    <Modal
      open={open} onClose={onClose} title="Booking details"
      footer={actions ?? (canCancel && <Button variant="danger" onClick={onCancel}>Cancel booking</Button>)}
    >
      {booking && (
        <div className="booking-detail-content">
          <div className="booking-card-header">
            <h3>{booking.resource?.name ?? 'Unavailable resource'}</h3>
            <StatusBadge status={booking.status} label={BOOKING_STATUSES[booking.status]} />
          </div>
          <dl className="booking-detail-facts">
            <div><dt>When</dt><dd>{formatBookingRange(booking.startTime, booking.endTime)}</dd></div>
            <div><dt>Purpose</dt><dd>{booking.purpose}</dd></div>
            {booking.requester && <div><dt>Requested by</dt><dd>{booking.requester.name} · {booking.requester.email}</dd></div>}
            {booking.resource && <div><dt>Resource</dt><dd>{RESOURCE_TYPES[booking.resource.type]} · Capacity {booking.resource.capacity}</dd></div>}
            {booking.createdAt && <div><dt>Requested</dt><dd>{formatLocalDate(booking.createdAt)}, {formatLocalTime(booking.createdAt, true)}</dd></div>}
            {booking.ticketId && (
              <div><dt>Support ticket</dt><dd><Link className="scheduling-text-link" to={`/tickets?${new URLSearchParams({ ticketId: booking.ticketId })}`}>View linked ticket</Link></dd></div>
            )}
            {booking.decisionNote && <div><dt>Decision note</dt><dd>{booking.decisionNote}</dd></div>}
          </dl>
        </div>
      )}
    </Modal>
  )
}
