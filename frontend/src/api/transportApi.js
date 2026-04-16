import axios from './axios'

// Transport Routes (Shuttle)
export function getTransportRoutes() {
  return axios.get('/api/transport').then((r) => r.data)
}

export function createRoute(data) {
  return axios.post('/api/transport', data).then((r) => r.data)
}

export function updateRoute(id, data) {
  return axios.put(`/api/transport/${id}`, data).then((r) => r.data)
}

export function deleteRoute(id) {
  return axios.delete(`/api/transport/${id}`).then((r) => r.data)
}

// Cab Bookings
export function bookCab(bookingData) {
  return axios.post('/api/transport/book-cab', bookingData).then((r) => r.data)
}

export function getMyCabBookings() {
  return axios.get('/api/transport/my-cab-bookings').then((r) => r.data)
}

export function getAllCabBookings() {
  return axios.get('/api/transport/cab-bookings').then((r) => r.data)
}

export function updateCabBooking(id, updates) {
  return axios.patch(`/api/transport/cab-bookings/${id}`, updates).then((r) => r.data)
}

export function deleteCabBooking(id) {
  return axios.delete(`/api/transport/cab-bookings/${id}`).then((r) => r.data)
}
