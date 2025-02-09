import React, { useState } from "react";

const Chatbot = ({ session }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            Start a conversation by typing a message below
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`p-2 my-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
              <span className={`px-3 py-2 rounded-lg inline-block ${
                msg.sender === "user" 
                  ? "bg-blue-500 text-white" 
                  : msg.isError 
                    ? "bg-red-100 text-red-600" 
                    : "bg-gray-200 text-black"
              }`}>
                {msg.text}
              </span>
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
      </div>
      <div className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your question about grad school..."
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage} 
            className={`px-4 py-2 rounded-r-lg ${
              isLoading 
                ? "bg-blue-300 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors`}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;