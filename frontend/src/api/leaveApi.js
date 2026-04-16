import axiosInstance from './axios'

export async function getLeaves() {
  const { data } = await axiosInstance.get('/api/leaves')
  return { count: data.count, leaves: data.leaves || [] }
}

export async function applyLeave(payload) {
  const { data } = await axiosInstance.post('/api/leaves/apply', payload)
  return { message: data.message, leave: data.leave }
}

export async function getLeaveBalance() {
  const { data } = await axiosInstance.get('/api/leaves/balance')
  return data
}

export async function decideLeave(leaveId, status, rejectionReason) {
  const { data } = await axiosInstance.put(`/api/leaves/${leaveId}/decision`, {
    status,
    rejectionReason: rejectionReason || undefined
  })
  return { message: data.message, leave: data.leave }
}
