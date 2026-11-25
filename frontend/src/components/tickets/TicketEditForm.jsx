import { useState } from 'react'
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES, ticketFieldLabel } from '../../utils/constants.js'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import Select from '../common/Select.jsx'

const fields = [
  { key: 'category', label: 'Category', options: TICKET_CATEGORIES },
  { key: 'priority', label: 'Priority', options: TICKET_PRIORITIES },
  { key: 'status', label: 'Status', options: TICKET_STATUSES },
]

export default function TicketEditForm({ ticket, currentUserId, onSave, saving }) {
  const [draft, setDraft] = useState({})
  const [assigneeError, setAssigneeError] = useState('')
  const assignee = draft.assigneeId ?? ticket.assigneeId ?? ''
  const normalizedAssignee = assignee.trim().toLowerCase() || null
  const changes = Object.fromEntries(Object.entries({ ...draft, assigneeId: normalizedAssignee })
    .filter(([key, value]) => value !== ticket[key]))

  function change(key, value) {
    if (key === 'assigneeId') setAssigneeError('')
    setDraft((previous) => ({ ...previous, [key]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (saving || !Object.keys(changes).length) return
    if (normalizedAssignee && !/^[a-f0-9]{24}$/.test(normalizedAssignee)) {
      setAssigneeError('Enter a valid 24-character user ID or leave the field empty.')
      return
    }
    onSave(changes)
    setDraft({})
    setAssigneeError('')
  }

  return (
    <form className="ticket-edit-form" onSubmit={handleSubmit} aria-busy={saving}>
      <fieldset className="ticket-edit-fields" disabled={saving}>
        {fields.map(({ key, label, options }) => (
          <Select key={key} label={label} value={draft[key] ?? ticket[key]} onChange={(event) => change(key, event.target.value)}>
            {options.map((value) => <option key={value} value={value}>{ticketFieldLabel(value)}</option>)}
          </Select>
        ))}
        <div className="ticket-assignee-field">
          <Input
            label="Assignee ID"
            value={assignee}
            placeholder="Unassigned"
            hint="Leave empty to unassign the ticket."
            error={assigneeError}
            onChange={(event) => change('assigneeId', event.target.value)}
          />
          <Button variant="secondary" onClick={() => change('assigneeId', currentUserId)} disabled={normalizedAssignee === currentUserId}>
            Assign to me
          </Button>
        </div>
        <div className="ticket-form-actions ticket-edit-actions">
          <Button type="submit" disabled={!Object.keys(changes).length}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </fieldset>
    </form>
  )
}
