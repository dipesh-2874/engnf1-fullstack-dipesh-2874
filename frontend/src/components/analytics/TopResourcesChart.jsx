import CountBarChart from './CountBarChart.jsx'

export default function TopResourcesChart({ resources }) {
  const rows = resources.map(({ resourceId, name, bookingCount }) => ({ id: resourceId, label: name, value: bookingCount }))
  return <CountBarChart title="Top booked resources" rows={rows} emptyMessage="No resource bookings to rank yet." tone="highlight" />
}
