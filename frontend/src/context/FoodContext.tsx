import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FoodItem } from '../types';
import { useUserContext } from './UserContext';

interface FoodContextType {
  foodItems: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, 'id' | 'userId'>) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
  getDonationItems: () => FoodItem[];
}

const API_URL = 'https://foodwasteapp-1.onrender.com/api';
const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

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
      const token = isLocalStorageAvailable ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_URL}/food-items`, { 
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch food items');
      }

      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  const addFoodItem = async (item: Omit<FoodItem, 'id' | 'userId'>) => {
    try {
      const token = isLocalStorageAvailable ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_URL}/food-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error('Failed to add food item');
      }

      const newItem = await response.json();
      setFoodItems([...foodItems, newItem]);
    } catch (error) {
      console.error('Error adding food item:', error);
      throw error;
    }
  };

  const deleteFoodItem = async (id: string) => {
    try {
      const token = typeof window !== 'undefined' && localStorage.getItem('token');
      const response = await fetch(`${API_URL}/food-items/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete food item');
      }

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
