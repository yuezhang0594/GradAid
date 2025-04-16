import { useCallback } from "react";
import { useQuery, useMutation, useAction, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "../components/ui/toast";

interface Program {
  _id: Id<"programs">;
  name: string;
  degree: string;
  department: string;
}

interface University {
  _id: Id<"universities">;
  name: string;
  department: string;
}

interface Application {
  _id: Id<"applications">;
  universityId: Id<"universities">;
  programId: Id<"programs">;
  university: University;
  program: Program;
}

export function useGenerateStatementOfPurpose(applicationId?: Id<"applications">) {
  console.log("[useGenerateStatementOfPurpose] called with", { applicationId });
  const applicationDetails = useQuery(
    api.applications.queries.getApplicationDetails,
    applicationId ? { applicationId } : "skip"
  );
  const userProfile = useQuery(api.userProfiles.queries.getProfile, {});
  const generateSOP = useAction(api.services.llm.generateSOP);
  const saveDocumentDraft = useMutation(api.documents.mutations.saveDocumentDraft);

  return useCallback(
    async () => {
      try {
        const details = applicationDetails;
        console.log("[useGenerateStatementOfPurpose] applicationDetails:", details);
        console.log("[useGenerateStatementOfPurpose] userProfile:", userProfile);
        if (!details || !userProfile) {
          toast({
            title: "Application not found",
            description: "Could not find the application for SOP generation.",
            variant: "destructive"
          });
          return null;
        }
        // Use university and program directly from applicationDetails
        const university = details.university;
        const department = details.department;
        const program = details.program;
        console.log("[useGenerateStatementOfPurpose] university:", university);
        console.log("[useGenerateStatementOfPurpose] program:", program);
        if (!university || !program) {
          toast({
            title: "Missing Data",
            description: "University or program information is missing for this application.",
            variant: "destructive"
          });
          return null;
        }
        const data = {
          profile: userProfile,
          program: {
            university,
            name: details.program,
            degree: details.degree,
            department
          }
        };
        console.log("[useGenerateStatementOfPurpose] data to generateSOP:", data);
        const sop = await generateSOP(data);
        console.log("[useGenerateStatementOfPurpose] SOP output:", sop);
        if (sop) {
          // Find the SOP document in details.documents
          const sopDoc = Array.isArray(details.documents)
            ? details.documents.find((doc) => doc.type === "sop")
            : undefined;
          if (sopDoc && sopDoc._id) {
            await saveDocumentDraft({
              applicationDocumentId: sopDoc._id,
              content: sop,
            });
          } else {
            console.warn("[useGenerateStatementOfPurpose] No SOP document found to store SOP content.");
          }
          toast({
            title: "Success",
            description: "Statement of Purpose generated successfully!",
            variant: "default"
          });
        }
        return sop;
      } catch (error) {
        console.error('[useGenerateStatementOfPurpose] Error generating SOP:', error);
        toast({
          title: "Error",
          description: "Failed to generate Statement of Purpose. Please try again.",
          variant: "destructive"
        });
        return null;
      }
    },
    [applicationDetails, userProfile, generateSOP, saveDocumentDraft]
  );
}

export function useGenerateLetterOfRecommendation(documentId: Id<"applicationDocuments">) {
  const applications = useQuery(api.dashboard.queries.getApplications, {  });
  const userProfile = useQuery(api.users.current);
  const generateLOR = useAction(api.services.llm.generateLOR);
  const convex = useConvex();

  return useCallback(
    async (applicationId: Id<"applications">) => {
      try {
        if (!applications || !userProfile) {
          throw new Error("Could not fetch required data");
        }

        const applicationData = applications.find(app => app._id === applicationId) as Application | undefined;
        if (!applicationData) {
          throw new Error("Application not found");
        }

        // Fetch recommender info only when needed
        const recommender = await convex.query(api.programs.search.getRecommender, { documentId });
        if (!recommender) {
          toast({
            title: "Missing Recommender",
            description: "Please assign a recommender before generating a Letter of Recommendation.",
            variant: "destructive"
          });
          return null;
        }

        const data = {
          profile: userProfile,
          university: {
            name: applicationData.university.name,
            department: applicationData.university.department
          },
          program: {
            name: applicationData.program.name,
            degree: applicationData.program.degree,
            department: applicationData.program.department
          },
          recommender
        };

        // Generate LOR using Convex action
        const lor = await generateLOR(data);

        if (lor) {
          toast({
            title: "Success",
            description: "Letter of Recommendation generated successfully!",
            variant: "default"
          });
        }

        return lor;
      } catch (error) {
        console.error('Error generating LOR:', error);
        toast({
          title: "Error",
          description: "Failed to generate Letter of Recommendation. Please try again.",
          variant: "destructive"
        });
        return null;
      }
    },
    [applications, userProfile, generateLOR, convex, documentId]
  );
}
