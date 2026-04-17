import PropTypes from 'prop-types'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as authApi from '../services/authApi'
import { clearToken, getToken, setToken } from '../services/tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const data = await authApi.fetchMe()
      if (data?.success && data.user) {
        setUser(data.user)
      } else {
        clearToken()
        setUser(null)
      }
    } catch {
      clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (email, password) => {
    const data = await authApi.loginRequest(email, password)
    if (!data?.token) {
      throw new Error(data?.error || 'Connexion impossible')
    }
    setToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (username, email, password) => {
    const data = await authApi.registerRequest(username, email, password)
    if (!data.success) {
      const err =
        data.error ||
        (data.errors && Object.values(data.errors).join(' ')) ||
        'Inscription refusée'
      throw new Error(err)
    }
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logoutRequest()
    } catch {
      /* on efface le token même si l’API échoue */
    }
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired }

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth doit être utilisé sous AuthProvider')
  }
  return ctx
}
