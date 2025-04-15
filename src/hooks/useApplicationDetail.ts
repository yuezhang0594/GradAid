import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";

// This interface will be used when we integrate with Convex
interface ApplicationDetailData {
  applicationStats: Array<{
    title: string;
    // icon: ReactNode;
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
    type: string; 
    documentId: Id<"applicationDocuments">; 
    action: {
      label: string;
      href: string;
      tooltip: string;
    };
  }>;
  requirementStats: Array<{
    title: string;
    status: "completed" | "in_progress" | "pending" | "not_started";
    dueDate: string;
    notes?: string;
    action: {
      label: string;
      href: string;
      tooltip: string;
    };
  }>;
}

interface ApplicationData {
  _id: string;
  university: string;
  program: string;
  degree: string;
  status: string;
  priority: string;
  deadline: string;
  documents: any[];
  requirements: any[];
}

export function useApplicationDetail(applicationId: string, demoMode = true): ApplicationDetailData & { application: ApplicationData | null; isLoading: boolean } {
  const applicationData = useQuery(api.applications.queries.getApplicationDetails, { applicationId, demoMode });

  console.log("[useApplicationDetail] Query params:", { applicationId, demoMode });
  console.log("[useApplicationDetail] Raw application data:", applicationData);

  if (applicationData === undefined) {
    console.log("[useApplicationDetail] Loading application data");
    return {
      application: null,
      applicationStats: [],
      documentStats: [],
      requirementStats: [],
      isLoading: true,
    };
  }

  if (applicationData === null) {
    console.log("[useApplicationDetail] No application data found");
    return {
      application: null,
      applicationStats: [],
      documentStats: [],
      requirementStats: [],
      isLoading: false,
    };
  }

  const applicationStats = [
    {
      title: "Status",
      // icon: <FileTextIcon className="h-4 w-4 text-muted-foreground" />,
      value: applicationData.status,
      description: `Priority: ${applicationData.priority}`,
      action: {
        label: "Update Status",
        href: `/applications/${applicationData.university}/status`,
        tooltip: "Update application status",
      },
    },
    {
      title: "Documents",
      // icon: <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />,
      value: `${applicationData.documents.length} Required`,
      description: `${applicationData.documents.filter((d) => d.status === "complete").length} Completed`,
      action: {
        label: "View Documents",
        href: `/applications/${applicationData.university}/documents`,
        tooltip: "View all application documents",
      },
    },
    {
      title: "Deadline",
      // icon: <ClockIcon className="h-4 w-4 text-muted-foreground" />,
      value: new Date(applicationData.deadline).toLocaleDateString(),
      description: `${formatDistanceToNow(new Date(applicationData.deadline))} remaining`,
      action: {
        label: "View Timeline",
        href: "/timeline",
        tooltip: "View application timeline",
      },
    },
  ];

  const documentStats = applicationData.documents.map((doc) => {
    console.log("[useApplicationDetail] Processing document:", doc);
    return {
      title: doc.title,
      progress: doc.progress,
      status: doc.status,
      university: applicationData.university,
      lastEdited: doc.lastEdited,
      aiSuggestions: doc.aiSuggestions,
      type: doc.type,
      documentId: doc.id,  
      action: {
        label: "Edit Document",
        href: `/applications/${applicationData.university}/documents/${doc.type.toLowerCase()}`,
        tooltip: "Continue editing document",
      },
    };
  });

  const requirementStats = applicationData.requirements.map((req) => {
    console.log("[useApplicationDetail] Processing requirement:", req);
    return {
      title: req.type,
      status: req.status,
      dueDate: applicationData.deadline,
      action: {
        label: "Update Status",
        href: `/applications/${applicationData.university}/requirements/${req.type.toLowerCase()}`,
        tooltip: "Update requirement status",
      },
    };
  });

  const result = {
    application: applicationData,
    applicationStats,
    documentStats,
    requirementStats,
    isLoading: false,
  };

  console.log("[useApplicationDetail] Returning processed data:", result);
  return result;
}
