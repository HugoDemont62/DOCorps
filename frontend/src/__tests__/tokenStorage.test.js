/**
 * tokenStorage.test.js
 *
 * Tests unitaires pour le service de stockage du JWT (sessionStorage).
 * Aucun mock nécessaire : jsdom simule sessionStorage.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { getToken, setToken, clearToken } from '../services/tokenStorage'

describe('tokenStorage', () => {
  beforeEach(() => {
    // Repart d'un sessionStorage vide avant chaque test
    sessionStorage.clear()
  })

  it('retourne null quand aucun token n\'est stocké', () => {
    expect(getToken()).toBeNull()
  })

  it('stocke et récupère correctement un token', () => {
    setToken('mon-super-jwt-token')
    expect(getToken()).toBe('mon-super-jwt-token')
  })

  it('écrase un token existant', () => {
    setToken('ancien-token')
    setToken('nouveau-token')
    expect(getToken()).toBe('nouveau-token')
  })

  it('supprime le token avec clearToken', () => {
    setToken('token-a-effacer')
    clearToken()
    expect(getToken()).toBeNull()
  })

  it('clearToken sur un storage vide ne lève pas d\'erreur', () => {
    expect(() => clearToken()).not.toThrow()
    expect(getToken()).toBeNull()
  })
})
