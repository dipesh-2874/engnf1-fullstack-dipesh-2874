import { useAuth } from '../hooks/useAuth.js'
import AuthLayout from '../layouts/AuthLayout.jsx'

export default function WorkspaceLanding({ title }) {
  const { user, signOut } = useAuth()

  return (
    <AuthLayout>
      <h1>{title}</h1>
      <p className="auth-description">Signed in as {user.name}.</p>
      <div className="auth-actions">
        <button type="button" className="auth-text-button" onClick={() => signOut()}>Sign out</button>
      </div>
    </AuthLayout>
  )
}
