export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string | Date;
  userId: string;
}

export interface Donation {
  id: string;
  foodItemId: string;
  userId: string;
  donationDate: string | Date;
}