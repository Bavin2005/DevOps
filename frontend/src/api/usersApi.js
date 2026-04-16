import axios from './axios'

export function getDirectory() {
  return axios.get('/api/users/directory').then((res) => res.data)
}

export function getItStaff() {
  return axios.get('/api/users/it-staff').then((res) => res.data)
}

export function getCelebrations() {
  return axios.get('/api/users/celebrations').then((res) => res.data)
}

export function updateUser(id, payload) {
  return axios.put(`/api/users/${id}`, payload).then((res) => res.data)
}
