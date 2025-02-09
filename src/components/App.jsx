import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Auth from './Auth';
import Chatbot from './Chatbot';
import Welcome from './Welcome';

const App = () => {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
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

  // Show auth page
  if (showAuth) {
    return <Auth onBackClick={() => setShowAuth(false)} />;
  }

  // Show welcome page if not authenticated
  if (!session) {
    return <Welcome onAuthClick={() => setShowAuth(true)} />;
  }

  // Show main app if authenticated
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header Panel */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Chatbot Assistant</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-400 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 p-4 gap-4 overflow-hidden">
        {/* Instructions Panel */}
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Instructions</h2>
          <div className="space-y-4">
            <section>
              <h3 className="font-medium text-gray-700 mb-2">Getting Started</h3>
              <p className="text-gray-600">
                Welcome to our AI Chatbot! This assistant is designed to help answer your questions
                and provide assistance with various tasks.
              </p>
            </section>
            
            <section>
              <h3 className="font-medium text-gray-700 mb-2">How to Use</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Type your message in the chat input field</li>
                <li>Press Enter or click the Send button</li>
                <li>Wait for the AI to respond to your query</li>
                <li>You can ask follow-up questions at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="font-medium text-gray-700 mb-2">Tips</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Be specific with your questions</li>
                <li>Provide context when necessary</li>
                <li>You can ask the bot to clarify its responses</li>
                <li>The chat history is preserved during your session</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Chatbot Panel */}
        <div className="w-1/3 bg-white rounded-lg shadow-lg overflow-hidden">
          <Chatbot user={session.user} />
        </div>
      </main>
    </div>
  );
};

export default App;
