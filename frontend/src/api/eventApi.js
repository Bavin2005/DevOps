import axiosInstance from './axios'

export async function getEvents(from, to) {
  const params = {}
  if (from) params.from = from
  if (to) params.to = to
  const { data } = await axiosInstance.get('/api/events', { params })
  return { count: data.count, events: data.events || [] }
}

export async function createEvent(payload) {
  const { data } = await axiosInstance.post('/api/events', payload)
  return { message: data.message, event: data.event }
}
