import axiosInstance from './axios'

export async function getPolicies(category) {
  const params = category ? { category } : {}
  const { data } = await axiosInstance.get('/api/policies', { params })
  return { count: data.count, policies: data.policies || [] }
}

export async function getPolicy(id) {
  const { data } = await axiosInstance.get(`/api/policies/${id}`)
  return data
}

export async function createPolicy(payload) {
  const { data } = await axiosInstance.post('/api/policies', payload)
  return { message: data.message, policy: data.policy }
}
