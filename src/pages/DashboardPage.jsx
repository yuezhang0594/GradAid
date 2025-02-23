import React from 'react';
import { supabase } from '../supabaseClient';
import Chatbot from '../components/Chatbot';
import ApplicationTracker from '../components/ApplicationTracker';
import Header from '../components/Header';
import InstructionsPanel from '../components/InstructionsPanel';

const DashboardPage = ({ session }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-4 py-4">
        <div className="grid md:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
          <div className="md:col-span-8 grid grid-cols-12 gap-4 h-full">
            <div className="col-span-12 h-[250px] overflow-hidden">
              <InstructionsPanel />
            </div>
            <div className="col-span-12 h-[calc(100vh-395px)] overflow-hidden">
              <ApplicationTracker />
            </div>
          </div>
          <div className="md:col-span-4 h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg">
            <Chatbot session={session} />
          </div>
        </div>
        <div className="text-center text-gray-400 text-sm mt-4">
          Version {import.meta.env.VITE_APP_VERSION}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
