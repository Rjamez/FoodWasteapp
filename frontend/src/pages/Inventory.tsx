import React, { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useFoodContext } from '../context/FoodContext';

const Inventory: React.FC = () => {
  const { foodItems, addFoodItem, deleteFoodItem, loading, error } = useFoodContext();

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    expiryDate: new Date().toISOString().split('T')[0]
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFoodItem({
        name: newItem.name,
        quantity: newItem.quantity,
        expiryDate: newItem.expiryDate
      });
      setNewItem({
        name: '',
        quantity: 1,
        expiryDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      // Error is handled by context
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Food Inventory</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleAddItem} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Food name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border rounded-lg px-4 py-2"
            required
          />
          <input
            type="number"
            min="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
            className="border rounded-lg px-4 py-2"
          />
          <input
            type="date"
            value={newItem.expiryDate}
            onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
            className="border rounded-lg px-4 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          <span>Add Item</span>
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Expiry Date</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : foodItems.length > 0 ? (
              foodItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteFoodItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No items in your inventory. Add some items to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;