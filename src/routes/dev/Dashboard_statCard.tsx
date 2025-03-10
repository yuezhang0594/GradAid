import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, Activity, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BookOpenIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  ClockIcon,
  FileTextIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChevronRight,
  ExternalLink,
  BellIcon,
  TargetIcon,
} from "lucide-react";
import { Header } from "@/components/layout";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatBot } from "@/components/chatbot";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Add this interface for card actions
interface CardAction {
  label: string;
  href: string;
  tooltip: string;
}

// 1. Application Progress Cards (Enhanced based on personas)
const applicationStats = [
  {
    title: "Active Applications",
    icon: <FileTextIcon className="h-4 w-4 text-muted-foreground" />,
    value: "5",
    description: "2 submitted, 3 in progress",
    action: {
      label: "View all applications",
      href: "/applications",
      tooltip: "View summary of all your applications",
    },
  },
  {
    title: "AI Credits Used",
    icon: <SparklesIcon className="h-4 w-4 text-muted-foreground" />,
    value: "250/500",
    description: "50% remaining this month",
    action: {
      label: "View usage",
      href: "/ai-usage",
      tooltip: "Monitor your AI credit usage",
    },
  },
  {
    title: "Next Deadline",
    icon: <ClockIcon className="h-4 w-4 text-muted-foreground" />,
    value: "5 days",
    description: "Stanford MS CS - May 15",
    action: {
      label: "View timeline",
      href: "/timeline",
      tooltip: "Check upcoming deadlines",
    },
  },
  {
    title: "Recent Activity",
    icon: <Activity className="h-4 w-4 text-muted-foreground" />,
    value: "12",
    description: "Actions in last 7 days",
    action: {
      label: "View activity",
      href: "/activity",
      tooltip: "See your recent actions",
    },
  },
];

// 2. Document Status Cards (Enhanced for better tracking)
const documentStats = [
  {
    title: "Statement of Purpose",
    progress: 75,
    status: "In Review",
    university: "Stanford University",
    lastEdited: "2 hours ago",
    aiSuggestions: 3,
    action: {
      label: "Edit document",
      href: "/applications/stanford-university/documents/sop",
      tooltip: "Continue editing your Statement of Purpose",
    },
  },
  {
    title: "Research Statement",
    progress: 45,
    status: "Draft",
    university: "MIT",
    lastEdited: "1 day ago",
    aiSuggestions: 2,
    action: {
      label: "Edit document",
      href: "/applications/mit/documents/research-statement",
      tooltip: "Continue working on your Research Statement",
    },
  },
  {
    title: "Letters of Recommendation",
    progress: 100,
    status: "Complete",
    count: "3/3 received",
    lastUpdated: "5 days ago",
    action: {
      label: "View LORs",
      href: "/applications/stanford-university/documents/lors",
      tooltip: "View your Letters of Recommendation",
    },
  },
];

// 3. Timeline/Deadlines Section (Enhanced with more details)
const applicationTimeline = [
  {
    date: "2025-05-15",
    university: "Stanford University",
    program: "MS Computer Science",
    priority: "high",
    requirements: [
      { type: "SOP", status: "completed", lastEdit: "2025-03-08" },
      { type: "Transcripts", status: "pending", dueDate: "2025-05-01" },
      { type: "LORs", status: "in_progress", count: "2/3" },
    ],
    notes: "Need to follow up with Prof. Johnson for LOR",
  },
  {
    date: "2025-06-01",
    university: "MIT",
    program: "MS Artificial Intelligence",
    priority: "medium",
    requirements: [
      { type: "SOP", status: "in_progress", lastEdit: "2025-03-07" },
      { type: "Research Statement", status: "pending", dueDate: "2025-05-15" },
      { type: "LORs", status: "completed", count: "3/3" },
    ],
    notes: "Research statement needs revision based on AI feedback",
  },
];

// Create a clickable card component
function ClickableCard({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action: CardAction;
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`group transition-all hover:shadow-md cursor-pointer ${className}`}
            onClick={() => navigate(action.href)}
          >
            <div className="relative">
              {children}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{action.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Application Progress Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {applicationStats.map((stat, index) => (
              <ClickableCard key={index} action={stat.action}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </ClickableCard>
            ))}
          </div>

          {/* Document Progress Section */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileTextIcon className="h-5 w-5 mr-2" />
              Application Documents
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {documentStats.map((doc, index) => (
                <ClickableCard key={index} action={doc.action}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">{doc.title}</CardTitle>
                      {doc.aiSuggestions && (
                        <Badge variant="secondary" className="ml-2">
                          <SparklesIcon className="h-3 w-3 mr-1" />
                          {doc.aiSuggestions} suggestions
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center">
                      {doc.university}
                      {doc.lastEdited && (
                        <span className="text-xs text-muted-foreground ml-2">
                          · Edited {doc.lastEdited}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          <Badge
                            variant={
                              doc.status === "Complete" ? "default" : "secondary"
                            }
                          >
                            {doc.status}
                          </Badge>
                        </span>
                        <span>{doc.progress}%</span>
                      </div>
                      <Progress value={doc.progress} className="h-2" />
                      {doc.count && (
                        <p className="text-xs text-muted-foreground">
                          {doc.count}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </ClickableCard>
              ))}
            </div>
          </div>

          {/* Application Timeline */}
          <div className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <div>
                    <CardTitle>Application Timeline</CardTitle>
                    <CardDescription>
                      Track your application deadlines and requirements
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/timeline")}
                  className="hover:bg-primary/10"
                >
                  <span>View all</span>
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicationTimeline.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(
                          `/applications/${item.university
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`
                        )
                      }
                    >
                      <div className="min-w-[100px] text-sm">
                        <div className="font-medium">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                        <Badge
                          variant={item.priority === "high" ? "destructive" : "secondary"}
                          className="mt-1"
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium flex items-center">
                          {item.university}
                          <TargetIcon className="h-4 w-4 ml-2 text-muted-foreground" />
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.program}
                        </p>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {item.requirements.map((req, idx) => (
                            <Badge
                              key={idx}
                              variant={
                                req.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className="flex items-center"
                            >
                              {req.type}
                              {req.count && (
                                <span className="ml-1 text-xs">({req.count})</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                        {item.notes && (
                          <p className="mt-2 text-xs text-muted-foreground flex items-center">
                            <BellIcon className="h-3 w-3 mr-1" />
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Existing ChatBot */}
          <ChatBot />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
