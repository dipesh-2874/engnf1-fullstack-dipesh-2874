import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../utils/errorHandler.js'
import { validateCredentials } from '../../utils/validators.js'

function AuthField({ name, label, error, hint, children, ...inputProps }) {
  const message = error || hint
  const messageId = message ? `${name}-message` : undefined

  return (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>
      <div className="auth-input-wrap">
        <input
          {...inputProps}
          id={name}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          required
        />
        {children}
      </div>
      {message && (
        <p className={error ? 'auth-field-error' : 'auth-field-hint'} id={messageId}>{message}</p>
      )}
    </div>
  )
}

export default function AuthForm({ isRegistration = false, initialEmail, notice, from, onSubmit }) {
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const title = isRegistration ? 'Create your account' : 'Sign in'
  const description = isRegistration
    ? 'Register to triage tickets and book resources.'
    : 'Use your work account to access TriageSync.'

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    const form = event.currentTarget
    const formData = new FormData(form)
    const credentials = {
      email: String(formData.get('email') ?? '').trim().toLowerCase(),
      password: String(formData.get('password') ?? ''),
    }
    if (isRegistration) credentials.name = String(formData.get('name') ?? '').trim()

    const fieldErrors = validateCredentials(credentials)
    const firstInvalidField = Object.keys(fieldErrors)[0]
    setErrors(fieldErrors)
    setFormError('')

    if (firstInvalidField) {
      form.elements.namedItem(firstInvalidField).focus()
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(credentials)
    } catch (error) {
      const fallback = isRegistration
        ? 'Could not create your account. Please try again.'
        : 'Could not sign in. Please try again.'
      setFormError(getErrorMessage(error, fallback))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <h1>{title}</h1>
      <p className="auth-description">{description}</p>

      {formError ? (
        <p className="auth-notice auth-notice-error" role="alert">{formError}</p>
      ) : notice && (
        <p className="auth-notice" role="status">{notice}</p>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting}>
          {isRegistration && (
            <AuthField name="name" label="Full name" autoComplete="name" error={errors.name} />
          )}
          <AuthField
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            defaultValue={initialEmail}
            error={errors.email}
          />
          <AuthField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            className="auth-password-input"
            autoComplete={isRegistration ? 'new-password' : 'current-password'}
            maxLength={isRegistration ? 64 : undefined}
            error={errors.password}
            hint={isRegistration ? '8 to 64 characters, including a letter and a number.' : undefined}
          >
            <button
              className="auth-password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
            </button>
          </AuthField>
          <button className="auth-primary" type="submit">
            {isSubmitting ? (isRegistration ? 'Creating account…' : 'Signing in…') : title}
            {!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        </fieldset>
      </form>

      <p className="auth-footer">
        {isRegistration ? 'Already have an account?' : 'New to TriageSync?'}{' '}
        <Link to={isRegistration ? '/login' : '/register'} state={{ from }}>
          {isRegistration ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </>
  )
}
