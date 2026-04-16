import axiosInstance from './axios'

export async function sendChatMessage(message) {
  const { data } = await axiosInstance.post('/api/ai/chat', { message })
  return { reply: data.reply, source: data.source }
}
