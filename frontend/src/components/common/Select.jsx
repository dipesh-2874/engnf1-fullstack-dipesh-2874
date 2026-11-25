import { ChevronDown } from 'lucide-react'
import FormField from './FormField.jsx'

export default function Select({ id, label, hint, error, className = '', 'aria-describedby': describedBy, children, ...props }) {
  return (
    <FormField id={id} label={label} hint={hint} error={error} describedBy={describedBy}>
      {(fieldProps) => (
        <div className="ui-select">
          <select {...props} {...fieldProps} aria-invalid={error ? true : props['aria-invalid']} className={`ui-control ${className}`}>
            {children}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      )}
    </FormField>
  )
}
