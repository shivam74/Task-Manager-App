import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

/** Normalize API user shape so both `id` and `_id` work in the UI */
function normalizeUser(raw) {
  if (!raw) return null;
  const id = raw._id ?? raw.id;
  return {
    ...raw,
    _id: id,
    id,
    role: raw.role || 'user',
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const stored = localStorage.getItem('token');
      setToken(stored || null);
      if (stored) {
        try {
          const res = await api.get('/auth/me');
          setUser(normalizeUser(res.data.data));
        } catch (err) {
          console.error('Failed to load user', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const nextToken = res.data.token;
    localStorage.setItem('token', nextToken);
    setToken(nextToken);
    setUser(normalizeUser(res.data.user));
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const nextToken = res.data.token;
    localStorage.setItem('token', nextToken);
    setToken(nextToken);
    setUser(normalizeUser(res.data.user));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
