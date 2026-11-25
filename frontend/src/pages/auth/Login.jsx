import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import AuthForm from './AuthForm.jsx'

export default function Login() {
  const { state } = useLocation()
  const { expired, signIn } = useAuth()

  let notice
  if (expired) notice = 'Your session expired. Sign in again.'
  if (state?.registered) notice = 'Account created. Sign in to continue.'

  return <AuthForm initialEmail={state?.email} from={state?.from} notice={notice} onSubmit={signIn} />
}
