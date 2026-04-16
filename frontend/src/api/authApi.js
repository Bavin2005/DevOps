/**
 * Auth API - integrates with backend POST /api/auth/login and /api/auth/register.
 * All responses include { message, token, user } on success.
 */

import axiosInstance from './axios'

/**
 * Login with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function login(email, password) {
  const { data } = await axiosInstance.post('/api/auth/login', { email, password })
  return { token: data.token, user: data.user }
}

/**
 * Register a new user.
 * @param {Object} payload - { name, email, password, role?, department? }
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function register(payload) {
  const { data } = await axiosInstance.post('/api/auth/register', payload)
  return { token: data.token, user: data.user }
}
