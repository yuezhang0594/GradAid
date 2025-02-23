import React, { useState, useEffect } from 'react';

const InstructionsPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded]);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div 
        className={`bg-white rounded-lg shadow-lg h-full flex flex-col cursor-pointer transition-all duration-300 ${
          isExpanded ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 shadow-2xl' : 'p-4 hover:bg-gray-100'
        }`}
        onClick={!isExpanded ? handleClick : undefined}
      >
        <div className="flex justify-between items-center mb-4 flex-none">
          <h2 className="text-xl font-semibold text-gray-800">Welcome to GradAid!</h2>
          <button 
            onClick={handleClick}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '✕' : '⋯'}
          </button>
        </div>
        
        {isExpanded ? (
          // Full content
          <div className="space-y-4 overflow-y-auto flex-1">
            <section>
              <h3 className="font-medium text-gray-700 mb-2">How GradAid Can Help You</h3>
              <p className="text-gray-600 mb-2">
                I'm your AI-powered graduate application assistant. Ask me anything about:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
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
        ) : (
          // Preview content
          <div className="text-gray-600">
            <p className="mb-2">Click to see how GradAid can help you with:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>School selection & program fit</li>
              <li>Application requirements</li>
              <li>Essay writing & interview prep</li>
              <li>And more...</li>
            </ul>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleClick}
        />
      )}
    </>
  );
};

export default InstructionsPanel; 