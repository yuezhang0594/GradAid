import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

/**
 * Hook for managing the application process
 */
export function useApply() {
  const [isCreating, setIsCreating] = useState(false);
  
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
    requirements
  }: {
    universityId: Id<"universities">;
    programId: Id<"programs">;
    deadline: string;
    priority: "high" | "medium" | "low";
    notes?: string;
    requirements?: Array<{
      type: string;
      status: "completed" | "in_progress" | "pending" | "not_started";
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
        requirements
      });
      
      toast.success("Application Created", {
        description: "Your application has been successfully created."
      });
      
      return applicationId;
    } catch (error) {
      toast.error("Error Creating Application", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
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

  // Function to get program details given a program ID
  const useProgram = (programId: Id<"programs"> | null) => {
    return useQuery(api.programs.search.getProgramsByIds, programId ? { programIds: [programId] } : "skip");
  };

  // Function to get university details given a university ID
  const useUniversity = (universityId: Id<"universities"> | null) => {
    return useQuery(api.programs.search.getUniversity, universityId ? { universityId: universityId } : "skip");
  };

  return {
    createApplication,
    updateApplicationStatus,
    useProgram,
    useUniversity,
    isCreating
  };
}
