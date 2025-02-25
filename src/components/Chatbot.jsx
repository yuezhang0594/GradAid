import { useState, useEffect, useRef } from 'react';
import { INTERVIEW_QUESTIONS } from '../services/chatbot';
import chatbotService from '../services/chatbot';

export default function Chatbot({ session }) {
  console.log('Chatbot rendering with session:', session);

  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const messagesEndRef = useRef(null);
  const notificationSound = useRef(new Audio('/sounds/notification.mp3'));

  const playNotification = () => {
    try {
      notificationSound.current.currentTime = 0;
      notificationSound.current.volume = 0.2; // Set volume to 50%
      notificationSound.current.play().catch(err => console.log('Error playing sound:', err));
    } catch (err) {
      console.log('Error playing sound:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = () => {
      notificationSound.current.load();
    };

    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  // Handle initial welcome message with delay
  useEffect(() => {
    console.log('Session effect running, session:', session);
    if (!session) {
      console.log('No session, returning early');
      return;
    }

    // Reset states when session changes
    setMessages([]);
    setCurrentQuestion(0);
    setShowWelcome(false);

    // Add initial typing indicator
    setMessages([
      {
        type: 'bot',
        content: 'Typing...',
        isTyping: true
      }
    ]);

    // Show welcome message after 5 seconds
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(true);
      setMessages([
        {
          type: 'bot',
          content: `Every story is unique! At GradAid, we're excited to hear yours. Share your experiences, goals, and inspirations with us—we're here to help you on your journey to U.S. graduate studies!`,
        }
      ]);
      playNotification();

      // Show first question after 2 more seconds
      const questionTimer = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            type: 'bot',
            content: INTERVIEW_QUESTIONS[0],
          }
        ]);
        playNotification();
      }, 2000);

      return () => clearTimeout(questionTimer);
    }, 5000);

    return () => clearTimeout(welcomeTimer);
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing || !session || !showWelcome) return;

    const response = userInput.trim();
    setIsProcessing(true);
    setUserInput('');

    // Add user's response to messages
    setMessages(prev => [...prev, { type: 'user', content: response }]);

    try {
      // Add typing indicator
      setMessages(prev => [...prev, { type: 'bot', content: 'Typing...', isTyping: true }]);

      // Simple validation
      const analysis = chatbotService.validateResponse(response);
      console.log('Response analysis:', analysis);

      // Remove typing indicator and add feedback if necessary
      if (!analysis.isValid) {
        setMessages(prev => [
          ...prev.filter(m => !m.isTyping),
          {
            type: 'bot',
            content: `${analysis.feedback}\n${analysis.suggestions}`,
            isFeedback: true
          }
        ]);
        playNotification();
        setIsProcessing(false);
        return;
      }

      // Move to next question with typing indicator
      if (currentQuestion < INTERVIEW_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        
        // Remove typing indicator and add next question after a short delay
        setTimeout(() => {
          setMessages(prev => [
            ...prev.filter(m => !m.isTyping),
            {
              type: 'bot',
              content: INTERVIEW_QUESTIONS[currentQuestion + 1]
            }
          ]);
          playNotification();
        }, 1500);
      } else {
        // Interview completed
        setTimeout(() => {
          setMessages(prev => [
            ...prev.filter(m => !m.isTyping),
            {
              type: 'bot',
              content: "Thank you for completing the interview! Your responses will help you prepare better answers for your graduate school applications."
            }
          ]);
          playNotification();
        }, 1500);
      }
    } catch (error) {
      console.error('Error processing response:', error);
      setMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        {
          type: 'bot',
          content: "I apologize, but I encountered an error processing your response. Please try again.",
          isError: true
        }
      ]);
      playNotification();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!session) {
    console.log('Rendering no-session state');
    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
        <div className="text-center text-gray-500">
          Please sign in to use the interview assistant.
        </div>
      </div>
    );
  }

  console.log('Rendering chat interface with messages:', messages);
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.isTyping
                  ? 'bg-gray-100 text-gray-500 animate-pulse'
                  : message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isError
                  ? 'bg-red-100 text-red-700'
                  : message.isFeedback
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={showWelcome ? "Type your response..." : "Please wait..."}
          disabled={isProcessing || currentQuestion >= INTERVIEW_QUESTIONS.length || !showWelcome}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isProcessing || !userInput.trim() || currentQuestion >= INTERVIEW_QUESTIONS.length || !showWelcome}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Send'}
        </button>
      </form>
    </div>
  );
}