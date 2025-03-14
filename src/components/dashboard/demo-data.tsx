import React from "react";
import { Activity, FileTextIcon, SparklesIcon, ClockIcon } from "lucide-react";
import { type CardAction } from "./clickablecard";

// Define interfaces for type safety
interface ApplicationStat {
  title: string;
  icon: React.ReactElement;
  value: string;
  description: string;
  action: CardAction;
}

interface DocumentStat {
  title: string;
  progress: number;
  status: string;
  university: string;
  lastEdited: string;
  aiSuggestions?: number;
  count?: string;
  action: CardAction;
}

interface Requirement {
  type: string;
  status: "completed" | "pending" | "in_progress";
  lastEdit?: string;
  dueDate?: string;
  count?: string;
}

interface TimelineEvent {
  date: string;
  university: string;
  program: string;
  priority: "high" | "medium" | "low";
  requirements: Requirement[];
  notes?: string;
}

// 1. Application Progress Cards (Enhanced based on personas)
export const applicationStats: ApplicationStat[] = [
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
    description: "Reset on Apr 1, 2025",
    action: {
      label: "View usage",
      href: "/credits",
      tooltip: "Monitor your AI credit usage",
    },
  },
  {
    title: "Next Deadline",
    icon: <ClockIcon className="h-4 w-4 text-muted-foreground" />,
    value: "Stanford",
    description: "Due May 15, 2025",
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
    description: "Last 7 days",
    action: {
      label: "View activity",
      href: "/activity",
      tooltip: "See your recent actions",
    },
  },
];

// 2. Document Status Cards (Enhanced for better tracking)
export const documentStats: DocumentStat[] = [
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
    aiSuggestions: 5,
    count: "Due May 15, 2025",
    action: {
      label: "Edit document",
      href: "/applications/mit/documents/research-statement",
      tooltip: "Continue working on your Research Statement",
    },
  },
  {
    title: "CV",
    progress: 100,
    status: "Complete",
    university: "Stanford University",
    lastEdited: "1 week ago",
    action: {
      label: "View CV",
      href: "/applications/stanford-university/documents/cv",
      tooltip: "View your completed CV",
    },
  },
  {
    title: "Letters of Recommendation",
    progress: 100,
    status: "Complete",
    count: "3/3 received",
    lastEdited: "5 days ago",
    university: "Stanford University",
    action: {
      label: "View LORs",
      href: "/applications/stanford-university/documents/lors",
      tooltip: "View your Letters of Recommendation",
    },
  },
];

// 3. Timeline/Deadlines Section (Enhanced with more details)
export const applicationTimeline: TimelineEvent[] = [
  {
    date: "2025-05-15",
    university: "Stanford University",
    program: "MS Computer Science",
    priority: "high",
    requirements: [
      { type: "SOP", status: "completed", lastEdit: "2025-03-08" },
      { type: "Transcripts", status: "pending", dueDate: "2025-05-01" },
      { type: "LORs", status: "completed", count: "3/3" },
      { type: "CV", status: "completed", lastEdit: "2025-03-06" }
    ],
    notes: "All LORs received from Prof. Johnson, Dr. Smith, and Dr. Wilson",
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
  {
    date: "2025-06-15",
    university: "UC Berkeley",
    program: "MS Computer Science",
    priority: "medium",
    requirements: [
      { type: "SOP", status: "in_progress", lastEdit: "2025-03-10" },
      { type: "Research Statement", status: "pending", dueDate: "2025-06-01" },
      { type: "LORs", status: "pending", count: "0/3" },
      { type: "CV", status: "in_progress", lastEdit: "2025-03-09" }
    ],
    notes: "Need to start LOR requests",
  },
  {
    date: "2025-07-01",
    university: "Carnegie Mellon University",
    program: "MS Software Engineering",
    priority: "medium",
    requirements: [
      { type: "SOP", status: "pending" },
      { type: "Transcripts", status: "pending", dueDate: "2025-06-15" },
      { type: "LORs", status: "pending", count: "0/3" },
      { type: "CV", status: "in_progress", lastEdit: "2025-03-09" }
    ],
    notes: "Application window opens on April 1st",
  },
  {
    date: "2025-07-15",
    university: "Georgia Tech",
    program: "MS Computer Science",
    priority: "low",
    requirements: [
      { type: "SOP", status: "pending" },
      { type: "Research Statement", status: "pending" },
      { type: "LORs", status: "pending", count: "0/3" },
      { type: "CV", status: "in_progress", lastEdit: "2025-03-09" }
    ],
    notes: "Rolling admissions - apply early",
  },
];