/**
 * Stockage du JWT en sessionStorage : limité à l’onglet courant,
 * effacé à la fermeture du navigateur. Réduit l’exposition par rapport à localStorage.
 * En production, privilégier un cookie HttpOnly côté serveur.
 */
const KEY = 'devopscorp_jwt'

export function getToken() {
  return sessionStorage.getItem(KEY)
}

export function setToken(token) {
  sessionStorage.setItem(KEY, token)
}

export function clearToken() {
  sessionStorage.removeItem(KEY)
}
