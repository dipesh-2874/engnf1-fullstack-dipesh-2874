import { useState } from 'react'
import { RESOURCE_TYPES } from '../../utils/constants.js'
import Button from '../common/Button.jsx'
import FormField from '../common/FormField.jsx'
import Input from '../common/Input.jsx'
import Select from '../common/Select.jsx'

export default function ResourceForm({ resource, onSave, onClose, busy, error }) {
  const [errors, setErrors] = useState({})

  function handleSubmit(event) {
    event.preventDefault()
    if (busy) return

    const form = event.currentTarget
    const values = new FormData(form)
    const changes = {
      name: String(values.get('name')).trim(),
      type: String(values.get('type')),
      capacity: Number(values.get('capacity')),
      description: String(values.get('description')).trim() || null,
    }
    const nextErrors = {}
    if (changes.name.length < 3 || changes.name.length > 60) nextErrors.name = 'Enter a name between 3 and 60 characters.'
    if (!Object.hasOwn(RESOURCE_TYPES, changes.type)) nextErrors.type = 'Choose a resource type.'
    if (!Number.isInteger(changes.capacity) || changes.capacity < 1 || changes.capacity > 500) nextErrors.capacity = 'Enter a whole number from 1 to 500.'
    if (changes.description?.length > 300) nextErrors.description = 'Use 300 characters or fewer.'

    const first = Object.keys(nextErrors)[0]
    if (first) {
      setErrors(nextErrors)
      form.elements.namedItem(first).focus()
      return
    }

    const edit = resource ? Object.fromEntries(Object.entries(changes).filter(([key, value]) => value !== (resource[key] ?? null))) : changes
    if (!Object.keys(edit).length) {
      setErrors({ form: 'Change a field before saving.' })
      return
    }

    setErrors({})
    onSave(edit)
  }

  return (
    <form className="admin-dialog-form" onSubmit={handleSubmit} noValidate aria-busy={busy}>
      <fieldset disabled={busy} onChange={() => setErrors({})}>
        <Input label="Name" name="name" defaultValue={resource?.name ?? ''} error={errors.name} required />
        <div className="admin-resource-fields">
          <Select label="Resource type" name="type" defaultValue={resource?.type ?? ''} error={errors.type} required>
            <option value="" disabled>Choose type</option>
            {Object.entries(RESOURCE_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <Input label="Capacity" name="capacity" type="number" min={1} max={500} step={1} defaultValue={resource?.capacity ?? ''} error={errors.capacity} required />
        </div>
        <FormField label="Description" hint="Optional, up to 300 characters." error={errors.description}>
          {(field) => <textarea {...field} className="ui-control admin-textarea" name="description" rows={3} maxLength={300} aria-invalid={Boolean(errors.description)} defaultValue={resource?.description ?? ''} />}
        </FormField>
        {(errors.form || error) && <p className="scheduling-message scheduling-message--error" role="alert">{errors.form || error}</p>}
        <div className="admin-dialog-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{busy ? 'Saving…' : resource ? 'Save changes' : 'Create resource'}</Button>
        </div>
      </fieldset>
    </form>
  )
}
