import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="page">
      <h1 className="page__title">Bienvenue, {user?.username}</h1>
      <p className="page__lead">
        Interface React du projet fil rouge DevOps : authentification JWT via l’API Auth
        (PHP) et catalogue produits via l’API Python, le tout orchestré par Docker Compose.
      </p>
      <div className="card" style={{ maxWidth: '560px' }}>
        <p style={{ margin: '0 0 1rem' }}>
          Votre rôle :{' '}
          <span className={`badge ${user?.role === 'admin' ? 'badge--admin' : 'badge--user'}`}>
            {user?.role}
          </span>
        </p>
        <p className="muted" style={{ margin: '0 0 1.25rem' }}>
          Les utilisateurs <strong>user</strong> peuvent consulter les produits. Les{' '}
          <strong>admin</strong> peuvent créer, modifier et supprimer des produits (API
          produits protégée par JWT identique à celui délivré par l’API Auth).
        </p>
        <Link to="/produits" className="btn btn--primary">
          Voir les produits
        </Link>
      </div>
    </div>
  )
}
