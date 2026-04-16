/**
 * Axios instance for API requests.
 *
 * Uses relative URLs (/api/...) which Vite proxies to the backend (port 5000).
 * The request interceptor attaches the JWT from storage to every request.
 * The response interceptor handles 401 (unauthorized) by clearing auth and redirecting to login.
 */

import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies if backend uses them
})

// Request interceptor: attach JWT to Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: on 401, clear auth and redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect only if we're not already on login (prevents loops)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
