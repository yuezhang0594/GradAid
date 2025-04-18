import { useLocation } from "react-router-dom";
import { useApplicationDetail } from "@/hooks/useApplicationDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClickableCard } from "@/components/dashboard/clickablecard";
import { FileTextIcon, GraduationCapIcon, CheckCircleIcon, ClockIcon, FilePlus2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Id } from "#/_generated/dataModel";
import { Button } from "@/components/ui";
import { api } from "#/_generated/api";
import { DocumentType, MAX_LOR } from "#/validators";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { set } from "date-fns";

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
  const createDocument = useMutation(api.documents.mutations.createDocument);
  const deleteApplication = useMutation(api.applications.mutations.deleteApplication);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const { application, applicationStats, documentStats, isLoading } = useApplicationDetail(
    state?.applicationId ?? ""
  );
  const icons = {
    "Status": <FileTextIcon className="h-4 w-4 text-muted-foreground" />,
    "Documents": <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />,
    "Deadline": <ClockIcon className="h-4 w-4 text-muted-foreground" />,
  };

  if (!state?.applicationId) {
    return (
      <PageWrapper title="Error">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Missing Application ID</h1>
          <p>No application ID was provided in the navigation state.</p>
        </div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </PageWrapper>
    );
  }

  if (isLoading) {
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
    return (
      <PageWrapper title="Application not found">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Application not found</h1>
          <p>No application found for {state?.universityName ?? "unknown university"}.</p>
        </div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </PageWrapper>
    );
  }

  const handleDocumentClick = (documentId: Id<"applicationDocuments">, documentType: string) => {
    navigate(`/documents/${encodeURIComponent(state.universityName)}/${documentType.toLowerCase()}?documentId=${documentId}`, {
      state: {
        applicationId: state.applicationId,
        universityName: state.universityName,
        returnPath: location.pathname
      }
    });
  };

  const handleNewDocumentClick = async (applicationId: Id<"applications">, universityName: string, documentType: DocumentType) => {
    const documentId = await createDocument({
      applicationId,
      type: documentType,
    });

    // Navigate to the document editor with the document ID as a query parameter
    navigate(`/documents/${encodeURIComponent(universityName)}/${documentType.toLowerCase()}?documentId=${documentId}`, {
      state: {
        applicationId,
        universityName,
        returnPath: location.pathname
      }
    });
  };

  function confirmDelete(applicationId: Id<"applications">): void {    
    try {
      // Call the mutation to delete the application
      deleteApplication({ applicationId })
        .then(() => {
          // Navigate back to applications list on success
          navigate("/applications", { 
            state: { message: `Application for ${state.universityName} has been deleted.` } 
          });
          toast.success("Application deleted successfully");
        })
        .catch(error => {
          toast.error("Failed to delete application. Please try again.");
        });
    } catch (error) {
      toast.error("An error occurred while attempting to delete the application.");
    } finally {
      // Reset the dialog state
      setIsDeleteDialogOpen(false);
      setDeleteConfirmation("");
    }
  }

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
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {applicationStats.map((stat, index) => (
            <Card key={index} className="group flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm group-hover:text-primary transition-colors text-left font-bold">{stat.title}</CardTitle>
                {icons[stat.title as keyof typeof icons]}
              </CardHeader>
              <CardContent className="flex flex-col justify-center h-full">
                <div className="text-xl font-bold mb-2">{formatStatus(stat.value)}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 text-start">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FileTextIcon className="h-5 w-5 mr-2" />
          Application Documents
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {!documentStats.some(doc => doc.type.toLowerCase() === 'sop') && (
            <ClickableCard
              action={{
                label: "Create Statement of Purpose",
                href: "#",
                tooltip: "Create a new Statement of Purpose document",
                onClick: () => handleNewDocumentClick(
                  state.applicationId,
                  state.universityName,
                  "sop" as DocumentType
                )
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm group-hover:text-primary transition-colors text-left">
                    Statement of Purpose
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  No SOP found for this application.
                </p>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="flex items-center justify-center h-full">
                  <FilePlus2Icon className="h-6 w-6 mr-2" />
                  <p className="text-sm text-muted-foreground">
                    Create New Document
                  </p>
                </div>
              </CardContent>
            </ClickableCard>
          )}
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
          {documentStats.filter(doc => doc.type.toLowerCase() === "lor").length < MAX_LOR && (
            <ClickableCard
              action={{
                label: "Create Letter of Recommendation",
                href: "#",
                tooltip: "Create a new Letter of Recommendation document",
                onClick: () => handleNewDocumentClick(
                  state.applicationId,
                  state.universityName,
                  "lor" as DocumentType
                )
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm group-hover:text-primary transition-colors text-left">
                    Letter of Recommendation
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create up to {MAX_LOR} LORs for each application.
                </p>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="flex items-center justify-center h-full">
                  <FilePlus2Icon className="h-6 w-6 mr-2" />
                  <p className="text-sm text-muted-foreground">
                    Create New Document
                  </p>
                </div>
              </CardContent>
            </ClickableCard>
          )}
        </div>
        <Button
          variant="destructive"
          className="mt-4"
          onClick={() => setIsDeleteDialogOpen(true)}>
          Delete Application
        </Button>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this application?</DialogTitle>
            <DialogDescription>
              This will permanently delete this application for {state?.universityName} and all associated documents. 
            </DialogDescription>
            <DialogDescription className="text-red-500">
              This action is permanent and irreversible.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Type <span className="font-semibold">Delete application</span> to confirm:
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Delete application"
              className="mt-2"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={deleteConfirmation !== "Delete application"}
              onClick={() => confirmDelete(state.applicationId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
