import React, { useState } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }
      
      const data = await response.json();
      const botMessage = { sender: "bot", text: data.response };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = { 
        sender: "bot", 
        text: "Sorry, I encountered an error. Please try again.",
        isError: true 
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
    <div className="flex flex-col w-full max-w-lg mx-auto p-4 border rounded-lg shadow-lg bg-white">
      <div className="h-96 overflow-y-auto p-2 border-b">
        {messages.map((msg, index) => (
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
        ))}
      </div>
      <div className="flex mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-2 border rounded-l-lg focus:outline-none"
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage} 
          className={`px-4 py-2 rounded-r-lg ${
            isLoading 
              ? "bg-blue-300 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
          disabled={isLoading}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;