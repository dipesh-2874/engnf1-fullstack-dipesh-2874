import { BOOKING_STATUSES } from '../../utils/constants.js'
import Select from '../common/Select.jsx'

export default function BookingFilters({ status, onStatus }) {
  return (
    <section className="booking-filters scheduling-surface" aria-label="Booking filters">
      <Select label="Status" value={status} onChange={(event) => onStatus(event.target.value)}>
        <option value="">All statuses</option>
        {Object.entries(BOOKING_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </Select>
    </section>
  )
}
