import { useId } from 'react'

export default function FormField({ id, label, hint, error, describedBy, children }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const message = error || hint
  const descriptionId = message ? `${inputId}-message` : undefined

  return (
    <div className="ui-field">
      <label className="ui-field-label" htmlFor={inputId}>{label}</label>
      {children({
        id: inputId,
        'aria-describedby': [describedBy, descriptionId].filter(Boolean).join(' ') || undefined,
      })}
      {message && <p className={error ? 'ui-field-error' : 'ui-field-hint'} id={descriptionId}>{message}</p>}
    </div>
  )
}
