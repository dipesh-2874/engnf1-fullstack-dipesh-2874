import { CalendarDays, ChartNoAxesCombined, ClipboardList, Layers3 } from 'lucide-react'
import BookingStatusChart from '../../components/analytics/BookingStatusChart.jsx'
import CategoryChart from '../../components/analytics/CategoryChart.jsx'
import PriorityChart from '../../components/analytics/PriorityChart.jsx'
import TopResourcesChart from '../../components/analytics/TopResourcesChart.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import Loader from '../../components/common/Loader.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import { useAdminStats, useTicketStats } from '../../hooks/useStats.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import '../../styles/admin.css'

const number = new Intl.NumberFormat()
const percent = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 2 })

export default function AdminDashboard() {
  const adminQuery = useAdminStats()
  const ticketQuery = useTicketStats()
  const admin = adminQuery.data
  const tickets = ticketQuery.data

  return (
    <div className="scheduling-page">
      <header className="dashboard-page-heading scheduling-heading">
        <h1>Analytics Dashboard</h1><p>Monitor ticket performance and resource utilization.</p>
      </header>

      {(adminQuery.isPending || ticketQuery.isPending) && <Loader label="Loading analytics…" />}
      {adminQuery.isError && <ErrorState title="Could not load resource and booking analytics" description={getErrorMessage(adminQuery.error, 'Please try again.')} onRetry={adminQuery.refetch} retrying={adminQuery.isFetching} />}
      {ticketQuery.isError && <ErrorState title="Could not load ticket analytics" description={getErrorMessage(ticketQuery.error, 'Please try again.')} onRetry={ticketQuery.refetch} retrying={ticketQuery.isFetching} />}

      {(admin || tickets) && (
        <section className="analytics-stats-grid" aria-label="Overview metrics">
          {admin && (
            <>
              <StatCard label="Active resources" value={number.format(admin.activeResources)} icon={Layers3} />
              <StatCard label="Total bookings" value={number.format(admin.totalBookings)} icon={CalendarDays} />
              <StatCard label="Pending requests" value={number.format(admin.bookingsByStatus.PENDING)} icon={ClipboardList} />
            </>
          )}
          {tickets && <StatCard label="Model agreement" value={percent.format(tickets.modelAgreementRate / 100)} icon={ChartNoAxesCombined} />}
        </section>
      )}

      {(admin || tickets) && (
        <div className="analytics-charts-grid">
          {tickets && <CategoryChart counts={tickets.categoryDistribution} />}
          {admin && <BookingStatusChart counts={admin.bookingsByStatus} />}
          {tickets && <PriorityChart counts={tickets.priorityDistribution} />}
          {admin && <TopResourcesChart resources={admin.topResources} />}
        </div>
      )}
    </div>
  )
}
