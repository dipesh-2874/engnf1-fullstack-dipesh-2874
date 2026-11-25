import { useState } from 'react'
import BookingDetails from '../../components/bookings/BookingDetails.jsx'
import BookingFilters from '../../components/bookings/BookingFilters.jsx'
import BookingTable from '../../components/bookings/BookingTable.jsx'
import RejectBookingModal from '../../components/bookings/RejectBookingModal.jsx'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import Input from '../../components/common/Input.jsx'
import Loader from '../../components/common/Loader.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Select from '../../components/common/Select.jsx'
import { useAdminBookings, useApproveBooking, useRejectBooking } from '../../hooks/useBookings.js'
import { useNow } from '../../hooks/useNow.js'
import { formatBookingRange, localDayBounds } from '../../utils/dateUtils.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import '../../styles/admin.css'

const emptyFilters = { status: '', resourceId: '', from: '', to: '' }
const pageSize = 10

function BookingResults({ bookings, hasFilters, onClear, onOpen, refreshing }) {
  const [page, setPage] = useState(1)
  const pageCount = Math.ceil(bookings.length / pageSize)
  const displayPage = Math.min(page, Math.max(pageCount, 1))
  const rows = bookings.slice((displayPage - 1) * pageSize, displayPage * pageSize)

  if (!bookings.length) {
    return (
      <EmptyState title={hasFilters ? 'No matching bookings' : 'No booking requests yet'}
        action={hasFilters && <Button variant="secondary" onClick={onClear}>Clear filters</Button>} />
    )
  }

  return (
    <section className="scheduling-results" aria-label="Booking results" aria-busy={refreshing}>
      <div className="bookings-results scheduling-surface">
        <header><h2>Booking requests</h2><p className="scheduling-muted">{bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}</p></header>
        <BookingTable bookings={rows} onOpen={onOpen} label="Booking requests" />
      </div>
      <Pagination page={displayPage} totalPages={pageCount} onPageChange={setPage} />
    </section>
  )
}

export default function AdminBookings() {
  const now = useNow()
  const query = useAdminBookings()
  const approve = useApproveBooking()
  const reject = useRejectBooking()
  const [filters, setFilters] = useState(emptyFilters)
  const [selected, setSelected] = useState(null)
  const [decision, setDecision] = useState(null)
  const [notice, setNotice] = useState('')
  const allBookings = query.data ?? []
  const resourceOptions = [...new Map(allBookings.filter(({ resource }) => resource).map(({ resource }) => [resource.id, resource])).values()]
    .sort((a, b) => a.name.localeCompare(b.name))
  const from = localDayBounds(filters.from)
  const to = localDayBounds(filters.to)
  const dateError = from && to && from.start >= to.end
  const bookings = allBookings.filter((booking) => (
    (!filters.status || booking.status === filters.status) &&
    (!filters.resourceId || booking.resourceId === filters.resourceId) &&
    (!from || Date.parse(booking.endTime) > from.start) &&
    (!to || Date.parse(booking.startTime) < to.end)
  ))
  const booking = allBookings.find(({ id }) => id === selected?.id) ?? selected
  const canDecide = booking?.status === 'PENDING' && Date.parse(booking.startTime) > now
  const description = booking && `${booking.resource?.name ?? 'Resource booking'} · ${formatBookingRange(booking.startTime, booking.endTime)}`

  function changeFilter(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }))
  }

  function closeDecision() {
    approve.reset()
    reject.reset()
    setDecision(null)
  }

  function recordDecision(mutation, message, note) {
    if (!canDecide || mutation.isPending) return
    setNotice('')
    mutation.mutate({ id: booking.id, resourceId: booking.resourceId, note }, {
      onSuccess() {
        setSelected(null)
        setDecision(null)
        setNotice(message)
      },
    })
  }

  return (
    <div className="scheduling-page">
      <header className="dashboard-page-heading scheduling-heading"><h1>Manage Bookings</h1><p>Review resource requests and record booking decisions.</p></header>
      <BookingFilters status={filters.status} onStatus={(value) => changeFilter('status', value)}>
        <Select label="Resource" value={filters.resourceId} onChange={(event) => changeFilter('resourceId', event.target.value)}>
          <option value="">All resources</option>
          {resourceOptions.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}
        </Select>
        <Input label="From date" type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => changeFilter('from', event.target.value)} />
        <Input label="To date" type="date" value={filters.to} min={filters.from || undefined} error={dateError ? 'Choose a date on or after the start date.' : undefined} onChange={(event) => changeFilter('to', event.target.value)} />
        <Button className="scheduling-filter-reset" variant="ghost" disabled={!Object.values(filters).some(Boolean)} onClick={() => setFilters(emptyFilters)}>Clear filters</Button>
      </BookingFilters>

      {notice && <p className="scheduling-message" role="status">{notice}</p>}
      {query.isPending && <Loader label="Loading bookings…" />}
      {query.isError && <ErrorState title="Could not load booking requests" description={getErrorMessage(query.error, 'Please try again.')} onRetry={query.refetch} retrying={query.isFetching} />}
      {query.data && !dateError && <BookingResults key={JSON.stringify(filters)} bookings={bookings} hasFilters={Object.values(filters).some(Boolean)}
        onOpen={setSelected} onClear={() => setFilters(emptyFilters)} refreshing={query.isFetching} />}

      <BookingDetails booking={booking} open={Boolean(booking) && !decision} onClose={() => setSelected(null)}
        actions={canDecide && (
          <>
            <Button variant="secondary" onClick={() => {
              reject.reset()
              setDecision('reject')
            }}>Reject booking</Button>
            <Button onClick={() => {
              approve.reset()
              setDecision('approve')
            }}>Approve booking</Button>
          </>
        )} />
      <ConfirmDialog open={decision === 'approve'} title="Approve this booking?" description={description}
        confirmLabel="Approve booking" cancelLabel="Back" onClose={closeDecision}
        onConfirm={() => recordDecision(approve, 'Booking approved.')} busy={approve.isPending} confirmDisabled={!canDecide}
        error={approve.isError ? getErrorMessage(approve.error, 'Could not approve the booking. Please try again.') : undefined} />
      <RejectBookingModal open={decision === 'reject'} description={description} onClose={closeDecision}
        onReject={(note) => recordDecision(reject, 'Booking rejected.', note)} busy={reject.isPending} canReject={canDecide}
        error={reject.isError ? getErrorMessage(reject.error, 'Could not reject the booking. Please try again.') : undefined} />
    </div>
  )
}
