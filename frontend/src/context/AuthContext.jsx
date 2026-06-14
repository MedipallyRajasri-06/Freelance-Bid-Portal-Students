import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [loading, setLoading] = useState(false);

  const loginUser = async (data) => {
    setLoading(true);
    try {
      const res = await api.login(data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (data) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getProfile();
      const updated = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch (err) {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
