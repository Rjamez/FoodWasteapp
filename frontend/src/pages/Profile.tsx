import React from 'react';
import { useUserContext } from '../context/UserContext';
import { UserCircle, Mail, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useUserContext();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <UserCircle className="h-12 w-12 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;