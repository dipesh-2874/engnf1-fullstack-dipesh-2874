import { api } from './axiosInstance.js'

export async function getTicketStats(signal) {
  const { data } = await api.get('/stats', { signal })
  return data
}

export async function getAdminStats(signal) {
  const { data } = await api.get('/admin/stats', { signal })
  return data
}
