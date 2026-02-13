import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const data = payload.data || payload;
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
        });
      } catch {
        logout();
      }
    }
  }, [token]);

  function loginUser(tokenValue, userData) {
    localStorage.setItem('token', tokenValue);
    setToken(tokenValue);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
