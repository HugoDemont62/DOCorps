import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="page">
      <div className="card card--narrow">
        <h1 className="page__title">Connexion</h1>
        <p className="page__lead muted">
          Identifiez-vous pour accéder à l’espace DevOpsCorp.
        </p>
        {error ? (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        ) : null}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--primary btn-block" disabled={pending}>
            {pending ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}
