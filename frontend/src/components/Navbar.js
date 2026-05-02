import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/skills', label: 'Skills' },
  { to: '/requests', label: 'Requests' },
  { to: '/exchanges', label: 'Exchanges' },
  { to: '/messages', label: 'Messages' },
];

const NavLink = ({ to, label, onClick }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
        isActive
          ? 'bg-white/20 text-white'
          : 'text-indigo-100 hover:bg-white/10 hover:text-white'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </Link>
  );
};

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  return (
    <nav className="bg-primary-700 dark:bg-slate-900 shadow-lg sticky top-0 z-50 border-b border-primary-800 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl" aria-hidden="true">⚡</span>
            <span className="hidden sm:block">Skill Exchange</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} label={l.label} />
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-indigo-100 hover:bg-white/10 hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-indigo-100 hover:bg-white/10 hover:text-white transition-colors duration-150"
                >
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user?.username?.charAt(0) || '?'}
                  </span>
                  <span className="hidden lg:block">{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:block px-3 py-2 rounded-lg text-sm font-medium bg-rose-500/80 hover:bg-rose-500 text-white transition-colors duration-150"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="px-3 py-2 rounded-lg text-sm font-medium text-indigo-100 hover:bg-white/10 hover:text-white transition-colors duration-150">Login</Link>
                <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-primary-700 hover:bg-indigo-50 transition-colors duration-150 shadow-sm">Register</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              className="md:hidden p-2 rounded-lg text-indigo-100 hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-primary-800 dark:border-slate-700 bg-primary-800 dark:bg-slate-900 pb-3">
          <div className="px-4 pt-3 space-y-1">
            {isAuthenticated ? (
              <>
                {navLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} label={l.label} onClick={() => setMobileOpen(false)} />
                ))}
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-indigo-100 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user?.username?.charAt(0) || '?'}
                  </span>
                  {user?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:bg-white/10 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-100 hover:bg-white/10 hover:text-white transition-colors">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-100 hover:bg-white/10 hover:text-white transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

