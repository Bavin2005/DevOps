import axios from './axios'

export function getMenuForDate(date) {
  const d = typeof date === 'string' ? date : date?.toISOString?.()?.slice(0, 10)
  return axios.get('/api/cafeteria/menu', { params: { date: d } }).then((res) => res.data)
}

export function updateMenu(date, items) {
  const d = typeof date === 'string' ? date : date?.toISOString?.()?.slice(0, 10)
  return axios.put('/api/cafeteria/menu', { date: d, items }).then((res) => res.data)
}
