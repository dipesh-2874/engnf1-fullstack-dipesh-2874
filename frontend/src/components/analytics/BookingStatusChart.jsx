import { useId } from 'react'
import { Pie, PieChart, ResponsiveContainer } from 'recharts'
import { BOOKING_STATUSES } from '../../utils/constants.js'

const colors = { APPROVED: '#004d3a', PENDING: '#bc9147', REJECTED: '#823e30', CANCELLED: '#9a938b' }
const order = ['APPROVED', 'PENDING', 'REJECTED', 'CANCELLED']
const number = new Intl.NumberFormat()

export default function BookingStatusChart({ counts }) {
  const titleId = useId()
  const series = order.map((status) => ({ label: BOOKING_STATUSES[status], value: counts[status], fill: colors[status] }))
  const total = series.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="analytics-chart scheduling-surface" aria-labelledby={titleId}>
      <h2 id={titleId}>Bookings by status</h2>
      {total > 0 ? (
        <div className="analytics-booking-summary">
          <div className="analytics-donut" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer={false}>
                <Pie data={series.filter(({ value }) => value > 0)} dataKey="value" nameKey="label" innerRadius="67%" outerRadius="95%" stroke="none" isAnimationActive={false} />
              </PieChart>
            </ResponsiveContainer>
            <div className="analytics-donut-total"><strong>{number.format(total)}</strong><span>Bookings</span></div>
          </div>
          <ul className="analytics-legend" aria-label="Booking status counts">
            {series.map(({ label, value, fill }) => (
              <li key={label}>
                <span className="analytics-legend-dot" style={{ backgroundColor: fill }} aria-hidden="true" />
                <span>{label}</span><strong>{number.format(value)}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : <p className="scheduling-muted">No bookings yet.</p>}
    </section>
  )
}
