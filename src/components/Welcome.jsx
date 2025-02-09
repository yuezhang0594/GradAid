import React from 'react';

const Welcome = ({ onAuthClick }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header Panel */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">AI Chatbot Assistant</h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 p-4 gap-4 overflow-hidden">
        {/* Instructions Panel */}
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Welcome to AI Chatbot Assistant</h2>
          <div className="space-y-4">
            <section>
              <h3 className="font-medium text-gray-700 mb-2">About Our Chatbot</h3>
              <p className="text-gray-600">
                Welcome to our AI-powered chatbot assistant! This intelligent system is designed
                to provide you with instant, accurate responses to your questions and assist you
                with various tasks.
              </p>
            </section>
            
            <section>
              <h3 className="font-medium text-gray-700 mb-2">Key Features</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Instant responses to your questions</li>
                <li>Natural language understanding</li>
                <li>Personalized assistance</li>
                <li>Secure user authentication</li>
              </ul>
            </section>

            <section>
              <h3 className="font-medium text-gray-700 mb-2">Getting Started</h3>
              <p className="text-gray-600 mb-4">
                To start using our chatbot, simply sign in with your account or create a new one.
                Your conversations will be securely saved and available whenever you need them.
              </p>
              <button
                onClick={onAuthClick}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sign In / Sign Up
              </button>
            </section>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/3 bg-white rounded-lg shadow-lg overflow-hidden p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Preview</h3>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-end">
                  <span className="bg-blue-500 text-white px-3 py-2 rounded-lg">
                    How can you help me?
                  </span>
                </div>
                <div className="flex justify-start">
                  <span className="bg-gray-200 text-black px-3 py-2 rounded-lg">
                    I can assist you with various tasks, answer questions, and provide helpful information. How may I help you today?
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Sign in to start your conversation
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
