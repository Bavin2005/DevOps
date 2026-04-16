import axiosInstance from './axios'

export async function getAnnouncements() {
  const { data } = await axiosInstance.get('/api/announcements')
  return { count: data.count, announcements: data.announcements || [] }
}

export async function createAnnouncement(payload) {
  const { data } = await axiosInstance.post('/api/announcements', payload)
  return { message: data.message, announcement: data.announcement }
}
