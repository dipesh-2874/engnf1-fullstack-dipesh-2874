import Button from './Button.jsx'
import Modal from './Modal.jsx'

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onClose, onConfirm, busy = false, error, destructive = false }) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      dismissible={!busy}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>{cancelLabel}</Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </>
      )}
    >
      {error && <p className="ui-field-error" role="alert">{error}</p>}
    </Modal>
  )
}
