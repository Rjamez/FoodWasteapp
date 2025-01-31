import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFoodContext } from '../context/FoodContext';
import { format, isAfter, isBefore, addDays } from 'date-fns';

const Dashboard: React.FC = () => {
  const { foodItems } = useFoodContext();

  // Calculate statistics
  const now = new Date();
  const expiringThreshold = addDays(now, 7); // Items expiring within 7 days

  const expiringSoon = foodItems.filter(item => {
    const expiryDate = new Date(item.expiryDate);
    return isAfter(expiryDate, now) && isBefore(expiryDate, expiringThreshold);
  });

  const expired = foodItems.filter(item => 
    isBefore(new Date(item.expiryDate), now)
  );

  // Sort items by most recently added/modified
  const recentItems = [...foodItems]
    .sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold">Expiring Soon</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {expiringSoon.length} items
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold">Expired</h3>
              <p className="text-2xl font-bold text-red-600">
                {expired.length} items
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Tracked Items</h3>
              <p className="text-2xl font-bold text-green-600">
                {foodItems.length} total
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Items</h2>
        <div className="space-y-4">
          {recentItems.length > 0 ? (
            recentItems.map((item) => (
              <div key={item.id} className="border-b pb-4">
                <p className="text-gray-600">
                  {item.name} - {item.quantity} units
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-400">
                    Expires: {format(new Date(item.expiryDate), 'MMM d, yyyy')}
                  </span>
                  {isBefore(new Date(item.expiryDate), now) ? (
                    <span className="text-sm text-red-500">Expired</span>
                  ) : isBefore(new Date(item.expiryDate), expiringThreshold) ? (
                    <span className="text-sm text-yellow-500">Expiring Soon</span>
                  ) : (
                    <span className="text-sm text-green-500">Good</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No items in your inventory yet. Add some items to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;