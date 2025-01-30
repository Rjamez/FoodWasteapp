import React from 'react';
import { Link } from 'react-router-dom';
import { Apple, UserCircle } from 'lucide-react';
import { useUserContext } from '../context/UserContext';

const Navbar: React.FC = () => {
  const { user } = useUserContext();

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Apple className="h-8 w-8" />
            <span className="text-xl font-bold">FoodSaver</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-green-200">Dashboard</Link>
                <Link to="/inventory" className="hover:text-green-200">Inventory</Link>
                <Link to="/donations" className="hover:text-green-200">Donations</Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{user.name}</span>
                  <Link to="/profile" className="hover:text-green-200">
                    <UserCircle className="h-6 w-6" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-200">Sign in</Link>
                <Link 
                  to="/register" 
                  className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;