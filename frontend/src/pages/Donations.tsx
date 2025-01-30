import React from 'react';
import { Heart } from 'lucide-react';
import { useFoodContext } from '../context/FoodContext';

const Donations: React.FC = () => {
  const { getDonationItems } = useFoodContext();
  const availableItems = getDonationItems();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Food Donations</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Help reduce food waste by donating your excess food to local food banks and charities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Available for Donation</h2>
          <div className="space-y-4">
            {availableItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Donate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Local Food Banks</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Community Food Bank</h3>
              <p className="text-sm text-gray-600">123 Main Street</p>
              <p className="text-sm text-gray-600">Open Mon-Fri: 9AM - 5PM</p>
              <a href="#" className="text-green-600 hover:text-green-700 text-sm">Get Directions</a>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">City Food Pantry</h3>
              <p className="text-sm text-gray-600">456 Oak Avenue</p>
              <p className="text-sm text-gray-600">Open Mon-Sat: 10AM - 6PM</p>
              <a href="#" className="text-green-600 hover:text-green-700 text-sm">Get Directions</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;