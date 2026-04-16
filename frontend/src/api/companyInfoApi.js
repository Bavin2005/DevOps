import axiosInstance from './axios'

export async function getCompanyInfo() {
  const { data } = await axiosInstance.get('/api/company-info')
  return data
}

export async function updateCompanyInfo(key, value) {
  const { data } = await axiosInstance.put('/api/company-info', { key, value })
  return data
}
