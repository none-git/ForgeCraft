import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Quick Access', path: '/access' },
    { name: 'Wiki', path: '/wiki' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-surface-border bg-background-dark/95 backdrop-blur-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-stone-800 flex items-center justify-center text-surface-dark">
              <span className="material-symbols-outlined text-[20px]">
                swords
              </span>
            </div>
            <h1 className="text-white text-xl font-display font-bold tracking-tight">
              ForgeCraft
            </h1>
          </Link>

          <div className="hidden md:flex flex-1 justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-gray-300 hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/access"
              className="hidden sm:flex items-center justify-center h-9 px-4 bg-primary hover:bg-primary-hover text-surface-dark text-sm font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(195,163,138,0.3)]"
            >
              <span>Play Now</span>
              <span className="material-symbols-outlined text-[18px] ml-2">
                rocket_launch
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <span className="material-symbols-outlined">
                {isOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-surface-dark border-b border-surface-border px-4 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block text-lg font-medium ${
                location.pathname === link.path
                  ? 'text-primary'
                  : 'text-gray-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/access"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center h-12 bg-primary text-surface-dark font-bold rounded-lg"
          >
            Play Now
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
