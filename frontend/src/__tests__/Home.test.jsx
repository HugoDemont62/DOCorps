/**
 * Home.test.jsx
 *
 * Tests du composant Home :
 * - Affichage du nom d'utilisateur
 * - Affichage du rôle (badge)
 * - Lien vers les produits
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'alice', role: 'admin' },
  }),
}))

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
}

describe('Home', () => {
  it('affiche le nom de l\'utilisateur dans le titre', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: /alice/i })).toBeInTheDocument()
  })

  it('affiche le rôle admin dans le badge', () => {
    renderHome()
    const badge = document.querySelector('.badge--admin')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('admin')
  })

  it('affiche un lien vers les produits', () => {
    renderHome()
    const link = screen.getByRole('link', { name: /voir les produits/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/produits')
  })
})
