import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  category?: "academic" | "administrative" | "general";
}

interface QuickReply {
  id: string;
  text: string;
  category: string;
}

// Add ChatMessage component
const ChatMessage = ({ message }: { message: ChatMessage }) => {
  return (
    <div
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
    >
      {message.role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={`rounded-lg p-4 max-w-[80%] ${
          message.role === "user"
            ? "bg-primary text-primary-foreground ml-2"
            : "bg-muted"
        }`}
      >
        {message.category && (
          <span className="text-xs font-medium mb-1 block opacity-70">
            {message.category.toUpperCase()}
          </span>
        )}
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

// Add QuickReplies component
const QuickReplies = ({ onSelect }: { onSelect: (reply: string) => void }) => {
  const quickReplies: QuickReply[] = [
    { id: "1", text: "How's my academic progress?", category: "academic" },
    { id: "2", text: "Show my upcoming deadlines", category: "administrative" },
    { id: "3", text: "Calculate my GPA", category: "academic" },
    { id: "4", text: "Course recommendations", category: "academic" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {quickReplies.map((reply) => (
        <Button
          key={reply.id}
          variant="outline"
          size="sm"
          onClick={() => onSelect(reply.text)}
          className="text-xs"
        >
          {reply.text}
        </Button>
      ))}
    </div>
  );
};

// Add ChatBot component
export const ChatBot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your academic assistant. I can help you with course information, deadlines, and academic progress. What would you like to know?",
        timestamp: new Date(),
        category: "general",
      },
    ]);
  }, []);

  // Auto-scroll to latest messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Here you would integrate with your AI service
      // For now, we'll simulate a response based on the message content
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let response = "";
      let category: "academic" | "administrative" | "general" = "general";

      if (content.toLowerCase().includes("gpa")) {
        response =
          "Your current GPA is 3.8. This is calculated from your last 6 completed courses.";
        category = "academic";
      } else if (content.toLowerCase().includes("deadline")) {
        response =
          "You have 4 upcoming deadlines:\n1. Final Project (CS101) - May 15\n2. Research Paper (HIS202) - May 18\n3. Group Presentation (BUS301) - May 20";
        category = "administrative";
      } else {
        response = `I understand you're asking about "${content}". Let me help you with that. What specific information would you like to know?`;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        category,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
          {messages.length > 1 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {messages.length - 1}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Academic Assistant
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100vh-8rem)]">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {messages.length === 1 && (
                <QuickReplies onSelect={handleSendMessage} />
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
