import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFoodContext } from '../context/FoodContext';

const Inventory: React.FC = () => {
  const { foodItems, addFoodItem, deleteFoodItem } = useFoodContext();

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    expiryDate: new Date().toISOString().split('T')[0]
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    addFoodItem({
      name: newItem.name,
      quantity: newItem.quantity,
      expiryDate: new Date(newItem.expiryDate)
    });
    setNewItem({ name: '', quantity: 1, expiryDate: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Food Inventory</h1>

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
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Item</span>
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md">
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
            {foodItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">{new Date(item.expiryDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => deleteFoodItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;