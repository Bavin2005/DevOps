/**
 * AuthContext - provides authentication state and actions across the app.
 *
 * State: user (object), token (string), loading (bool), isAuthenticated (bool)
 * Actions: login(email, password), logout()
 *
 * JWT Storage: We store token and user in localStorage for persistence across
 * page refreshes and tabs. The axios interceptor attaches the token to requests.
 * For production hardening, consider httpOnly cookies (requires backend support).
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/authApi'

const AuthContext = createContext(null)

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

function getStoredAuth() {
  const token = localStorage.getItem(TOKEN_KEY)
  const userStr = localStorage.getItem(USER_KEY)
  const user = userStr ? JSON.parse(userStr) : null
  return { token, user }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!token && !!user

  const persistAuth = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(async (email, password) => {
    const { token: newToken, user: newUser } = await apiLogin(email, password)
    persistAuth(newToken, newUser)
    return newUser
  }, [persistAuth])

  const register = useCallback(async (payload) => {
    const { token: newToken, user: newUser } = await apiRegister(payload)
    persistAuth(newToken, newUser)
    return newUser
  }, [persistAuth])

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  useEffect(() => {
    const { token: storedToken, user: storedUser } = getStoredAuth()
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
