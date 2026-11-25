import { CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BOOKING_HORIZON_MS, SLOT_MS, formatLocalDate, formatLocalTime, localDateValue } from '../../utils/dateUtils.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import Button from '../common/Button.jsx'
import FormField from '../common/FormField.jsx'
import Select from '../common/Select.jsx'
import BookingTicketPicker from './BookingTicketPicker.jsx'

export default function BookingForm({ resourceId, date, startSlots, endOptions, start, end, onStart, onEnd, ready, mutation }) {
  const [ticket, setTicket] = useState(null)
  const [validationError, setValidationError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!ready || mutation.isPending || start === null || end === null) return

    const form = event.currentTarget
    const purpose = String(new FormData(form).get('purpose') ?? '').trim()
    const now = Date.now()
    if (start <= now || start > now + BOOKING_HORIZON_MS) {
      setValidationError({ field: 'time', message: 'Choose a start time within the next 30 days.' })
      return
    }
    if (purpose.length < 5 || purpose.length > 200) {
      setValidationError({ field: 'purpose', message: 'Enter a purpose between 5 and 200 characters.' })
      return
    }

    setValidationError(null)
    try {
      await mutation.mutateAsync({
        resourceId,
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
        purpose,
        ...(ticket && { ticketId: ticket.id }),
      })
      form.reset()
      setTicket(null)
      onStart(null)
    } catch (error) {
      if (error.response?.status === 409) onStart(null)
    }
  }

  return (
    <section className="booking-form-panel scheduling-surface" aria-labelledby="booking-form-title">
      <header className="scheduling-section-heading">
        <span className="resource-icon"><CalendarPlus size={20} aria-hidden="true" /></span>
        <div>
          <h2 id="booking-form-title">Request a booking</h2>
          {date && <p className="scheduling-muted">{formatLocalDate(date)}</p>}
        </div>
      </header>
      <form className="resource-booking-form" onSubmit={handleSubmit} noValidate aria-busy={mutation.isPending}>
        <fieldset disabled={mutation.isPending}>
          <div className="booking-time-fields">
            <Select label="Start time" value={start ?? ''} disabled={!ready || startSlots.length === 0} onChange={(event) => onStart(event.target.value ? Number(event.target.value) : null)}>
              <option value="">Select start</option>
              {startSlots.map((slot) => <option key={slot.start} value={slot.start}>{formatLocalTime(slot.start, true)}</option>)}
            </Select>
            <Select label="End time" value={end ?? ''} disabled={!ready || endOptions.length === 0} onChange={(event) => onEnd(event.target.value ? Number(event.target.value) : null)}>
              <option value="">Select end</option>
              {endOptions.map((option) => (
                <option key={option} value={option}>
                  {formatLocalTime(option, true)}{localDateValue(option) !== localDateValue(start) ? ' next day' : ''} · {(option - start) / 60_000} min
                </option>
              ))}
            </Select>
          </div>
          <p className="scheduling-muted">30–240 minutes in {SLOT_MS / 60_000}-minute steps.</p>
          <FormField label="Purpose" hint="5–200 characters." error={validationError?.field === 'purpose' ? validationError.message : undefined}>
            {(field) => (
              <textarea {...field} className="ui-control booking-purpose" name="purpose" rows={3} maxLength={200}
                aria-invalid={validationError?.field === 'purpose'} placeholder="What will you use this resource for?" onChange={() => setValidationError(null)} />
            )}
          </FormField>
          <BookingTicketPicker selected={ticket} onSelect={setTicket} />
          {validationError?.field === 'time' && <p className="scheduling-message scheduling-message--error" role="alert">{validationError.message}</p>}
          {mutation.isError && <p className="scheduling-message scheduling-message--error" role="alert">{getErrorMessage(mutation.error, 'Could not book this resource. Try again.')}</p>}
          {mutation.isSuccess && (
            <div className="scheduling-message" role="status">
              <p>Booking requested.</p>
              <Link to="/my-bookings" className="scheduling-text-link">View my bookings</Link>
            </div>
          )}
          <Button type="submit" disabled={!ready || start === null || end === null}>
            {mutation.isPending ? 'Requesting…' : 'Request booking'}
          </Button>
        </fieldset>
      </form>
    </section>
  )
}
