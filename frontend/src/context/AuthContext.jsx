import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medicare_user')); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Validate stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('medicare_token');
    if (token) {
      api.get('/auth/me')
        .then((res) => { setUser(res.data.user); localStorage.setItem('medicare_user', JSON.stringify(res.data.user)); })
        .catch(() => { localStorage.removeItem('medicare_token'); localStorage.removeItem('medicare_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('medicare_token', data.token);
    localStorage.setItem('medicare_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('medicare_token', data.token);
    localStorage.setItem('medicare_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
