import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { FoodItem } from '../types';
import { useUserContext } from './UserContext';

interface FoodContextType {
  foodItems: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, 'id' | 'userId'>) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
  getDonationItems: () => FoodItem[];
}

const API_URL = 'http://localhost:5000/api';

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

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const { user } = useUserContext();

  useEffect(() => {
    if (user) {
      fetchFoodItems();
    } else {
      setFoodItems([]);
    }
  }, [user]);

  const fetchFoodItems = async () => {
    try {
      const response = await api.get('/food-items');
      setFoodItems(response.data);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  const addFoodItem = async (item: Omit<FoodItem, 'id' | 'userId'>) => {
    try {
      const response = await api.post('/food-items', item);
      setFoodItems([...foodItems, response.data]);
    } catch (error) {
      console.error('Error adding food item:', error);
      throw error;
    }
  };

  const deleteFoodItem = async (id: string) => {
    try {
      await api.delete(`/food-items/${id}`);
      setFoodItems(foodItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting food item:', error);
      throw error;
    }
  };

  const getDonationItems = () => {
    return foodItems.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate > new Date() && item.quantity > 0;
    });
  };

  return (
    <FoodContext.Provider value={{ foodItems, addFoodItem, deleteFoodItem, getDonationItems }}>
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