import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setVendorProfile(res.data.vendorProfile);
        } catch (err) {
          console.error('Auth initialization failed', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setVendorProfile(res.data.vendorProfile);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setVendorProfile(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, vendorProfile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
