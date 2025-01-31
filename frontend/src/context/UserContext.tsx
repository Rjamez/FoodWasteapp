import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import type { User } from '../types';

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (error: unknown): string => {
    if (!navigator.onLine) {
      return 'No internet connection. Please check your connection and try again.';
    }
    
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return 'Unable to connect to the server. Please make sure the backend server is running.';
      }
      return error.response.data.message || 'An error occurred during the request.';
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await api.post('/login', { email, password });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await api.post('/register', { name, email, password });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ user, login, register, logout, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}