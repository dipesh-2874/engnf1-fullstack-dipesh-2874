import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { getCurrentUser, loginUser } from '../api/authApi.js'
import { endSession, getSession, startSession, subscribeToSession } from './authSession.js'
import { AuthContext } from './authState.js'

async function signIn(credentials) {
  const { token } = await loginUser(credentials)
  startSession(token)
}

export default function AuthProvider({ children }) {
  const { token, version, expired } = useSyncExternalStore(subscribeToSession, getSession)
  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: ['auth', 'me', version],
    queryFn: ({ signal }) => getCurrentUser(signal),
    enabled: Boolean(token),
    retry: false,
    networkMode: 'always',
  })

  const user = token ? data ?? null : null

  return (
    <AuthContext.Provider value={{
      user,
      expired,
      isChecking: Boolean(token && isPending),
      isRetrying: isFetching,
      sessionError: token && !user ? error : null,
      retrySession: refetch,
      signIn,
      signOut: endSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
