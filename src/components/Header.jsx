import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserProfileForm from './UserProfileForm';
import { profileService } from '../services/profile';

const Header = ({ session, onSignOut }) => {
  const location = useLocation();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [hasCompleteProfile, setHasCompleteProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!session) return;
      
      try {
        const profile = await profileService.getProfile();
        // Check if all required fields are filled
        const isComplete = profile && 
          profile.country && 
          profile.education_level && 
          profile.major && 
          profile.dob &&
          profile.profile_description;
        
        setHasCompleteProfile(!!isComplete);
      } catch (error) {
        console.error('Error checking profile:', error);
        setHasCompleteProfile(false);
      }
    };

    checkProfile();
  }, [session]);

  const handleProfileClick = () => {
    setShowProfileForm(true);
  };

  const handleFormComplete = () => {
    setShowProfileForm(false);
    setHasCompleteProfile(true);
  };
  
  return (
    <>
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
                <img src="/images/gradaid-logo-white.png" alt="GradAid Logo" className="w-8 h-8" />
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
                  <button 
                    onClick={handleProfileClick}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      hasCompleteProfile 
                        ? 'text-blue-100 hover:bg-blue-700 hover:text-white'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600 animate-pulse'
                    }`}
                  >
                    {hasCompleteProfile ? 'Edit Profile' : 'Complete Profile'}
                  </button>
                </nav>
              )}
            </div>
            {session && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-100">
                  {session.user.user_metadata?.full_name || 
                   session.user.user_metadata?.name || 
                   session.user.email}
                </span>
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

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {hasCompleteProfile ? 'Edit Your Profile' : 'Complete Your Profile'}
              </h2>
              <button 
                onClick={() => setShowProfileForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <UserProfileForm 
              onComplete={handleFormComplete}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
