import React, { createContext, useContext, useState, useEffect } from 'react';  
import type { User } from '../types';  

interface UserContextType {  
  user: User | null;  
  login: (email: string, password: string) => Promise<void>;  
  register: (name: string, email: string, password: string) => Promise<void>;  
  logout: () => void;  
}  

const API_URL = 'https://foodwasteapp-1.onrender.com/api';  

const UserContext = createContext<UserContextType | undefined>(undefined);   

export function UserProvider({ children }: { children: React.ReactNode }) {  
  const [user, setUser] = useState<User | null>(null);  

  // Load user from localStorage when the component mounts  
  useEffect(() => {  
    const savedUser = localStorage.getItem('user');  
    if (savedUser) {  
      setUser(JSON.parse(savedUser));  
    }  
  }, []);  

  const login = async (email: string, password: string) => {  
    try {  
      const response = await fetch(`${API_URL}/login`, {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
        },  
        body: JSON.stringify({ email, password }),  
      });  

      if (!response.ok) {  
        const errorData = await response.json();  
        throw new Error(errorData.message || 'Login failed');  
      }  

      const data = await response.json();  
      setUser(data.user);  
      localStorage.setItem('user', JSON.stringify(data.user));  
      localStorage.setItem('token', data.token);  
    } catch (error) {  
      console.error('Login error:', error);  
      throw error;  
    }  
  };  

  const register = async (name: string, email: string, password: string) => {  
    try {  
      const response = await fetch(`${API_URL}/register`, {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
        },  
        body: JSON.stringify({ name, email, password }),  
      });  

      if (!response.ok) {  
        const errorData = await response.json();  
        throw new Error(errorData.message || 'Registration failed');  
      }  

      const data = await response.json();  
      setUser(data.user);  
      localStorage.setItem('user', JSON.stringify(data.user));  
      localStorage.setItem('token', data.token);  
    } catch (error) {  
      console.error('Registration error:', error);  
      throw error;  
    }  
  };  

  const logout = () => {  
    setUser(null);  
    localStorage.removeItem('user');  
    localStorage.removeItem('token');  
  };  

  return (  
    <UserContext.Provider value={{ user, login, register, logout }}>  
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
