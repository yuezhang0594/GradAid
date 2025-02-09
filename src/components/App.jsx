import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Auth from './Auth';
import Chatbot from './Chatbot';

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
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">GradAid</h1>
          {session && (
            <div className="flex items-center space-x-4">
              <span className="text-sm">{session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-400 rounded"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {!session ? (
            // Welcome content for signed-out users
            <div className="text-center space-y-8">
              <h2 className="text-4xl font-bold text-gray-900">
                Welcome to GradAid
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your AI-Powered Graduate Application Assistant. Get personalized guidance
                for your graduate school applications, 24/7.
              </p>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800">Key Features</h3>
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <h4 className="text-xl font-medium text-gray-800 mb-2">Application Strategy</h4>
                    <p className="text-gray-600">Get personalized advice on school selection and application strategy</p>
                  </div>
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <h4 className="text-xl font-medium text-gray-800 mb-2">Essay Review</h4>
                    <p className="text-gray-600">Receive feedback on your statement of purpose and other essays</p>
                  </div>
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <h4 className="text-xl font-medium text-gray-800 mb-2">24/7 Support</h4>
                    <p className="text-gray-600">Get instant answers to your application questions anytime</p>
                  </div>
                </div>
              </div>
              <div>
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          ) : (
            // Main app content for signed-in users
            <div className="grid md:grid-cols-3 gap-8">
              {/* Instructions Panel */}
              <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Welcome to GradAid!</h2>
                <div className="space-y-6">
                  <section>
                    <h3 className="font-medium text-gray-700 mb-2">How GradAid Can Help You</h3>
                    <p className="text-gray-600">
                      I'm your AI-powered graduate application assistant. Ask me anything about:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                      <li>School selection and program fit</li>
                      <li>Application requirements and deadlines</li>
                      <li>Statement of purpose and essay writing</li>
                      <li>Test preparation (GRE, TOEFL, etc.)</li>
                      <li>Recommendation letters</li>
                      <li>Interview preparation</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="font-medium text-gray-700 mb-2">How to Use</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Type your question in the chat</li>
                      <li>Be specific about what you need help with</li>
                      <li>Feel free to ask follow-up questions</li>
                      <li>Share relevant context about your background and goals</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-medium text-gray-700 mb-2">Pro Tips</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Start with your target schools and programs</li>
                      <li>Break down complex questions into smaller parts</li>
                      <li>Use the chat history to build on previous conversations</li>
                      <li>Ask for examples when you need them</li>
                    </ul>
                  </section>
                </div>
              </div>

              {/* Chatbot Panel */}
              <div className="md:col-span-1">
                <Chatbot session={session} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
