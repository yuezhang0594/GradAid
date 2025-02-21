import React from 'react';
import UniversityTracker from '../components/UniversityTracker';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const UniversityTrackerPage = ({ session }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">University Application Tracker</h1>
          <Link 
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <UniversityTracker />
        </div>
      </main>
    </div>
  );
};

export default UniversityTrackerPage;
