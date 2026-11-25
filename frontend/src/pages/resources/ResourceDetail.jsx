import { ArrowLeft, CalendarDays, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import Input from '../../components/common/Input.jsx'
import Loader from '../../components/common/Loader.jsx'
import AvailabilityGrid from '../../components/resources/AvailabilityGrid.jsx'
import BookingForm from '../../components/resources/BookingForm.jsx'
import { useCreateBooking } from '../../hooks/useBookings.js'
import { useNow } from '../../hooks/useNow.js'
import { useResource, useResourceAvailability } from '../../hooks/useResources.js'
import { RESOURCE_TYPES } from '../../utils/constants.js'
import { BOOKING_HORIZON_MS, SLOT_MS, availabilitySlots, bookingEndOptions, localDateValue, localDayBounds } from '../../utils/dateUtils.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import '../../styles/scheduling.css'

const noSelection = { start: null, end: null }
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ')

function Schedule({ resource }) {
  const now = useNow()
  const [date, setDate] = useState(() => localDateValue(Date.now()))
  const [selection, setSelection] = useState(noSelection)
  const firstDate = localDateValue(now)
  const lastDate = localDateValue(now + BOOKING_HORIZON_MS)
  const day = date >= firstDate && date <= lastDate ? localDayBounds(date) : null
  const query = useResourceAvailability(resource.id, day ? date : '')
  const mutation = useCreateBooking()
  const ready = Boolean(day && query.isSuccess && !query.isFetching)
  const slots = day && query.data ? availabilitySlots(day, query.data, now) : []
  const startSlots = slots.filter((slot) => slot.state === 'Available')
  const start = startSlots.some((slot) => slot.start === selection.start) ? selection.start : null
  const endOptions = start === null ? [] : bookingEndOptions(start, query.data)
  const end = endOptions.includes(selection.end) ? selection.end : null

  function selectStart(time) {
    setSelection(time === null ? noSelection : { start: time, end: time + SLOT_MS })
  }

  function changeDate(value) {
    setDate(value)
    setSelection(noSelection)
    mutation.reset()
  }

  return (
    <div className="resource-schedule">
      <section className="availability-panel scheduling-surface" aria-labelledby="availability-title" aria-busy={query.isFetching}>
        <header className="scheduling-section-heading availability-heading">
          <span className="resource-icon"><CalendarDays size={20} aria-hidden="true" /></span>
          <div><h2 id="availability-title">Availability</h2><p className="scheduling-muted">Local time · {timeZone}</p></div>
        </header>
        <div className="availability-day-control">
          <Input label="Booking date" type="date" value={date} min={firstDate} max={lastDate} disabled={mutation.isPending}
            error={!day ? 'Choose a date within the next 30 days.' : undefined} onChange={(event) => changeDate(event.target.value)} />
          {day && query.isFetching && query.data && <span className="scheduling-muted" role="status">Refreshing availability…</span>}
        </div>
        {day && query.isPending && <Loader label="Loading availability…" />}
        {day && query.isError && <ErrorState title="Could not load availability" description={getErrorMessage(query.error, 'Please try again.')} retrying={query.isFetching} onRetry={() => query.refetch()} />}
        {day && query.data && (
          <>
            <p className="scheduling-muted availability-instructions">
              {startSlots.length > 0 ? 'Select an available start time.' : 'No start times are available for this date.'}
            </p>
            <AvailabilityGrid slots={slots} selectedStart={start} selectedEnd={start === null ? null : end ?? start + SLOT_MS} disabled={!ready || mutation.isPending} onSelect={selectStart} />
          </>
        )}
      </section>
      <BookingForm resourceId={resource.id} date={day?.start} startSlots={startSlots} endOptions={endOptions}
        start={start} end={end} onStart={selectStart} onEnd={(time) => setSelection({ start, end: time })} ready={ready} mutation={mutation} />
    </div>
  )
}

export default function ResourceDetail() {
  const { id } = useParams()
  const query = useResource(id)
  const resource = query.data

  return (
    <div className="scheduling-page">
      <Button as={Link} to="/resources" variant="ghost" className="scheduling-back"><ArrowLeft size={17} aria-hidden="true" /> Back to resources</Button>
      {query.isPending && <Loader label="Loading resource…" />}
      {query.isError && <ErrorState title="Could not load this resource" description={getErrorMessage(query.error, 'Please try again.')} onRetry={() => query.refetch()} retrying={query.isFetching} />}
      {resource && (
        <>
          <header className="dashboard-page-heading scheduling-heading">
            <div className="resource-detail-meta">
              <span className="ui-badge ui-badge--neutral">{RESOURCE_TYPES[resource.type] ?? resource.type}</span>
              <p className="scheduling-capacity"><UsersRound size={16} aria-hidden="true" /> Capacity {resource.capacity}</p>
            </div>
            <h1>{resource.name}</h1>
            {resource.description && <p>{resource.description}</p>}
          </header>
          {resource.isActive ? <Schedule key={resource.id} resource={resource} /> : (
            <EmptyState title="Resource unavailable" description="This resource is inactive and cannot be booked." />
          )}
        </>
      )}
    </div>
  )
}
