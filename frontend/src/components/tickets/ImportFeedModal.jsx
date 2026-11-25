import { useState } from 'react'
import { useImportTickets } from '../../hooks/useTickets.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import Button from '../common/Button.jsx'
import FormField from '../common/FormField.jsx'
import Input from '../common/Input.jsx'
import Modal from '../common/Modal.jsx'

function readFeed(text) {
  let feed
  try {
    feed = JSON.parse(text)
  } catch {
    throw new Error('Enter a valid JSON feed.')
  }

  const tickets = Array.isArray(feed) ? feed : feed?.tickets
  if (!Array.isArray(tickets) || tickets.length === 0) {
    throw new Error('The feed must contain a non-empty array of tickets.')
  }
  return tickets
}

export default function ImportFeedModal({ open, onClose }) {
  const [feedText, setFeedText] = useState('')
  const [reading, setReading] = useState(false)
  const [inputError, setInputError] = useState('')
  const mutation = useImportTickets()
  const busy = reading || mutation.isPending
  const requestError = mutation.error?.response?.status === 413
    ? 'This feed is too large for one upload. Split it into smaller JSON files.'
    : getErrorMessage(mutation.error, 'Could not import this feed. Try again.')

  function handleClose() {
    setInputError('')
    mutation.reset()
    onClose()
  }

  function changeFeed(text) {
    setFeedText(text)
    setInputError('')
    mutation.reset()
  }

  async function handleFile(event) {
    const file = event.currentTarget.files[0]
    if (!file) return
    event.currentTarget.value = ''
    setReading(true)
    try {
      changeFeed(await file.text())
    } catch {
      changeFeed('')
      setInputError('Could not read this file. Select it again or paste the JSON.')
    } finally {
      setReading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (busy) return
    setInputError('')
    mutation.reset()
    try {
      mutation.mutate(readFeed(feedText))
    } catch (error) {
      setInputError(error.message)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Re-Import Feed" dismissible={!busy}>
      <form className="ticket-import-form" onSubmit={handleSubmit}>
        <Input type="file" label="Choose a JSON file" accept=".json,application/json" disabled={busy} onChange={handleFile} />
        <FormField label="Feed JSON" hint="Each ticket requires externalId, subject, and body." error={inputError}>
          {(field) => (
            <textarea
              {...field}
              className="ui-control ticket-feed-source"
              rows={8}
              value={feedText}
              disabled={busy}
              aria-invalid={Boolean(inputError)}
              onChange={(event) => changeFeed(event.target.value)}
            />
          )}
        </FormField>
        {mutation.isError && <p className="ticket-message ticket-message--error" role="alert">{requestError}</p>}
        {mutation.isSuccess && (
          <p className="ticket-message" role="status">
            {mutation.data.imported} newly imported · {mutation.data.updated} updated
          </p>
        )}
        <div className="ticket-form-actions">
          <Button variant="secondary" disabled={busy} onClick={handleClose}>Close</Button>
          <Button type="submit" disabled={busy || !feedText.trim()}>
            {reading ? 'Reading file…' : mutation.isPending ? 'Importing…' : 'Import feed'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
