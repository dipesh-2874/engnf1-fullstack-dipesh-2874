import { TICKET_PRIORITIES, ticketFieldLabel } from '../../utils/constants.js'
import CountBarChart from './CountBarChart.jsx'

export default function PriorityChart({ counts }) {
  const rows = TICKET_PRIORITIES.map((id) => ({ id, label: ticketFieldLabel(id), value: counts[id] }))
  return <CountBarChart title="Tickets by priority" rows={rows} emptyMessage="No ticket priorities to show yet." />
}
