import axiosInstance from './axios'

export async function getUpcoming(category, status) {
  const params = {}
  if (category) params.category = category
  if (status) params.status = status
  const { data } = await axiosInstance.get('/api/upcoming', { params })
  return { count: data.count, items: data.items || [] }
}

export async function createUpcoming(payload) {
  const { data } = await axiosInstance.post('/api/upcoming', payload)
  return { message: data.message, item: data.item }
}

export async function updateUpcomingStatus(id, status) {
  const { data } = await axiosInstance.put(`/api/upcoming/${id}/status`, { status })
  return { message: data.message, item: data.item }
}
