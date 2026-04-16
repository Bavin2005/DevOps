import axios from './axios'

export function getRooms() {
  return axios.get('/api/meeting-rooms/rooms').then((res) => res.data)
}

export function createRoom(payload) {
  return axios.post('/api/meeting-rooms/rooms', payload).then((res) => res.data)
}

export function getBookings(params = {}) {
  return axios.get('/api/meeting-rooms/bookings', { params }).then((res) => res.data)
}

export function createBooking(payload) {
  return axios.post('/api/meeting-rooms/bookings', payload).then((res) => res.data)
}

export function cancelBooking(id) {
  return axios.delete(`/api/meeting-rooms/bookings/${id}`).then((res) => res.data)
}
