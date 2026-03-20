/**
 * authApi.test.js
 *
 * Tests unitaires pour les fonctions du service authApi.
 * On mocke axios pour ne pas faire de vrais appels réseau.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock d'axios ─────────────────────────────────────────────────────────────
// On mock l'instance créée par axios.create()
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}))

// Import APRÈS le mock pour que les modules utilisent la version mockée
const { loginRequest, registerRequest } = await import('../services/authApi')

describe('authApi — loginRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('retourne les données du serveur en cas de succès', async () => {
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { token: 'jwt-token-123', user: { id: 1, username: 'alice', role: 'user' } },
    })

    const result = await loginRequest('alice@example.com', 'password123')

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/login', {
      email: 'alice@example.com',
      password: 'password123',
    })
    expect(result.token).toBe('jwt-token-123')
    expect(result.user.username).toBe('alice')
  })

  it('lève une erreur avec le message serveur si la réponse contient error', async () => {
    mockAxiosInstance.post.mockRejectedValueOnce({
      response: { data: { error: 'Identifiants invalides' } },
      message: 'Request failed',
    })

    await expect(loginRequest('bad@example.com', 'wrong')).rejects.toThrow(
      'Identifiants invalides',
    )
  })

  it('lève une erreur réseau si pas de réponse serveur', async () => {
    mockAxiosInstance.post.mockRejectedValueOnce({
      message: 'Network Error',
    })

    await expect(loginRequest('a@b.com', 'pass')).rejects.toThrow('Network Error')
  })
})

describe('authApi — registerRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne les données en cas de succès', async () => {
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { success: true, message: 'Compte créé' },
    })

    const result = await registerRequest('bob', 'bob@example.com', 'password123')

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/register', {
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('lève une erreur si le serveur renvoie un champ error', async () => {
    mockAxiosInstance.post.mockRejectedValueOnce({
      response: { data: { error: 'Email déjà utilisé' } },
      message: 'Request failed',
    })

    await expect(registerRequest('bob', 'taken@example.com', 'pass')).rejects.toThrow(
      'Email déjà utilisé',
    )
  })

  it('lève une erreur si le serveur renvoie un champ errors (objet)', async () => {
    mockAxiosInstance.post.mockRejectedValueOnce({
      response: { data: { errors: { email: 'Format invalide', password: 'Trop court' } } },
      message: 'Request failed',
    })

    await expect(registerRequest('bob', 'bad-email', '12')).rejects.toThrow(
      /Format invalide|Trop court/,
    )
  })
})
