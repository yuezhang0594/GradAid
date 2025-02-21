import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import MainContent from './components/MainContent';
import UniversityTrackerPage from './pages/UniversityTrackerPage';
import LandingPage from './components/LandingPage';

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <LandingPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainContent session={session} />} />
      <Route path="/tracker" element={<UniversityTrackerPage session={session} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
