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
    <nav className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-900/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-extrabold tracking-tight hover:text-white/90 transition-colors flex items-center gap-2">
            <span className="bg-white/15 rounded-full px-2 py-1 text-sm">🌟</span>
            Skill Exchange
          </Link>
          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link to="/" className="px-3 py-2 rounded-full text-sm font-medium hover:bg-white/15 transition-colors">Dashboard</Link>
                <Link to="/skills" className="px-3 py-2 rounded-full text-sm font-medium hover:bg-white/15 transition-colors">Skills</Link>
                <Link to="/requests" className="px-3 py-2 rounded-full text-sm font-medium hover:bg-white/15 transition-colors">Requests</Link>
                <Link to="/exchanges" className="px-3 py-2 rounded-full text-sm font-medium hover:bg-white/15 transition-colors">Exchanges</Link>
                <Link to="/messages" className="px-3 py-2 rounded-full text-sm font-medium hover:bg-white/15 transition-colors">Messages</Link>
                <Link to="/profile" className="px-3 py-2 rounded-full text-sm font-medium hover:bg-white/15 transition-colors">
                  {user?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 transition-all shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-full text-sm font-medium hover:bg-white/15 transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-blue-700 hover:bg-blue-50 transition-colors shadow-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
