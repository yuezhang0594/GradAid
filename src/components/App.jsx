import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Auth from './Auth';
import Header from './Header';
import LandingPage from './LandingPage';
import MainContent from './MainContent';

const App = () => {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check URL for sign_out parameter
    const urlParams = new URLSearchParams(window.location.search);
    const shouldSignOut = urlParams.get('sign_out') === 'true';

    if (shouldSignOut) {
      // Clear all Supabase-related items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      // Remove the sign_out parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // If user is authenticated, make sure we're not showing the auth page
      if (session) {
        setShowAuth(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // If user is authenticated, make sure we're not showing the auth page
      if (session) {
        setShowAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      // Force session cleanup regardless of Supabase state
      setSession(null);
      setShowAuth(false);
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('Auth session missing')) {
        throw error;
      }
      
      // Clear all Supabase-related items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // Force reload the page to ensure clean state
      window.location.href = '/?sign_out=true';
    } catch (error) {
      console.error('Error signing out:', error.message);
      // Even if there's an error, we want to clear the local state
      setSession(null);
      setShowAuth(false);
    }
  };

  // Show auth page
  if (showAuth) {
    return <Auth onBackClick={() => setShowAuth(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header session={session} onSignOut={handleSignOut} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {!session ? (
            <LandingPage onGetStarted={() => setShowAuth(true)} />
          ) : (
            <MainContent session={session} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
