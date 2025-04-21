import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";

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
    aiCredits: {
      totalCredits: number;
      usedCredits: number;
    };
    recentActivity: any[];
  };
  applicationStats: Array<{
    title: string;
    // icon: React.ReactNode;
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
    program: string;
    type: string;
    documentId: string;
    applicationId: string | undefined;
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

interface Document {
  title: string;
  type: string;
  status: string;
  progress: number;
  lastEdited?: string;
  aiSuggestions?: number;
  documentId: string;
  program: string;
}

interface University {
  name: string;
  documents: Document[];
  programs: Array<{
    applicationId: Id<"applications">;
    name: string;
  }>;
}

export const useDashboardData = (): DashboardData => {
  // Fetch data from Convex
  const stats = useQuery(api.dashboard.queries.getDashboardStats) ?? {
    applications: { total: 0, submitted: 0, inProgress: 0, nextDeadline: null },
    documents: { totalDocuments: 0, averageProgress: 0, completedDocuments: 0 },
    lors: { total: 0, submitted: 0, pending: 0 },
    aiCredits: { totalCredits: 0, usedCredits: 0, resetDate: "" },
    recentActivity: []
  };

  const applications = useQuery(api.applications.queries.getApplications) ?? [];
  const recentDocuments = useQuery(api.applications.queries.getDocumentDetails) ?? [];

  // Format resetDate as mm/dd/yyyy
  const resetDateFormatted = stats.aiCredits.resetDate
    ? new Date(stats.aiCredits.resetDate).toLocaleDateString(undefined, {
        year: 'numeric', month: '2-digit', day: '2-digit'
      })
    : '';

  // Format application stats
  const applicationStats = [
    {
      title: "Active Applications",
      // icon: <FileTextIcon className="h-4 w-4 text-muted-foreground" />,
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
      // icon: <SparklesIcon className="h-4 w-4 text-muted-foreground" />,
      value: `${stats.aiCredits.usedCredits}/${stats.aiCredits.totalCredits}`,
      description: `Reset on ${resetDateFormatted}`,
      // description: `${aiDocTypeUsed} times AI Doc used`,
      action: {
        label: "View usage",
        href: "/credits",
        tooltip: "Monitor your AI credit usage",
      },
    },
    {
      title: "Next Deadline",
      // icon: <ClockIcon className="h-4 w-4 text-muted-foreground" />,
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
      // icon: <Activity className="h-4 w-4 text-muted-foreground" />,
      value: stats.recentActivity.length.toString(),
      description: "Last 7 days",
      action: {
        label: "View activity",
        href: "/activity",
        tooltip: "See your recent actions",
      },
    },
  ];

  // Helper function to format document type
  const formatDocumentType = (type: string): string => {
    // Special cases for acronyms
    const upperCaseTypes = ['sop', 'lor', 'cv'];
    if (upperCaseTypes.includes(type.toLowerCase())) {
      return type.toUpperCase();
    }
    
    // For other types: capitalize first letter and replace - or _ with space
    return type
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Format document stats
  const documentStats = recentDocuments.flatMap((uni: University) => 
    uni.documents.map((doc: Document) => ({
      title: formatDocumentType(doc.type) ?? "New Document",
      progress: doc.progress,
      status: doc.status,
      university: uni.name,
      program: doc.program,
      type: doc.type,
      documentId: doc.documentId,
      applicationId: uni.programs[0]?.applicationId,
      lastEdited: doc.lastEdited,
      aiSuggestions: doc.aiSuggestions,
      action: {
        label: "Edit Document",
        href: `/applications/${uni.name}/documents/${doc.type.toLowerCase()}`,
        tooltip: "Continue editing document",
      },
    }))
  );

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
