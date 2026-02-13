import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api.js';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await register(username, email, password);
      setSuccess('Compte créé ! Redirection...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err.data || {};
      setError(data.error || data.errors?.username || data.errors?.email || data.errors?.password || 'Erreur lors de l\'inscription');
    }
  }

  return (
    <div className="auth-page">
      <h2>Inscription</h2>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom d'utilisateur</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <button type="submit" className="btn btn-primary">Créer un compte</button>
      </form>
      <p className="text-center mt-1">
        Déjà inscrit ? <Link to="/login" className="link">Se connecter</Link>
      </p>
    </div>
  );
}
