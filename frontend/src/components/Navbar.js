import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight hover:text-blue-200 transition-colors">
            🌟 Skill Exchange
          </Link>
          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">Dashboard</Link>
                <Link to="/skills" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">Skills</Link>
                <Link to="/requests" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">Requests</Link>
                <Link to="/exchanges" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">Exchanges</Link>
                <Link to="/messages" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">Messages</Link>
                <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
                  {user?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-700 hover:bg-blue-50 transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
