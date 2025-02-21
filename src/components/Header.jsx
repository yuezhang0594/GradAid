import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ session, onSignOut }) => {
  const location = useLocation();
  
  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-white">
              GradAid
            </Link>
            {session && (
              <nav className="hidden md:flex space-x-4">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/' 
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/tracker" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/tracker'
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  University Tracker
                </Link>
              </nav>
            )}
          </div>
          {session && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-100">{session.user.email}</span>
              <button 
                onClick={onSignOut}
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
