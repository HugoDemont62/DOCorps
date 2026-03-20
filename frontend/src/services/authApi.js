import axios from 'axios'
import { getToken } from './tokenStorage'

const baseURL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080'

export const authApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

/** Requêtes nécessitant le JWT (Bearer) */
export async function fetchMe() {
  const token = getToken()
  if (!token) return null
  const { data } = await authApi.get('/api/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function loginRequest(email, password) {
  try {
    const { data } = await authApi.post('/api/login', { email, password })
    return data
  } catch (e) {
    const msg = e.response?.data?.error || e.message
    throw new Error(msg)
  }
}

export async function registerRequest(username, email, password) {
  try {
    const { data } = await authApi.post('/api/register', {
      username,
      email,
      password,
    })
    return data
  } catch (e) {
    const d = e.response?.data
    if (d?.error) throw new Error(d.error)
    if (d?.errors) throw new Error(Object.values(d.errors).join(' '))
    throw new Error(e.message)
  }
}

export async function logoutRequest() {
  const token = getToken()
  if (!token) return
  await authApi.post(
    '/api/logout',
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  )
}
