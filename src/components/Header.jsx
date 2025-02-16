import React from 'react';

const Header = ({ session, onSignOut, onLogoClick }) => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <button
          onClick={onLogoClick}
          className="text-2xl font-bold hover:text-blue-100 transition-colors"
        >
          GradAid
        </button>
        {session && (
          <div className="flex items-center space-x-4">
            <span className="text-sm">{session.user.email}</span>
            <button
              onClick={onSignOut}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-400 rounded"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
