import { TICKET_CATEGORIES, ticketFieldLabel } from '../../utils/constants.js'
import CountBarChart from './CountBarChart.jsx'

export default function CategoryChart({ counts }) {
  const rows = TICKET_CATEGORIES.map((id) => ({ id, label: ticketFieldLabel(id), value: counts[id] }))
  return <CountBarChart title="Tickets by category" rows={rows} emptyMessage="No ticket categories to show yet." />
}
