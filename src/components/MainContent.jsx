import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Chatbot from './Chatbot';
import UserProfileForm from './UserProfileForm';

const InstructionsPanel = () => (
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
);

// Demo mode flag - set to true to always show the profile form
const DEMO_MODE = true;

const MainContent = ({ session }) => {
  const [showProfileForm, setShowProfileForm] = useState(DEMO_MODE);

  useEffect(() => {
    // In demo mode, we don't need to check the profile
    if (DEMO_MODE) return;

    const checkUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;
        
        // If no profile exists, show the profile form
        if (!data) {
          setShowProfileForm(true);
        }
      } catch (error) {
        console.error('Error checking user profile:', error.message);
      }
    };

    checkUserProfile();
  }, [session]);

  // In demo mode, always show the form again after it's closed
  const handleFormComplete = () => {
    setShowProfileForm(false);
    if (DEMO_MODE) {
      setTimeout(() => setShowProfileForm(true), 3000); // Show form again after 3 seconds
    }
  };

  return (
    <>
      {showProfileForm && (
        <UserProfileForm 
          onComplete={handleFormComplete}
        />
      )}
      <div className="grid md:grid-cols-3 gap-8">
        <InstructionsPanel />
        <div className="md:col-span-1">
          <Chatbot session={session} />
        </div>
      </div>
    </>
  );
};

export default MainContent;
