import React, { useState, useRef } from "react";

const Chatbot = ({ session }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input, userId: session.user.id };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.id}` // Add user ID to requests
        },
        body: JSON.stringify({ 
          message: input,
          userId: session.user.id // Include user ID in message
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }
      
      const data = await response.json();
      const botMessage = { 
        sender: "bot", 
        text: data.response,
        userId: session.user.id 
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = { 
        sender: "bot", 
        text: "Sorry, I encountered an error. Please try again.",
        isError: true,
        userId: session.user.id
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-[600px] flex flex-col">
      <div className="flex-none mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Chat with GradAid</h2>
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            Start a conversation by typing a message below
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 ${
                msg.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.isError 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-left p-2 my-1">
            <span className="px-3 py-2 rounded-lg inline-block bg-gray-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question about grad school..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              isLoading ? "cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;