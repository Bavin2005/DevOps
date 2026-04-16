import axios from './axios'

export function getEmergencyContacts() {
  return axios.get('/api/emergency-contacts').then((res) => res.data)
}

export function createEmergencyContact(payload) {
  return axios.post('/api/emergency-contacts', payload).then((res) => res.data)
}

export function updateEmergencyContact(id, payload) {
  return axios.put(`/api/emergency-contacts/${id}`, payload).then((res) => res.data)
}

export function deleteEmergencyContact(id) {
  return axios.delete(`/api/emergency-contacts/${id}`).then((res) => res.data)
}
