import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "#/_generated/api";
import { Doc, Id } from "#/_generated/dataModel";
import { toast } from "sonner";
import { DocumentType, DocumentStatus, ApplicationPriority } from "#/validators";

export type Program = Doc<"programs">;
export type University = Doc<"universities">;

/**
 * Hook for managing the application process
 */
export function useApply(programId?: Id<"programs"> | null) {
  const [isCreating, setIsCreating] = useState(false);
  
  // Get program data
  const programsQuery = useQuery(
    api.programs.queries.getProgramsByIds, 
    programId ? { programIds: [programId] } : "skip"
  );
  const program: Program | null = programsQuery?.length ? programsQuery[0] : null;
  
  // Get university data for the program
  const universityQuery = useQuery(
    api.universities.queries.getUniversity,
    program ? { universityId: program.universityId } : "skip"
  );
  const university: University | null = universityQuery ?? null;
  
  // Mutations
  const createApplicationMutation = useMutation(api.applications.mutations.createApplication);
  const updateStatusMutation = useMutation(api.applications.mutations.updateApplicationStatus);

  // Function to create a new application
  const createApplication = async ({
    universityId,
    programId,
    deadline,
    priority,
    notes,
    applicationDocuments
  }: {
    universityId: Id<"universities">;
    programId: Id<"programs">;
    deadline: string;
    priority: ApplicationPriority;
    notes?: string;
    applicationDocuments: Array<{
      type: DocumentType;
      status: DocumentStatus;
    }>;
  }) => {
    setIsCreating(true);
    
    try {
      const applicationId = await createApplicationMutation({
        universityId,
        programId,
        deadline,
        priority,
        notes,
        applicationDocuments
      });
      
      toast.success("Application Created", {
        description: "Your application has been successfully created."
      });
      
      return applicationId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      const truncatedMessage = errorMessage.includes("Uncaught Error:") 
        ? errorMessage.split("Uncaught Error:")[1].split(/\s+at\s+/)[0].trim()
        : errorMessage;
      toast.error("Error Creating Application", {
        description: truncatedMessage
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  // Function to update application status
  const updateApplicationStatus = async ({
    applicationId,
    status,
    notes,
    submissionDate
  }: {
    applicationId: Id<"applications">;
    status: "draft" | "in_progress" | "submitted" | "accepted" | "rejected";
    notes?: string;
    submissionDate?: string;
  }) => {
    try {
      const updatedId = await updateStatusMutation({
        applicationId,
        status,
        notes,
        submissionDate
      });
      
      toast.success("Application Updated", {
        description: `Application status updated to ${status}.`
      });
      
      return updatedId;
    } catch (error) {
      toast.error("Error Updating Application", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      return null;
    }
  };

  return {
    createApplication,
    updateApplicationStatus,
    isCreating,
    program,
    university,
    isLoading: !programsQuery && programId !== null && programId !== undefined
  };
}
