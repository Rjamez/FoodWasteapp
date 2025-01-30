import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold">Expiring Soon</h3>
              <p className="text-2xl font-bold text-yellow-600">5 items</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold">Expired</h3>
              <p className="text-2xl font-bold text-red-600">2 items</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Tracked Items</h3>
              <p className="text-2xl font-bold text-green-600">15 total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {/* Placeholder for recent activities */}
          <div className="border-b pb-4">
            <p className="text-gray-600">Added 2 apples to inventory</p>
            <span className="text-sm text-gray-400">2 hours ago</span>
          </div>
          <div className="border-b pb-4">
            <p className="text-gray-600">Marked milk as consumed</p>
            <span className="text-sm text-gray-400">5 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;