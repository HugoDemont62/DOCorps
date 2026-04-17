import PropTypes from 'prop-types'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import './App.css'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Products from './pages/Products'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="page page--center">
        <p className="muted">Chargement…</p>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

ProtectedRoute.propTypes = { children: PropTypes.node.isRequired }

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="page page--center">
        <p className="muted">Chargement…</p>
      </div>
    )
  }
  if (user) {
    return <Navigate to="/" replace />
  }
  return children
}

PublicOnly.propTypes = { children: PropTypes.node.isRequired }

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <Register />
            </PublicOnly>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/produits"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
