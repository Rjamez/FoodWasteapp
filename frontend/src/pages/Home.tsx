import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Calendar, Share2 } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Reduce Food Waste, Save the Planet
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track your food inventory, get expiry notifications, and make a difference
          in reducing food waste.
        </p>
        <Link
          to="/register"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Get Started
        </Link>
      </header>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Track Food Items</h3>
          <p className="text-gray-600">
            Easily manage your food inventory and never let items go to waste.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Expiry Reminders</h3>
          <p className="text-gray-600">
            Get timely notifications before your food items expire.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Share2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Share & Donate</h3>
          <p className="text-gray-600">
            Connect with others to share or donate excess food items.
          </p>
        </div>
      </div>

      <div className="text-center">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"
          alt="Fresh produce"
          className="rounded-lg mx-auto max-w-4xl"
        />
      </div>
    </div>
  );
};

export default Home;