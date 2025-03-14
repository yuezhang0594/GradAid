import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

import {
  BarChart,
  LineChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BookOpenIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  ClockIcon,
} from "lucide-react";
import { Header } from "@/components/layout";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";

// Add these new interfaces
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
const ChatBot = () => {
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

// Mock data for charts
const performanceData = [
  { name: "Jan", score: 65 },
  { name: "Feb", score: 59 },
  { name: "Mar", score: 80 },
  { name: "Apr", score: 81 },
  { name: "May", score: 76 },
  { name: "Jun", score: 85 },
];

const courseData = [
  { name: "Mathematics", completed: 80 },
  { name: "Science", completed: 65 },
  { name: "Literature", completed: 90 },
  { name: "History", completed: 73 },
];

export default function Dashboard() {
  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <Header />
        {/* Main content */}
        <main className="flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Stats cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Courses
                </CardTitle>
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last semester
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Current GPA
                </CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.8</div>
                <p className="text-xs text-muted-foreground">
                  +0.2 from last semester
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Credits Earned
                </CardTitle>
                <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72</div>
                <p className="text-xs text-muted-foreground">
                  48 more needed to graduate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Deadlines
                </CardTitle>
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">2 due this week</p>
              </CardContent>
            </Card>
          </div>
          {/* Add ChatBot */}
          <ChatBot />

          {/* Charts and tables */}
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>
                  Your performance over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Course Completion</CardTitle>
                <CardDescription>Current progress by subject</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={courseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent activity and upcoming events */}
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <Card className="col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Assignment submitted",
                      description:
                        "You submitted 'Research Paper' for Biology 101",
                      time: "2 hours ago",
                    },
                    {
                      title: "Grade received",
                      description:
                        "You received an A on 'Midterm Exam' for Mathematics 202",
                      time: "Yesterday",
                    },
                    {
                      title: "Course enrolled",
                      description: "You enrolled in 'Computer Science 301'",
                      time: "2 days ago",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {item.title[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Final Project",
                      course: "Computer Science 101",
                      deadline: "May 15, 2023",
                      progress: 65,
                    },
                    {
                      title: "Research Paper",
                      course: "History 202",
                      deadline: "May 18, 2023",
                      progress: 25,
                    },
                    {
                      title: "Group Presentation",
                      course: "Business 301",
                      deadline: "May 20, 2023",
                      progress: 10,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.course}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Due {item.deadline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
