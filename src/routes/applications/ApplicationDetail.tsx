import { useLocation } from "react-router-dom";
import { useApplicationDetail } from "@/hooks/useApplicationDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClickableCard } from "@/components/dashboard/clickablecard";
import { useState, useEffect } from "react";
import { FileTextIcon, CheckSquare2Icon, GraduationCapIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Id } from "#/_generated/dataModel";

interface LocationState {
  applicationId: Id<"applications">;
  universityName: string;
}

// Helper function to format status text
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ApplicationDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  console.log("[ApplicationDetail] Rendering with state:", { state });

  const { application, applicationStats, documentStats, isLoading } = useApplicationDetail(
    state?.applicationId ?? ""
  );
  const icons = {
    "Status": <FileTextIcon className="h-4 w-4 text-muted-foreground" />,
    "Documents": <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />,
    "Deadline": <ClockIcon className="h-4 w-4 text-muted-foreground" />,
  };

  console.log("[ApplicationDetail] Hook returned:", {
    hasApplication: !!application,
    isLoading,
    statsCount: {
      application: applicationStats.length,
      documents: documentStats.length,
    }
  });

  if (!state?.applicationId) {
    console.log("[ApplicationDetail] No application ID in state");
    return (
      <PageWrapper title="Error">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Missing Application ID</h1>
          <p>No application ID was provided in the navigation state.</p>
        </div>
      </PageWrapper>
    );
  }

  if (isLoading) {
    console.log("[ApplicationDetail] Showing loading state");
    return (
      <PageWrapper title="Loading Application Details...">
        <div className="space-y-4">
          {/* Application Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg border animate-pulse">
                <div className="h-4 w-24 bg-muted rounded mb-2" />
                <div className="h-6 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>

          {/* Documents */}
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border animate-pulse">
                <div className="h-4 w-32 bg-muted rounded mb-2" />
                <div className="h-2 w-full bg-muted rounded mt-4" />
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!application) {
    console.log("[ApplicationDetail] No application found");
    return (
      <PageWrapper title="Application not found">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Application not found</h1>
          <p>No application found for {state?.universityName ?? "unknown university"}.</p>
        </div>
      </PageWrapper>
    );
  }

  console.log("[ApplicationDetail] Rendering application:", {
    university: application.university,
    program: application.program,
    status: application.status
  });

  const handleDocumentClick = (documentId: Id<"applicationDocuments">, documentType: string) => {
    navigate(`/documents/${encodeURIComponent(state.universityName)}/${documentType.toLowerCase()}?documentId=${documentId}`, {
      state: {
        applicationId: state.applicationId,
        universityName: state.universityName,
        returnPath: location.pathname
      }
    });
  };

  return (
    <PageWrapper
      title={application.university}
      description={`${application.degree} in ${application.program}`}
    >
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <GraduationCapIcon className="h-5 w-5 mr-2" />
          Application Status
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {applicationStats.map((stat, index) => (
            <Card key={index} className="group flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm group-hover:text-primary transition-colors text-left font-bold">{stat.title}</CardTitle>
                {icons[stat.title as keyof typeof icons]}
              </CardHeader>
              <CardContent className="pt-4 flex flex-col justify-center h-full">
                <div className="text-xl font-bold mb-2">{formatStatus(stat.value)}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FileTextIcon className="h-5 w-5 mr-2" />
          Application Documents
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {documentStats.map((doc, index) => (
            <ClickableCard
              key={index}
              action={{
                ...doc.action,
                href: doc.action.href,
                onClick: () => handleDocumentClick(doc.documentId, doc.type)
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm group-hover:text-primary transition-colors text-left">{doc.title}</CardTitle>
                  {doc.aiSuggestions && (
                    <Badge variant="secondary" className="ml-2 hidden xl:inline-flex">
                      <span className="mr-1">🤖</span>
                      {doc.aiSuggestions} suggestions
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {doc.lastEdited && `Last edited ${new Date(doc.lastEdited).toLocaleDateString()}`}
                </p>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Badge variant={doc.status === "complete" ? "default" : "secondary"}>
                        {formatStatus(doc.status)}
                      </Badge>
                    </span>
                    <span>{doc.progress}%</span>
                  </div>
                  <Progress value={doc.progress} className="h-2 group-hover:bg-primary/20 transition-colors" />
                </div>
              </CardContent>
            </ClickableCard>
          ))}
        </div>
      </div>

      {/* <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <CheckSquare2Icon className="h-5 w-5 mr-2" />
          Requirements
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {requirementStats.map((req, index) => (
            <Card key={index} className="group flex flex-col">
              <CardHeader>
                <CardTitle className="text-sm">{req.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Due {new Date(req.dueDate).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant={req.status === "completed" ? "default" : "secondary"}>
                      {formatStatus(req.status)}
                    </Badge>
                  </div>
                  {req.notes && (
                    <p className="text-xs text-muted-foreground">{req.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}
    </PageWrapper>
  );
}
