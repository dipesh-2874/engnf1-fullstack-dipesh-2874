import { BadgeCheck, ChartNoAxesCombined, ClipboardList, Inbox } from 'lucide-react'
import ErrorState from '../common/ErrorState.jsx'
import Loader from '../common/Loader.jsx'
import StatCard from '../common/StatCard.jsx'
import { useTicketStats } from '../../hooks/useStats.js'
import { getErrorMessage } from '../../utils/errorHandler.js'

const count = new Intl.NumberFormat()
const percentage = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 2 })

export default function TicketStats() {
  const { data, isPending, isError, error, isFetching, refetch } = useTicketStats()

  return (
    <section aria-label="Ticket statistics" aria-busy={isFetching}>
      {isPending && <div className="ticket-surface"><Loader label="Loading ticket statistics…" /></div>}
      {isError && (
        <ErrorState
          title="Could not load ticket statistics"
          description={getErrorMessage(error, 'Please try again.')}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      )}
      {data && (
        <div className="ticket-stats-grid">
          <StatCard label="Total tickets" value={count.format(data.totalTickets)} icon={ClipboardList} />
          <StatCard label="Open tickets" value={count.format(data.statusDistribution.OPEN)} icon={Inbox} />
          <StatCard label="Reviewed" value={count.format(data.reviewedTickets)} icon={BadgeCheck} />
          <StatCard label="Model agreement" value={percentage.format(data.modelAgreementRate / 100)} icon={ChartNoAxesCombined} />
        </div>
      )}
    </section>
  )
}
