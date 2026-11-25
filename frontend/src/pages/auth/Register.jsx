import { useLocation, useNavigate } from 'react-router-dom'
import { registerUser } from '../../api/authApi.js'
import AuthForm from './AuthForm.jsx'

export default function Register() {
  const navigate = useNavigate()
  const { state } = useLocation()

  async function register(credentials) {
    const user = await registerUser(credentials)
    navigate('/login', {
      replace: true,
      state: { registered: true, email: user.email, from: state?.from },
    })
  }

  return <AuthForm isRegistration from={state?.from} onSubmit={register} />
}
