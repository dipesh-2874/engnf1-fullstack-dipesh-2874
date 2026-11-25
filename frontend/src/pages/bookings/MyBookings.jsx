import { CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import BookingDetails from '../../components/bookings/BookingDetails.jsx'
import BookingFilters from '../../components/bookings/BookingFilters.jsx'
import BookingTable from '../../components/bookings/BookingTable.jsx'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import Loader from '../../components/common/Loader.jsx'
import { useCancelBooking, useMyBookings } from '../../hooks/useBookings.js'
import { useNow } from '../../hooks/useNow.js'
import { formatBookingRange } from '../../utils/dateUtils.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import '../../styles/scheduling.css'

export default function MyBookings() {
  const [status, setStatus] = useState('')
  const [selection, setSelection] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [notice, setNotice] = useState('')
  const now = useNow()
  const query = useMyBookings(status)
  const cancellation = useCancelBooking()
  const booking = query.data?.find(({ id }) => id === selection?.id) ?? selection
  const canCancel = Boolean(booking && Date.parse(booking.startTime) > now && ['PENDING', 'APPROVED'].includes(booking.status))

  function closeConfirmation() {
    cancellation.reset()
    setConfirming(false)
  }

  function confirmCancellation() {
    if (!booking || cancellation.isPending) return
    setNotice('')
    cancellation.mutate({ id: booking.id, resourceId: booking.resourceId }, {
      onSuccess() {
        setSelection(null)
        setConfirming(false)
        setNotice('Booking cancelled.')
      },
    })
  }

  return (
    <div className="scheduling-page">
      <header className="dashboard-page-heading scheduling-heading scheduling-heading--split">
        <div><h1>My Bookings</h1><p>View and manage your resource bookings.</p></div>
        <Button as={Link} to="/resources"><CalendarPlus size={17} aria-hidden="true" /> Browse resources</Button>
      </header>
      <BookingFilters status={status} onStatus={setStatus} />
      {notice && <p className="scheduling-message" role="status">{notice}</p>}
      {query.isPending && <Loader label="Loading bookings…" />}
      {query.isError && <ErrorState title="Could not load bookings" description={getErrorMessage(query.error, 'Please try again.')} retrying={query.isFetching} onRetry={() => query.refetch()} />}
      {query.data?.length === 0 && (
        <EmptyState
          title={status ? 'No bookings with this status' : 'No bookings yet'}
          description={status ? 'Choose another status to see more bookings.' : 'Browse resources to request a booking.'}
          action={status ? <Button variant="secondary" onClick={() => setStatus('')}>Show all bookings</Button> : undefined}
        />
      )}
      {query.data?.length > 0 && (
        <section className="bookings-results scheduling-surface" aria-label="Booking results" aria-busy={query.isFetching}>
          <header><h2>Your bookings</h2><p className="scheduling-muted">{query.data.length} {query.data.length === 1 ? 'booking' : 'bookings'}</p></header>
          <BookingTable bookings={query.data} onOpen={setSelection} />
        </section>
      )}
      <BookingDetails booking={booking} open={Boolean(booking) && !confirming} onClose={() => setSelection(null)} onCancel={() => setConfirming(true)} canCancel={canCancel} />
      <ConfirmDialog
        open={confirming}
        title="Cancel this booking?"
        description={booking && `${booking.resource?.name ?? 'Resource booking'} · ${formatBookingRange(booking.startTime, booking.endTime)}`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        onClose={closeConfirmation}
        onConfirm={confirmCancellation}
        busy={cancellation.isPending}
        error={cancellation.isError ? getErrorMessage(cancellation.error, 'Could not cancel this booking. Try again.') : undefined}
        destructive
      />
    </div>
  )
}
