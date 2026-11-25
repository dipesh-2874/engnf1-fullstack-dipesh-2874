import FormField from './FormField.jsx'

export default function Input({ id, label, hint, error, className = '', 'aria-describedby': describedBy, ...props }) {
  return (
    <FormField id={id} label={label} hint={hint} error={error} describedBy={describedBy}>
      {(fieldProps) => (
        <input {...props} {...fieldProps} aria-invalid={error ? true : props['aria-invalid']} className={`ui-control ${className}`} />
      )}
    </FormField>
  )
}
