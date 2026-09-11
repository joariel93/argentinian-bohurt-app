import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '@/services/apiService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        debugger
        const me = await apiService.me();
        if (me && me.id) {
          setUser(me);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const result = await apiService.login(email, password);
    if (result && result.id) {
      const me = await apiService.me();
      setUser(me);
      return { success: true, user: me };
    }
    return { success: false, error: result?.error || 'Error al iniciar sesión' };
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.tipoUsuario === 1;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
