import axios from 'axios'
import { endSession, getSession } from '../context/authSession.js'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:5000/api',
  allowAbsoluteUrls: false,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const { token, version } = getSession()

  if (token && !config.skipAuth) {
    config.headers.set('Authorization', `Bearer ${token}`)
    config.sessionVersion = version
  }

  return config
})

api.interceptors.response.use(undefined, (error) => {
  const { token, version } = getSession()

  if (error.response?.status === 401 && token && error.config?.sessionVersion === version) {
    endSession({ expired: true })
  }

  return Promise.reject(error)
})
