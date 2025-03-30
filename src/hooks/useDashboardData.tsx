import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Activity, FileTextIcon, SparklesIcon, ClockIcon } from "lucide-react";
import React from "react";

export interface DashboardData {
  stats: {
    applications: {
      total: number;
      submitted: number;
      inProgress: number;
      nextDeadline: string | null;
    };
    documents: {
      totalDocuments: number;
      averageProgress: number;
      completedDocuments: number;
    };
    lors: {
      total: number;
      submitted: number;
      pending: number;
    };
    aiCredits: {
      totalCredits: number;
      usedCredits: number;
    };
    recentActivity: any[];
  };
  applicationStats: Array<{
    title: string;
    icon: React.ReactNode;
    value: string;
    description: string;
    action: {
      label: string;
      href: string;
      tooltip: string;
    };
  }>;
  documentStats: Array<{
    title: string;
    progress: number;
    status: string;
    university: string;
    lastEdited?: string;
    aiSuggestions?: number;
    action: {
      label: string;
      href: string;
      tooltip: string;
    };
  }>;
  applicationTimeline: Array<{
    date: string;
    university: string;
    program: string;
    priority: "high" | "medium" | "low";
    requirements: Array<{
      type: string;
      status: "completed" | "in_progress" | "pending";
    }>;
    notes: string;
  }>;
}

export const useDashboardData = (demoMode?: boolean): DashboardData => {
  // Fetch data from Convex
  const stats = useQuery(api.dashboard.queries.getDashboardStats, { demoMode }) ?? {
    applications: { total: 0, submitted: 0, inProgress: 0, nextDeadline: null },
    documents: { totalDocuments: 0, averageProgress: 0, completedDocuments: 0 },
    lors: { total: 0, submitted: 0, pending: 0 },
    aiCredits: { totalCredits: 0, usedCredits: 0 },
    recentActivity: []
  };

  const applications = useQuery(api.applications.queries.getApplications, { demoMode }) ?? [];
  const recentDocuments = useQuery(api.applications.queries.getDocumentsByUniversity, { demoMode }) ?? [];

  // Get next deadline application
  const nextDeadlineApp = applications.length > 0 
    ? applications.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]
    : null;

  // Format application stats
  const applicationStats = [
    {
      title: "Active Applications",
      icon: <FileTextIcon className="h-4 w-4 text-muted-foreground" />,
      value: applications.length.toString(),
      description: `${applications.filter(a => a.status === "submitted").length} submitted, ${applications.filter(a => a.status === "in_progress").length} in progress`,
      action: {
        label: "View all applications",
        href: "/applications",
        tooltip: "View summary of all your applications",
      },
    },
    {
      title: "AI Credits Used",
      icon: <SparklesIcon className="h-4 w-4 text-muted-foreground" />,
      value: `${stats.aiCredits.usedCredits}/${stats.aiCredits.totalCredits}`,
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
      value: applications.length > 0 ? 
        applications.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0].university :
        "No deadlines",
      description: applications.length > 0 ? 
        `Due ${new Date(applications.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0].deadline).toLocaleDateString()}` :
        "No upcoming deadlines",
      action: {
        label: "View timeline",
        href: "/timeline",
        tooltip: "Check upcoming deadlines",
      },
    },
    {
      title: "Recent Activity",
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
      value: stats.recentActivity.length.toString(),
      description: "Last 7 days",
      action: {
        label: "View activity",
        href: "/activity",
        tooltip: "See your recent actions",
      },
    },
  ];

  // Format document stats
  const documentStats = recentDocuments.slice(0, 4).map(uni => ({
    title: uni.documents[0]?.type.toUpperCase() ?? "New Document",
    progress: uni.documents[0]?.progress ?? 0,
    status: uni.documents[0]?.status ?? "Not Started",
    university: uni.name,
    lastEdited: uni.documents[0]?.lastEdited ? new Date(uni.documents[0].lastEdited).toLocaleDateString() : undefined,
    aiSuggestions: uni.documents[0]?.aiSuggestionsCount,
    action: {
      label: "Edit document",
      href: `/applications/${uni.name.replace(/\s+/g, " ")}/documents/${uni.documents[0]?.type ?? "new"}`,
      tooltip: "Continue editing your document",
    },
  }));

  // Format application timeline
  const applicationTimeline = applications
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)
    .map(app => ({
      date: app.deadline,
      university: app.university,
      program: `${app.degree} in ${app.program}`,
      priority: app.priority as "high" | "medium" | "low",
      requirements: [
        {
          type: "Documents",
          status: app.progress === 100 ? ("completed" as const) : 
                  app.progress > 0 ? ("in_progress" as const) : ("pending" as const)
        }
      ],
      notes: `${app.documentsComplete}/${app.totalDocuments} documents completed`
    }));

  return {
    stats,
    applicationStats,
    documentStats,
    applicationTimeline,
  };
};
