import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      await register(username.trim(), email.trim(), password)
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Inscription impossible')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="page">
      <div className="card card--narrow">
        <h1 className="page__title">Inscription</h1>
        <p className="page__lead muted">
          Créez un compte pour accéder aux microservices (rôle utilisateur par défaut).
        </p>
        {error ? (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        ) : null}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d’utilisateur</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">E-mail</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Mot de passe</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="muted" style={{ fontSize: '0.8rem' }}>
              Au moins 6 caractères
            </span>
          </div>
          <button type="submit" className="btn btn--primary btn-block" disabled={pending}>
            {pending ? 'Création…' : 'S’inscrire'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
