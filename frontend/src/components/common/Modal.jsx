import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import Button from './Button.jsx'

export default function Modal({ open, onClose, id, title, description, children, footer, dismissible = true, className = '' }) {
  const ref = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function handleCancel(event) {
    event.preventDefault()
    if (dismissible) onClose()
  }

  function handleBackdrop(event) {
    if (event.target === event.currentTarget && dismissible) onClose()
  }

  return (
    <dialog
      ref={ref}
      id={id}
      className={`ui-dialog ${className}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClick={handleBackdrop}
    >
      <div className="ui-dialog-surface">
        <header className="ui-dialog-header">
          <h2 id={titleId}>{title}</h2>
          {dismissible && (
            <Button variant="icon" onClick={onClose} aria-label="Close dialog">
              <X size={20} aria-hidden="true" />
            </Button>
          )}
        </header>
        <div className="ui-dialog-body">
          {description && <p className="ui-dialog-description" id={descriptionId}>{description}</p>}
          {children}
        </div>
        {footer && <footer className="ui-dialog-footer">{footer}</footer>}
      </div>
    </dialog>
  )
}
