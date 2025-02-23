import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import DashboardPage from './pages/DashboardPage';
import TrackerPage from './pages/TrackerPage';
import LandingPage from './pages/LandingPage';
import Auth from './components/Auth';

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
      if (session) {
        setShowAuth(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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

  // Show auth page if requested
  if (showAuth) {
    return <Auth onBackClick={() => setShowAuth(false)} />;
  }

  // Show landing page if not authenticated
  if (!session) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  // Show main app if authenticated
  return (
    <Routes>
      <Route path="/" element={<DashboardPage session={session} onSignOut={handleSignOut} />} />
      <Route path="/tracker" element={<TrackerPage session={session} onSignOut={handleSignOut} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
