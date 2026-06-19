import React, { createContext, useContext, useState, useEffect } from 'react';
import { request, setAuthToken, removeAuthToken, getAuthToken } from '../services/api.js';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'customer' | 'seller' | 'admin';
  storeName?: string;
  storeDescription?: string;
  phone?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, role?: 'customer' | 'seller', storeName?: string, phone?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      const savedToken = getAuthToken();
      if (savedToken) {
        try {
          const data = await request('/auth/profile');
          setUser(data.user);
        } catch (err) {
          console.error('Failed to load user profile with current token:', err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string, role?: 'customer' | 'seller', storeName?: string, phone?: string) => {
    setLoading(true);
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role: role || 'customer', storeName, phone }),
      });
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
