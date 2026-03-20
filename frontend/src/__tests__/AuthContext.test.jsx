/**
 * AuthContext.test.jsx
 *
 * Tests du contexte d'authentification :
 * - État initial (pas de user, loading=true)
 * - login() stocke le user et le token
 * - logout() efface le user et le token
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

// ── Mock des dépendances externes ─────────────────────────────────────────────
vi.mock('../services/authApi', () => ({
  fetchMe: vi.fn(),
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  logoutRequest: vi.fn(),
}))

import * as authApiMock from '../services/authApi'

// Composant auxiliaire pour exposer le contexte dans les tests
function AuthConsumer() {
  const { user, loading, login, logout } = useAuth()
  if (loading) return <div data-testid="loading">Chargement…</div>
  return (
    <div>
      <div data-testid="user">{user ? user.username : 'null'}</div>
      <div data-testid="role">{user?.role || ''}</div>
      <button onClick={() => login('alice@example.com', 'pass123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

function renderWithAuth() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('démarre en état "pas de user" quand pas de token en session', async () => {
    authApiMock.fetchMe.mockResolvedValue(null)
    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null')
    })
  })

  it('charge le user depuis fetchMe si un token est présent', async () => {
    sessionStorage.setItem('devopscorp_jwt', 'valid-token')
    authApiMock.fetchMe.mockResolvedValue({
      success: true,
      user: { id: 1, username: 'alice', role: 'user' },
    })

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('alice')
    })
  })

  it('efface le token si fetchMe échoue', async () => {
    sessionStorage.setItem('devopscorp_jwt', 'expired-token')
    authApiMock.fetchMe.mockRejectedValue(new Error('Token expiré'))

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(sessionStorage.getItem('devopscorp_jwt')).toBeNull()
    })
  })

  it('login() met à jour le user et stocke le token', async () => {
    authApiMock.fetchMe.mockResolvedValue(null)
    authApiMock.loginRequest.mockResolvedValue({
      token: 'new-jwt-token',
      user: { id: 2, username: 'bob', role: 'admin' },
    })

    renderWithAuth()

    await waitFor(() => screen.getByTestId('user'))

    await act(async () => {
      screen.getByRole('button', { name: /login/i }).click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('bob')
      expect(sessionStorage.getItem('devopscorp_jwt')).toBe('new-jwt-token')
    })
  })

  it('logout() efface le user et le token', async () => {
    sessionStorage.setItem('devopscorp_jwt', 'valid-token')
    authApiMock.fetchMe.mockResolvedValue({
      success: true,
      user: { id: 1, username: 'alice', role: 'user' },
    })
    authApiMock.logoutRequest.mockResolvedValue(undefined)

    renderWithAuth()

    await waitFor(() => screen.getByTestId('user'))

    await act(async () => {
      screen.getByRole('button', { name: /logout/i }).click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(sessionStorage.getItem('devopscorp_jwt')).toBeNull()
    })
  })
})
