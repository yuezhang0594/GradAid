// import { ReactNode } from "react";
// import { FileTextIcon, ClockIcon, CheckCircleIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { DocumentType, DocumentStatus } from "convex/validators";
import { Id, Doc } from "convex/_generated/dataModel";

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
    documentId: Id<"applicationDocuments">;
    title: string;
    progress: number;
    status: DocumentStatus;
    university: string;
    lastEdited?: string;
    aiSuggestions?: number;
    type: DocumentType; // Add type to the interface
    action: {
      label: string;
      href: string;
      tooltip: string;
    };
  }>;
}

// Types for Convex data
type Document = Doc<"applicationDocuments">;
type ApplicationData = Doc<"applications">;

interface ApplicationDocument {
  type: DocumentType;
  status: DocumentStatus;
}

export function useApplicationDetail(applicationId: Id<"applications">) {
  const applicationData = useQuery(api.applications.queries.getApplicationDetails, { applicationId });

  if (applicationData === undefined) {
    return {
      application: null,
      applicationStats: [],
      documentStats: [],
      isLoading: true,
    };
  }

  if (applicationData === null) {
    return {
      application: null,
      applicationStats: [],
      documentStats: [],
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
      description: `${applicationData.documents.filter((d: Document) => d.status === "complete").length} Completed`,
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

  const documentStats = applicationData.documents.map((doc: Document) => {
    return {
      documentId: doc._id,
      title: doc.title,
      progress: doc.progress,
      status: doc.status,
      university: applicationData.university,
      lastEdited: doc.lastEdited,
      aiSuggestions: doc.aiSuggestionsCount,
      type: doc.type,
      action: {
        label: "Edit Document",
        href: `/applications/${applicationData.university}/documents/${doc.type.toLowerCase()}`,
        tooltip: "Continue editing document",
      },
    };
  });
  const result = {
    application: applicationData,
    applicationStats,
    documentStats,
    isLoading: false,
  };
  return result;
}
