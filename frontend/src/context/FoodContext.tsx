import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import type { FoodItem } from '../types';
import { useUserContext } from './UserContext';

interface FoodContextType {
  foodItems: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, 'id' | 'userId'>) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
  getDonationItems: () => FoodItem[];
  loading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://foodwasteapp.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const FoodContext = createContext<FoodContextType | undefined>(undefined);

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserContext();

  useEffect(() => {
    if (user) {
      fetchFoodItems();
    } else {
      setFoodItems([]);
    }
  }, [user]);

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;
      return axiosError.response?.data?.message || 'An error occurred while processing your request';
    }
    return 'An unexpected error occurred';
  };

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/food-items');
      setFoodItems(response.data);
    } catch (error) {
      setError(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const addFoodItem = async (item: Omit<FoodItem, 'id' | 'userId'>) => {
    try {
      setError(null);
      const response = await api.post('/food-items', item);
      setFoodItems([...foodItems, response.data]);
    } catch (error) {
      const errorMessage = handleError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteFoodItem = async (id: string) => {
    try {
      setError(null);
      await api.delete(`/food-items/${id}`);
      setFoodItems(foodItems.filter(item => item.id !== id));
    } catch (error) {
      const errorMessage = handleError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getDonationItems = () => {
    return foodItems.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate > new Date() && item.quantity > 0;
    });
  };

  const value = {
    foodItems,
    addFoodItem,
    deleteFoodItem,
    getDonationItems,
    loading,
    error
  };

  return (
    <FoodContext.Provider value={value}>
      {children}
    </FoodContext.Provider>
  );
}

export function useFoodContext() {
  const context = useContext(FoodContext);
  if (context === undefined) {
    throw new Error('useFoodContext must be used within a FoodProvider');
  }
  return context;
}
