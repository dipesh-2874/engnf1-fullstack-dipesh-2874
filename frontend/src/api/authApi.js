import { api } from './axiosInstance.js'

export async function loginUser(credentials) {
  const { data } = await api.post('/auth/login', credentials, { skipAuth: true })
  return data
}

export async function registerUser(details) {
  const { data } = await api.post('/auth/register', details, { skipAuth: true })
  return data.user
}

export async function getCurrentUser(signal) {
  const { data } = await api.get('/auth/me', { signal })
  return data.user
}
