import { useState } from 'react'
import Button from '../common/Button.jsx'
import FormField from '../common/FormField.jsx'
import Modal from '../common/Modal.jsx'

export default function RejectBookingModal({ open, description, onClose, onReject, busy, canReject, error }) {
  const [noteError, setNoteError] = useState('')

  function close() {
    setNoteError('')
    onClose()
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!canReject || busy) return

    const form = event.currentTarget
    const note = String(new FormData(form).get('note') ?? '').trim()
    if (note.length < 5 || note.length > 200) {
      setNoteError('Enter a rejection note between 5 and 200 characters.')
      form.elements.namedItem('note').focus()
      return
    }

    setNoteError('')
    onReject(note)
  }

  return (
    <Modal open={open} title="Reject booking" description={description} onClose={close} dismissible={!busy}>
      {open && (
        <form className="admin-dialog-form" onSubmit={handleSubmit} noValidate aria-busy={busy}>
          <fieldset disabled={busy}>
            <FormField label="Rejection note" hint="5–200 characters. The requester will see this in My Bookings." error={noteError}>
              {(field) => <textarea {...field} className="ui-control admin-textarea" name="note" rows={4} maxLength={200} aria-invalid={Boolean(noteError)} required onChange={() => setNoteError('')} />}
            </FormField>
            {error && <p className="scheduling-message scheduling-message--error" role="alert">{error}</p>}
            <div className="admin-dialog-actions">
              <Button variant="secondary" onClick={close}>Back</Button>
              <Button type="submit" variant="danger" disabled={!canReject}>{busy ? 'Rejecting…' : 'Reject booking'}</Button>
            </div>
          </fieldset>
        </form>
      )}
    </Modal>
  )
}
