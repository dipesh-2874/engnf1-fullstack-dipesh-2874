import { api } from './axiosInstance.js'

export async function getTicketStats(signal) {
  const { data } = await api.get('/stats', { signal })
  return data
}
