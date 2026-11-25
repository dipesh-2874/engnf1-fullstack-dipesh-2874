import { useAuth } from '../../hooks/useAuth.js'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import { getErrorMessage } from '../../utils/errorHandler.js'

export default function SessionStatus() {
  const { sessionError, isRetrying, retrySession, signOut } = useAuth()

  return (
    <AuthLayout>
      {sessionError ? (
        <>
          <h1>Could not verify your session</h1>
          <p className="auth-description" role="alert">
            {getErrorMessage(sessionError, 'Check your connection and try again.')}
          </p>
          <div className="auth-actions">
            <button type="button" className="auth-primary" disabled={isRetrying} onClick={() => retrySession()}>
              {isRetrying ? 'Trying again…' : 'Try again'}
            </button>
            <button type="button" className="auth-text-button" onClick={() => signOut()}>Sign out</button>
          </div>
        </>
      ) : (
        <h1 role="status">Checking your session…</h1>
      )}
    </AuthLayout>
  )
}
