import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <>
      <header className="nav">
        <NavLink to="/" className="nav__brand">
          DevOps<span>Corp</span>
        </NavLink>
        {user ? (
          <nav className="nav__links">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'active' : '')}
              end
            >
              Accueil
            </NavLink>
            <NavLink
              to="/produits"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Produits
            </NavLink>
            <span className="nav__user">
              {user.username}
              <span
                className={`badge ${user.role === 'admin' ? 'badge--admin' : 'badge--user'}`}
                style={{ marginLeft: '0.5rem' }}
              >
                {user.role}
              </span>
            </span>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => logout()}>
              Déconnexion
            </button>
          </nav>
        ) : (
          <nav className="nav__links">
            <NavLink to="/login">Connexion</NavLink>
            <NavLink to="/register">Inscription</NavLink>
          </nav>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
