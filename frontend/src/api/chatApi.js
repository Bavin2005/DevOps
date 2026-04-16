import axios from './axios'

export function getConversations() {
  return axios.get('/api/chat/conversations').then((res) => res.data)
}

export function getMessages(peerId) {
  return axios.get(`/api/chat/messages/${peerId}`).then((res) => res.data)
}

export function sendMessage(receiver, content) {
  return axios.post('/api/chat/messages', { receiver, content }).then((res) => res.data)
}
