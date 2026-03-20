/**
 * Login.test.jsx
 *
 * Tests du composant Login :
 * - Rendu des champs et bouton
 * - Soumission du formulaire
 * - Affichage d'une erreur en cas d'échec
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// ── Mock de useNavigate ───────────────────────────────────────────────────────
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

// ── Mock du contexte Auth ─────────────────────────────────────────────────────
const mockLogin = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  )
}

describe('Login — rendu', () => {
  it('affiche le titre Connexion', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument()
  })

  it('affiche un champ e-mail', () => {
    renderLogin()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
  })

  it('affiche un champ mot de passe', () => {
    renderLogin()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  it('affiche le bouton Se connecter', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('affiche un lien vers la page d\'inscription', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /créer un compte/i })).toBeInTheDocument()
  })
})

describe('Login — soumission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('appelle login() avec l\'email et le mot de passe saisis', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    renderLogin()

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'alice@example.com')
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'password123')
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alice@example.com', 'password123')
    })
  })

  it('redirige vers / après une connexion réussie', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    renderLogin()

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'alice@example.com')
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'password123')
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('affiche un message d\'erreur si login() échoue', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Identifiants invalides'))
    renderLogin()

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'bad@example.com')
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'wrong')
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Identifiants invalides')
    })
  })

  it('désactive le bouton pendant la connexion', async () => {
    // login() ne se résout jamais (connexion en cours)
    mockLogin.mockReturnValue(new Promise(() => {}))
    renderLogin()

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'alice@example.com')
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'password123')
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /connexion…/i })).toBeDisabled()
    })
  })
})
